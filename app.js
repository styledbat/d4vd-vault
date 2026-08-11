/* =========================================================
   d4vd.vault
   Main application
========================================================= */


/* =========================
   R2 CONFIGURATION
========================= */

const R2_BASE_URL =
    "https://pub-d9bd233ceeaa46968d21cdfda84af3d9.r2.dev";


/* =========================
   ELEMENTS
========================= */

const audio =
    document.getElementById("audio");


/* Navigation */

const brandButton =
    document.getElementById("brand-button");

const libraryButton =
    document.getElementById("library-button");

const searchButton =
    document.getElementById("search-button");


/* Views */

const libraryView =
    document.getElementById("library-view");

const albumView =
    document.getElementById("album-view");

const searchView =
    document.getElementById("search-view");


/* Library */

const albumGrid =
    document.getElementById("album-grid");

const libraryTotal =
    document.getElementById("library-total");

const libraryEmpty =
    document.getElementById("library-empty");


/* Album */

const backToLibrary =
    document.getElementById("back-to-library");

const albumCover =
    document.getElementById("album-cover");

const albumTitle =
    document.getElementById("album-title");

const albumType =
    document.getElementById("album-type");

const albumMeta =
    document.getElementById("album-meta");

const tracklistTitle =
    document.getElementById("tracklist-title");

const trackCount =
    document.getElementById("track-count");

const trackList =
    document.getElementById("track-list");

const albumEmpty =
    document.getElementById("album-empty");


/* Album actions */

const playAlbumButton =
    document.getElementById("play-album");

const shuffleButton =
    document.getElementById("shuffle-button");

const downloadAlbumButton =
    document.getElementById("download-album");


/* Search */

const searchInput =
    document.getElementById("search-input");

const clearSearch =
    document.getElementById("clear-search");

const searchResults =
    document.getElementById("search-results");

const searchEmpty =
    document.getElementById("search-empty");


/* Player */

const playerCover =
    document.getElementById("player-cover");

const nowTitle =
    document.getElementById("now-title");

const nowArtist =
    document.getElementById("now-artist");

const playButton =
    document.getElementById("play-button");

const previousButton =
    document.getElementById("previous-button");

const nextButton =
    document.getElementById("next-button");

const currentTime =
    document.getElementById("current-time");

const totalTime =
    document.getElementById("total-time");

const progress =
    document.getElementById("progress");

const volume =
    document.getElementById("volume");


/* =========================
   STATE
========================= */

let currentAlbumIndex = 0;

let currentTrackIndex = -1;

let currentPlaylist = [];

let durationCache = new Map();


/* =========================
   HELPERS
========================= */

function getAlbum(index = currentAlbumIndex) {

    return albums[index];

}


function getAlbumCover(album) {

    return `${R2_BASE_URL}/${encodeURIComponent(album.folder)}/${encodeURIComponent(album.cover)}`;

}


function getTrackPath(album, filename) {

    return `${R2_BASE_URL}/${encodeURIComponent(album.folder)}/${encodeURIComponent(filename)}`;

}


function getTrackName(filename) {

    return filename

        .replace(/\.[^/.]+$/, "")

        .replace(/^\d+-/, "")

        .replace(/-/g, " ")

        .replace(/\b\w/g, character =>
            character.toUpperCase()
        );

}


function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {

        return "0:00";

    }


    const minutes =
        Math.floor(seconds / 60);


    const remainingSeconds =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");


    return `${minutes}:${remainingSeconds}`;

}


function escapeHtml(value) {

    return value

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =========================
   VIEW MANAGEMENT
========================= */

function showView(viewName) {

    libraryView.classList.remove(
        "active-view"
    );

    albumView.classList.remove(
        "active-view"
    );

    searchView.classList.remove(
        "active-view"
    );


    libraryButton.classList.remove(
        "active"
    );

    searchButton.classList.remove(
        "active"
    );


    if (viewName === "library") {

        libraryView.classList.add(
            "active-view"
        );

        libraryButton.classList.add(
            "active"
        );

        document.title =
            "d4vd.vault — Library";

    }


    if (viewName === "album") {

        albumView.classList.add(
            "active-view"
        );

        libraryButton.classList.remove(
            "active"
        );

        document.title =
            `${getAlbum().name} — d4vd.vault`;

    }


    if (viewName === "search") {

        searchView.classList.add(
            "active-view"
        );

        searchButton.classList.add(
            "active"
        );

        document.title =
            "Search — d4vd.vault";

    }


    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

}


/* =========================
   LIBRARY
========================= */

function renderLibrary() {

    albumGrid.innerHTML = "";


    libraryTotal.textContent =
        `${albums.length
            .toString()
            .padStart(2, "0")} RELEASES`;


    if (!albums.length) {

        libraryEmpty.classList.add(
            "visible"
        );

        return;

    }


    libraryEmpty.classList.remove(
        "visible"
    );


    albums.forEach(
        (album, index) => {

            const card =
                document.createElement("button");


            card.type =
                "button";


            card.className =
                "album-card";


            const cover =
                getAlbumCover(album);


            card.innerHTML = `

                <div class="album-card-cover">

                    <img
                        src="${cover}"
                        alt="${escapeHtml(album.name)} artwork"
                        loading="lazy"
                    >

                </div>

                <div class="album-card-title">
                    ${escapeHtml(album.name)}
                </div>

                <div class="album-card-meta">
                    ${escapeHtml(album.type || "Release")}
                    ·
                    ${album.tracks.length} tracks
                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    openAlbum(index);

                }
            );


            albumGrid.appendChild(card);

        }
    );

}


/* =========================
   OPEN ALBUM
========================= */

function openAlbum(index) {

    if (!albums[index]) {

        return;

    }


    currentAlbumIndex =
        index;


    currentTrackIndex =
        -1;


    currentPlaylist =
        [...albums[index].tracks];


    renderAlbum();


    showView("album");

}


/* =========================
   ALBUM
========================= */

function renderAlbum() {

    const album =
        getAlbum();


    const cover =
        getAlbumCover(album);


    albumCover.src =
        cover;


    albumCover.alt =
        `${album.name} artwork`;


    albumTitle.textContent =
        album.name;


    albumType.textContent =
        `${album.type || "RELEASE"} / ARCHIVE`;


    albumMeta.textContent =
        `${album.tracks.length} TRACKS · ARCHIVE`;


    tracklistTitle.textContent =
        album.name;


    trackCount.textContent =
        album.tracks.length
            .toString()
            .padStart(2, "0");


    playerCover.src =
        cover;


    renderTracks();

}


/* =========================
   TRACK LIST
========================= */

function renderTracks() {

    const album =
        getAlbum();


    trackList.innerHTML = "";


    if (!album.tracks.length) {

        albumEmpty.classList.add(
            "visible"
        );

        return;

    }


    albumEmpty.classList.remove(
        "visible"
    );


    album.tracks.forEach(
        (filename, index) => {

            const button =
                document.createElement("button");


            button.type =
                "button";


            button.className =
                "track";


            if (
                index ===
                currentTrackIndex
            ) {

                button.classList.add(
                    "active"
                );

            }


            const path =
                getTrackPath(
                    album,
                    filename
                );


            const cachedDuration =
                durationCache.get(path);


            button.innerHTML = `

                <span class="track-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <span class="track-name">
                    ${escapeHtml(
                        getTrackName(filename)
                    )}
                </span>

                <span class="track-duration">
                    ${
                        cachedDuration
                            ? formatTime(cachedDuration)
                            : "—"
                    }
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    loadTrack(index);

                    playTrack();

                }
            );


            trackList.appendChild(
                button
            );


            loadDuration(
                album,
                filename
            );

        }
    );

}


/* =========================
   AUDIO DURATION
========================= */

function loadDuration(
    album,
    filename
) {

    const path =
        getTrackPath(
            album,
            filename
        );


    if (
        durationCache.has(path)
    ) {

        return;

    }


    const temporaryAudio =
        new Audio();


    temporaryAudio.preload =
        "metadata";


    temporaryAudio.src =
        path;


    temporaryAudio.addEventListener(
        "loadedmetadata",
        () => {

            durationCache.set(
                path,
                temporaryAudio.duration
            );


            if (
                getAlbum() === album
            ) {

                renderTracks();

            }

        },
        {
            once: true
        }
    );


    temporaryAudio.addEventListener(
        "error",
        () => {

            console.warn(
                "Could not load duration:",
                path
            );

        },
        {
            once: true
        }
    );

}


/* =========================
   LOAD TRACK
========================= */

function loadTrack(index) {

    const album =
        getAlbum();


    const filename =
        album.tracks[index];


    if (!filename) {

        return;

    }


    currentTrackIndex =
        index;


    currentPlaylist =
        [...album.tracks];


    audio.src =
        getTrackPath(
            album,
            filename
        );


    audio.load();


    nowTitle.textContent =
        getTrackName(filename);


    nowArtist.textContent =
        "d4vd";


    playerCover.src =
        getAlbumCover(album);


    renderTracks();


    updateProgress();

}


/* =========================
   PLAYBACK
========================= */

function playTrack() {

    if (!audio.src) {

        loadTrack(
            currentTrackIndex >= 0
                ? currentTrackIndex
                : 0
        );

    }


    audio.play()
        .catch(error => {

            console.error(
                "Playback error:",
                error
            );

        });

}


function pauseTrack() {

    audio.pause();

}


function togglePlay() {

    if (!audio.src) {

        loadTrack(0);

        playTrack();

        return;

    }


    if (audio.paused) {

        playTrack();

    } else {

        pauseTrack();

    }

}


/* =========================
   PREVIOUS
========================= */

function previousTrack() {

    const album =
        getAlbum();


    if (
        !album.tracks.length
    ) {

        return;

    }


    if (
        currentTrackIndex <= 0
    ) {

        loadTrack(
            album.tracks.length - 1
        );

    } else {

        loadTrack(
            currentTrackIndex - 1
        );

    }


    playTrack();

}


/* =========================
   NEXT
========================= */

function nextTrack() {

    const album =
        getAlbum();


    if (
        !album.tracks.length
    ) {

        return;

    }


    if (
        currentTrackIndex <
        album.tracks.length - 1
    ) {

        loadTrack(
            currentTrackIndex + 1
        );

    } else {

        loadTrack(0);

    }


    playTrack();

}


/* =========================
   SHUFFLE
========================= */

function shuffleTrack() {

    const album =
        getAlbum();


    if (
        !album.tracks.length
    ) {

        return;

    }


    let next =
        Math.floor(
            Math.random() *
            album.tracks.length
        );


    if (
        album.tracks.length > 1 &&
        next === currentTrackIndex
    ) {

        next =
            (next + 1) %
            album.tracks.length;

    }


    loadTrack(next);


    playTrack();

}


/* =========================
   PLAY ALBUM
========================= */

function playAlbum() {

    const album =
        getAlbum();


    if (
        !album.tracks.length
    ) {

        return;

    }


    if (
        currentTrackIndex === -1
    ) {

        loadTrack(0);

    }


    playTrack();

}


/* =========================
   PLAYER UI
========================= */

function updatePlayButton() {

    const playing =
        !audio.paused &&
        !audio.ended;


    playButton.textContent =
        playing
            ? "Ⅱ"
            : "▶";


    const playIcon =
        playAlbumButton.querySelector(
            "span"
        );


    if (playIcon) {

        playIcon.textContent =
            playing
                ? "Ⅱ"
                : "▶";

    }

}


function updateProgress() {

    if (
        !audio.duration
    ) {

        currentTime.textContent =
            "0:00";


        totalTime.textContent =
            "0:00";


        progress.value =
            0;


        return;

    }


    const percentage =
        (
            audio.currentTime /
            audio.duration
        ) * 100;


    progress.value =
        percentage;


    currentTime.textContent =
        formatTime(
            audio.currentTime
        );


    totalTime.textContent =
        formatTime(
            audio.duration
        );

}


/* =========================
   DOWNLOAD ALBUM
========================= */

async function downloadAlbum() {

    const album =
        getAlbum();


    if (
        !album ||
        !album.tracks.length
    ) {

        return;

    }


    if (
        typeof JSZip ===
        "undefined"
    ) {

        alert(
            "The download system failed to load. Please refresh the page."
        );

        return;

    }


    const originalText =
        downloadAlbumButton.textContent;


    downloadAlbumButton.disabled =
        true;


    downloadAlbumButton.textContent =
        "Preparing...";


    try {

        const zip =
            new JSZip();


        for (
            const filename of album.tracks
        ) {

            const response =
                await fetch(
                    getTrackPath(
                        album,
                        filename
                    )
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    `Could not download ${filename}`
                );

            }


            const audioData =
                await response.arrayBuffer();


            zip.file(
                filename,
                audioData
            );

        }


        downloadAlbumButton.textContent =
            "Creating ZIP...";


        const zipBlob =
            await zip.generateAsync({

                type: "blob",

                compression: "STORE"

            });


        const downloadUrl =
            URL.createObjectURL(
                zipBlob
            );


        const link =
            document.createElement("a");


        link.href =
            downloadUrl;


        link.download =
            `${album.name}.zip`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            downloadUrl
        );


    } catch (error) {

        console.error(
            "Album download failed:",
            error
        );


        alert(
            "The album could not be downloaded. Check that all track files are uploaded correctly and that R2 CORS is configured."
        );


    } finally {

        downloadAlbumButton.disabled =
            false;


        downloadAlbumButton.textContent =
            originalText;

    }

}


/* =========================
   SEARCH
========================= */

function openSearch() {

    showView("search");


    searchInput.focus();


    renderSearchResults();

}


function renderSearchResults() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    searchResults.innerHTML = "";


    clearSearch.classList.toggle(
        "visible",
        query.length > 0
    );


    if (!query) {

        searchEmpty.classList.remove(
            "visible"
        );

        return;

    }


    const results = [];


    albums.forEach(
        (album, albumIndex) => {

            album.tracks.forEach(
                (filename, trackIndex) => {

                    const trackName =
                        getTrackName(
                            filename
                        );


                    const matchesTrack =
                        trackName
                            .toLowerCase()
                            .includes(query);


                    const matchesAlbum =
                        album.name
                            .toLowerCase()
                            .includes(query);


                    if (
                        matchesTrack ||
                        matchesAlbum
                    ) {

                        results.push({

                            albumIndex,

                            trackIndex,

                            filename,

                            trackName,

                            album

                        });

                    }

                }
            );

        }
    );


    if (!results.length) {

        searchEmpty.classList.add(
            "visible"
        );

        return;

    }


    searchEmpty.classList.remove(
        "visible"
    );


    results.forEach(
        (result, index) => {

            const button =
                document.createElement("button");


            button.type =
                "button";


            button.className =
                "search-result";


            const path =
                getTrackPath(
                    result.album,
                    result.filename
                );


            const duration =
                durationCache.get(path);


            button.innerHTML = `

                <span class="search-result-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <span class="search-result-info">

                    <span class="search-result-title">
                        ${escapeHtml(
                            result.trackName
                        )}
                    </span>

                    <span class="search-result-album">
                        ${escapeHtml(
                            result.album.name
                        )}
                    </span>

                </span>

                <span class="search-result-duration">
                    ${
                        duration
                            ? formatTime(duration)
                            : "—"
                    }
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    openAlbum(
                        result.albumIndex
                    );


                    loadTrack(
                        result.trackIndex
                    );


                    playTrack();

                }
            );


            searchResults.appendChild(
                button
            );


            loadDuration(
                result.album,
                result.filename
            );

        }
    );

}


/* =========================
   NAVIGATION EVENTS
========================= */

libraryButton.addEventListener(
    "click",
    () => {

        showView("library");

    }
);


searchButton.addEventListener(
    "click",
    () => {

        openSearch();

    }
);


brandButton.addEventListener(
    "click",
    () => {

        showView("library");

    }
);


backToLibrary.addEventListener(
    "click",
    () => {

        showView("library");

    }
);


/* =========================
   ALBUM EVENTS
========================= */

playAlbumButton.addEventListener(
    "click",
    playAlbum
);


shuffleButton.addEventListener(
    "click",
    shuffleTrack
);


downloadAlbumButton.addEventListener(
    "click",
    downloadAlbum
);


/* =========================
   PLAYER EVENTS
========================= */

playButton.addEventListener(
    "click",
    togglePlay
);


previousButton.addEventListener(
    "click",
    previousTrack
);


nextButton.addEventListener(
    "click",
    nextTrack
);


audio.addEventListener(
    "play",
    updatePlayButton
);


audio.addEventListener(
    "pause",
    updatePlayButton
);


audio.addEventListener(
    "timeupdate",
    updateProgress
);


audio.addEventListener(
    "loadedmetadata",
    updateProgress
);


audio.addEventListener(
    "ended",
    nextTrack
);


progress.addEventListener(
    "input",
    () => {

        if (
            !audio.duration
        ) {

            return;

        }


        audio.currentTime =
            (
                Number(progress.value) /
                100
            ) *
            audio.duration;

    }
);


volume.addEventListener(
    "input",
    () => {

        audio.volume =
            Number(volume.value);

    }
);


/* =========================
   SEARCH EVENTS
========================= */

searchInput.addEventListener(
    "input",
    renderSearchResults
);


clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value =
            "";


        searchInput.focus();


        renderSearchResults();

    }
);


/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {

            return;

        }


        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            togglePlay();

        }


        if (
            event.code === "ArrowLeft"
        ) {

            previousTrack();

        }


        if (
            event.code === "ArrowRight"
        ) {

            nextTrack();

        }

    }
);


/* =========================
   INITIALIZE
========================= */

renderLibrary();

showView("library");

audio.volume =
    Number(volume.value);
