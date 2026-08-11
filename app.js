/* =========================================================
   d4vd.vault
   Main application
   ========================================================= */


/* ELEMENTS */

const audio = document.getElementById("audioPlayer");

const homePage = document.getElementById("homePage");
const libraryPage = document.getElementById("libraryPage");
const albumPage = document.getElementById("albumPage");

const sidebarAlbums = document.getElementById("sidebarAlbums");
const featuredAlbums = document.getElementById("featuredAlbums");
const libraryGrid = document.getElementById("libraryGrid");

const albumCover = document.getElementById("albumCover");
const albumTitle = document.getElementById("albumTitle");
const albumType = document.getElementById("albumType");
const albumTrackCount = document.getElementById("albumTrackCount");
const albumTracks = document.getElementById("albumTracks");

const albumPlayButton =
    document.getElementById("albumPlayButton");

const albumDownload =
    document.getElementById("albumDownload");

const shareAlbum =
    document.getElementById("shareAlbum");

const shareMessage =
    document.getElementById("shareMessage");

const backToLibrary =
    document.getElementById("backToLibrary");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const searchResultsSection =
    document.getElementById("searchResultsSection");

const searchResults =
    document.getElementById("searchResults");

const resultCount =
    document.getElementById("resultCount");

const trackCount =
    document.getElementById("trackCount");

const libraryCount =
    document.getElementById("libraryCount");

const playerCover =
    document.getElementById("playerCover");

const playerTitle =
    document.getElementById("playerTitle");

const playerArtist =
    document.getElementById("playerArtist");

const playPauseButton =
    document.getElementById("playPauseButton");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const progressBar =
    document.getElementById("progressBar");

const volumeBar =
    document.getElementById("volumeBar");


/* STATE */

let currentAlbum = null;
let currentTrackIndex = -1;

let currentPage = "home";


/* =========================================================
   PATHS
   ========================================================= */

function getTrackPath(album, track) {

    return `albums/${album.folder}/${track.file}`;

}


function getCoverPath(album) {

    return `albums/${album.folder}/${album.cover}`;

}


/* =========================================================
   TIME
   ========================================================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const remaining =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${remaining}`;

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(page) {

    currentPage = page;

    homePage.classList.remove("active-page");
    libraryPage.classList.remove("active-page");
    albumPage.classList.remove("active-page");

    if (page === "home") {

        homePage.classList.add("active-page");

    }

    if (page === "library") {

        libraryPage.classList.add("active-page");

    }

    if (page === "album") {

        albumPage.classList.add("active-page");

    }

    document
        .querySelectorAll("[data-page]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

}


/* =========================================================
   URL ROUTING
   ========================================================= */

function getAlbumFromURL() {

    const params =
        new URLSearchParams(window.location.search);

    const albumID =
        params.get("album");

    if (!albumID) {
        return null;
    }

    return albums.find(
        album => album.id === albumID
    ) || null;

}


function openAlbum(album, updateURL = true) {

    if (!album) {
        return;
    }

    currentAlbum = album;

    renderAlbum(album);

    showPage("album");

    if (updateURL) {

        const url =
            new URL(window.location.href);

        url.searchParams.set(
            "album",
            album.id
        );

        history.pushState(
            { album: album.id },
            "",
            url
        );

    }

}


function goHome(updateURL = true) {

    showPage("home");

    if (updateURL) {

        const url =
            new URL(window.location.href);

        url.searchParams.delete("album");

        history.pushState(
            {},
            "",
            url
        );

    }

}


function goLibrary(updateURL = true) {

    showPage("library");

    if (updateURL) {

        const url =
            new URL(window.location.href);

        url.searchParams.delete("album");

        history.pushState(
            {},
            "",
            url
        );

    }

}


/* Browser back/forward */

window.addEventListener("popstate", () => {

    const album =
        getAlbumFromURL();

    if (album) {

        openAlbum(
            album,
            false
        );

    } else {

        goHome(false);

    }

});


/* =========================================================
   ALBUM CARDS
   ========================================================= */

function createAlbumCard(album) {

    const card =
        document.createElement("a");

    card.className = "album-card";

    card.href =
        `?album=${encodeURIComponent(album.id)}`;

    card.innerHTML = `

        <img
            class="album-card-cover"
            src="${getCoverPath(album)}"
            alt="${escapeHTML(album.name)} cover"
            loading="lazy"
        >

        <div class="album-card-info">

            <div class="album-card-title">
                ${escapeHTML(album.name)}
            </div>

            <div class="album-card-type">
                ${escapeHTML(album.type)}
                ·
                ${album.tracks.length} TRACKS
            </div>

        </div>
    `;

    card.addEventListener("click", event => {

        event.preventDefault();

        openAlbum(album);

    });

    return card;

}


/* =========================================================
   RENDER LIBRARY
   ========================================================= */

function renderLibrary() {

    libraryGrid.innerHTML = "";

    albums.forEach(album => {

        libraryGrid.appendChild(
            createAlbumCard(album)
        );

    });

    libraryCount.textContent =
        `${albums.length} RELEASE${albums.length === 1 ? "" : "S"}`;

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function renderSidebar() {

    sidebarAlbums.innerHTML = "";

    albums.forEach(album => {

        const button =
            document.createElement("a");

        button.className =
            "sidebar-album";

        button.textContent =
            album.name;

        button.href =
            `?album=${encodeURIComponent(album.id)}`;

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openAlbum(album);

            }
        );

        sidebarAlbums.appendChild(button);

    });

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

    const totalTracks =
        albums.reduce(
            (total, album) =>
                total + album.tracks.length,
            0
        );

    trackCount.textContent =
        `${totalTracks} TRACK${totalTracks === 1 ? "" : "S"}`;

    featuredAlbums.innerHTML = "";

    albums
        .slice(0, 6)
        .forEach(album => {

            featuredAlbums.appendChild(
                createAlbumCard(album)
            );

        });

}


/* =========================================================
   ALBUM PAGE
   ========================================================= */

function renderAlbum(album) {

    albumCover.src =
        getCoverPath(album);

    albumCover.alt =
        `${album.name} cover`;

    albumTitle.textContent =
        album.name;

    albumType.textContent =
        album.type;

    albumTrackCount.textContent =
        `${album.tracks.length} tracks`;

    shareMessage.textContent = "";

    albumDownload.href =
        createAlbumDownloadURL(album);

    albumDownload.download =
        `${album.id}.txt`;

    albumTracks.innerHTML = "";

    album.tracks.forEach(
        (track, index) => {

            const row =
                document.createElement("div");

            row.className =
                "track-row";

            row.dataset.index =
                index;

            row.innerHTML = `

                <div class="track-number">
                    ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="track-main">

                    <div class="track-title">
                        ${escapeHTML(track.title)}
                    </div>

                    <div class="track-file">
                        ${escapeHTML(track.file)}
                    </div>

                </div>

                <div class="track-status">
                    ${escapeHTML(track.status || "")}
                </div>

                <div class="track-time">
                    --
                </div>

            `;

            row.addEventListener(
                "click",
                () => {

                    playTrack(
                        album,
                        index
                    );

                }
            );

            albumTracks.appendChild(row);

        }
    );

}


/* =========================================================
   PLAYBACK
   ========================================================= */

function playTrack(album, index) {

    if (
        !album ||
        !album.tracks[index]
    ) {
        return;
    }

    currentAlbum = album;

    currentTrackIndex = index;

    const track =
        album.tracks[index];

    audio.src =
        getTrackPath(
            album,
            track
        );

    audio.load();

    audio.play()
        .then(() => {

            updatePlayer();

        })
        .catch(() => {

            updatePlayer();

        });

    updatePlayer();

    highlightPlayingTrack();

}


function updatePlayer() {

    if (
        !currentAlbum ||
        currentTrackIndex < 0
    ) {
        playerTitle.textContent =
            "Nothing playing";

        playerArtist.textContent =
            "d4vd";

        return;
    }

    const track =
        currentAlbum.tracks[
            currentTrackIndex
        ];

    playerTitle.textContent =
        track.title;

    playerArtist.textContent =
        `d4vd · ${currentAlbum.name}`;

    playerCover.src =
        getCoverPath(currentAlbum);

    playPauseButton.textContent =
        audio.paused
            ? "▶"
            : "Ⅱ";

    highlightPlayingTrack();

}


function togglePlay() {

    if (!audio.src) {

        if (
            currentAlbum &&
            currentAlbum.tracks.length
        ) {

            playTrack(
                currentAlbum,
                0
            );

        }

        return;

    }

    if (audio.paused) {

        audio.play();

    } else {

        audio.pause();

    }

    updatePlayer();

}


function playNext() {

    if (!currentAlbum) {
        return;
    }

    let nextIndex =
        currentTrackIndex + 1;

    if (
        nextIndex >=
        currentAlbum.tracks.length
    ) {

        nextIndex = 0;

    }

    playTrack(
        currentAlbum,
        nextIndex
    );

}


function playPrevious() {

    if (!currentAlbum) {
        return;
    }

    let previousIndex =
        currentTrackIndex - 1;

    if (previousIndex < 0) {

        previousIndex =
            currentAlbum.tracks.length - 1;

    }

    playTrack(
        currentAlbum,
        previousIndex
    );

}


/* Automatically continue */

audio.addEventListener(
    "ended",
    playNext
);


/* Update player */

audio.addEventListener(
    "play",
    updatePlayer
);

audio.addEventListener(
    "pause",
    updatePlayer
);


/* =========================================================
   HIGHLIGHT PLAYING TRACK
   ========================================================= */

function highlightPlayingTrack() {

    document
        .querySelectorAll(".track-row")
        .forEach(row => {

            const rowIndex =
                Number(row.dataset.index);

            const isPlaying =
                rowIndex === currentTrackIndex &&
                currentAlbum &&
                row.closest(".album-tracks");

            row.classList.toggle(
                "playing",
                Boolean(
                    isPlaying &&
                    !audio.paused
                )
            );

        });

}


/* =========================================================
   PROGRESS
   ========================================================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(audio.duration);

    }
);


audio.addEventListener(
    "timeupdate",
    () => {

        currentTime.textContent =
            formatTime(audio.currentTime);

        if (
            audio.duration &&
            Number.isFinite(audio.duration)
        ) {

            progressBar.value =
                (
                    audio.currentTime /
                    audio.duration
                ) * 100;

        }

    }
);


progressBar.addEventListener(
    "input",
    () => {

        if (!audio.duration) {
            return;
        }

        audio.currentTime =
            (
                Number(progressBar.value) /
                100
            ) * audio.duration;

    }
);


/* Volume */

volumeBar.addEventListener(
    "input",
    () => {

        audio.volume =
            Number(volumeBar.value);

    }
);


/* =========================================================
   SEARCH
   ========================================================= */

function getAllTracks() {

    const results = [];

    albums.forEach(album => {

        album.tracks.forEach(
            (track, index) => {

                results.push({

                    album,

                    track,

                    index

                });

            }
        );

    });

    return results;

}


function searchVault(query) {

    const search =
        query
            .trim()
            .toLowerCase();

    if (!search) {

        searchResultsSection
            .classList.add("hidden");

        return;

    }

    const matches =
        getAllTracks()
            .filter(item => {

                return (
                    item.track.title
                        .toLowerCase()
                        .includes(search)
                    ||
                    item.album.name
                        .toLowerCase()
                        .includes(search)
                    ||
                    item.track.file
                        .toLowerCase()
                        .includes(search)
                );

            });

    searchResultsSection
        .classList.remove("hidden");

    resultCount.textContent =
        `${matches.length} RESULT${matches.length === 1 ? "" : "S"}`;

    searchResults.innerHTML = "";

    matches.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "track-row search-result";

        row.innerHTML = `

            <div class="track-number">
                ${String(item.index + 1).padStart(2, "0")}
            </div>

            <div class="track-main">

                <div class="track-title">
                    ${escapeHTML(item.track.title)}
                </div>

                <div class="track-file">
                    ${escapeHTML(item.album.name)}
                </div>

            </div>

            <div class="track-status">
                ${escapeHTML(item.track.status || "")}
            </div>

            <div class="track-time">
                --
            </div>

        `;

        row.addEventListener(
            "click",
            () => {

                playTrack(
                    item.album,
                    item.index
                );

            }
        );

        searchResults.appendChild(row);

    });

}


/* =========================================================
   DOWNLOAD
   =========================================================

   Browsers cannot reliably create a single ZIP from
   multiple MP3 files without either:

   - a server-side ZIP
   - a ZIP library
   - or downloading each file individually.

   For now this button downloads a text manifest containing
   the album's tracks and their direct URLs.

   You can replace this later with a real ZIP system.
   ========================================================= */

function createAlbumDownloadURL(album) {

    const lines = [

        `d4vd.vault — ${album.name}`,

        "",

        `Artist: d4vd`,

        `Type: ${album.type}`,

        "",

        "TRACKS",

        ...album.tracks.map(
            (track, index) =>
                `${String(index + 1).padStart(2, "0")} — ${track.title} — ${getTrackPath(album, track)}`
        )

    ];

    const blob =
        new Blob(
            [lines.join("\n")],
            {
                type: "text/plain"
            }
        );

    return URL.createObjectURL(blob);

}


/* =========================================================
   SHARE
   ========================================================= */

async function shareCurrentAlbum() {

    if (!currentAlbum) {
        return;
    }

    const url =
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "album",
        currentAlbum.id
    );

    const shareURL =
        url.toString();

    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    `${currentAlbum.name} — d4vd.vault`,

                text:
                    `d4vd.vault — ${currentAlbum.name}`,

                url:
                    shareURL

            });

            shareMessage.textContent =
                "SHARE MENU OPENED";

            return;

        }

        await navigator.clipboard.writeText(
            shareURL
        );

        shareMessage.textContent =
            "ALBUM LINK COPIED";

    } catch (error) {

        shareMessage.textContent =
            "LINK READY — COPY IT FROM THE ADDRESS BAR";

    }

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

playPauseButton.addEventListener(
    "click",
    togglePlay
);

nextButton.addEventListener(
    "click",
    playNext
);

previousButton.addEventListener(
    "click",
    playPrevious
);

albumPlayButton.addEventListener(
    "click",
    () => {

        if (!currentAlbum) {
            return;
        }

        playTrack(
            currentAlbum,
            0
        );

    }
);

shareAlbum.addEventListener(
    "click",
    shareCurrentAlbum
);

backToLibrary.addEventListener(
    "click",
    () => {

        goLibrary();

    }
);


/* Search */

searchInput.addEventListener(
    "input",
    () => {

        const value =
            searchInput.value;

        clearSearch.classList.toggle(
            "visible",
            value.length > 0
        );

        searchVault(value);

    }
);

clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        clearSearch.classList.remove(
            "visible"
        );

        searchResultsSection
            .classList.add("hidden");

        searchInput.focus();

    }
);


/* Navigation buttons */

document
    .querySelectorAll("[data-page]")
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                const page =
                    event.currentTarget.dataset.page;

                if (page === "home") {

                    goHome();

                }

                if (page === "library") {

                    goLibrary();

                }

            }
        );

    });


/* =========================================================
   SECURITY / HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initialize() {

    renderSidebar();

    renderHome();

    renderLibrary();

    const album =
        getAlbumFromURL();

    if (album) {

        openAlbum(
            album,
            false
        );

    } else {

        showPage("home");

    }

}


/* START */

initialize();
