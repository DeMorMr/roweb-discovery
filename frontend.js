// AUTHOR BY AI & DeMorMr | https://github.com/DeMorMr
function sound(name) {var audio = new Audio();audio.volume = 0.3;if (typeof name === 'string' && name.includes(',')) {var sounds = name.split(',').map(s => s.trim());var randomSound = sounds[Math.floor(Math.random() * sounds.length)];audio.src = 'data/main/sfx/' + randomSound;} else if (Array.isArray(name)) {var randomSound = name[Math.floor(Math.random() * name.length)];audio.src = 'data/main/sfx/' + randomSound;}else {audio.src = 'data/main/sfx/' + name;}audio.autoplay = true;return true;}
function ExtraClearStorage() {const itemsCount = localStorage.length;localStorage.clear();alert(`Deleted: ${itemsCount}`);}
function switchdiv(hideId, showId, displayType = 'block') {const hideElement = document.getElementById(hideId);const showElement = document.getElementById(showId);if (hideElement) hideElement.style.display = 'none';if (showElement) showElement.style.display = displayType;sound("click.mp3");}

function switchSection(sectionId) {document.querySelectorAll('.content-section').forEach(section => {section.style.display = 'none';});const targetSection = document.getElementById(sectionId);if (targetSection) {targetSection.style.display = 'block';}sound("click.mp3");}
function initPage() {document.querySelectorAll('.content-section').forEach((section, index) => {if (index !== 0) section.style.display = 'none';});}

function extractPlaceId(url) {const match = url.match(/(?:\/\/|\b)(?:www\.)?(?:rblx\.games|roblox\.com)\/games\/(\d+)(?:\/|$|\?)/);return match ? match[1] : null;}
function normalizeRobloxUrl(url) {const id = extractPlaceId(url);if (!id) return url.toLowerCase();return `https://www.roblox.com/games/${id}`;}

// --------------------------------------------------------------------------------
function saveCache_just() {const cacheObj = Object.fromEntries(thumbnailCache);localStorage.setItem('thumbnailCache', JSON.stringify(cacheObj));}
function loadCache_just() {const cachedData = localStorage.getItem('thumbnailCache');if (cachedData) thumbnailCache = new Map(Object.entries(JSON.parse(cachedData)));}
function loadCache() {const cacheData = localStorage.getItem('thumbnailCache');if (cacheData) {try {const cache = JSON.parse(cacheData);for (const [key, value] of Object.entries(cache)) {thumbnailCache.set(key, {url:value,timestamp:Date.now()});}console.log(`Loaded ${thumbnailCache.size} thumbnails from cache`);} catch (e) {console.error('Failed to load thumbnail cache', e);}}}
function saveCache() {if (thumbnailCache.size > 500) {const entries = [...thumbnailCache.entries()].sort((a, b) => b[1].timestamp - a[1].timestamp).slice(0, 300);thumbnailCache.clear();entries.forEach(([key, value]) => thumbnailCache.set(key, value));}localStorage.setItem('thumbnailCache', JSON.stringify(Object.fromEntries([...thumbnailCache.entries()].map(([k, v]) => [k, v?.url || null]))));}
function clearThumbnailCache() {thumbnailCache.clear();}
// --------------------------------------------------------------------------------


// --------------------------------------------------------------------------------
let categories = ['All', 'Adventure', 'Tycoon', 'Roleplay', 'Obby', 'Shooter'];
function initCategories() {
    const savedCategories = JSON.parse(localStorage.getItem('categories'));
    if (savedCategories && savedCategories.length > 0) {categories = savedCategories;}if (!categories.includes('All')) categories.unshift('All');if (!categories.includes('None')) categories.push('None');
    localStorage.setItem('categories', JSON.stringify(categories));
}
function saveCategory() {
    const newCategory = document.getElementById('newCategory').value.trim();
    if (!newCategory) {alert("Please enter a category name!");sound("ouch.mp3");return;}if (newCategory.length > 10) {alert("Place name cannot exceed 10 characters!");sound("ouch.mp3");return;}
    if (newCategory === 'All' || newCategory === 'None') {alert("Category name cannot be 'All' or 'None'!");return;}if (categories.includes(newCategory)) {alert("This category already exists!");return;}
    categories.push(newCategory);localStorage.setItem('categories', JSON.stringify(categories));document.getElementById('newCategory').value = '';
    populateCategoryDropdowns();sound("splat.mp3");
}
function populateCategoryDropdowns() {
    const categorySelect = document.getElementById('placeCategory');const filterSelect = document.getElementById('categoryFilter');
    [categorySelect, filterSelect].forEach(select => {
        select.innerHTML = '';
        categories.forEach(category => {if (select === categorySelect && category === 'All') return;const option = document.createElement('option');option.value = category;option.textContent = category;select.appendChild(option);
        });});categorySelect.value = 'None';filterSelect.value = 'All';
}
function manageCategories() {
    const container = document.getElementById('categories-container');
    const manageBtn = document.getElementById('manageCategoriesBtn');
    if (container.style.display === 'none' || !container.innerHTML.trim()) {
        container.innerHTML = `
            <div class="categories-list">
                ${categories.filter(cat => cat !== 'All' && cat !== 'None').map(cat => `
                    <div class="category-item">
                        <span>${cat}</span>
                        <button onclick="deleteCategory('${cat}')" class="delete-category-btn">✖</button>
                    </div>
                `).join('')}
            </div>
            <button onclick="closeCategories()" class="close-btn">Close</button>
        `;container.style.display = 'block';manageBtn.style.display = 'none';
    } 
    else {container.style.display = 'none';manageBtn.style.display = 'block';}
    sound("click.mp3");
}
function closeCategories() {const container=document.getElementById('categories-container');const manageBtn=document.getElementById('manageCategoriesBtn');container.innerHTML='';container.style.display='none';manageBtn.style.display='block';sound("click.mp3");}

function deleteCategory(category) {
    if (!confirm(`Delete category "${category}"? All places in this category will be moved to "None".`)) {sound("ouch.mp3");return;}
    categories = categories.filter(cat => cat !== category);localStorage.setItem('categories', JSON.stringify(categories));
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    savedPlaces.forEach(place => {if (place.category === category) {place.category = '';}});localStorage.setItem('places', JSON.stringify(savedPlaces));
    populateCategoryDropdowns();renderPlaces();
    const categoriesContainer = document.getElementById('categories-container');
    if (categoriesContainer && categoriesContainer.style.display !== 'none') {
        const categoriesList = categoriesContainer.querySelector('.categories-list');
        if (categoriesList) {
            categoriesList.innerHTML = categories
                .filter(cat => cat !== 'All' && cat !== 'None')
                .map(cat => `
                    <div class="category-item">
                        <span>${cat}</span>
                        <button onclick="deleteCategory('${cat}')" class="delete-category-btn">✖</button>
                    </div>
                `).join('');
        }
    }sound("collide.mp3");
}
// --------------------------------------------------------------------------------



// --------------------------------------------------------------------------------
function savePlace() {
    const name=document.getElementById('placeName').value;const url=document.getElementById('placeUrl').value;const category=document.getElementById('placeCategory').value;
    if (name.length > 50) {alert("Place name cannot exceed 39 characters!");sound("ouch.mp3");return;}if (!name || !url) {alert("Please fill both fields!");sound("ouch.mp3");return;}
    let id=extractPlaceId(url);if (!id) {const numMatch = url.match(/\b(\d+)\b/);if (numMatch && numMatch[1].length >= 7) {id = numMatch[1];}}
    const savedPlaces=JSON.parse(localStorage.getItem('places')) || [];const normalizedUrl=normalizeRobloxUrl(url);
    const isDuplicate=savedPlaces.some(place => {if (id && place.id && place.id === id) return true;const placeNormalizedUrl = normalizeRobloxUrl(place.url);return placeNormalizedUrl === normalizedUrl;});
    if (isDuplicate) {alert("This place is already saved!");return;}const storeCategory = category === 'None' ? '' : category;
    const place = {id,name,url,category:storeCategory,normalizedUrl:normalizedUrl,date:new Date().toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',','')};
    savedPlaces.push(place);localStorage.setItem('places', JSON.stringify(savedPlaces));sound("splat.mp3");renderPlaces();clearForm();
}
function downloadData() {
    const savedPlaces=JSON.parse(localStorage.getItem('places')) || [];const categories=JSON.parse(localStorage.getItem('categories')) || ['All', 'None'];
    const exportData={version:1,categories:categories,places:savedPlaces};
    const dataStr = JSON.stringify(exportData, null, 2);const blob = new Blob([dataStr], {type: 'application/json'});const url = URL.createObjectURL(blob);const a = document.createElement('a');
    a.href=url;a.download='saved.json';
    document.body.appendChild(a);a.click();
    setTimeout(() => {document.body.removeChild(a);URL.revokeObjectURL(url);}, 100);sound("click.mp3");
}
// --------------------------------------------------------------------------------


/* BACKUP!!!
async function getThumbnailUrl(placeId, size = 256) {
    const cacheKey = `${placeId}_${size}`;
    if (thumbnailCache.has(cacheKey)) {return thumbnailCache.get(cacheKey);}
    const apiUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&size=${size}x${size}&format=Png&isCircular=false`;
    // Yippe
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.data?.[0]?.imageUrl) {
                thumbnailCache.set(cacheKey, data.data[0].imageUrl);
                return data.data[0].imageUrl;
            }
        }
    } catch (directError) {console.log("Direct request failed, trying proxies...");}
    // Bruh
    const PROXY_SERVERS = ["https://api.allorigins.win/raw?url=","https://corsproxy.io/?","https://api.codetabs.com/v1/proxy?quest="];
    for (const proxy of PROXY_SERVERS) {
        try {
            const response = await fetch(proxy + encodeURIComponent(apiUrl));
            if (!response.ok) continue;
            const data = await response.json();
            if (data.data?.[0]?.imageUrl) {thumbnailCache.set(cacheKey, data.data[0].imageUrl);return data.data[0].imageUrl;}
        } catch (e) {
            console.error(`Proxy error (${proxy}):`, e);
        }
    }
    thumbnailCache.set(cacheKey, null);
    return null;
}
*/




// Thumbnails --------------------------------------------------------------------------------
const thumbnailCache = new Map();const BATCH_SIZE = 10;
async function getBatchThumbnailUrls(placeIds, size = 128) { // 256
    const uncachedIds = [];const result = {};placeIds.forEach(id => {const cacheKey = `${id}_${size}`;if (thumbnailCache.has(cacheKey)) {result[id] = thumbnailCache.get(cacheKey);} else {uncachedIds.push(id);}});if (uncachedIds.length === 0) return result;
    const PROXY_SERVERS = ["https://api.allorigins.win/raw?url=","https://corsproxy.io/?","https://api.codetabs.com/v1/proxy?quest="];const apiUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${uncachedIds.join(',')}&size=${size}x${size}&format=Png&isCircular=false`; //${size}x${size}&format=Png&isCircular=false
    for (const proxy of PROXY_SERVERS) {
        try {
            const response = await fetch(proxy + encodeURIComponent(apiUrl),{headers: {'Accept': 'image/webp'}});if (!response.ok) continue;const data = await response.json();
            if (data.data && Array.isArray(data.data)) {data.data.forEach(item => {if (item.imageUrl) {const cacheKey = `${item.targetId}_${size}`;thumbnailCache.set(cacheKey, item.imageUrl);result[item.targetId] = item.imageUrl;}});return result;}
        } catch (e) {console.error(`Proxy error (${proxy}):`, e);}
    }uncachedIds.forEach(id => {const cacheKey=`${id}_${size}`;thumbnailCache.set(cacheKey, null);result[id] = null;});return result;
}
async function loadThumbnails(placesToShow, startIndex) {
    for (let i = 0; i < placesToShow.length; i += BATCH_SIZE) {
        const batch = placesToShow.slice(i, i + BATCH_SIZE);const placeIds = batch.map(place => place.id).filter(id => id && id.length >= 7);
        batch.forEach((place, localIndex) => {const img = document.getElementById(`img-${place.originalIndex}`);if (img) img.src = 'data/main/loading.webp';});if (placeIds.length === 0) continue;
        try {const thumbnails = await getBatchThumbnailUrls(placeIds);batch.forEach((place) => {const img = document.getElementById(`img-${place.originalIndex}`);if (!img) return;img.src = thumbnails[place.id] || 'data/main/NewFrontPageGuy.png';});
        } catch (error) {console.error('Thumbnail batch error:', error);batch.forEach((place) => {const img=document.getElementById(`img-${place.originalIndex}`);if (img) img.src='data/main/NewFrontPageGuy.png';});}
    }
}
async function loadCoolThumbnails(places) {
    for (let i = 0; i < places.length; i += BATCH_SIZE) {
        const batch = places.slice(i, i + BATCH_SIZE);const validPlaces = batch.filter(place => place.id && place.id.length >= 7);const placeIds = validPlaces.map(place => place.id);
        validPlaces.forEach(place => {const img = document.querySelector(`.UserPlace img[data-place-id="${place.id}"]`);if (img) img.src = 'data/main/loading.webp';});if (placeIds.length === 0) continue;
        try {const thumbnails = await getBatchThumbnailUrls(placeIds, 128);validPlaces.forEach(place => {const img = document.querySelector(`.UserPlace img[data-place-id="${place.id}"]`);if (img) {img.src = thumbnails[place.id] || 'data/main/NewFrontPageGuy.png';}});
        } catch (error) {console.error('Cool thumbnail batch error:', error);validPlaces.forEach(place => {const img = document.querySelector(`.UserPlace img[data-place-id="${place.id}"]`);if (img) img.src = 'data/main/NewFrontPageGuy.png';});}
    }
}
// --------------------------------------------------------------------------------


let editMode=false;function toggleEditMode() {editMode = !editMode;renderPlaces();sound(editMode ? "click.mp3" : "splat.mp3");}

let currentPage=0;const itemsPerPage=15;
function renderPlaces() {
    const container = document.getElementById('placesContainer');if (!container) {console.error('placesContainer not found!');return;}
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];const selectedCategory = document.getElementById('categoryFilter').value;
    if (savedPlaces.length === 0) {container.innerHTML = `
            <div class="empty-message">
                What's here is empty :(<br>
                Want to see my list?<br>
                <img src='data/main/teddy.png' onclick="sound(['1.mp3','2.mp3','3.mp3','4.mp3']) "alt="teddy" width="115px" title='Teddy Bloxpin'><br>
                <button onclick="loadDefaultList()">Load</button>
            </div>
        `;return;}
    const filteredPlaces = savedPlaces.map((place, originalIndex) => ({...place, originalIndex})).filter(place => {if (selectedCategory === 'All') return true;
            if (selectedCategory === 'None') return !place.category || place.category === '';return place.category === selectedCategory;});
    const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
    if (currentPage >= totalPages && totalPages > 0) {currentPage = totalPages - 1;}const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredPlaces.length);const placesToShow = filteredPlaces.slice(startIndex, endIndex);
    container.innerHTML = '';
    placesToShow.forEach((place, index) => {
        const globalIndex = startIndex + index;const displayCategory = place.category ? place.category : 'None';
        container.innerHTML += `
        <div class="place" data-id="${place.originalIndex}">
            <a onclick="sound('splat.mp3')" href="${place.url}" target="_blank">
                <img id="img-${place.originalIndex}" src="data/main/loading.webp" alt="${place.name}" title='${place.name}' decoding="async">
                ${editMode ? '' : `<t><small>${place.name}</small></t><br>`}
            </a>
            ${editMode ? `
                <div class="edit-controls">
                    <button onclick="deletePlace(${place.originalIndex})" class="delete-btn">✖</button>
                    <button onclick="startEditPlace(${place.originalIndex})" class="edit-btn">✎</button>
                </div>
            ` : ''}
            <desc><b>Added:</b> ${place.date}</desc>
        </div>
        `;
    });renderPagination(totalPages);loadThumbnails(placesToShow, startIndex);
}


function renderPagination(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (totalPages <= 1) {container.innerHTML = '';return;}
    let paginationHTML = '<div class="pagination">';
    paginationHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>&lt; Back</button>`;
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {paginationHTML += `<button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ''}>${i + 1}</button>`;}
    paginationHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>Next &gt;</button>`;
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
}

function changePage(newPage) {currentPage = newPage;renderPlaces();sound("pageturn.mp3");}

function clearAllPlaces() {if (confirm("Are you sure you want to delete ALL saved places? This action cannot be undone!")) {localStorage.removeItem('places');localStorage.removeItem('categories');clearThumbnailCache();renderPlaces();sound("collide.mp3");}}

function setRandomBanner() {
    const defaultBanners = [
        "data/main/banners/2007ChristmasBanner.webp","data/main/banners/2007HalloweenBanner.webp",
        "data/main/banners/2008NoLogoBanner.webp","data/main/banners/BuildermanBanner.webp",
        "data/main/banners/ChristmasBanner2008.webp"
    ];
    try {
        const customBanners = JSON.parse(localStorage.getItem('customBanners')) || [];const banners = customBanners.length > 0 ? customBanners : defaultBanners;
        const randomBanner = banners[Math.floor(Math.random() * banners.length)];const header = document.querySelector('.banner');
        if (header) {
            header.style.backgroundImage = `url('${randomBanner}')`;
            header.style.backgroundSize = 'cover';
            header.style.backgroundPosition = 'center';
            header.style.backgroundRepeat = 'no-repeat';
            header.style.transition = 'background-image 0.5s ease-in-out';
        }
    } catch (error) {console.error('Error setting banner:', error);const header = document.querySelector('.banner');if (header) {header.style.backgroundImage = "url('data/main/NewFrontPageGuy.png')";}}
}

function setRandomBackground() {
    const defaultBanners = [
        "data/main/bg/RobloxScreenShot20230930_102558741.jpeg",
        "data/main/bg/p8wXp8.jpg",
        "data/main/bg/OIP%20(3).webp",
        "data/main/bg/OIP%20(2).webp",
        "data/main/bg/Mod_525859_sd_image.webp",
        "data/main/bg/1.webp",
        "data/main/bg/3.webp",
        "data/main/bg/4.webp",
        "data/main/bg/5.webp",
        "data/main/bg/Life-o-Riley.jpg",
        "data/main/bg/5.jpg"
    ];
    try {
        const customBanners = JSON.parse(localStorage.getItem('customBackgrounds')) || [];const banners = customBanners.length > 0 ? customBanners : defaultBanners;
        const randomBanner = banners[Math.floor(Math.random() * banners.length)];const header = document.querySelector('body');
        if (header) {
            header.style.backgroundImage = `url('${randomBanner}')`;
            header.style.backgroundSize = 'cover';
            header.style.backgroundPosition = 'center';
            header.style.backgroundRepeat = 'no-repeat';
            header.style.transition = 'background-image 0.5s ease-in-out';
        }
    } catch (error) {console.error('Error setting background:', error);const header = document.querySelector('body');if (header) {header.style.backgroundImage = "url('data/main/NewFrontPageGuy.png')";}}
}

// USERPLACES --------------------------------------------------------------------------------
let coolPlacesHistory = [];let currentCoolIndex = -1;
function updateCoolPlaces() {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];const container = document.querySelector('.UserPlaces');
    container.innerHTML = '';
    if (savedPlaces.length === 0) {for (let i = 0; i < 5; i++) {container.innerHTML += `<div class='UserPlace'><a href=''><img src='data/main/loading.webp'><br></a></div>`;}return;}
    const currentSet = coolPlacesHistory[currentCoolIndex] || [];
    currentSet.forEach(place => {
        container.innerHTML += `
            <div class='UserPlace'>
                <a onclick="sound('splat.mp3')" href='${place.url}' target='_blank'>
                    <img src='data/main/loading.webp' data-place-id="${place.id}"alt="${place.name}" title='${place.name}'><br>
                </a>
            </div>
        `;
    });loadCoolThumbnails(currentSet);
}

function generateRandomPlaces() {
    const savedPlaces=JSON.parse(localStorage.getItem('places')) || [];if (savedPlaces.length <= 5) return [...savedPlaces];
    const randomPlaces=[];const indices=new Set();
    while (indices.size < 5) {const randomIndex = Math.floor(Math.random() * savedPlaces.length);if (!indices.has(randomIndex)) {indices.add(randomIndex);randomPlaces.push(savedPlaces[randomIndex]);}}
    return randomPlaces;
}
function nextCoolSet() {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];if (savedPlaces.length === 0) return;const newSet = generateRandomPlaces();
    coolPlacesHistory = coolPlacesHistory.slice(0, currentCoolIndex + 1);coolPlacesHistory.push(newSet);currentCoolIndex = coolPlacesHistory.length - 1;
    updateCoolPlaces();updateCoolNavigation();sound("click.mp3");
}
function prevCoolSet() {if (currentCoolIndex > 0) {currentCoolIndex--;updateCoolPlaces();updateCoolNavigation();}sound("click.mp3");}
function updateCoolNavigation() {const prevBtn = document.getElementById('prevCoolBtn');const nextBtn = document.getElementById('nextCoolBtn');prevBtn.disabled = currentCoolIndex <= 0;nextBtn.disabled = false;}
// --------------------------------------------------------------------------------


function handleFileSelect(event) {const file = event.target.files[0];if (!file) return;const reader = new FileReader();reader.onload = function(e) {
        try {const importedData = JSON.parse(e.target.result);let importedPlaces = [];let importedCategories = null;
            if (importedData.places && importedData.categories) {importedPlaces = importedData.places;importedCategories = importedData.categories;
            } else if (Array.isArray(importedData)) {importedPlaces = importedData;} else {throw new Error("Invalid file format");}
            if (!Array.isArray(importedPlaces)) {alert("Error: no data");return;}const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
            let duplicates = 0;let imported = 0;if (importedCategories && importedCategories.length > 0) {
                const currentCategories = JSON.parse(localStorage.getItem('categories')) || ['All', 'None'];const newCategories = importedCategories.filter(cat => cat !== 'All' && cat !== 'None' && !currentCategories.includes(cat));
                if (newCategories.length > 0) {categories = [...currentCategories, ...newCategories];localStorage.setItem('categories', JSON.stringify(categories));populateCategoryDropdowns();}
            }importedPlaces.forEach(place => {if (!place.url || !place.name) {console.warn("Missed url or name:", place);return;}
                const id = place.id || extractPlaceId(place.url);const normalizedUrl = place.normalizedUrl || normalizeRobloxUrl(place.url);
                const isDuplicate = savedPlaces.some(savedPlace => {return (id && savedPlace.id === id) || savedPlace.normalizedUrl === normalizedUrl || normalizeRobloxUrl(savedPlace.url) === normalizedUrl;});
                if (isDuplicate) {duplicates++;} else {let category = place.category || '';
                    const completePlace = {id,name:place.name,url:place.url,category,normalizedUrl,
                        date:place.date || new Date().toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',','')
                    };savedPlaces.push(completePlace);imported++;
                }});localStorage.setItem('places', JSON.stringify(savedPlaces));currentPage = Math.floor(savedPlaces.length / itemsPerPage);
            renderPlaces();alert(`Success import: ${imported}\nDuplicates: ${duplicates}\nInvalid: ${importedPlaces.length - imported - duplicates}`);
        } catch (error) {console.error("Import Error:", error);alert(`Import Error: ${error.message}\nCheck file format`);}
    };reader.readAsText(file);sound("victory.mp3");startConfetti();
}

// MUSIC PLAYER ---------------------------------------------------------------------------------
/*   -------- OLD VERSION --------
const audioPlayer=new Audio();
const playBtn=document.getElementById('play-btn');const prevBtn = document.getElementById('prev-btn');const nextBtn = document.getElementById('next-btn');
const volumeSlider=document.getElementById('volume-slider');const trackName = document.getElementById('track-name');
const progressBar=document.getElementById('progress-bar');const errorMsg = document.getElementById('error-message');
let currentTrackIndex=0;let isPlaying=false;
function decodeFileName(encoded) {return decodeURIComponent(encoded).split('/').pop().replace(/\.[^/.]+$/, "");}
function loadRandomTrack() {if (tracks.length === 0) {errorMsg.textContent = "No tracks found";return;}currentTrackIndex = Math.floor(Math.random() * tracks.length);const trackPath = tracks[currentTrackIndex];audioPlayer.src = trackPath;trackName.textContent = decodeFileName(trackPath);progressBar.style.width = '0%';audioPlayer.load();}
function togglePlay() {if (!audioPlayer.src) {loadRandomTrack();}if (isPlaying) {audioPlayer.pause();playBtn.textContent = "▶";} else {audioPlayer.play().then(() => {playBtn.textContent = "⏸";}).catch(error => {errorMsg.textContent = "Playing error: " + error.message;console.error("Playing error", error);});}isPlaying = !isPlaying;sound("click.mp3");}
function nextTrack() {currentTrackIndex = (currentTrackIndex + 1) % tracks.length;loadRandomTrack();if (isPlaying) {audioPlayer.play().catch(e => {errorMsg.textContent = "AutoPlay error: " + e.message;});}sound("click.mp3");}
function prevTrack() {currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;loadRandomTrack();if (isPlaying) {audioPlayer.play().catch(e => {errorMsg.textContent = "AutoPlay error: " + e.message;});}sound("click.mp3");}
*/
const paths = {
  mp3: "data/main/mp3/",
  cr: "data/main/cr/"
};

const songs = {
  mp3: [
    "Michael Wyckoff - Keygen.mp3",
    "Roblox Monster Mash Potion Remix ｜ Classy Doge Remix.mp3",
    "Positively Dark- Awakening.mp3",
    "Ragnarok Online - Monastery in Disguise (Cursed Abbey⧸Monastery) HD.mp3",
    "old roblox dance｜Roblox.mp3",
    "M.U.L.E Theme (ROBLOX music).mp3",
    "Flight of the Bumblebee Roblox.mp3",
    "Caramelldansen - Supergott - Roblox Music.mp3",
    "Bossfight - Starship Showdown.mp3",
    "Bossfight - Milky Ways.mp3",
    "Bossfight - Leaving Leafwood Forest.mp3",
    "Bossfight - Farbror Melker Fixar Fiskdamm (Fastbom Cover).mp3",
    "Bossfight - Commando Steve.mp3",
    "Bossfight - Captain Cool.mp3",
    "Better Off Alone - Glejs (Remix).mp3",
    "30. Roblox Soundtrack - Party Music (2008).mp3",
    "29. Roblox Soundtrack - Explore ROBLOX.mp3",
    "28. Roblox Soundtrack - Online Social Hangout.mp3",
    "23. Roblox Soundtrack - Tycoon Game.mp3",
    "19. Roblox Soundtrack - Santa's Winter Stronghold.mp3",
    "18. Roblox Soundtrack - 1x1x1x1's Creed.mp3",
    "17. Roblox Soundtrack - Big Clan⧸Group Recruitment Centre Entrance.mp3",
    "16. Roblox Soundtrack - Heli Wars.mp3",
    "13. Roblox Soundtrack - Contest Time!.mp3",
    "11. Roblox Soundtrack - Clan Being Raided.mp3",
    "09. Roblox Soundtrack - Crossroads Times.mp3",
    "08. Roblox Soundtrack - Noob Alert.mp3",
    "07. Roblox Soundtrack - Trouble Ahead (BONUS SONG) (Teddy9340's Production).mp3",
    "06. Roblox Soundtrack - Metal Bricks.mp3",
    "05. Roblox Soundtrack - Robloxia's Last Stand.mp3",
    "03. Roblox Soundtrack - Happy Day In Robloxia⧸Roblox HQ.mp3",
    "01. Roblox Soundtrack - The Main Theme.mp3",
    "its-raining-tacos!.mp3",
    "Toby Fox - A DARK ZONE.mp3"
  ],
  cr: [
    "1. happy-pig_@warble_humanoid.mp3",
    "2. lancer-waltz_@penilipo.mp3",
    "3. KEYGEN_@penilipo.mp3",
    "4. NEW-TRY_MostoThisStuff.wav",
    "5. kqwke-Barrier.mp3",
    "6. Penilipo x Maomi_@penilipo.mp3",
    "7. ExitedParty_@penilipo.wav",
    "8. 8BITAMBIENT_@penilipo.wav",
    "9. EarthboundSoundsOnly_@penilipo.wav",
    "10. SEATURTLE_@penilipo.mp3",
    "11. print-hello-world_@warble_humanoid.mp3",
    "evilbell_imsosha.mp3"
  ]
};


function mixTracks(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


function createPlaylist() {
  const allTracks = [
    ...songs.mp3.map(file => paths.mp3 + file),
    ...songs.cr.map(file => paths.cr + file)
  ];
  return mixTracks(allTracks);
}

const playlist = createPlaylist();

const player = new Audio();
let currentTrack = 0;
let playing = false;
let userClicked = false;
let isSeeking = false;
let progressUpdateInterval = null;

let bufferedRanges = [];

function loadTrack() {
  const track = encodeURI(playlist[currentTrack]);
  
  player.src = "";
  bufferedRanges = [];
  
  player.preload = "auto"; 
  player.load();
  
  const trackName = playlist[currentTrack].split('/').pop().replace(/\.(mp3|wav)$/, '');
  document.getElementById('track-name').textContent = trackName;
  document.getElementById('progress-bar').style.width = '0%';
  

  if (progressUpdateInterval) {
    clearInterval(progressUpdateInterval);
    progressUpdateInterval = null;
  }
}


function playAudio() {
  return player.play().then(() => {
    document.getElementById('play-btn').textContent = "⏸";
    playing = true;

    startProgressUpdate();
  }).catch(e => {
    document.getElementById('error-message').textContent = "Ошибка: " + e.message;
    document.getElementById('play-btn').textContent = "▶";
    playing = false;
  });
}


function startProgressUpdate() {

  if (progressUpdateInterval) {
    clearInterval(progressUpdateInterval);
  }
  

  progressUpdateInterval = setInterval(() => {
    if (!isSeeking && player.duration && !isNaN(player.duration) && playing) {
      const progress = (player.currentTime / player.duration) * 100;
      document.getElementById('progress-bar').style.width = `${progress}%`;
      

      updateBufferedRanges();
    }
  }, 100);
}


function updateBufferedRanges() {
  if (player.buffered && player.buffered.length > 0) {
    bufferedRanges = [];
    for (let i = 0; i < player.buffered.length; i++) {
      bufferedRanges.push({
        start: player.buffered.start(i),
        end: player.buffered.end(i)
      });
    }
  }
}


function isTimeBuffered(time) {
  for (const range of bufferedRanges) {
    if (time >= range.start && time <= range.end) {
      return true;
    }
  }
  return false;
}


function stopProgressUpdate() {
  if (progressUpdateInterval) {
    clearInterval(progressUpdateInterval);
    progressUpdateInterval = null;
  }
}


document.querySelector('.progress').addEventListener('click', (e) => {
  if (!player.duration || isNaN(player.duration)) return;
  
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const newTime = percent * player.duration;
  

  stopProgressUpdate();
  

  isSeeking = true;
  
  document.getElementById('progress-bar').style.width = `${percent * 100}%`;
  
  if (isTimeBuffered(newTime)) {
    player.currentTime = newTime;
    isSeeking = false;
    if (playing) {
      startProgressUpdate();
    }
  } else {
    player.currentTime = newTime;
    document.getElementById('error-message').textContent = "Загрузка сегмента...";
    
    const checkBuffering = setInterval(() => {
      if (isTimeBuffered(newTime) || player.readyState >= 3) {
        clearInterval(checkBuffering);
        isSeeking = false;
        document.getElementById('error-message').textContent = "";
        if (playing) {
          startProgressUpdate();
        }
      }
    }, 100);
  }
});

document.getElementById('play-btn').addEventListener('click', () => {
  userClicked = true;
  
  if (!player.src) loadTrack();
  
  if (playing) {
    player.pause();
    document.getElementById('play-btn').textContent = "▶";
    playing = false;
    stopProgressUpdate();
  } else {
    playAudio();
  }
});

document.getElementById('next-btn').addEventListener('click', () => {
  userClicked = true;
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack();
  if (playing) playAudio();
  if (typeof sound === 'function') sound("click.mp3");
});

document.getElementById('prev-btn').addEventListener('click', () => {
  userClicked = true;
  currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
  loadTrack();
  if (playing) playAudio();
  if (typeof sound === 'function') sound("click.mp3");
});

document.getElementById('volume-slider').addEventListener('input', (e) => {
  player.volume = e.target.value;
});

player.addEventListener('loadstart', () => {
  document.getElementById('error-message').textContent = "Начало загрузки...";
});

player.addEventListener('progress', () => {
  updateBufferedRanges();
});

player.addEventListener('seeking', () => {
  isSeeking = true;
  stopProgressUpdate();
  document.getElementById('error-message').textContent = "Перемотка...";
});

player.addEventListener('seeked', () => {
  document.getElementById('error-message').textContent = "Загрузка сегмента...";
});

player.addEventListener('canplay', () => {
  isSeeking = false;
  document.getElementById('error-message').textContent = "";
  if (playing) {
    startProgressUpdate();
  }
});

player.addEventListener('canplaythrough', () => {
  document.getElementById('error-message').textContent = "Трек полностью загружен";
  setTimeout(() => {
    document.getElementById('error-message').textContent = "";
  }, 2000);
});

player.addEventListener('waiting', () => {
  document.getElementById('error-message').textContent = "Буферизация...";
});

player.addEventListener('stalled', () => {
  document.getElementById('error-message').textContent = "Проблемы с загрузкой...";
});

player.addEventListener('ended', () => {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack();
  if (playing && userClicked) playAudio();
});

player.addEventListener('pause', () => {
  stopProgressUpdate();
});


function preloadNextTrack() {
  const nextTrackIndex = (currentTrack + 1) % playlist.length;
  const nextTrack = new Audio();
  nextTrack.preload = "metadata";
  nextTrack.src = encodeURI(playlist[nextTrackIndex]);
}


player.volume = 0.7;


document.addEventListener('click', () => {
  userClicked = true;
}, { once: true });



// --------------------------------------------------------------------------------



// EDIT MODE --------------------------------------------------------------------------------
function deletePlace(index) {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    if (index < 0 || index >= savedPlaces.length) {console.error('Invalid index:', index);return;}if (!confirm(`Delete "${savedPlaces[index].name}"?`)) return; 
    savedPlaces.splice(index, 1);localStorage.setItem('places', JSON.stringify(savedPlaces));renderPlaces();sound("collide.mp3");
}
function startEditPlace(index) {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];const place = savedPlaces[index];
    const placeElement = document.querySelector(`.place[data-id="${index}"]`);
    if (!placeElement) {console.error(`Place element with id ${index} not found!`);return;}
    let categoryOptions = '';
    categories.forEach(cat => {if (cat === 'All') return;const selected = (cat === 'None' && !place.category) || (cat === place.category);categoryOptions += `<option value="${cat}" ${selected ? 'selected' : ''}>${cat}</option>`;});
    placeElement.innerHTML = `
        <div class="edit-form">
            <input type="text" id="edit-name-${index}" value="${place.name}" placeholder="Place Name">
            <input type="text" id="edit-url-${index}" value="${place.url}" placeholder="Place URL">
            <select id="edit-category-${index}">
                ${categoryOptions}
            </select>
            <button onclick="saveEditedPlace(${index})">Save</button>
            <button onclick="renderPlaces()">Cancel</button>
        </div>
    `;sound("bass.mp3");
}
function saveEditedPlace(index) {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];const nameInput = document.getElementById(`edit-name-${index}`);
    const urlInput = document.getElementById(`edit-url-${index}`);const categorySelect = document.getElementById(`edit-category-${index}`);
    if (!nameInput || !urlInput || !categorySelect) {console.error('Edit form inputs not found!');return;}
    const newName = nameInput.value;const newUrl = urlInput.value;const newCategory = categorySelect.value;
    if (!newName || !newUrl) {alert("Both fields are required!");return;}const place = savedPlaces[index];
    if (!place) {console.error(`Place with index ${index} not found!`);return;}const storeCategory = newCategory === 'None' ? '' : newCategory;
    place.name=newName;place.url=newUrl;
    place.category=storeCategory;place.id=extractPlaceId(newUrl) || place.id;
    place.normalizedUrl=normalizeRobloxUrl(newUrl);
    localStorage.setItem('places', JSON.stringify(savedPlaces));renderPlaces();sound("splat.mp3");
}
// --------------------------------------------------------------------------------


function clearForm() {document.getElementById('placeName').value = '';document.getElementById('placeUrl').value = '';document.getElementById('placeCategory').value = 'None';}

function loadDefaultList() {
    fetch('My_Fav_List.json')
        .then(response => {if (!response.ok) throw new Error('File not found');return response.json();})
        .then(importedPlaces => {if (!Array.isArray(importedPlaces)) {alert("Error: Invalid data format");return;}
            const savedPlaces=JSON.parse(localStorage.getItem('places')) || [];let duplicates=0;let imported=0;let invalid=0;
            importedPlaces.forEach(place => {
                if (!place.url || !place.name) {invalid++;return;}
                const id = place.id || extractPlaceId(place.url);const normalizedUrl = place.normalizedUrl || normalizeRobloxUrl(place.url);
                const isDuplicate = savedPlaces.some(savedPlace => {
                    return (id && savedPlace.id === id) || savedPlace.normalizedUrl === normalizedUrl || normalizeRobloxUrl(savedPlace.url) === normalizedUrl;});
                if (isDuplicate) {duplicates++;
                } else {
                    const completePlace = {id,name:place.name,url:place.url,category:place.category || '',normalizedUrl,
                        date:place.date || new Date().toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',','')
                    };savedPlaces.push(completePlace);imported++;
                }
            });localStorage.setItem('places', JSON.stringify(savedPlaces));
            renderPlaces();nextCoolSet();alert(`Successfully imported: ${imported}\nDuplicates skipped: ${duplicates}\nInvalid entries: ${invalid}`);sound("victory.mp3");
        }).catch(error => {alert(`Error loading default list: ${error.message}\nMake sure Fav-List.json is in the same directory`);console.error("Load error:", error);sound("ouch.mp3");});
}


function startConfetti() {const canvas = document.createElement('canvas');canvas.style.position = 'fixed';canvas.style.top = '0';canvas.style.left = '0';canvas.style.width = '100%';canvas.style.height = '100%';canvas.style.pointerEvents = 'none';canvas.style.zIndex = '9999';document.body.appendChild(canvas);const ctx = canvas.getContext('2d');canvas.width = window.innerWidth;canvas.height = window.innerHeight;const particles = [];const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];for (let i = 0; i < 150; i++) {particles.push({x: Math.random() * canvas.width,y: Math.random() * canvas.height - canvas.height,size: Math.random() * 8 + 3,color: colors[Math.floor(Math.random() * colors.length)],speedY: Math.random() * 3 + 2,speedX: Math.random() * 4 - 2,rotation: Math.random() * 360,rotationSpeed: Math.random() * 5 - 2.5});}function animate() {ctx.clearRect(0, 0, canvas.width, canvas.height);for (let i = 0; i < particles.length; i++) {const p = particles[i];ctx.save();ctx.translate(p.x, p.y);ctx.rotate(p.rotation * Math.PI / 180);ctx.fillStyle = p.color;ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);ctx.restore();p.y += p.speedY;p.x += p.speedX;p.rotation += p.rotationSpeed;if (p.y > canvas.height) {p.y = -10;p.x = Math.random() * canvas.width;}}requestAnimationFrame(animate);}animate();setTimeout(() => {canvas.remove();}, 2500);}

const randombackgroundinterval = setInterval(function() {setRandomBackground();},30000)
const randombannerinterval = setInterval(function() {setRandomBanner();},60000)

window.onload = function() {
    setRandomBackground();initCategories();populateCategoryDropdowns();setRandomBanner();renderPlaces();nextCoolSet();
    document.getElementById('categoryFilter').addEventListener('change', function() {currentPage = 0;renderPlaces();});
    document.getElementById('prevCoolBtn').addEventListener('click', prevCoolSet);document.getElementById('nextCoolBtn').addEventListener('click', nextCoolSet);
    document.getElementById('importFile').addEventListener('change', handleFileSelect);
    loadTrack();
    preloadNextTrack();
};