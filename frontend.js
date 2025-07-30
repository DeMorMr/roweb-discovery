// AUTHOR BY AI & DeMorMr | https://github.com/DeMorMr
function play_sound(name) {var audio = new Audio();audio.src = 'data/needable/sounds/' + name;audio.autoplay = true;return true;}

function switchdiv(hideId, showId, displayType = 'block') {
    const hideElement = document.getElementById(hideId);const showElement = document.getElementById(showId);
    if (hideElement) hideElement.style.display = 'none';if (showElement) showElement.style.display = displayType;
    play_sound("click.mp3");
}
function ExtraClearStorage() {const itemsCount = localStorage.length;localStorage.clear();alert(`Deleted: ${itemsCount}`);}



let currentPage = 0;
const itemsPerPage = 15;

function extractPlaceId(url) {const match = url.match(/(?:\/\/|\b)(?:www\.)?(?:rblx\.games|roblox\.com)\/games\/(\d+)(?:\/|$|\?)/);return match ? match[1] : null;}
function normalizeRobloxUrl(url) {const id = extractPlaceId(url);if (!id) return url.toLowerCase();return `https://www.roblox.com/games/${id}`;}

function saveCache_n() {const cacheObj = Object.fromEntries(thumbnailCache);localStorage.setItem('thumbnailCache', JSON.stringify(cacheObj));}
function loadCache_n() {const cachedData = localStorage.getItem('thumbnailCache');if (cachedData) thumbnailCache = new Map(Object.entries(JSON.parse(cachedData)));}
// test
function loadCache() {
    const cacheData = localStorage.getItem('thumbnailCache');
    if (cacheData) {
        try {
            const cache = JSON.parse(cacheData);
            for (const [key, value] of Object.entries(cache)) {
                thumbnailCache.set(key, value);
            }
            console.log(`Loaded ${thumbnailCache.size} thumbnails from cache`);
        } catch (e) {
            console.error('Failed to load thumbnail cache', e);
        }
    }
}
function saveCache() {
    if (thumbnailCache.size > 500) {
        const entries = [...thumbnailCache.entries()]
            .sort((a, b) => b[1].timestamp - a[1].timestamp)
            .slice(0, 300);
        
        thumbnailCache.clear();
        entries.forEach(([key, value]) => thumbnailCache.set(key, value));
    }
    
    localStorage.setItem('thumbnailCache', JSON.stringify(
        Object.fromEntries([...thumbnailCache.entries()].map(([k, v]) => [k, v?.url || null]))
    ));
}

function clearThumbnailCache() {thumbnailCache.clear();}


let categories = ['All', 'Adventure', 'Tycoon', 'Roleplay', 'Obby', 'Shooter'];
function initCategories() {
    const savedCategories = JSON.parse(localStorage.getItem('categories'));
    if (savedCategories && savedCategories.length > 0) {categories = savedCategories;}
    if (!categories.includes('All')) categories.unshift('All');
    if (!categories.includes('None')) categories.push('None');
    localStorage.setItem('categories', JSON.stringify(categories));
}

function saveCategory() {
    const newCategory = document.getElementById('newCategory').value.trim();
    if (!newCategory) {alert("Please enter a category name!");play_sound("ouch.mp3");return;}
    if (newCategory.length > 10) {alert("Place name cannot exceed 10 characters!");play_sound("ouch.mp3");return;}
    if (newCategory === 'All' || newCategory === 'None') {alert("Category name cannot be 'All' or 'None'!");return;}
    if (categories.includes(newCategory)) {alert("This category already exists!");return;}
    categories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(categories));
    document.getElementById('newCategory').value = '';
    populateCategoryDropdowns();play_sound("splat.mp3");
}

function populateCategoryDropdowns() {
    const categorySelect = document.getElementById('placeCategory');
    const filterSelect = document.getElementById('categoryFilter');
    [categorySelect, filterSelect].forEach(select => {
        select.innerHTML = '';
        categories.forEach(category => {
            if (select === categorySelect && category === 'All') return;
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    });
    categorySelect.value = 'None';filterSelect.value = 'All';
}

function savePlace() {
    const name = document.getElementById('placeName').value;
    const url = document.getElementById('placeUrl').value;
    const category = document.getElementById('placeCategory').value;
    if (name.length > 50) {alert("Place name cannot exceed 39 characters!");play_sound("ouch.mp3");return;}
    if (!name || !url) {alert("Please fill both fields!");play_sound("ouch.mp3");return;}
    let id = extractPlaceId(url);
    if (!id) {const numMatch = url.match(/\b(\d+)\b/);if (numMatch && numMatch[1].length >= 7) {id = numMatch[1];}}
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    const normalizedUrl = normalizeRobloxUrl(url);
    const isDuplicate = savedPlaces.some(place => {
        if (id && place.id && place.id === id) return true;
        const placeNormalizedUrl = normalizeRobloxUrl(place.url);
        return placeNormalizedUrl === normalizedUrl;
    });
    if (isDuplicate) {alert("This place is already saved!");return;}
    const storeCategory = category === 'None' ? '' : category;
    const place = {
        id,
        name,
        url,
        category: storeCategory,
        normalizedUrl: normalizedUrl,
        date: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '')
    };
    savedPlaces.push(place);
    localStorage.setItem('places', JSON.stringify(savedPlaces));
    play_sound("splat.mp3");
    renderPlaces();
    clearForm();
}

function downloadData() {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    const dataStr = JSON.stringify(savedPlaces, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {document.body.removeChild(a);URL.revokeObjectURL(url);}, 100);
    play_sound("click.mp3");
}

// Thumbnails
const thumbnailCache = new Map();
/*
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

const BATCH_SIZE = 100;

const PROXY_SERVERS = [
    "https://corsproxy.io/?",
    "https://api.allorigins.win/raw?url=",
    "https://api.codetabs.com/v1/proxy?quest="
];

async function fetchThumbnailsBatch(placeIds, size = 256) {
    const uniqueIds = [...new Set(placeIds)];
    const apiUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${uniqueIds.join(',')}&size=${size}x${size}&format=Png&isCircular=false`;
    
    for (const proxy of PROXY_SERVERS) {
        try {
            const proxyUrl = proxy + encodeURIComponent(apiUrl);
            const response = await fetch(proxyUrl, { timeout: 5000 });
            
            if (!response.ok) continue;
            
            const data = await response.json();
            const results = new Map();
            
            if (data.data && Array.isArray(data.data)) {
                data.data.forEach(item => {
                    if (item.imageUrl) {
                        const cacheKey = `${item.placeId}_${size}`;
                        results.set(String(item.placeId), item.imageUrl);
                    }
                });
                return results;
            }
        } catch (e) {
            console.error(`Proxy error (${proxy}):`, e);
        }
    }
    
    console.error("All proxies failed for batch:", placeIds);
    return new Map();
}



async function getThumbnailsUrls(placeIds, size = 256) {
    const results = new Map();
    const toFetch = [];
    

    placeIds.forEach(placeId => {
        const cacheKey = `${placeId}_${size}`;
        if (thumbnailCache.has(cacheKey)) {
            results.set(placeId, thumbnailCache.get(cacheKey));
        } else {
            toFetch.push(placeId);
        }
    });
    

    for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
        const batch = toFetch.slice(i, i + BATCH_SIZE);
        const batchResults = await fetchThumbnailsBatch(batch, size);
        
        batchResults.forEach((url, id) => {
            const cacheKey = `${id}_${size}`;
            thumbnailCache.set(cacheKey, url);
            results.set(id, url);
        });
    }
    
    saveCache();
    return results;
}





async function loadThumbnails(placesToShow, startIndex) {
    const placeIds = [];
    const imageElements = [];
    placesToShow.forEach((place, localIndex) => {
        const globalIndex = startIndex + localIndex;
        const img = document.getElementById(`img-${globalIndex}`);
        if (!img) return;
        img.src = 'data/needable/loading.png';
        if (!place.id || place.id.length < 7) {
            img.src = 'data/needable/NewFrontPageGuy.png';
        } else {
            placeIds.push(place.id);
            imageElements.push({img, placeId: place.id});
        }
    });
    if (placeIds.length === 0) return;
    const thumbnailsMap = await getThumbnailsUrls(placeIds);
    imageElements.forEach(({img, placeId}) => {
        const url = thumbnailsMap.get(placeId) || 'data/needable/NewFrontPageGuy.png';
        img.src = url;
    });
}

async function loadCoolThumbnails(places) {
    const placeIds = [];
    const imageElements = [];
    
    places.forEach(place => {
        if (!place.id || place.id.length < 7) return;
        
        const img = document.querySelector(`.UserPlace img[data-place-id="${place.id}"]`);
        if (!img) return;
        
        img.src = 'data/needable/loading.png';
        placeIds.push(place.id);
        imageElements.push({img, placeId: place.id});
    });

    if (placeIds.length === 0) return;
    const thumbnailsMap = await getThumbnailsUrls(placeIds, 512);
    imageElements.forEach(({img, placeId}) => {
        const url = thumbnailsMap.get(placeId) || 'data/needable/NewFrontPageGuy.png';
        img.src = url;
    });
}

let editMode = false;
function toggleEditMode() {editMode = !editMode;renderPlaces();play_sound(editMode ? "click.mp3" : "splat.mp3");}

function renderPlaces() {
    const container = document.getElementById('placesContainer');
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    const selectedCategory = document.getElementById('categoryFilter').value;
    if (savedPlaces.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                What's here is empty :(<br>
                Want to see my list?<br>
                <button onclick="loadDefaultList()">Load</button>
            </div>
        `;
        return;
    }
    let filteredPlaces = savedPlaces;
    if (selectedCategory !== 'All') {
        filteredPlaces = savedPlaces.filter(place => {
            if (selectedCategory === 'None') {return !place.category || place.category === '';}
            return place.category === selectedCategory;
        });
    }
    const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
    if (currentPage >= totalPages && totalPages > 0) {currentPage = totalPages - 1;}

    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredPlaces.length);
    const placesToShow = filteredPlaces.slice(startIndex, endIndex);
    container.innerHTML = '';
    placesToShow.forEach((place, index) => {
        const globalIndex = startIndex + index;
        const displayCategory = place.category ? place.category : 'None';
        container.innerHTML += `
        <div class="place" data-id="${globalIndex}">
            <a onclick="play_sound('splat.mp3')" href="${place.url}" target="_blank">
                <img id="img-${globalIndex}" src="data/needable/loading.png" alt="${place.name}" loading="lazy" decoding="async">
                ${editMode ? '' : `<br><t><small>${place.name}</small></t><br>`}
            </a>
            ${editMode ? `
                <div class="edit-controls">
                    <button onclick="deletePlace(${globalIndex})" class="delete-btn">✖</button>
                    <button onclick="startEditPlace(${globalIndex})" class="edit-btn">✎</button>
                </div>
            ` : ''}
            <desc><b>Added:</b> ${place.date}</desc>
        </div>
        `;
    });
    renderPagination(totalPages);
    loadThumbnails(placesToShow, startIndex);
}



function loadDefaultList() {
    fetch('My_Fav_List.json')
        .then(response => {if (!response.ok) throw new Error('File not found');return response.json();})
        .then(importedPlaces => {
            if (!Array.isArray(importedPlaces)) {alert("Error: Invalid data format");return;}
            
            const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
            let duplicates = 0;
            let imported = 0;
            let invalid = 0;
            
            importedPlaces.forEach(place => {
                if (!place.url || !place.name) {invalid++;return;}
                const id = place.id || extractPlaceId(place.url);
                const normalizedUrl = place.normalizedUrl || normalizeRobloxUrl(place.url);
                
                const isDuplicate = savedPlaces.some(savedPlace => {
                    return (id && savedPlace.id === id) || 
                           savedPlace.normalizedUrl === normalizedUrl ||
                           normalizeRobloxUrl(savedPlace.url) === normalizedUrl;
                });
                
                if (isDuplicate) {duplicates++;
                } else {
                    const completePlace = {
                        id,
                        name: place.name,
                        url: place.url,
                        category: place.category || '',
                        normalizedUrl,
                        date: place.date || new Date().toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }).replace(',', '')
                    };
                    savedPlaces.push(completePlace);
                    imported++;
                }
            });
            
            localStorage.setItem('places', JSON.stringify(savedPlaces));
            renderPlaces();
            nextCoolSet();
            alert(`Successfully imported: ${imported}\nDuplicates skipped: ${duplicates}\nInvalid entries: ${invalid}`);
            play_sound("victory.mp3");
        })
        .catch(error => {
            alert(`Error loading default list: ${error.message}\nMake sure Fav-List.json is in the same directory`);
            console.error("Load error:", error);
            play_sound("ouch.mp3");
        });
}



function renderPagination(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination">';
    paginationHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>&lt; Back</button>`;
    paginationHTML += `<span>Page ${currentPage + 1} of ${totalPages}</span>`;
    paginationHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>Next &gt;</button>`;
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
}

function changePage(newPage) {
    currentPage = newPage;
    renderPlaces();
    play_sound("pageturn.mp3");
}

function clearAllPlaces() {
    if (confirm("Are you sure you want to delete ALL saved places? This action cannot be undone!")) {
        localStorage.removeItem('places');
        localStorage.removeItem('categories');
        clearThumbnailCache();
        renderPlaces();
        play_sound("collide.mp3");
    }
}

function setRandomBanner() {
    const defaultBanners = [
        "data/needable/banners/2007ChristmasBanner.webp",
        "data/needable/banners/2007HalloweenBanner.webp",
        "data/needable/banners/2008NoLogoBanner.webp",
        "data/needable/banners/BuildermanBanner.webp",
        "data/needable/banners/ChristmasBanner2008.webp"
    ];
    
    try {
        const customBanners = JSON.parse(localStorage.getItem('customBanners')) || [];
        const banners = customBanners.length > 0 ? customBanners : defaultBanners;
        const randomBanner = banners[Math.floor(Math.random() * banners.length)];
        const header = document.querySelector('.banner');
        
        if (header) {
            header.style.backgroundImage = `url('${randomBanner}')`;
            header.style.backgroundSize = 'cover';
            header.style.backgroundPosition = 'center';
            header.style.backgroundRepeat = 'no-repeat';
            header.style.transition = 'background-image 0.5s ease-in-out';
        }
    } catch (error) {
        console.error('Error setting banner:', error);
        const header = document.querySelector('.banner');
        if (header) {
            header.style.backgroundImage = "url('data/needable/NewFrontPageGuy.png')";
        }
    }
}

// USERPLACES
let coolPlacesHistory = [];
let currentCoolIndex = -1;

function updateCoolPlaces() {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    const container = document.querySelector('.UserPlaces');
    container.innerHTML = '';
    
    if (savedPlaces.length === 0) {
        for (let i = 0; i < 5; i++) {
            container.innerHTML += `<div class='UserPlace'><a href=''><img src='data/needable/loading.png'><br></a></div>`;
        }
        return;
    }
    
    const currentSet = coolPlacesHistory[currentCoolIndex] || [];
    
    currentSet.forEach(place => {
        container.innerHTML += `
            <div class='UserPlace'>
                <a onclick="play_sound('splat.mp3')" href='${place.url}' target='_blank'>
                    <img src='data/needable/loading.png' 
                         data-place-id="${place.id}" 
                         alt="${place.name}">
                    <br>
                </a>
            </div>
        `;
    });
    
    loadCoolThumbnails(currentSet);
}

function generateRandomPlaces() {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    if (savedPlaces.length <= 5) return [...savedPlaces];
    
    const randomPlaces = [];
    const indices = new Set();
    
    while (indices.size < 5) {
        const randomIndex = Math.floor(Math.random() * savedPlaces.length);
        if (!indices.has(randomIndex)) {
            indices.add(randomIndex);
            randomPlaces.push(savedPlaces[randomIndex]);
        }
    }
    
    return randomPlaces;
}

function nextCoolSet() {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    if (savedPlaces.length === 0) return;
    
    const newSet = generateRandomPlaces();
    coolPlacesHistory = coolPlacesHistory.slice(0, currentCoolIndex + 1);
    coolPlacesHistory.push(newSet);
    currentCoolIndex = coolPlacesHistory.length - 1;
    
    updateCoolPlaces();
    updateCoolNavigation();
    play_sound("click.mp3");
}

function prevCoolSet() {
    if (currentCoolIndex > 0) {
        currentCoolIndex--;
        updateCoolPlaces();
        updateCoolNavigation();
    }
    play_sound("click.mp3");
}

function updateCoolNavigation() {
    const prevBtn = document.getElementById('prevCoolBtn');
    const nextBtn = document.getElementById('nextCoolBtn');
    prevBtn.disabled = currentCoolIndex <= 0;
    nextBtn.disabled = false;
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedPlaces = JSON.parse(e.target.result);
            if (!Array.isArray(importedPlaces)) {
                alert("Error: no data");
                return;
            }
            
            const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
            let duplicates = 0;
            let imported = 0;
            
    importedPlaces.forEach(place => {
        if (!place.url || !place.name) {
            console.warn("Missed url or name:", place);
            return;
        }
        
        const id = place.id || extractPlaceId(place.url);
        const normalizedUrl = place.normalizedUrl || normalizeRobloxUrl(place.url);
        
        const isDuplicate = savedPlaces.some(savedPlace => {
            return (id && savedPlace.id === id) || 
                   savedPlace.normalizedUrl === normalizedUrl ||
                   normalizeRobloxUrl(savedPlace.url) === normalizedUrl;
        });
        
        if (isDuplicate) {
            duplicates++;
        } else {
            let category = place.category || '';
            const completePlace = {
                id,
                name: place.name,
                url: place.url,
                category,
                normalizedUrl,
                date: place.date || new Date().toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }).replace(',', '')
            };
            savedPlaces.push(completePlace);
            imported++;
        }
    });
    
    localStorage.setItem('places', JSON.stringify(savedPlaces));
    currentPage = Math.floor(savedPlaces.length / itemsPerPage);
    renderPlaces();
    
    alert(`Succes import: ${imported}\nDuplicates: ${duplicates}\nInvalid: ${importedPlaces.length - imported - duplicates}`);
} catch (error) {console.error("Import Error:", error);alert(`Import Error: ${error.message}\nCheck format file`);
}
    };reader.readAsText(file);play_sound("victory.mp3");
}

// MUSIC PLAYER
const tracks = [
    "data/needable/Audio/Michael%20Wyckoff%20-%20Keygen.mp3","data/needable/Audio/Roblox%20Monster%20Mash%20Potion%20Remix%20｜%20Classy%20Doge%20Remix.mp3",
    "data/needable/Audio/Positively%20Dark-%20Awakening.mp3","data/needable/Audio/Ragnarok%20Online%20-%20Monastery%20in%20Disguise%20(Cursed%20Abbey⧸Monastery)%20HD.mp3",
    "data/needable/Audio/old%20roblox%20dance｜Roblox.mp3","data/needable/Audio/M.U.L.E%20Theme%20(ROBLOX%20music).mp3",
    "data/needable/Audio/Flight%20of%20the%20Bumblebee%20Roblox.mp3","data/needable/Audio/Caramelldansen%20-%20Supergott%20-%20Roblox%20Music.mp3",
    "data/needable/Audio/Bossfight%20-%20Starship%20Showdown.mp3","data/needable/Audio/Bossfight%20-%20Milky%20Ways.mp3",
    "data/needable/Audio/Bossfight%20-%20Leaving%20Leafwood%20Forest.mp3",
    "data/needable/Audio/Bossfight%20-%20Farbror%20Melker%20Fixar%20Fiskdamm%20(Fastbom%20Cover).mp3","data/needable/Audio/Bossfight%20-%20Commando%20Steve.mp3",
    "data/needable/Audio/Bossfight%20-%20Captain%20Cool.mp3","data/needable/Audio/Better%20Off%20Alone%20-%20Glejs%20(Remix).mp3",
    "data/needable/Audio/30.%20Roblox%20Soundtrack%20-%20Party%20Music%20(2008).mp3","data/needable/Audio/29.%20Roblox%20Soundtrack%20-%20Explore%20ROBLOX.mp3",
    "data/needable/Audio/28.%20Roblox%20Soundtrack%20-%20Online%20Social%20Hangout.mp3","data/needable/Audio/23.%20Roblox%20Soundtrack%20-%20Tycoon%20Game.mp3",
    "data/needable/Audio/19.%20Roblox%20Soundtrack%20-%20Santa's%20Winter%20Stronghold.mp3","data/needable/Audio/18.%20Roblox%20Soundtrack%20-%201x1x1x1's%20Creed.mp3",
    "data/needable/Audio/17.%20Roblox%20Soundtrack%20-%20Big%20Clan⧸Group%20Recruitment%20Centre%20Entrance.mp3",
    "data/needable/Audio/16.%20Roblox%20Soundtrack%20-%20Heli%20Wars.mp3","data/needable/Audio/13.%20Roblox%20Soundtrack%20-%20Contest%20Time!.mp3",
    "data/needable/Audio/11.%20Roblox%20Soundtrack%20-%20Clan%20Being%20Raided.mp3","data/needable/Audio/09.%20Roblox%20Soundtrack%20-%20Crossroads%20Times.mp3",
    "data/needable/Audio/08.%20Roblox%20Soundtrack%20-%20Noob%20Alert.mp3","data/needable/Audio/07.%20Roblox%20Soundtrack%20-%20Trouble%20Ahead%20(BONUS%20SONG)%20(Teddy9340's%20Production).mp3",
    "data/needable/Audio/06.%20Roblox%20Soundtrack%20-%20Metal%20Bricks.mp3","data/needable/Audio/05.%20Roblox%20Soundtrack%20-%20Robloxia's%20Last%20Stand.mp3",
    "data/needable/Audio/03.%20Roblox%20Soundtrack%20-%20Happy%20Day%20In%20Robloxia⧸Roblox%20HQ.mp3","data/needable/Audio/01.%20Roblox%20Soundtrack%20-%20The%20Main%20Theme.mp3"
];

const audioPlayer = new Audio();
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const volumeSlider = document.getElementById('volume-slider');
const trackName = document.getElementById('track-name');
const progressBar = document.getElementById('progress-bar');
const errorMsg = document.getElementById('error-message');
let currentTrackIndex = 0;
let isPlaying = false;

function decodeFileName(encoded) {return decodeURIComponent(encoded).split('/').pop().replace(/\.[^/.]+$/, "");}

function loadRandomTrack() {
    if (tracks.length === 0) {errorMsg.textContent = "No tracks found";return;}
    currentTrackIndex = Math.floor(Math.random() * tracks.length);
    const trackPath = tracks[currentTrackIndex];
    audioPlayer.src = trackPath;
    trackName.textContent = decodeFileName(trackPath);
    progressBar.style.width = '0%';
    audioPlayer.load();
}

function togglePlay() {
    if (!audioPlayer.src) {loadRandomTrack();}
    if (isPlaying) {audioPlayer.pause();playBtn.textContent = "▶";
    } else {audioPlayer.play().then(() => {playBtn.textContent = "⏸";}).catch(error => {errorMsg.textContent = "Playing error: " + error.message;console.error("Playing error", error);});
    }isPlaying = !isPlaying;play_sound("click.mp3");
}
function nextTrack() {currentTrackIndex = (currentTrackIndex + 1) % tracks.length;loadRandomTrack();if (isPlaying) {audioPlayer.play().catch(e => {errorMsg.textContent = "AutoPlay error: " + e.message;});}play_sound("click.mp3");}
function prevTrack() {currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;loadRandomTrack();if (isPlaying) {audioPlayer.play().catch(e => {errorMsg.textContent = "AutoPlay error: " + e.message;});}play_sound("click.mp3");}

// EDIT MODE
function deletePlace(index) {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    if (index < 0 || index >= savedPlaces.length) {console.error('Invalid index:', index);return;}
    if (!confirm(`Delete "${savedPlaces[index].name}"?`)) return; 
    savedPlaces.splice(index, 1);localStorage.setItem('places', JSON.stringify(savedPlaces));renderPlaces();play_sound("collide.mp3");
}

function startEditPlace(index) {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    const place = savedPlaces[index];
    const placeElement = document.querySelector(`.place[data-id="${index}"]`);
    let categoryOptions = '';
    categories.forEach(cat => {
        if (cat === 'All') return;
        const selected = (cat === 'None' && !place.category) || 
                         (cat === place.category);
        
        categoryOptions += `<option value="${cat}" ${selected ? 'selected' : ''}>${cat}</option>`;
    });
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
    `;
    play_sound("bass.mp3");
}

function saveEditedPlace(index) {
    const savedPlaces = JSON.parse(localStorage.getItem('places')) || [];
    const place = savedPlaces[index];
    const newName = document.getElementById(`edit-name-${index}`).value;
    const newUrl = document.getElementById(`edit-url-${index}`).value;
    const newCategory = document.getElementById(`edit-category-${index}`).value;
    if (!newName || !newUrl) {alert("Both fields are required!");return;}
    const storeCategory = newCategory === 'None' ? '' : newCategory;
    place.name = newName;
    place.url = newUrl;
    place.category = storeCategory;
    place.id = extractPlaceId(newUrl) || place.id;
    place.normalizedUrl = normalizeRobloxUrl(newUrl);
    localStorage.setItem('places', JSON.stringify(savedPlaces));renderPlaces();play_sound("splat.mp3");
}

function clearForm() {
    document.getElementById('placeName').value = '';
    document.getElementById('placeUrl').value = '';
    document.getElementById('placeCategory').value = 'None';
}

window.onload = function() {
    initCategories();populateCategoryDropdowns();setRandomBanner();renderPlaces();nextCoolSet();

    document.getElementById('categoryFilter').addEventListener('change', function() {currentPage = 0;renderPlaces();});
    document.getElementById('prevCoolBtn').addEventListener('click', prevCoolSet);
    document.getElementById('nextCoolBtn').addEventListener('click', nextCoolSet);
    document.getElementById('importFile').addEventListener('change', handleFileSelect);
    
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    volumeSlider.addEventListener('input', () => {audioPlayer.volume = volumeSlider.value;});
    
    audioPlayer.addEventListener('timeupdate', () => {
        if (!audioPlayer.duration) return;
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progress}%`;
    });
    audioPlayer.addEventListener('ended', nextTrack);
    audioPlayer.addEventListener('error', () => {
        errorMsg.textContent = `Error loading: ${audioPlayer.error ? audioPlayer.error.message : 'Unknown error'}`;
        setTimeout(nextTrack, 2000);
    });
    document.querySelector('.progress').addEventListener('click', (e) => {
        if (!audioPlayer.duration) return;
        const progressWidth = e.currentTarget.clientWidth;
        const clickPosition = e.offsetX;
        audioPlayer.currentTime = (clickPosition / progressWidth) * audioPlayer.duration;
    });
    loadRandomTrack();
};