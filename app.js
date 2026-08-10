const audio = document.getElementById("audio");

const trackList = document.getElementById("track-list");
const emptyState = document.getElementById("empty-state");

const albumTitle = document.getElementById("album-title");
const albumCover = document.getElementById("album-cover");
const albumMeta = document.getElementById("album-meta");
const trackCount = document.getElementById("track-count");

const playerCover = document.getElementById("player-cover");
const nowTitle = document.getElementById("now-title");
const nowArtist = document.getElementById("now-artist");

const playButton = document.getElementById("play-button");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

const playAlbumButton = document.getElementById("play-album");
const shuffleButton = document.getElementById("shuffle-button");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const currentTime = document.getElementById("current-time");
const totalTime = document.getElementById("total-time");

const searchArea = document.getElementById("search-area");
const searchInput = document.getElementById("search-input");
const clearSearch = document.getElementById("clear-search");

const libraryButton = document.getElementById("library-button");
const searchButton = document.getElementById("search-button");
const homeButton = document.getElementById("home-button");


let currentTrack = -1;
let filteredTracks = [];
let durationCache = new Map();


function getAlbum() {
    return albums[0];
}


function getTrackName(filename) {
    return filename
        .replace(/\.[^/.]+$/, "")
        .replace(/^\d+-/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}


function getTrackPath(filename) {
    const album = getAlbum();

    return `albums/${album.folder}/${filename}`;
}


function getCoverPath() {
    const album = getAlbum();

    return `albums/${album.folder}/${album.cover}`;
}


function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secondsPart =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${secondsPart}`;
}


function renderAlbum() {

    const album = getAlbum();

    albumTitle.textContent = album.name;

    albumCover.src =
        getCoverPath();

    playerCover.src =
        getCoverPath();

    albumMeta.textContent =
        `${album.tracks.length} TRACKS · ARCHIVE`;

    trackCount.textContent =
        album.tracks.length
            .toString()
            .padStart(2, "0");

    renderTracks();
}


function renderTracks() {

    const album = getAlbum();

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    filteredTracks =
        album.tracks
            .map((filename, index) => ({
                filename,
                index,
                title: getTrackName(filename)
            }))
            .filter(track => {

                if (!query) {
                    return true;
                }

                return (
                    track.title
                        .toLowerCase()
                        .includes(query) ||

                    track.filename
                        .toLowerCase()
                        .includes(query)
                );
            });


    trackList.innerHTML = "";


    emptyState.classList.toggle(
        "visible",
        filteredTracks.length === 0
    );


    filteredTracks.forEach(track => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "track";


        if (track.index === currentTrack) {
            button.classList.add("active");
        }


        const duration =
            durationCache.get(
                getTrackPath(track.filename)
            );


        button.innerHTML = `
            <span class="track-number">
                ${String(track.index + 1).padStart(2, "0")}
            </span>

            <span class="track-name">
                ${escapeHtml(track.title)}
            </span>

            <span class="track-duration">
                ${duration ? formatTime(duration) : "—"}
            </span>
        `;


        button.addEventListener(
            "click",
            () => {

                loadTrack(track.index);

                playTrack();
            }
        );


        trackList.appendChild(button);


        loadDuration(
            track.filename
        );

    });

}


function loadDuration(filename) {

    const path =
        getTrackPath(filename);


    if (durationCache.has(path)) {
        return;
    }


    const tempAudio =
        new Audio();


    tempAudio.preload =
        "metadata";


    tempAudio.src =
        path;


    tempAudio.addEventListener(
        "loadedmetadata",
        () => {

            durationCache.set(
                path,
                tempAudio.duration
            );

            renderTracks();
        },
        { once: true }
    );

}


function loadTrack(index) {

    const album =
        getAlbum();


    const filename =
        album.tracks[index];


    if (!filename) {
        return;
    }


    currentTrack =
        index;


    audio.src =
        getTrackPath(filename);


    audio.load();


    const title =
        getTrackName(filename);


    nowTitle.textContent =
        title;


    nowArtist.textContent =
        "d4vd";


    playerCover.src =
        getCoverPath();


    renderTracks();

}


function playTrack() {

    if (!audio.src) {
        loadTrack(
            currentTrack >= 0
                ? currentTrack
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


function previousTrack() {

    const album =
        getAlbum();


    if (currentTrack <= 0) {

        loadTrack(
            album.tracks.length - 1
        );

    } else {

        loadTrack(
            currentTrack - 1
        );

    }


    playTrack();

}


function nextTrack() {

    const album =
        getAlbum();


    if (
        currentTrack <
        album.tracks.length - 1
    ) {

        loadTrack(
            currentTrack + 1
        );

    } else {

        loadTrack(0);

    }


    playTrack();

}


function shuffleTrack() {

    const album =
        getAlbum();


    if (!album.tracks.length) {
        return;
    }


    let next =
        Math.floor(
            Math.random() *
            album.tracks.length
        );


    if (
        album.tracks.length > 1 &&
        next === currentTrack
    ) {

        next =
            (next + 1) %
            album.tracks.length;

    }


    loadTrack(next);

    playTrack();

}


function updatePlayButton() {

    const playing =
        !audio.paused &&
        !audio.ended;


    playButton.textContent =
        playing ? "Ⅱ" : "▶";


    playAlbumButton.querySelector(
        "span"
    ).textContent =
        playing ? "Ⅱ" : "▶";

}


function updateProgress() {

    if (!audio.duration) {
        return;
    }


    const percentage =
        (audio.currentTime /
            audio.duration) *
        100;


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


function escapeHtml(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* PLAYER */

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


playAlbumButton.addEventListener(
    "click",
    togglePlay
);


shuffleButton.addEventListener(
    "click",
    shuffleTrack
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

        if (!audio.duration) {
            return;
        }


        audio.currentTime =
            (progress.value / 100) *
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


/* SEARCH */

searchButton.addEventListener(
    "click",
    () => {

        searchArea.classList.add(
            "visible"
        );

        searchButton.classList.add(
            "active"
        );

        libraryButton.classList.remove(
            "active"
        );

        searchInput.focus();

    }
);


libraryButton.addEventListener(
    "click",
    () => {

        searchArea.classList.remove(
            "visible"
        );

        searchButton.classList.remove(
            "active"
        );

        libraryButton.classList.add(
            "active"
        );

        searchInput.value = "";

        renderTracks();

    }
);


homeButton.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


searchInput.addEventListener(
    "input",
    () => {

        clearSearch.classList.toggle(
            "visible",
            searchInput.value.length > 0
        );

        renderTracks();

    }
);


clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        clearSearch.classList.remove(
            "visible"
        );

        searchInput.focus();

        renderTracks();

    }
);


/* KEYBOARD CONTROLS */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {
            return;
        }


        if (event.code === "Space") {

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


renderAlbum();