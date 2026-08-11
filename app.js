const audio = document.getElementById("audio");

const libraryView = document.getElementById("library-view");
const albumView = document.getElementById("album-view");
const searchView = document.getElementById("search-view");

const albumGrid = document.getElementById("album-grid");
const libraryTotal = document.getElementById("library-total");

const albumCover = document.getElementById("album-cover");
const albumTitle = document.getElementById("album-title");
const albumType = document.getElementById("album-type");
const albumMeta = document.getElementById("album-meta");
const trackList = document.getElementById("track-list");

const playAlbumButton = document.getElementById("play-album");
const downloadAlbumButton = document.getElementById("download-album");

const playerCover = document.getElementById("player-cover");
const nowTitle = document.getElementById("now-title");

const playButton = document.getElementById("play-button");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

const currentTime = document.getElementById("current-time");
const totalTime = document.getElementById("total-time");
const progress = document.getElementById("progress");

const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

let currentAlbumIndex = 0;
let currentTrackIndex = -1;

function getAlbum(index = currentAlbumIndex) {
    return albums[index];
}

function getAlbumCover(album) {
    return `albums/${album.folder}/${album.cover}`;
}

function getTrackPath(album, track) {
    return `albums/${album.folder}/${track.file}`;
}

function showView(name) {
    libraryView.classList.remove("active-view");
    albumView.classList.remove("active-view");
    searchView.classList.remove("active-view");

    if (name === "library") {
        libraryView.classList.add("active-view");
    }

    if (name === "album") {
        albumView.classList.add("active-view");
    }

    if (name === "search") {
        searchView.classList.add("active-view");
    }
}

function updateAlbumURL(album) {
    const url = new URL(window.location);
    url.searchParams.set("album", album.id);
    history.pushState({}, "", url);
}

function renderLibrary() {
    albumGrid.innerHTML = "";

    libraryTotal.textContent =
        `${albums.length.toString().padStart(2, "0")} RELEASES`;

    albums.forEach((album, index) => {

        const card = document.createElement("button");

        card.className = "album-card";

        card.innerHTML = `
            <div class="album-card-cover">
                <img src="${getAlbumCover(album)}" alt="${album.name}">
            </div>
            <div class="album-card-title">${album.name}</div>
            <div class="album-card-meta">${album.type}</div>
        `;

        card.addEventListener("click", () => openAlbum(index));

        albumGrid.appendChild(card);
    });
}

function openAlbum(index) {
    currentAlbumIndex = index;
    currentTrackIndex = -1;

    const album = getAlbum();

    updateAlbumURL(album);

    albumCover.src = getAlbumCover(album);
    albumTitle.textContent = album.name;
    albumType.textContent = album.type;
    albumMeta.textContent = `${album.tracks.length} TRACKS`;

    renderTracks();

    showView("album");
}

function renderTracks() {
    const album = getAlbum();

    trackList.innerHTML = "";

    album.tracks.forEach((track, index) => {

        const button = document.createElement("button");

        button.className = "track";

        button.innerHTML = `
            <span class="track-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="track-name">${track.title}</span>
            <span class="track-duration">--:--</span>
        `;

        button.addEventListener("click", () => {
            loadTrack(index);
            playTrack();
        });

        trackList.appendChild(button);
    });
}

function loadTrack(index) {
    const album = getAlbum();
    const track = album.tracks[index];

    currentTrackIndex = index;

    audio.src = getTrackPath(album, track);

    nowTitle.textContent = track.title;

    playerCover.src = getAlbumCover(album);

    audio.load();
}

function playTrack() {
    audio.play();
    playButton.textContent = "PAUSE";
}

function pauseTrack() {
    audio.pause();
    playButton.textContent = "PLAY";
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

function nextTrack() {
    const album = getAlbum();

    if (currentTrackIndex < album.tracks.length - 1) {
        loadTrack(currentTrackIndex + 1);
    } else {
        loadTrack(0);
    }

    playTrack();
}

function previousTrack() {
    const album = getAlbum();

    if (currentTrackIndex > 0) {
        loadTrack(currentTrackIndex - 1);
    } else {
        loadTrack(album.tracks.length - 1);
    }

    playTrack();
}

function updateProgress() {

    if (!audio.duration) return;

    progress.value = (audio.currentTime / audio.duration) * 100;

    currentTime.textContent = formatTime(audio.currentTime);

    totalTime.textContent = formatTime(audio.duration);
}

function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${secs}`;
}

async function downloadAlbum() {

    const album = getAlbum();

    if (!album) return;

    const zip = new JSZip();

    for (const track of album.tracks) {

        const response = await fetch(getTrackPath(album, track));

        const data = await response.arrayBuffer();

        zip.file(track.file, data);
    }

    const blob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${album.name}.zip`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}

function renderSearchResults() {

    const query = searchInput.value.toLowerCase().trim();

    searchResults.innerHTML = "";

    if (!query) return;

    albums.forEach((album, albumIndex) => {

        album.tracks.forEach((track, trackIndex) => {

            if (
                track.title.toLowerCase().includes(query) ||
                album.name.toLowerCase().includes(query)
            ) {

                const button = document.createElement("button");

                button.className = "search-result";

                button.innerHTML = `
                    <span class="search-result-title">${track.title}</span>
                    <span class="search-result-album">${album.name}</span>
                `;

                button.addEventListener("click", () => {
                    openAlbum(albumIndex);
                    loadTrack(trackIndex);
                    playTrack();
                });

                searchResults.appendChild(button);
            }
        });
    });
}

document.getElementById("library-button")
    .addEventListener("click", () => showView("library"));

document.getElementById("search-button")
    .addEventListener("click", () => showView("search"));

document.getElementById("brand-button")
    .addEventListener("click", () => showView("library"));

document.getElementById("back-to-library")
    .addEventListener("click", () => showView("library"));

playAlbumButton.addEventListener("click", () => {

    if (currentTrackIndex === -1) {
        loadTrack(0);
    }

    playTrack();
});

downloadAlbumButton.addEventListener("click", downloadAlbum);

playButton.addEventListener("click", togglePlay);

previousButton.addEventListener("click", previousTrack);

nextButton.addEventListener("click", nextTrack);

audio.addEventListener("ended", nextTrack);

audio.addEventListener("timeupdate", updateProgress);

progress.addEventListener("input", () => {

    if (!audio.duration) return;

    audio.currentTime = (progress.value / 100) * audio.duration;
});

searchInput.addEventListener("input", renderSearchResults);

renderLibrary();

const params = new URLSearchParams(window.location.search);
const albumId = params.get("album");

if (albumId) {

    const index = albums.findIndex(album => album.id === albumId);

    if (index !== -1) {
        openAlbum(index);
    } else {
        showView("library");
    }

} else {

    showView("library");
}
