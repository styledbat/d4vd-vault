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

const copyAlbumLinkButton =
    document.getElementById("copy-album-link");


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

    return `${R2_BASE_URL}/${encodeURIComponent(
        album.folder
    )}/${encodeURIComponent(
        album.cover
    )}`;

}


function getTrackPath(album, filename) {

    return `${R2_BASE_URL}/${encodeURIComponent(
        album.folder
    )}/${encodeURIComponent(
        filename
    )}`;

}


function getAlbumUrl(albumIndex) {

    const album =
        albums[albumIndex];

    if (!album) {

        return window.location.href;

    }


    const url =
        new URL(
            window.location.href
        );


    url.search = "";

    url.hash = "";


    url.searchParams.set(
        "album",
        album.folder
    );


    return url.toString();

}


function getTrackUrl(
    albumIndex,
    trackIndex
) {

    const album =
        albums[albumIndex];

    if (
        !album ||
        !album.tracks[trackIndex]
    ) {

        return window.location.href;

    }


    const url =
        new URL(
            window.location.href
        );


    url.search = "";

    url.hash = "";


    url.searchParams.set(
        "album",
        album.folder
    );


    url.searchParams.set(
        "track",
        album.tracks[trackIndex]
    );


    return url.toString();

}


async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        return true;

    } catch (error) {

        try {

            const textarea =
                document.createElement("textarea");


            textarea.value =
                text;


            textarea.style.position =
                "fixed";

            textarea.style.opacity =
                "0";


            document.body.appendChild(
                textarea
            );


            textarea.focus();

            textarea.select();


            const successful =
                document.execCommand(
                    "copy"
                );


            textarea.remove();


            return successful;

        } catch (fallbackError) {

            console.error(
                "Copy failed:",
                fallbackError
            );

            return false;

        }

    }

}


async function copyAlbumLink() {

    const url =
        getAlbumUrl(
            currentAlbumIndex
        );


    const copied =
        await copyText(url);


    if (!copied) {

        alert(
            "Could not copy the link."
        );

        return;

    }


    const originalText =
        copyAlbumLinkButton.textContent;


    copyAlbumLinkButton.textContent =
        "✓ Copied";


    setTimeout(
        () => {

            copyAlbumLinkButton.textContent =
                originalText;

        },
        1600
    );

}


async function copyTrackLink(
    albumIndex,
    trackIndex,
    button
) {

    const url =
        getTrackUrl(
            albumIndex,
            trackIndex
        );


    const copied =
        await copyText(url);


    if (!copied) {

        alert(
            "Could not copy the link."
        );

        return;

    }


    const originalText =
        button.textContent;


    button.textContent =
        "✓";


    setTimeout(
        () => {

            button.textContent =
                originalText;

        },
        1600
    );

}


function getTrackName(filename) {

    return filename

        .replace(
            /\.[^/.]+$/,
            ""
        )

        .replace(
            /^\d+-/,
            ""
        )

        .replace(
            /-/g,
            " "
        )

        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );

}


function formatTime(seconds) {

    if (
        !Number.isFinite(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        )
            .toString()
            .padStart(
                2,
                "0"
            );


    return `${minutes}:${remainingSeconds}`;

}


function escapeHtml(value) {

    return value

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

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


    if (
        viewName === "library"
    ) {

        libraryView.classList.add(
            "active-view"
        );

        libraryButton.classList.add(
            "active"
        );

        document.title =
            "d4vd.vault — Library";

    }


    if (
        viewName === "album"
    ) {

        albumView.classList.add(
            "active-view"
        );

        libraryButton.classList.remove(
            "active"
        );

        const album =
            getAlbum();


        document.title =
            `${album.name} — d4vd.vault`;

    }


    if (
        viewName === "search"
    ) {

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

    albumGrid.innerHTML =
        "";


    libraryTotal.textContent =
        `${albums.length
            .toString()
            .padStart(
                2,
                "0"
            )} RELEASES`;


    if (
        !albums.length
    ) {

        libraryEmpty.classList.add(
            "visible"
        );

        return;

    }


    libraryEmpty.classList.remove(
        "visible"
    );


    albums.forEach(
        (
            album,
            index
        ) => {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "album-card";


            const cover =
                getAlbumCover(
                    album
                );


            card.innerHTML = `

                <div class="album-card-cover">

                    <img
                        src="${cover}"
                        alt="${escapeHtml(
                            album.name
                        )} artwork"
                        loading="lazy"
                    >

                </div>

                <div class="album-card-title">
                    ${escapeHtml(
                        album.name
                    )}
                </div>

                <div class="album-card-meta">
                    ${escapeHtml(
                        album.type ||
                        "Release"
                    )}
                    ·
                    ${album.tracks.length}
                    tracks
                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    openAlbum(
                        index
                    );

                }
            );


            albumGrid.appendChild(
                card
            );

        }
    );

}


/* =========================
   OPEN ALBUM
========================= */

function openAlbum(
    index,
    trackIndex = -1,
    updateUrl = true
) {

    if (
        !albums[index]
    ) {

        return;

    }


    currentAlbumIndex =
        index;


    currentTrackIndex =
        -1;


    currentPlaylist =
        [
            ...albums[index].tracks
        ];


    renderAlbum();


    showView(
        "album"
    );


    if (
        updateUrl
    ) {

        const url =
            new URL(
                window.location.href
            );


        url.search = "";

        url.hash = "";


        url.searchParams.set(
            "album",
            albums[index].folder
        );


        if (
            trackIndex >= 0 &&
            albums[index].tracks[
                trackIndex
            ]
        ) {

            url.searchParams.set(
                "track",
                albums[index].tracks[
                    trackIndex
                ]
            );

        }


        window.history.pushState(
            {},
            "",
            url
        );

    }


    if (
        trackIndex >= 0 &&
        albums[index].tracks[
            trackIndex
        ]
    ) {

        loadTrack(
            trackIndex,
            false
        );

    }

}


/* =========================
   ALBUM
========================= */

function renderAlbum() {

    const album =
        getAlbum();


    const cover =
        getAlbumCover(
            album
        );


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
            .padStart(
                2,
                "0"
            );


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


    trackList.innerHTML =
        "";


    if (
        !album.tracks.length
    ) {

        albumEmpty.classList.add(
            "visible"
        );

        return;

    }


    albumEmpty.classList.remove(
        "visible"
    );


    album.tracks.forEach(
        (
            filename,
            index
        ) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "track";


            if (
                index ===
                currentTrackIndex
            ) {

                row.classList.add(
                    "active"
                );

            }


            const path =
                getTrackPath(
                    album,
                    filename
                );


            const cachedDuration =
                durationCache.get(
                    path
                );


            row.innerHTML = `

                <button
                    type="button"
                    class="track-main"
                    aria-label="Play ${escapeHtml(
                        getTrackName(
                            filename
                        )
                    )}"
                >

                    <span class="track-number">
                        ${String(
                            index + 1
                        ).padStart(
                            2,
                            "0"
                        )}
                    </span>

                    <span class="track-name">
                        ${escapeHtml(
                            getTrackName(
                                filename
                            )
                        )}
                    </span>

                    <span class="track-duration">
                        ${
                            cachedDuration
                                ? formatTime(
                                    cachedDuration
                                )
                                : "—"
                        }
                    </span>

                </button>


                <div class="track-actions">

                    <button
                        type="button"
                        class="track-action"
                        data-action="copy"
                        aria-label="Copy track link"
                        title="Copy track link"
                    >
                        ⧉
                    </button>

                    <button
                        type="button"
                        class="track-action"
                        data-action="download"
                        aria-label="Download track"
                        title="Download track"
                    >
                        ↓
                    </button>

                </div>

            `;


            const mainButton =
                row.querySelector(
                    ".track-main"
                );


            const copyButton =
                row.querySelector(
                    '[data-action="copy"]'
                );


            const downloadButton =
                row.querySelector(
                    '[data-action="download"]'
                );


            mainButton.addEventListener(
                "click",
                () => {

                    loadTrack(
                        index
                    );

                    playTrack();

                }
            );


            copyButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    copyTrackLink(
                        currentAlbumIndex,
                        index,
                        copyButton
                    );

                }
            );


            downloadButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    downloadTrack(
                        currentAlbumIndex,
                        index,
                        downloadButton
                    );

                }
            );


            trackList.appendChild(
                row
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
        durationCache.has(
            path
        )
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
                getAlbum() ===
                album
            ) {

                renderTracks();

            }

        },
        {
            once: true
        }
    );

}


/* =========================
   LOAD TRACK
========================= */

function loadTrack(
    index,
    updateUrl = true
) {

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
        [
            ...album.tracks
        ];


    audio.src =
        getTrackPath(
            album,
            filename
        );


    audio.load();


    nowTitle.textContent =
        getTrackName(
            filename
        );


    nowArtist.textContent =
        "d4vd";


    playerCover.src =
        getAlbumCover(
            album
        );


    renderTracks();


    updateProgress();


    if (
        updateUrl
    ) {

        const url =
            new URL(
                window.location.href
            );


        url.search = "";

        url.hash = "";


        url.searchParams.set(
            "album",
            album.folder
        );


        url.searchParams.set(
            "track",
            filename
        );


        window.history.pushState(
            {},
            "",
            url
        );

    }

}


/* =========================
   PLAYBACK
========================= */

function playTrack() {

    if (
        !audio.src
    ) {

        loadTrack(
            currentTrackIndex >= 0
                ? currentTrackIndex
                : 0
        );

    }


    audio.play()
        .catch(
            error => {

                console.error(
                    "Playback error:",
                    error
                );

            }
        );

}


function pauseTrack() {

    audio.pause();

}


function togglePlay() {

    if (
        !audio.src
    ) {

        loadTrack(
            0
        );

        playTrack();

        return;

    }


    if (
        audio.paused
    ) {

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

        loadTrack(
            0
        );

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
        next ===
        currentTrackIndex
    ) {

        next =
            (
                next + 1
            ) %
            album.tracks.length;

    }


    loadTrack(
        next
    );


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

        loadTrack(
            0
        );

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


    if (
        playIcon
    ) {

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
   DOWNLOAD SINGLE TRACK
========================= */

async function downloadTrack(
    albumIndex,
    trackIndex,
    button
) {

    const album =
        albums[albumIndex];


    if (
        !album ||
        !album.tracks[trackIndex]
    ) {

        return;

    }


    const filename =
        album.tracks[
            trackIndex
        ];


    const url =
        getTrackPath(
            album,
            filename
        );


    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "…";


    try {

        const response =
            await fetch(
                url
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `Could not download ${filename}`
            );

        }


        const blob =
            await response.blob();


        const downloadUrl =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            downloadUrl;


        link.download =
            filename;


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
            "Track download failed:",
            error
        );


        alert(
            "The track could not be downloaded. Check your R2 CORS settings."
        );

    } finally {

        button.disabled =
            false;


        button.textContent =
            originalText;

    }

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
            const filename of
            album.tracks
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
            document.createElement(
                "a"
            );


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

    showView(
        "search"
    );


    searchInput.focus();


    renderSearchResults();

}


function renderSearchResults() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    searchResults.innerHTML =
        "";


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
        (
            album,
            albumIndex
        ) => {

            album.tracks.forEach(
                (
                    filename,
                    trackIndex
                ) => {

                    const trackName =
                        getTrackName(
                            filename
                        );


                    const matchesTrack =
                        trackName
                            .toLowerCase()
                            .includes(
                                query
                            );


                    const matchesAlbum =
                        album.name
                            .toLowerCase()
                            .includes(
                                query
                            );


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


    if (
        !results.length
    ) {

        searchEmpty.classList.add(
            "visible"
        );

        return;

    }


    searchEmpty.classList.remove(
        "visible"
    );


    results.forEach(
        (
            result,
            index
        ) => {

            const button =
                document.createElement(
                    "button"
                );


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
                durationCache.get(
                    path
                );


            button.innerHTML = `

                <span class="search-result-number">
                    ${String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    )}
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
                            ? formatTime(
                                duration
                            )
                            : "—"
                    }
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    openAlbum(
                        result.albumIndex,
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
   URL / DEEP LINKING
========================= */

function findAlbumFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const albumFolder =
        params.get(
            "album"
        );


    const trackFilename =
        params.get(
            "track"
        );


    if (
        !albumFolder
    ) {

        return;

    }


    const albumIndex =
        albums.findIndex(
            album =>
                album.folder ===
                albumFolder
        );


    if (
        albumIndex === -1
    ) {

        return;

    }


    let trackIndex =
        -1;


    if (
        trackFilename
    ) {

        trackIndex =
            albums[
                albumIndex
            ].tracks.findIndex(
                filename =>
                    filename ===
                    trackFilename
            );

    }


    openAlbum(
        albumIndex,
        trackIndex,
        false
    );

}


/* =========================
   NAVIGATION EVENTS
========================= */

libraryButton.addEventListener(
    "click",
    () => {

        const url =
            new URL(
                window.location.href
            );


        url.search = "";

        url.hash = "";


        window.history.pushState(
            {},
            "",
            url
        );


        showView(
            "library"
        );

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

        const url =
            new URL(
                window.location.href
            );


        url.search = "";

        url.hash = "";


        window.history.pushState(
            {},
            "",
            url
        );


        showView(
            "library"
        );

    }
);


backToLibrary.addEventListener(
    "click",
    () => {

        const url =
            new URL(
                window.location.href
            );


        url.search = "";

        url.hash = "";


        window.history.pushState(
            {},
            "",
            url
        );


        showView(
            "library"
        );

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


copyAlbumLinkButton.addEventListener(
    "click",
    copyAlbumLink
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
                Number(
                    progress.value
                ) / 100
            ) *
            audio.duration;

    }
);


volume.addEventListener(
    "input",
    () => {

        audio.volume =
            Number(
                volume.value
            );

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
            event.target.tagName ===
                "INPUT" ||
            event.target.tagName ===
                "TEXTAREA"
        ) {

            return;

        }


        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            togglePlay();

        }


        if (
            event.code ===
            "ArrowLeft"
        ) {

            previousTrack();

        }


        if (
            event.code ===
            "ArrowRight"
        ) {

            nextTrack();

        }

    }
);


/* =========================
   BROWSER HISTORY
========================= */

window.addEventListener(
    "popstate",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );


        if (
            params.has(
                "album"
            )
        ) {

            findAlbumFromUrl();

        } else {

            showView(
                "library"
            );

        }

    }
);


/* =========================
   INITIALIZE
========================= */

renderLibrary();

showView(
    "library"
);


audio.volume =
    Number(
        volume.value
    );


findAlbumFromUrl();
