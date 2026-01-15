// Render a list of artists in the artistListContainer
function renderArtists(artists) {
    const artistList = document.getElementById('artistList');
    if (!artistList) return;
    artistList.innerHTML = '';
    if (!artists || artists.length === 0) {
        artistList.innerHTML = '<div class="empty-state"><p>No artists found.</p></div>';
        return;
    }
    artists.forEach(artist => {
        const card = renderArtistCard(artist);
        artistList.appendChild(card);
    });
}
const searchSongQuery = "best hindi songs";
const masterPlay = document.getElementById("masterPlay");
const myProgressBar = document.getElementById("myProgressBar");
const currentTimeDisplay = document.getElementById("currentTime");
const totalTimeDisplay = document.getElementById("totalTime");
const currentSongName = document.getElementById("currentSongName");
const playingGif = document.getElementById("playingGif");
const likeBtn = document.getElementById("likeSong");
const volumeSlider = document.getElementById("volumeSlider");
const volumeBtn = document.getElementById("volumeBtn");


let audio = new Audio();
let currentSongIndex = 0;
let songs = []; // dynamic list
let lastSearchedSongs = []; // To store the result of the last search
let isShuffled = false;
let suggestionTimeout;
let isRepeating = false;
let isMuted = false;
let isFavoritesViewActive = false;
let previousVolume = 1;
let initialSongs = [];

// Local songs
const localSongs = [
    { name: "Legions - Mortals", artist: "Mortals", filePath: "songs/1.mp3", coverPath: "covers/1.jpg" },
    { name: "Trap Cartel - Huma-Huma", artist: "Trap Cartel", filePath: "songs/2.mp3", coverPath: "covers/2.jpg" },
    { name: "They MAD - Alan Walker", artist: "Alan Walker", filePath: "songs/3.mp3", coverPath: "covers/3.jpg" },
    { name: "Rich THE Kid - Alan Walker", artist: "Alan Walker", filePath: "songs/4.mp3", coverPath: "covers/4.jpg" },
    { name: "Alone - Marshmello", artist: "Marshmello", filePath: "songs/5.mp3", coverPath: "covers/5.jpg" },
    { name: "Safety Dance - Marshmello", artist: "Marshmello", filePath: "songs/6.mp3", coverPath: "covers/6.jpg" },
    { name: "Back It Up - OneRepublic", artist: "OneRepublic", filePath: "songs/7.mp3", coverPath: "covers/7.jpg" },
    { name: "BeAware - OneRepublic", artist: "OneRepublic", filePath: "songs/8.mp3", coverPath: "covers/8.jpg" },
    { name: "Beast - OneRepublic", artist: "OneRepublic", filePath: "songs/9.mp3", coverPath: "covers/9.jpg" },
    { name: "Tryhard - OneRepublic", artist: "OneRepublic", filePath: "songs/10.mp3", coverPath: "covers/10.jpg" },
];

// Utility Functions
function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function showLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay){
        loadingOverlay.classList.add('show');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay){
        loadingOverlay.classList.remove('show');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius-md);
        border: 1px solid var(--border-color);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Reset Play Button to Default Play Icon Into Every songItem
function resetSongItemIcons() {
    document.querySelectorAll(".songPlay").forEach(icon => {
        icon.classList.remove("fa-pause-circle");
        icon.classList.add("fa-play-circle");
    });
}

// Enhanced song rendering with improved UI
function renderSongs(songArray) {
    const songList = document.getElementById("songList");
    if (!songList) {
        console.error("Song list container not found! Cannot render songs.");
        return;
    }
    if (songArray.length === 0) {
        songList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-music" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <h3 style="opacity: 0.7; margin-bottom: 0.5rem;">No songs found</h3>
                <p style="opacity: 0.5;">Try searching for something else</p>
            </div>
        `;
        return;
    }
    songList.innerHTML = "";
        songArray.forEach((song, index) => {
        const songNameHTML = song.name.length > 25 ? `<marquee direction="left" scrollamount="3">${song.name}</marquee>` : song.name;
        const songItem = document.createElement("div");
        songItem.className = "songItem fade-in";
        songItem.dataset.songId = song.filePath; // Use filePath as a unique ID
        songItem.style.animationDelay = `${index * 0.1}s`;
        
        songItem.innerHTML = `
            <img src="${song.coverPath}" alt="Free royalty-free music download - AK Tunes" onerror="this.src='https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵'" />
            <div class="song-info">
                <div class="song-name">${songNameHTML}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <i class="fas fa-play-circle songPlay" data-song-id="${song.filePath}"></i>
        `;
        songList.appendChild(songItem);
    });

    addSongItemClickHandlers();

    hideLoading();
}

function addSongItemClickHandlers() {
    document.querySelectorAll(".songItem").forEach(item => {
        item.addEventListener("click", (e) => {
            if (e.target.closest('.songPlay')) return; // Don't trigger when clicking play button
            playSongById(item.dataset.songId);
        });
    });

    document.querySelectorAll(".songPlay").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            playSongById(btn.dataset.songId);
        });
    });
}


// Enhanced play function with better visual feedback
function playSongById(songId) {
    const index = songs.findIndex(s => s.filePath === songId);
    if (index === -1) {
        console.error(`Song with ID "${songId}" not found.`);
        return;
    }

    if (index < 0 || index >= songs.length) return;
    
    currentSongIndex = index;
    const song = songs[index];
    audio.src = song.filePath;
    
    // Update UI immediately
    resetSongItemIcons();
    updateCurrentSongUI(song);
    
    audio.play().catch(error => {
        // Ignore AbortError which happens when the user quickly changes songs.
        if (error.name === 'AbortError') {
            return;
        }
        console.error('Error playing audio:', error);
        showNotification('Error playing this song', 'error');
    });

    // Update play icon for the current song
    const activeIcon = document.querySelector(`.songPlay[data-song-id="${song.filePath}"]`);
    if (activeIcon) {
        activeIcon.classList.remove("fa-play-circle");
        activeIcon.classList.add("fa-pause-circle");
    }

    // Highlight current song
    document.querySelectorAll('.songItem').forEach(item => {
        item.classList.remove('active');
    });
    
    const currentSongItem = document.querySelector(`.songItem[data-song-id="${song.filePath}"]`);
    if (currentSongItem) {
        currentSongItem.classList.add('active');
    }

    const masterPlayIcon = masterPlay.querySelector('i');
    masterPlayIcon.classList.remove("fa-play-circle");
    masterPlayIcon.classList.add("fa-pause-circle");
    playingGif.style.opacity = 1;
}

function updateCurrentSongUI(song) {
    // currentSongName.innerText = song.name;
    currentSongName.innerHTML = song.name || "Unknown Song";

    
    // Show song artist when song is playing
    const currentArtist = document.getElementById("currentArtist");
    // likeBtn = document.getElementById("likeSong");
    if (currentArtist) {
        currentArtist.style.display = "block";
    }

    // Update like button status for the current song
    if (likeBtn) {
        const icon = likeBtn.querySelector('i');
        if (icon) {
            likeBtn.classList.toggle('liked', !!song.isLiked);
            icon.classList.toggle('far', !song.isLiked);
            icon.classList.toggle('fas', !!song.isLiked);
        }
        likeBtn.style.display = "block";
    }
    
    const songArtwork = document.querySelector('.song-artwork img');
    if (songArtwork) {
        songArtwork.src = song.coverPath;
        songArtwork.onerror = () => {
            songArtwork.src = 'https://via.placeholder.com/50x50/6366f1/ffffff?text=🎵';
        };
    }
}

/**
 * Saves the filePaths of liked songs to localStorage.
 */
function saveLikedSongs() {
    const likedSongPaths = songs
        .filter(song => song.isLiked)
        .map(song => song.filePath);
    localStorage.setItem('likedSongs', JSON.stringify(likedSongPaths));
}

/**
 * Loads the set of liked song filePaths from localStorage.
 * @returns {Set<string>} A set of filePaths for liked songs.
 */
function loadLikedSongs() {
    const likedSongPaths = JSON.parse(localStorage.getItem('likedSongs')) || [];
    return new Set(likedSongPaths);
}

if (likeBtn) {
    likeBtn.addEventListener("click", () => {
        if (songs.length === 0) return;
        const song = songs[currentSongIndex];
        song.isLiked = !song.isLiked; // Toggle state
        updateCurrentSongUI(song); // Update the player UI
        saveLikedSongs(); // Persist the change
        showNotification(song.isLiked ? 'Added to favorites' : 'Removed from favorites', song.isLiked ? 'success' : 'info');

        // If we are in favorites view, refresh the list to show the change (add or remove)
        if (isFavoritesViewActive) {
            // Use a small delay to allow the user to see the heart icon change before the item disappears/appears
            setTimeout(() => {
                renderFavoriteSongs();
            }, 300);
        }
    });
}



/**
 * Filters and displays only the songs marked as 'liked'.
 * To use this, you would add a button to your HTML, for example:
 * <button id="showFavoritesBtn"><i class="fas fa-heart"></i> Favorites</button>
 * Then you can uncomment and use the event listener below.
 */
function renderFavoriteSongs() {
    const songList = document.getElementById("songList");
    if (!songList) {
        console.error("Song list container not found for favorites!");
        return;
    }
    const favoriteSongsExist = songs.some(song => song.isLiked);

    if (!favoriteSongsExist) {
        songList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <h3 style="opacity: 0.7; margin-bottom: 0.5rem;">No favorite songs yet</h3>
                <p style="opacity: 0.5;">Click the heart icon on a song to add it here.</p>
            </div>
        `;
        return;
    }

    songList.innerHTML = ""; // Clear the current list
    let animationIndex = 0; // Separate index for animation delay

    // Iterate over the original 'songs' array to preserve the index
    songs.forEach((song, index) => {
        if (song.isLiked) {
            // const displayName = song.name.length > 35 ? song.name.substring(0, 35) + "..." : song.name;
            const displayName = song.name
            const songItem = document.createElement("div");
            songItem.className = "songItem fade-in";
            songItem.dataset.songId = song.filePath; // Use the song's filepath as the ID
            songItem.style.animationDelay = `${animationIndex * 0.1}s`;

            songItem.innerHTML = `
                <img src="${song.coverPath}" alt="Free royalty-free music download - AK Tunes" onerror="this.src='https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵'" />
                <div class="song-info">
                    <div class="song-name">${displayName}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <i class="fas fa-play-circle songPlay" data-song-id="${song.filePath}"></i>
            `;
            songList.appendChild(songItem);
            animationIndex++;
        }
    });

    // Re-add click handlers for the newly created items
    addSongItemClickHandlers();

    // If a song is currently playing and it's a favorite, update its UI
    if (!audio.paused) {
        const activeIcon = document.querySelector(`.songPlay[data-song-id="${songs[currentSongIndex].filePath}"]`);
        if (activeIcon) {
            activeIcon.classList.remove("fa-play-circle");
            activeIcon.classList.add("fa-pause-circle");
        }
        const currentSongItem = document.querySelector(`.songItem[data-song-id="${songs[currentSongIndex].filePath}"]`);
        if (currentSongItem) {
            currentSongItem.classList.add('active');
        }
    }
}

function toggleFavoritesView(forceShow = null) {
    const btn = document.getElementById("showFavoritesBtn");
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (forceShow === true) {
        isFavoritesViewActive = true;
    } else if (forceShow === false) {
        isFavoritesViewActive = false;
    } else {
        isFavoritesViewActive = !isFavoritesViewActive;
    }
    if (isFavoritesViewActive) {
        renderFavoriteSongs();
        showNotification("Showing favorite songs", 'info');
        btn.classList.add('active');
        icon.classList.remove('far');
        icon.classList.add('fas');
    } else {
        renderSongs(lastSearchedSongs);
        showNotification("Showing all songs", 'info');
        btn.classList.remove('active');
        icon.classList.remove('fas');
        icon.classList.add('far');
    }
}

document.getElementById("showFavoritesBtn")?.addEventListener('click', () => toggleFavoritesView());

// Enhanced master play/pause with better state management
masterPlay.addEventListener("click", () => {
    if (songs.length === 0) {
        showNotification('No songs available', 'warning');
        return;
    }
    
    if (!audio.src) {
        playSongById(songs[currentSongIndex].filePath);
        return;
    }

    const masterPlayIcon = masterPlay.querySelector('i');
    
    if (audio.paused || audio.currentTime <= 0) {
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
            showNotification('Error playing audio', 'error');
        });
    } else {
        audio.pause();
    }
});

// Enhanced audio event listeners
audio.addEventListener("pause", () => {
    const masterPlayIcon = masterPlay.querySelector('i');
    masterPlayIcon.classList.remove("fa-pause-circle");
    masterPlayIcon.classList.add("fa-play-circle");
    playingGif.style.opacity = 0;

    const activeIcon = document.querySelector(`.songPlay[data-song-id="${songs[currentSongIndex].filePath}"]`);
    if (activeIcon) {
        activeIcon.classList.remove("fa-pause-circle");
        activeIcon.classList.add("fa-play-circle");
    }
});

audio.addEventListener("play", () => {
    const masterPlayIcon = masterPlay.querySelector('i');
    masterPlayIcon.classList.remove("fa-play-circle");
    masterPlayIcon.classList.add("fa-pause-circle");
    playingGif.style.opacity = 1;

    resetSongItemIcons();
    const activeIcon = document.querySelector(`.songPlay[data-song-id="${songs[currentSongIndex].filePath}"]`);
    if (activeIcon) {
        activeIcon.classList.remove("fa-play-circle");
        activeIcon.classList.add("fa-pause-circle");
    }
});

// Enhanced progress bar with smooth updates
audio.addEventListener("timeupdate", () => {
    if (myProgressBar && !isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        myProgressBar.value = progress;

        // Update gradient background
        myProgressBar.style.background = `linear-gradient(to right, var(--primary-color) ${progress}%, var(--bg-card) ${progress}%)`;

        currentTimeDisplay.textContent = formatTime(audio.currentTime);
        totalTimeDisplay.textContent = formatTime(audio.duration);
    }
});


myProgressBar.addEventListener("input", () => {
    if (!isNaN(audio.duration)) {
        audio.currentTime = (myProgressBar.value * audio.duration) / 100;
    }
});

// Volume control
volumeSlider.addEventListener("input", (e) => {
    const volume = e.target.value / 100;
    audio.volume = volume;
    updateVolumeIcon(volume);
});

volumeBtn.addEventListener("click", () => {
    if (isMuted) {
        audio.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
        isMuted = false;
    } else {
        previousVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
        isMuted = true;
    }
    updateVolumeIcon(audio.volume);
});

function updateVolumeIcon(volume) {
    const volumeIcon = volumeBtn.querySelector('i');
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Enhanced API search with multiple pages for more songs
async function searchSongsOnline(query) {
    try {
        showLoading();
        let allSongs = [];
        const maxPages = 10; // Max pages to fetch in background
        const initialPages = 2; // Show 1 or 2 pages first
        const limit = 40;

        // Fetch first page
        const firstRes = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=${limit}`);
        if (!firstRes.ok) throw new Error(`HTTP error! status: ${firstRes.status}`);
        const firstData = await firstRes.json();
        if (!firstData.data.results || firstData.data.results.length === 0) throw new Error("No songs found");

        let firstPageSongs = firstData.data.results.map(song => ({
            name: song.name || 'Unknown Song',
            artist: song.artists?.primary?.[0]?.name || 'Unknown Artist',
            filePath: song.downloadUrl?.length ? song.downloadUrl[song.downloadUrl.length - 1].url : "",
            coverPath: song.image?.length ? song.image[song.image.length - 1].url : "https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵",
        })).filter(song => song.filePath);

        allSongs = allSongs.concat(firstPageSongs);

        // Shuffle the songs so order is different every load
        const shuffledSongs = [...allSongs].sort(() => Math.random() - 0.5);
        songs = shuffledSongs;
        lastSearchedSongs = [...shuffledSongs];
        if (initialSongs.length === 0) {
            initialSongs = [...shuffledSongs];
        }
        renderSongs(songs);
        hideLoading();

        // Fetch second page (if available) and render
        const totalSongs = firstData.data.total || 1800;
        const totalPages = Math.min(Math.ceil(totalSongs / limit), maxPages);
        if (totalPages >= 2) {
            fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&page=2&limit=${limit}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.data.results && data.data.results.length > 0) {
                        const secondPageSongs = data.data.results.map(song => ({
                            name: song.name || 'Unknown Song',
                            artist: song.artists?.primary?.[0]?.name || 'Unknown Artist',
                            filePath: song.downloadUrl?.length ? song.downloadUrl[song.downloadUrl.length - 1].url : "",
                            coverPath: song.image?.length ? song.image[song.image.length - 1].url : "https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵",
                        })).filter(song => song.filePath);
                        // Append to list and render new songs
                        allSongs = allSongs.concat(secondPageSongs);
                        // Shuffle after adding new songs
                        const shuffledSongs = [...allSongs].sort(() => Math.random() - 0.5);
                        songs = shuffledSongs;
                        lastSearchedSongs = [...shuffledSongs];
                        appendSongsToList(secondPageSongs);
                    }
                });
        }

        // Fetch remaining pages in background and append as they arrive
        for (let page = 3; page <= totalPages; page++) {
            fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.data.results && data.data.results.length > 0) {
                        const moreSongs = data.data.results.map(song => ({
                            name: song.name || 'Unknown Song',
                            artist: song.artists?.primary?.[0]?.name || 'Unknown Artist',
                            filePath: song.downloadUrl?.length ? song.downloadUrl[song.downloadUrl.length - 1].url : "",
                            coverPath: song.image?.length ? song.image[song.image.length - 1].url : "https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵",
                        })).filter(song => song.filePath);
                        allSongs = allSongs.concat(moreSongs);
                        // Shuffle after adding new songs
                        const shuffledSongs = [...allSongs].sort(() => Math.random() - 0.5);
                        songs = shuffledSongs;
                        lastSearchedSongs = [...shuffledSongs];
                        appendSongsToList(moreSongs);
                    }
                });
        }

        // Reset favorites view if a new search is successful
        isFavoritesViewActive = false;
        const favBtn = document.getElementById("showFavoritesBtn");
        if (favBtn) {
            favBtn.classList.remove('active');
            const icon = favBtn.querySelector('i');
            icon.classList.remove('fas');
            icon.classList.add('far');
        }

    } catch (err) {
        console.warn("API failed, using fallback songs.", err);
        // Shuffle localSongs before assigning
        const shuffledLocalSongs = [...localSongs].sort(() => Math.random() - 0.5);
        songs = shuffledLocalSongs;
        lastSearchedSongs = [...shuffledLocalSongs];
        if (initialSongs.length === 0) {
            initialSongs = [...shuffledLocalSongs];
        }
        renderSongs(songs);
        showNotification('Using offline songs', 'warning');
        hideLoading();
    }
}

// Append new songs to the song list in the UI
function appendSongsToList(newSongs) {
    const songList = document.getElementById("songList");
    if (!songList || !Array.isArray(newSongs) || newSongs.length === 0) return;
    newSongs.forEach((song, index) => {
        const songNameHTML = song.name.length > 25 ? `<marquee direction="left" scrollamount="3">${song.name}</marquee>` : song.name;
        const songItem = document.createElement("div");
        songItem.className = "songItem fade-in";
        songItem.dataset.songId = song.filePath;
        songItem.style.animationDelay = `0s`;
        songItem.innerHTML = `
            <img src="${song.coverPath}" alt="Free royalty-free music download - AK Tunes" onerror="this.src='https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵'" />
            <div class="song-info">
                <div class="song-name">${songNameHTML}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <i class="fas fa-play-circle songPlay" data-song-id="${song.filePath}"></i>
        `;
        songList.appendChild(songItem);
    });
    addSongItemClickHandlers();
}

// Enhanced navigation with shuffle support
function getNextIndex() {
    if (isShuffled) {
        return Math.floor(Math.random() * songs.length);
    }
    return (currentSongIndex + 1) % songs.length;
}

function getPreviousIndex() {
    if (isShuffled) {
        return Math.floor(Math.random() * songs.length);
    }
    return (currentSongIndex - 1 + songs.length) % songs.length;
}

// Previous button
document.getElementById("previous").addEventListener("click", () => {
    if (songs.length === 0) return;
    currentSongIndex = getPreviousIndex();
    playSongById(songs[currentSongIndex].filePath);
});

// Next button
document.getElementById("next").addEventListener("click", () => {
    if (songs.length === 0) return;
    currentSongIndex = getNextIndex();
    playSongById(songs[currentSongIndex].filePath);
});

// Enhanced auto-play with repeat functionality
audio.addEventListener("ended", () => {
    if (songs.length === 0) return;
    
    if (isRepeating) {
        playSongById(songs[currentSongIndex].filePath);
    } else {
        currentSongIndex = getNextIndex();
        playSongById(songs[currentSongIndex].filePath);
    }
});

// Enhanced keyboard controls
document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
    }

    switch(e.code) {
        case "Space":
            e.preventDefault();
            if (!audio.src || audio.src.trim() === "") {
                if (songs.length > 0) {
                    playSongById(songs[currentSongIndex].filePath);
                }
            } else if (audio.paused || audio.currentTime <= 0) {
                audio.play();
            } else {
                audio.pause();
            }
            break;

        case "ArrowUp":
            e.preventDefault();
            audio.volume = Math.min(1, audio.volume + 0.05);
            volumeSlider.value = audio.volume * 100;
            updateVolumeIcon(audio.volume);
            break;

        case "ArrowDown":
            e.preventDefault();
            audio.volume = Math.max(0, audio.volume - 0.05);
            volumeSlider.value = audio.volume * 100;
            updateVolumeIcon(audio.volume);
            break;

        case "ArrowRight":
            e.preventDefault();
            if (songs.length === 0) return;
            currentSongIndex = getNextIndex();
            playSongById(songs[currentSongIndex].filePath);
            break;

        case "ArrowLeft":
            e.preventDefault();
            if (songs.length === 0) return;
            currentSongIndex = getPreviousIndex();
            playSongById(songs[currentSongIndex].filePath);
            break;

        case "KeyS":
            e.preventDefault();
            document.getElementById("shuffle").click();
            break;

        case "KeyR":
            e.preventDefault();
            document.getElementById("repeat").click();
            break;
    }
});

// Enhanced download functionality
document.getElementById("downloadSong").addEventListener("click", () => {
    if (!songs[currentSongIndex] || !songs[currentSongIndex].filePath) {
        showNotification('No song selected for download', 'warning');
        return;
    }

    const fileUrl = songs[currentSongIndex].filePath;
    const fileName = songs[currentSongIndex].name.replace(/[^a-z0-9]/gi, "_") + ".mp3";

    // Show status section
    const statusBox = document.getElementById("downloadStatus");
    const statusText = document.getElementById("statusText");
    const progressBar = document.getElementById("downloadProgress");
    const progressText = document.getElementById("progressText");
    
    statusBox.style.display = "block";
    statusText.textContent = "Starting download...";
    progressBar.value = 0;
    progressText.textContent = "0%";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", fileUrl, true);
    xhr.responseType = "blob";

    xhr.onprogress = function (event) {
        if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            progressBar.value = percent;
            progressText.textContent = `${percent.toFixed(1)}%`;
            statusText.textContent = "Downloading...";
            
            // Update download size
            const downloadSize = document.getElementById("downloadSize");
            if (downloadSize) {
                const totalMB = (event.total / (1024 * 1024)).toFixed(1);
                downloadSize.textContent = `${totalMB} MB`;
            }
        } else {
            statusText.textContent = "Downloading...";
            progressText.textContent = "...";
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            statusText.textContent = "Download completed!";
            progressBar.value = 100;
            progressText.textContent = "100%";

            const blob = xhr.response;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('Download completed successfully!', 'success');

            setTimeout(() => {
                statusBox.style.display = "none";
            }, 2000);

        } else {
            statusText.textContent = "Download failed!";
            progressText.textContent = "Error";
            showNotification('Download failed. Please try again.', 'error');
        }
    };

    xhr.onerror = function () {
        statusText.textContent = "Download failed!";
        progressText.textContent = "Error";
        showNotification('Network error during download', 'error');
    };

    xhr.send();
});

// Initialize app
function initApp() {
    // This function initializes components that are ALWAYS on the page.
    // Start with local songs to provide an immediate list while waiting for the API.

    // Load liked songs from storage and apply to local fallback list
    const likedSongsSet = loadLikedSongs();
    localSongs.forEach(song => {
        if (likedSongsSet.has(song.filePath)) {
            song.isLiked = true;
        }
    });

    // Shuffle localSongs for a different order on every load
    const shuffledLocalSongs = [...localSongs].sort(() => Math.random() - 0.5);
    songs = shuffledLocalSongs;
    lastSearchedSongs = [...shuffledLocalSongs];
    initialSongs = [...shuffledLocalSongs];

    // Add dynamic CSS styles for the app
    if (!document.getElementById('dynamicStyles')) {
        const appStyles = document.createElement('style');
        appStyles.id = 'dynamicStyles';
        appStyles.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                text-align: center;
                grid-column: 1 / -1;
            }
            .songItem.active {
                background: var(--bg-card-hover) !important;
                border-color: var(--primary-color) !important;
                box-shadow: var(--shadow-glow) !important;
            }

            /* Artist Grid Styles */
            .artist-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 1.5rem;
                padding: 1.5rem;
            }

            .artist-card {
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                overflow: hidden;
                transition: all 0.3s ease;
                cursor: pointer;
                display: flex;
                flex-direction: column;
            }

            .artist-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-lg);
                border-color: var(--primary-color);
            }

            .artist-image {
                width: 100%;
                padding-top: 100%;
                position: relative;
                overflow: hidden;
                background: var(--bg-card-hover);
            }

            .artist-image img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }

            .artist-card:hover .artist-image img {
                transform: scale(1.1);
            }

            .artist-info {
                padding: 1rem;
                text-align: center;
            }

            .artist-name {
                margin: 0;
                font-size: 1.1rem;
                color: var(--text-primary);
                font-weight: 600;
            }

            .artist-role {
                display: block;
                margin-top: 0.5rem;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            #artistSearchInput {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-md);
                background: var(--bg-input);
                color: var(--text-primary);
                margin-bottom: 1.5rem;
            }

            #artistSearchInput:focus {
                border-color: var(--primary-color);
                outline: none;
                box-shadow: var(--shadow-glow);
            }

            /* Loading Overlay Fix */
            #loadingOverlay {
                position: fixed;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background: rgba(15, 15, 35, 0.9);
                backdrop-filter: blur(10px);
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 1000 !important;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            #loadingOverlay.show {
                opacity: 1;
                visibility: visible;
            }
        `;
        document.head.appendChild(appStyles);
    }
    
    // Set initial volume
    audio.volume = 1;
    volumeSlider.value = 100;
    // Add some CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
            grid-column: 1 / -1;
        }
        .songItem.active {
            background: var(--bg-card-hover) !important;
            border-color: var(--primary-color) !important;
            box-shadow: var(--shadow-glow) !important;
        }

        /* --- Loading Overlay Fix --- */
        #loadingOverlay {
            position: fixed;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(15, 15, 35, 0.9);
            backdrop-filter: blur(10px);
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 1000 !important;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        #loadingOverlay.show {
            opacity: 1;
            visibility: visible;
        }
    `;

    // Player controls that are always present
    const shufflebtn = document.getElementById("shuffle");
    if (shufflebtn) {
        shufflebtn.addEventListener("click", (e) => {
            isShuffled = !isShuffled;
            e.currentTarget.classList.toggle('active', isShuffled);
            showNotification(isShuffled ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
        });
    }

    const repeatbtn = document.getElementById("repeat");
    if (repeatbtn) {
        repeatbtn.addEventListener("click", (e) => {
            isRepeating = !isRepeating;
            e.currentTarget.classList.toggle('active', isRepeating);
            showNotification(isRepeating ? 'Repeat enabled' : 'Repeat disabled', 'info');
        });
    }
}

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');

    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('light-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            body.classList.remove('light-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        localStorage.setItem('theme', theme);
    };

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(prefersDark ? 'dark' : 'light');
    }
}

const MAX_HISTORY_ITEMS = 10;

function getSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory')) || [];
}

function saveSearchHistory(history) {
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

function addToSearchHistory(query) {
    if (!query) return;
    let history = getSearchHistory();
    const lowerCaseQuery = query.toLowerCase();
    // Remove existing entry to move it to the top
    history = history.filter(item => item.toLowerCase() !== lowerCaseQuery);
    // Add new query to the beginning
    history.unshift(query);
    // Limit history size
    if (history.length > MAX_HISTORY_ITEMS) {
        history.pop();
    }
    saveSearchHistory(history);
}

function showSearchHistory() {
    const suggestionsContainer = document.getElementById("searchSuggestions");
    if (!suggestionsContainer) return;

    const history = getSearchHistory();
    suggestionsContainer.innerHTML = '';

    if (history.length > 0) {
        history.forEach(query => {
            const historyItem = document.createElement('div');
            historyItem.className = 'suggestion-item history-item';
            historyItem.innerHTML = `
                <i class="fas fa-history"></i>
                <span>${query}</span>
            `;
            historyItem.addEventListener('click', () => {
                const searchInput = document.getElementById("searchInput");
                searchInput.value = query;
                suggestionsContainer.classList.remove('active');
                showLoading();
                searchSongsOnline(query);
            });
            suggestionsContainer.appendChild(historyItem);
        });
        suggestionsContainer.classList.add('active');
    } else {
        suggestionsContainer.classList.remove('active');
    }
}

async function fetchAndShowSuggestions(query) {
    const suggestionsContainer = document.getElementById("searchSuggestions");
    if (!suggestionsContainer) return;

    if (query.length < 2) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('active');
        showSearchHistory(); // Show history if input is short
        return;
    }

    try {
        const res = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=10`);
        if (!res.ok) throw new Error('Suggestion API failed');
        
        const data = await res.json();

        if (data.success && data.data.results?.length > 0) {
            suggestionsContainer.innerHTML = '';
            const suggestionNames = new Set();

            data.data.results.forEach(song => {
                // Decode HTML entities (like &quot;) before cleaning the name
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = song.name;
                const decodedName = tempDiv.textContent || tempDiv.innerText;
                const cleanName = decodedName.replace(/ \(From ".*"\)/i, '').trim();

                if (suggestionNames.has(cleanName)) return;
                
                suggestionNames.add(cleanName);

                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.textContent = cleanName;
                suggestionItem.title = cleanName; // Show full name on hover
                suggestionItem.addEventListener('click', () => {
                    const searchInput = document.getElementById("searchInput");
                    searchInput.value = cleanName;
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.classList.remove('active');
                    showLoading();
                    addToSearchHistory(cleanName); // Add to history on click
                    searchSongsOnline(cleanName);
                });
                suggestionsContainer.appendChild(suggestionItem);
            });

            if (suggestionsContainer.hasChildNodes()) {
                suggestionsContainer.classList.add('active');
            } else {
                suggestionsContainer.classList.remove('active');
            }
        } else {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('active');
        }
    } catch (error) {
        console.warn('Could not fetch search suggestions:', error);
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('active');
        }
    }
}

function initHomePage() {
    const searchInput = document.getElementById("searchInput");
    const viewToggleBtns = document.querySelectorAll(".view-btn");
    const songItemContainer = document.getElementById("songList");
    const songListTitle = document.getElementById('songListTitle');

    // Reset song list to initial songs for home page
    songs = [...initialSongs];
    lastSearchedSongs = [...initialSongs]; // Also reset last searched to initial songs
    renderSongs(songs);

    // Reset song list title
    if (songListTitle) {
        songListTitle.textContent = "All Songs"; // Or whatever your default title is
    }

    // View toggle functionality
    if (viewToggleBtns.length > 0 && songItemContainer) {
        viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                
                viewToggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                songItemContainer.className = `songItemContainer ${view}-view`;
                
                // Re-render with the correct function to preserve indices
                if (isFavoritesViewActive) {
                    renderFavoriteSongs();
                } else {
                    renderSongs(lastSearchedSongs);
                }
            });
        });
    }

    // Search with suggestions and debouncing
    if (searchInput) {
        const suggestionsContainer = document.getElementById("searchSuggestions");

        searchInput.addEventListener("input", (e) => {
            clearTimeout(suggestionTimeout);
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                if (suggestionsContainer) {
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.classList.remove('active');
                }
                // When input is cleared, restore the correct view
                if (isFavoritesViewActive) {
                    renderFavoriteSongs();
                } else {
                    // When input is cleared, re-fetch the original API songs
                    searchSongsOnline(searchSongQuery);
                }
                return;
            }
            
            if (query.length > 1) {
                suggestionTimeout = setTimeout(() => {
                    fetchAndShowSuggestions(query);
                }, 300); // Debounce for 300ms
            } else {
                 if (suggestionsContainer) {
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.classList.remove('active');
                }
            }
        });

        // Show history on focus if input is empty
        searchInput.addEventListener('focus', () => {
            const query = searchInput.value.trim();
            if (query.length === 0) {
                showSearchHistory();
            }
        });

        // Handle search on Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(suggestionTimeout);
                if (suggestionsContainer) {
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.classList.remove('active');
                }
                const query = searchInput.value.trim();
                if (query) {
                    showLoading();
                    addToSearchHistory(query); // Add to history on search
                    searchSongsOnline(query);
                }
            }
        });

        // Hide suggestions when clicking outside the search bar
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar') && suggestionsContainer) {
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.classList.remove('active');
            }
        });
    }

    // Initial song fetch for home page
    // Check if we only have the local fallback songs
    if (songs.length <= localSongs.length || initialSongs.length === 0) { // Also check if initialSongs is empty
        searchSongsOnline(searchSongQuery);
    } else {
        // If we already have a list from a previous search, just render it
        renderSongs(songs);
    }
}

function initContactPage() {
    hideLoading();
    
    // Initialize EmailJS (do this globally to ensure it's available)
    if (typeof emailjs !== 'undefined') {
        emailjs.init("nmRcMh7mTaf_ZBOve");
    } else {
        console.error('EmailJS library not loaded');
        return;
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Remove any existing event listeners to prevent duplicates
        const newForm = contactForm.cloneNode(true);
        contactForm.parentNode.replaceChild(newForm, contactForm);
        
        // Add the event listener to the new form
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Form submitted via EmailJS handler'); // Debug log
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const successMessage = document.getElementById('successMessage');
            const errorMessage = document.getElementById('errorMessage');
            
            // Hide previous messages
            if (successMessage) successMessage.style.display = 'none';
            if (errorMessage) errorMessage.style.display = 'none';
            
            // Update button state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value || 'Contact Form Submission',
                message: document.getElementById('message').value,
                timestamp: new Date().toLocaleString()
            };
            
            console.log('Sending email with data:', formData); // Debug log
            
            // Send email to admin
            emailjs.send("service_3fsrn7p", "template_jebkbnq", {
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject,
                message: formData.message,
                timestamp: formData.timestamp,
                to_email: "official.abhishant.kumar@gmail.com"
            })
            .then(() => {
                console.log('Admin email sent successfully'); // Debug log
                // Send auto-reply to user
                return emailjs.send("service_3fsrn7p", "template_fh8brzc", {
                    to_name: formData.name,
                    to_email: formData.email,
                    subject: "Thank you for contacting AK Music App",
                    message: formData.message
                });
            })
            .then(() => {
                console.log('Auto-reply sent successfully'); // Debug log
                // Success - both emails sent
                if (successMessage) successMessage.style.display = 'block';
                showNotification('Message sent successfully! Check your email for confirmation.', 'success');
                newForm.reset();
            })
            .catch((error) => {
                // Error handling
                console.error('EmailJS Error:', error);
                if (errorMessage) errorMessage.style.display = 'block';
                showNotification('Failed to send message. Please try again or contact us directly.', 'error');
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                submitBtn.disabled = false;
            });
        });
        
        console.log('Contact form handler attached successfully'); // Debug log
    } else {
        console.error('Contact form not found');
    }
}




async function fetchArtistSongsUnlimited(artistId, artistName) {
    try {
        showLoading(`Loading songs by ${artistName}...`);
        let allSongs = [];
        const limit = 50;       // API limit per page
        const maxPages = 20;    // Maximum pages to fetch to avoid overload

        // Fetch songs page by page
        for (let page = 1; page <= maxPages; page++) {
            const res = await fetch(`https://saavn.sumit.co/api/artists/${artistId}/songs?page=${page}&limit=${limit}`);
            if (!res.ok) throw new Error(`Failed to fetch artist songs, page ${page}`);

            const data = await res.json();
            const songsOnPage = (data.data?.songs || []).map(song => ({
                name: song.name || 'Unknown Song',
                artist: artistName,
                filePath: song.downloadUrl?.length
                    ? song.downloadUrl[song.downloadUrl.length - 1].url
                    : "",
                coverPath: song.image?.length
                    ? song.image[song.image.length - 1].url.replace('150x150', '500x500')
                    : "https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵",
            })).filter(song => song.filePath);

            if (songsOnPage.length === 0) break; // Stop if no songs found on this page

            allSongs = allSongs.concat(songsOnPage);
        }

        if (allSongs.length === 0) {
            showNotification(`No songs found for ${artistName}`, 'warning');
        }

        // Shuffle and limit results for performance
        const shuffledSongs = allSongs.sort(() => Math.random() - 0.5);
        songs = shuffledSongs.slice(0, 300); // max 300 songs
        lastSearchedSongs = [...songs];

        // Render songs
        await loadPage('home.html', true, false);
        renderSongs(songs);

        const songListTitle = document.getElementById('songListTitle');
        if (songListTitle) {
            songListTitle.textContent = `Top Songs by ${artistName}`;
        }

    } catch (error) {
        console.error('Error fetching artist songs:', error);
        showNotification('Could not load artist songs.', 'error');
    } finally {
        hideLoading();
    }
}







// Artist card rendering with enhanced styling and click handling
function createSongElement(song, index) {
    const songItem = document.createElement('div');
    songItem.className = 'songItem';
    songItem.dataset.songId = song.filePath;
    
    songItem.innerHTML = `
        <img src="${song.coverPath}" alt="${song.name}">
        <div class="songInfo">
            <span class="songName">${song.name}</span>
            <span class="artistName">${song.artist}</span>
        </div>
        <div class="songItemPlay songPlay" data-song-id="${song.filePath}">
            <i class="fas fa-play-circle"></i>
        </div>
        ${song.isLiked ? '<i class="fas fa-heart liked"></i>' : '<i class="far fa-heart"></i>'}
    `;
    
    return songItem;
}

function renderArtistCard(artist) {
    const artistCard = document.createElement('div');
    artistCard.className = 'artist-card fade-in';
    artistCard.innerHTML = `
        <div class="artist-image">
            <img src="${artist.image[2]?.url || artist.image[1]?.url || artist.image[0]?.url}" 
                 alt="${artist.name}" 
                 loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/120x120/6366f1/ffffff?text=${encodeURIComponent(artist.name.charAt(0))}'"/>
        </div>
        <div class="artist-info">
            <h3 class="artist-name">${artist.name}</h3>
            ${artist.role ? `<span class="artist-role">${artist.role}</span>` : ''}
        </div>
    `;
    
    // Add click handler to load artist songs
    artistCard.addEventListener('click', async (e) => {
        e.preventDefault();
        // Immediately navigate to home page, which will trigger initHomePage() and reset songs to initialSongs
        await loadPage('home.html', true, false);
        
        // Now fetch artist-specific songs
        try {
            showLoading(`Loading songs by ${artist.name}...`);
            let allArtistSongs = [];
            const limit = 50;
            const maxPages = 10; // Limit to 10 pages for artist songs

            for (let page = 1; page <= maxPages; page++) {
                const res = await fetch(`https://saavn.sumit.co/api/artists/${artist.id}/songs?page=${page}&limit=${limit}`);
                if (!res.ok) throw new Error('Failed to fetch artist songs');
                const data = await res.json();
                
                const newSongs = (data.data?.songs || [])
                    .map(song => ({
                        name: song.name || 'Unknown Song',
                        artist: artist.name,
                        filePath: song.downloadUrl?.length
                            ? song.downloadUrl[song.downloadUrl.length - 1].url
                            : "",
                        coverPath: song.image?.length
                            ? song.image[song.image.length - 1].url.replace('150x150', '500x500')
                            : "https://via.placeholder.com/60x60/6366f1/ffffff?text=🎵",
                    }))
                    .filter(song => song.filePath);
                
                allArtistSongs.push(...newSongs);
                if (newSongs.length === 0) break; // Stop if no more songs on this page
                
                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            if (allArtistSongs.length > 0) {
                // Shuffle and limit results for performance
                const shuffledArtistSongs = allArtistSongs.sort(() => Math.random() - 0.5);
                songs = shuffledArtistSongs.slice(0, 300); // max 300 songs
                lastSearchedSongs = [...songs];
                renderSongs(songs); // Render the artist-specific songs

                const songListTitle = document.getElementById('songListTitle');
                if (songListTitle) {
                    songListTitle.textContent = `Top Songs by ${artist.name}`;
                }
            } else {
                showNotification(`No songs found for ${artist.name}`, 'warning');
                // If no songs found for artist, ensure home page defaults are shown
                songs = [...initialSongs];
                lastSearchedSongs = [...initialSongs];
                renderSongs(songs);
            }
        } catch (error) {
            console.error('Error loading artist songs:', error);
            showNotification('Could not load songs for ' + artist.name, 'error');
            // On error, ensure home page defaults are shown
            songs = [...initialSongs];
            lastSearchedSongs = [...initialSongs];
            renderSongs(songs);
        } finally {
            hideLoading();
        }
    });
    
    return artistCard;
}



const searchArtists = async (query, isInitial = false) => {
    showLoading("Finding top artists...");
    const artistListContainer = document.getElementById('artistList');
    if (!artistListContainer) {
        console.error('Artist list container not found');
        hideLoading();
        return;
    }

    try {
        const res = await fetch(`https://saavn.sumit.co/api/search/artists?query=${encodeURIComponent(query)}&page=100&limit=100`);
        if (!res.ok) throw new Error('Artist search failed');
        const data = await res.json();
        console.log('Artist search response:', data); // Debug log

        if (data.success && data.data.results.length > 0) {
            // Deduplicate artists by name
            const seen = new Set();
            const uniqueArtists = data.data.results.filter(artist => {
                const name = artist.name.trim().toLowerCase();
                if (!seen.has(name)) {
                    seen.add(name);
                    return true;
                }
                return false;
            });

            renderArtists(uniqueArtists); // Render only unique artists
        } else {
            artistListContainer.innerHTML = !isInitial 
                ? `<div class="empty-state"><p>No artists found for "${query}"</p></div>`
                : `<div class="empty-state"><p>Search for your favorite artist to begin.</p></div>`;
        }
    } catch (error) {
        console.error('Error searching artists:', error);
        artistListContainer.innerHTML = `<div class="empty-state">
            <p>Error loading artists. Please try again.</p>
        </div>`;
    } finally {
        hideLoading();
    }
};

// Centralized page loading function
async function loadPage(page, push = true, doInit = true) {
    const content = document.getElementById("pageContent");
    const links = document.querySelectorAll(".nav-link");
    
    const loadingMessages = {
        'home.html': "Loading amazing music...",
        'about.html': "Loading about us...",
        'artists.html': "Finding top artists...",
        'contact.html': "Loading contact info...",
    };
    showLoading(loadingMessages[page] || "Loading...");

    try {
        const response = await fetch("pages/" + page);
        if (!response.ok) throw new Error(`Failed to load ${page}`);
        const html = await response.text();

        content.innerHTML = html;
        if (push) {
            history.pushState({ page }, "", page);
        }

        // Update active nav link
        links.forEach(l => l.classList.remove("active"));
        const activeLink = [...links].find(l => l.dataset.page === page);
        if (activeLink) activeLink.classList.add("active");

        // Initialize page-specific scripts
        if (doInit && typeof initPage === 'function') {
            initPage(page);
        } else {
            hideLoading();
        }
    } catch (error) {
        console.error("Error loading page:", error);
        content.innerHTML = `<div class="empty-state"><h1>Oops!</h1><p>Could not load the page. Please try again.</p></div>`;
        hideLoading();
    }
}

/**
 * This is the main router function called from index.html
 * after a page's content has been loaded into the DOM.
 */

function initArtistsPage() {
    const artistSearchInput = document.getElementById('artistSearchInput');
    if (artistSearchInput) {
        artistSearchInput.addEventListener('input', (e) => {
            clearTimeout(suggestionTimeout);
            const query = e.target.value.trim();
            if (query.length > 1) {
                suggestionTimeout = setTimeout(() => {
                    searchArtists(query, false);
                }, 300); // Debounce for 300ms
            }
        });

        // Handle search on Enter key
        artistSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = artistSearchInput.value.trim();
                if (query) {
                    searchArtists(query, false);
                }
            }
        });
    }

    

    searchArtists("all popular artist", true);
}


async function initPage(page) {
    // This function is now the single entry point for initializing page-specific JS
    switch (page) {
        case 'home.html':
            initHomePage();
            break;
        case 'artists.html':
            initArtistsPage();
            break;
        case 'contact.html':
            initContactPage();
            break;
        case 'about.html':
            // No specific JS for about page, just hide the loader
            hideLoading();
            break;
        default:
            hideLoading();
            break;
    }
}

// Initialize the application's global components
initApp();
initTheme();
