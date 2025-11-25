/*
AUTHOR BY AI & DeMorMr | https://github.com/DeMorMr
25.11.2025 | global improvements/changes using ai
Want to help us? Join to our server!
*/

class RoWebApp {
    constructor() {
        this.state = {
            // Music player
            player: new Audio(),
            playlist: [],
            currentTrack: 0,
            playing: false,
            userInteracted: false,
            isSeeking: false,
            
            // Places
            currentPage: 0,
            itemsPerPage: 15,
            editMode: false,
            
            // Cool places
            coolPlacesHistory: [],
            currentCoolIndex: -1,
            
            // Categories
            categories: ['All', 'Adventure', 'Tycoon', 'Roleplay', 'Obby', 'Shooter'],
            
            // Thumbnail cache
            thumbnailCache: new Map(),
            
            // Audio pool for sound effects
            audioPool: []
        };

        this.BATCH_SIZE = 10;
        this.PROXY_SERVERS = [
            "https://api.allorigins.win/raw?url=",
            "https://corsproxy.io/?",
            "https://api.codetabs.com/v1/proxy?quest="
        ];

        this.init();
    }

    // ==================== INITIALIZATION ====================
    init() {
        this.initCategories();
        this.initPlaylist();
        this.initThumbnailCache();
        this.setupEventListeners();
        this.loadUI();
        
        // Set up intervals
        setInterval(() => this.setRandomBackground(), 30000);
        setInterval(() => this.setRandomBanner(), 60000);
    }

    initCategories() {
        const saved = this.storageGet('categories');
        if (saved?.length) {
            this.state.categories = saved;
        }
        
        // Ensure required categories exist
        if (!this.state.categories.includes('All')) this.state.categories.unshift('All');
        if (!this.state.categories.includes('None')) this.state.categories.push('None');
        
        this.storageSet('categories', this.state.categories);
    }

    initPlaylist() {
        const paths = { 
            mp3: "data/main/mp3/", 
            cr: "data/main/cr/" 
        };
        
        const songs = {
            mp3: [
                "Michael Wyckoff - Keygen.mp3", "Roblox Monster Mash Potion Remix ｜ Classy Doge Remix.mp3",
                "Positively Dark- Awakening.mp3", "Ragnarok Online - Monastery in Disguise (Cursed Abbey⧸Monastery) HD.mp3",
                "old roblox dance｜Roblox.mp3", "M.U.L.E Theme (ROBLOX music).mp3", "Flight of the Bumblebee Roblox.mp3",
                "Caramelldansen - Supergott - Roblox Music.mp3", "Bossfight - Starship Showdown.mp3", "Bossfight - Milky Ways.mp3",
                "Bossfight - Leaving Leafwood Forest.mp3", "Bossfight - Farbror Melker Fixar Fiskdamm (Fastbom Cover).mp3",
                "Bossfight - Commando Steve.mp3", "Bossfight - Captain Cool.mp3", "Better Off Alone - Glejs (Remix).mp3",
                "30. Roblox Soundtrack - Party Music (2008).mp3", "29. Roblox Soundtrack - Explore ROBLOX.mp3",
                "28. Roblox Soundtrack - Online Social Hangout.mp3", "23. Roblox Soundtrack - Tycoon Game.mp3",
                "19. Roblox Soundtrack - Santa's Winter Stronghold.mp3", "18. Roblox Soundtrack - 1x1x1x1's Creed.mp3",
                "17. Roblox Soundtrack - Big Clan⧸Group Recruitment Centre Entrance.mp3", "16. Roblox Soundtrack - Heli Wars.mp3",
                "13. Roblox Soundtrack - Contest Time!.mp3", "11. Roblox Soundtrack - Clan Being Raided.mp3",
                "09. Roblox Soundtrack - Crossroads Times.mp3", "08. Roblox Soundtrack - Noob Alert.mp3",
                "07. Roblox Soundtrack - Trouble Ahead (BONUS SONG) (Teddy9340's Production).mp3", "06. Roblox Soundtrack - Metal Bricks.mp3",
                "05. Roblox Soundtrack - Robloxia's Last Stand.mp3", "03. Roblox Soundtrack - Happy Day In Robloxia⧸Roblox HQ.mp3",
                "01. Roblox Soundtrack - The Main Theme.mp3", "its-raining-tacos!.mp3", "Toby Fox - A DARK ZONE.mp3"
            ],
            cr: [
                "1. happy-pig_@warble_humanoid.mp3", "2. lancer-waltz_@penilipo.mp3", "3. KEYGEN_@penilipo.mp3",
                "4. NEW-TRY_MostoThisStuff.wav", "5. kqwke-Barrier.mp3", "6. Penilipo x Maomi_@penilipo.mp3",
                "7. ExitedParty_@penilipo.wav", "8. 8BITAMBIENT_@penilipo.wav", "9. EarthboundSoundsOnly_@penilipo.wav",
                "10. SEATURTLE_@penilipo.mp3", "11. print-hello-world_@warble_humanoid.mp3", "evilbell_imsosha.mp3"
            ]
        };
        
        this.state.playlist = [
            ...songs.mp3.map(file => paths.mp3 + file),
            ...songs.cr.map(file => paths.cr + file)
        ];
        this.shufflePlaylist();
    }

    initThumbnailCache() {
        const cached = this.storageGet('thumbnailCache', {});
        Object.entries(cached).forEach(([key, value]) => {
            this.state.thumbnailCache.set(key, { url: value, timestamp: Date.now() });
        });
    }

    setupEventListeners() {
        // Music player events
        this.state.player.addEventListener('timeupdate', () => this.updateProgress());
        this.state.player.addEventListener('seeking', () => {
            this.state.isSeeking = true;
            this.setErrorMessage("Seeking...");
        });
        this.state.player.addEventListener('seeked', () => {
            this.state.isSeeking = false;
            this.setErrorMessage("");
        });
        this.state.player.addEventListener('waiting', () => {
            this.setErrorMessage("Buffering...");
        });
        this.state.player.addEventListener('canplay', () => {
            this.state.isSeeking = false;
            this.setErrorMessage("");
        });
        this.state.player.addEventListener('ended', () => this.nextTrack());

        // UI events
        document.getElementById('play-btn')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextTrack());
        document.getElementById('prev-btn')?.addEventListener('click', () => this.previousTrack());
        document.getElementById('volume-slider')?.addEventListener('input', (e) => {
            this.state.player.volume = e.target.value;
        });
        document.querySelector('.progress')?.addEventListener('click', (e) => this.handleSeek(e));

        // Places events
        document.getElementById('categoryFilter')?.addEventListener('change', () => {
            this.state.currentPage = 0;
            this.renderPlaces();
        });
        document.getElementById('prevCoolBtn')?.addEventListener('click', () => this.prevCoolSet());
        document.getElementById('nextCoolBtn')?.addEventListener('click', () => this.nextCoolSet());
        document.getElementById('importFile')?.addEventListener('change', (e) => this.handleFileSelect(e));

        // One-time user interaction
        document.addEventListener('click', () => {
            this.state.userInteracted = true;
        }, { once: true });
    }

    loadUI() {
        this.setRandomBackground();
        this.setRandomBanner();
        this.populateCategoryDropdowns();
        this.renderPlaces();
        this.nextCoolSet();
        this.loadTrack();
        this.state.player.volume = 0.7;
    }

    // ==================== UTILITY FUNCTIONS ====================
    shufflePlaylist() {
        const newArray = [...this.state.playlist];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        this.state.playlist = newArray;
    }

    storageGet(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    }

    storageSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    extractPlaceId(url) {
        const match = url.match(/(?:\/\/|\b)(?:www\.)?(?:rblx\.games|roblox\.com)\/games\/(\d+)(?:\/|$|\?)/);
        return match ? match[1] : null;
    }

    normalizeRobloxUrl(url) {
        const id = this.extractPlaceId(url);
        return id ? `https://www.roblox.com/games/${id}` : url.toLowerCase();
    }

    // ==================== SOUND SYSTEM ====================
    sound(name) {
        if (!this.state.userInteracted) return true;
        
        // Reuse available audio elements
        const availableAudio = this.state.audioPool.find(a => a.paused || a.ended);
        const audio = availableAudio || new Audio();
        
        if (!availableAudio) {
            this.state.audioPool.push(audio);
            // Limit pool size
            if (this.state.audioPool.length > 5) {
                this.state.audioPool = this.state.audioPool.slice(-5);
            }
        }
        
        audio.volume = 0.3;
        
        let soundFile = name;
        if (typeof name === 'string' && name.includes(',')) {
            const sounds = name.split(',').map(s => s.trim());
            soundFile = sounds[Math.floor(Math.random() * sounds.length)];
        } else if (Array.isArray(name)) {
            soundFile = name[Math.floor(Math.random() * name.length)];
        }
        
        audio.src = 'data/main/sfx/' + soundFile;
        audio.autoplay = true;
        return true;
    }

    // ==================== UI MANAGEMENT ====================
    switchSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.style.display = 'block';
        this.sound("click.mp3");
    }

    switchdiv(hideId, showId, displayType = 'block') {
        const hideElement = document.getElementById(hideId);
        const showElement = document.getElementById(showId);
        if (hideElement) hideElement.style.display = 'none';
        if (showElement) showElement.style.display = displayType;
        this.sound("click.mp3");
    }

    setRandomBanner() {
        const defaultBanners = [
            "data/main/banners/2007ChristmasBanner.webp",
            "data/main/banners/2007HalloweenBanner.webp",
            "data/main/banners/2008NoLogoBanner.webp",
            "data/main/banners/BuildermanBanner.webp",
            "data/main/banners/ChristmasBanner2008.webp"
        ];
        this.setRandomBackground('.banner', defaultBanners, 'customBanners');
    }

    setRandomBackground(selector = 'body', defaults = null, storageKey = 'customBackgrounds') {
        const defaultBanners = defaults || [
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
            const customBanners = this.storageGet(storageKey) || [];
            const banners = customBanners.length > 0 ? customBanners : defaultBanners;
            const randomBanner = banners[Math.floor(Math.random() * banners.length)];
            const element = document.querySelector(selector);
            
            if (element) {
                element.style.backgroundImage = `url('${randomBanner}')`;
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
                element.style.backgroundRepeat = 'no-repeat';
            }
        } catch (error) {
            console.error('Background error:', error);
            const element = document.querySelector(selector);
            if (element) element.style.backgroundImage = "url('data/main/NewFrontPageGuy.png')";
        }
    }

    setErrorMessage(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) errorElement.textContent = message;
    }

    // ==================== CATEGORY MANAGEMENT ====================
    populateCategoryDropdowns() {
        const categorySelect = document.getElementById('placeCategory');
        const filterSelect = document.getElementById('categoryFilter');
        
        [categorySelect, filterSelect].forEach(select => {
            if (!select) return;
            
            select.innerHTML = '';
            this.state.categories.forEach(category => {
                if (select === categorySelect && category === 'All') return;
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        });
        
        if (categorySelect) categorySelect.value = 'None';
        if (filterSelect) filterSelect.value = 'All';
    }

    saveCategory() {
        const newCategoryInput = document.getElementById('newCategory');
        if (!newCategoryInput) return;
        
        const newCategory = newCategoryInput.value.trim();
        if (!newCategory) {
            alert("Please enter a category name!");
            this.sound("ouch.mp3");
            return;
        }
        
        if (newCategory.length > 10) {
            alert("Category name cannot exceed 10 characters!");
            this.sound("ouch.mp3");
            return;
        }
        
        if (newCategory === 'All' || newCategory === 'None') {
            alert("Category name cannot be 'All' or 'None'!");
            return;
        }
        
        if (this.state.categories.includes(newCategory)) {
            alert("This category already exists!");
            return;
        }
        
        this.state.categories.push(newCategory);
        this.storageSet('categories', this.state.categories);
        newCategoryInput.value = '';
        this.populateCategoryDropdowns();
        this.sound("splat.mp3");
    }

    manageCategories() {
        const container = document.getElementById('categories-container');
        const manageBtn = document.getElementById('manageCategoriesBtn');
        if (!container || !manageBtn) return;
        
        if (container.style.display === 'none' || !container.innerHTML.trim()) {
            container.innerHTML = `
                <div class="categories-list">
                    ${this.state.categories.filter(cat => cat !== 'All' && cat !== 'None').map(cat => `
                        <div class="category-item">
                            <span>${cat}</span>
                            <button onclick="app.deleteCategory('${cat}')" class="delete-category-btn">✖</button>
                        </div>
                    `).join('')}
                </div>
                <button onclick="app.closeCategories()" class="close-btn">Close</button>
            `;
            container.style.display = 'block';
            manageBtn.style.display = 'none';
        } else {
            container.style.display = 'none';
            manageBtn.style.display = 'block';
        }
        this.sound("click.mp3");
    }

    closeCategories() {
        const container = document.getElementById('categories-container');
        const manageBtn = document.getElementById('manageCategoriesBtn');
        if (!container || !manageBtn) return;
        
        container.innerHTML = '';
        container.style.display = 'none';
        manageBtn.style.display = 'block';
        this.sound("click.mp3");
    }

    deleteCategory(category) {
        if (!confirm(`Delete category "${category}"? All places in this category will be moved to "None".`)) {
            this.sound("ouch.mp3");
            return;
        }
        
        this.state.categories = this.state.categories.filter(cat => cat !== category);
        this.storageSet('categories', this.state.categories);
        
        const savedPlaces = this.storageGet('places', []);
        savedPlaces.forEach(place => {
            if (place.category === category) place.category = '';
        });
        this.storageSet('places', savedPlaces);
        
        this.populateCategoryDropdowns();
        this.renderPlaces();
        this.sound("collide.mp3");
    }

    // ==================== PLACE MANAGEMENT ====================
    savePlace() {
        const nameInput = document.getElementById('placeName');
        const urlInput = document.getElementById('placeUrl');
        const categoryInput = document.getElementById('placeCategory');
        
        if (!nameInput || !urlInput || !categoryInput) return;
        
        const name = nameInput.value;
        const url = urlInput.value;
        const category = categoryInput.value;
        
        if (name.length > 50) {
            alert("Place name cannot exceed 50 characters!");
            this.sound("ouch.mp3");
            return;
        }
        
        if (!name || !url) {
            alert("Please fill both fields!");
            this.sound("ouch.mp3");
            return;
        }
        
        let id = this.extractPlaceId(url);
        if (!id) {
            const numMatch = url.match(/\b(\d+)\b/);
            if (numMatch && numMatch[1].length >= 7) id = numMatch[1];
        }
        
        const savedPlaces = this.storageGet('places', []);
        const normalizedUrl = this.normalizeRobloxUrl(url);
        
        const isDuplicate = savedPlaces.some(place => {
            if (id && place.id && place.id === id) return true;
            const placeNormalizedUrl = this.normalizeRobloxUrl(place.url);
            return placeNormalizedUrl === normalizedUrl;
        });
        
        if (isDuplicate) {
            alert("This place is already saved!");
            return;
        }
        
        const storeCategory = category === 'None' ? '' : category;
        const place = {
            id,
            name,
            url,
            category: storeCategory,
            normalizedUrl,
            date: new Date().toLocaleString('en-GB', {
                day: '2-digit', month: '2-digit', year: '2-digit',
                hour: '2-digit', minute: '2-digit'
            }).replace(',', '')
        };
        
        savedPlaces.push(place);
        this.storageSet('places', savedPlaces);
        this.sound("splat.mp3");
        this.renderPlaces();
        this.clearForm();
    }

    clearForm() {
        const nameInput = document.getElementById('placeName');
        const urlInput = document.getElementById('placeUrl');
        const categoryInput = document.getElementById('placeCategory');
        
        if (nameInput) nameInput.value = '';
        if (urlInput) urlInput.value = '';
        if (categoryInput) categoryInput.value = 'None';
    }

    deletePlace(index) {
        const savedPlaces = this.storageGet('places', []);
        if (index < 0 || index >= savedPlaces.length) {
            console.error('Invalid index:', index);
            return;
        }
        
        if (!confirm(`Delete "${savedPlaces[index].name}"?`)) return;
        
        savedPlaces.splice(index, 1);
        this.storageSet('places', savedPlaces);
        this.renderPlaces();
        this.sound("collide.mp3");
    }

    startEditPlace(index) {
        const savedPlaces = this.storageGet('places', []);
        const place = savedPlaces[index];
        const placeElement = document.querySelector(`.place[data-id="${index}"]`);
        
        if (!placeElement) {
            console.error(`Place element with id ${index} not found!`);
            return;
        }
        
        let categoryOptions = '';
        this.state.categories.forEach(cat => {
            if (cat === 'All') return;
            const selected = (cat === 'None' && !place.category) || (cat === place.category);
            categoryOptions += `<option value="${cat}" ${selected ? 'selected' : ''}>${cat}</option>`;
        });
        
        placeElement.innerHTML = `
            <div class="edit-form">
                <input type="text" id="edit-name-${index}" value="${place.name}" placeholder="Place Name">
                <input type="text" id="edit-url-${index}" value="${place.url}" placeholder="Place URL">
                <select id="edit-category-${index}">
                    ${categoryOptions}
                </select>
                <button onclick="app.saveEditedPlace(${index})">Save</button>
                <button onclick="app.renderPlaces()">Cancel</button>
            </div>
        `;
        this.sound("bass.mp3");
    }

    saveEditedPlace(index) {
        const savedPlaces = this.storageGet('places', []);
        const nameInput = document.getElementById(`edit-name-${index}`);
        const urlInput = document.getElementById(`edit-url-${index}`);
        const categorySelect = document.getElementById(`edit-category-${index}`);
        
        if (!nameInput || !urlInput || !categorySelect) {
            console.error('Edit form inputs not found!');
            return;
        }
        
        const newName = nameInput.value;
        const newUrl = urlInput.value;
        const newCategory = categorySelect.value;
        
        if (!newName || !newUrl) {
            alert("Both fields are required!");
            return;
        }
        
        const place = savedPlaces[index];
        if (!place) {
            console.error(`Place with index ${index} not found!`);
            return;
        }
        
        const storeCategory = newCategory === 'None' ? '' : newCategory;
        place.name = newName;
        place.url = newUrl;
        place.category = storeCategory;
        place.id = this.extractPlaceId(newUrl) || place.id;
        place.normalizedUrl = this.normalizeRobloxUrl(newUrl);
        
        this.storageSet('places', savedPlaces);
        this.renderPlaces();
        this.sound("splat.mp3");
    }

    toggleEditMode() {
        this.state.editMode = !this.state.editMode;
        this.renderPlaces();
        this.sound(this.state.editMode ? "click.mp3" : "splat.mp3");
    }

    // ==================== PLACES RENDERING ====================
    renderPlaces() {
        const container = document.getElementById('placesContainer');
        if (!container) {
            console.error('placesContainer not found!');
            return;
        }
        
        const savedPlaces = this.storageGet('places', []);
        const selectedCategory = document.getElementById('categoryFilter')?.value || 'All';
        
        if (savedPlaces.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        const filteredPlaces = savedPlaces.map((place, originalIndex) => ({
            ...place, originalIndex
        })).filter(place => {
            if (selectedCategory === 'All') return true;
            if (selectedCategory === 'None') return !place.category || place.category === '';
            return place.category === selectedCategory;
        });
        
        const totalPages = Math.ceil(filteredPlaces.length / this.state.itemsPerPage);
        if (this.state.currentPage >= totalPages && totalPages > 0) {
            this.state.currentPage = totalPages - 1;
        }
        
        const startIndex = this.state.currentPage * this.state.itemsPerPage;
        const placesToShow = filteredPlaces.slice(startIndex, startIndex + this.state.itemsPerPage);
        
        container.innerHTML = placesToShow.map((place, index) => 
            this.getPlaceHTML(place, startIndex + index)
        ).join('');
        
        this.renderPagination(totalPages);
        this.loadThumbnails(placesToShow);
    }

    getPlaceHTML(place, globalIndex) {
        const displayCategory = place.category ? place.category : 'None';
        return `
        <div class="place" data-id="${place.originalIndex}">
            <a onclick="app.sound('splat.mp3')" href="${place.url}" target="_blank">
                <img id="img-${place.originalIndex}" src="data/main/loading.webp" alt="${place.name}" title="${place.name}" decoding="async">
                ${!this.state.editMode ? `<t><small>${place.name}</small></t><br>` : ''}
            </a>
            ${this.state.editMode ? `
                <div class="edit-controls">
                    <button onclick="app.deletePlace(${place.originalIndex})" class="delete-btn">✖</button>
                    <button onclick="app.startEditPlace(${place.originalIndex})" class="edit-btn">✎</button>
                </div>
            ` : ''}
            <desc><b>Added:</b> ${place.date}</desc>
        </div>`;
    }

    getEmptyStateHTML() {
        return `
        <div class="empty-message">
            What's here is empty :(<br>
            Want to see my list?<br>
            <img src='data/main/teddy.png' onclick="app.sound(['1.mp3','2.mp3','3.mp3','4.mp3'])" alt="teddy" width="115px" title='Teddy Bloxpin'><br>
            <button onclick="app.loadDefaultList()">Load</button>
        </div>`;
    }

    renderPagination(totalPages) {
        const container = document.getElementById('paginationContainer');
        if (!container) return;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination">';
        paginationHTML += `<button onclick="app.changePage(${this.state.currentPage - 1})" ${this.state.currentPage === 0 ? 'disabled' : ''}>&lt; Back</button>`;
        
        const startPage = Math.max(0, this.state.currentPage - 2);
        const endPage = Math.min(totalPages - 1, this.state.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button onclick="app.changePage(${i})" ${i === this.state.currentPage ? 'class="active"' : ''}>${i + 1}</button>`;
        }
        
        paginationHTML += `<button onclick="app.changePage(${this.state.currentPage + 1})" ${this.state.currentPage >= totalPages - 1 ? 'disabled' : ''}>Next &gt;</button>`;
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    changePage(newPage) {
        this.state.currentPage = newPage;
        this.renderPlaces();
        this.sound("pageturn.mp3");
    }

    clearAllPlaces() {
        if (!confirm("Are you sure you want to delete ALL saved places? This action cannot be undone!")) return;
        
        this.storageSet('places', []);
        this.storageSet('categories', ['All', 'None']);
        this.clearThumbnailCache();
        this.renderPlaces();
        this.sound("collide.mp3");
    }

    // ==================== THUMBNAIL MANAGEMENT ====================
    async loadThumbnails(placesToShow, size = 128) {
        for (let i = 0; i < placesToShow.length; i += this.BATCH_SIZE) {
            const batch = placesToShow.slice(i, i + this.BATCH_SIZE);
            await this.processThumbnailBatch(batch, size);
        }
    }

    async processThumbnailBatch(batch, size) {
        const placeIds = batch.map(place => place.id).filter(id => id && id.length >= 7);
        if (placeIds.length === 0) return;
        
        // Set loading state
        batch.forEach(place => {
            const img = document.getElementById(`img-${place.originalIndex}`);
            if (img) img.src = 'data/main/loading.webp';
        });
        
        try {
            const thumbnails = await this.getBatchThumbnailUrls(placeIds, size);
            batch.forEach(place => {
                const img = document.getElementById(`img-${place.originalIndex}`);
                if (img) {
                    img.src = thumbnails[place.id] || 'data/main/NewFrontPageGuy.png';
                }
            });
        } catch (error) {
            console.error('Thumbnail batch error:', error);
            batch.forEach(place => {
                const img = document.getElementById(`img-${place.originalIndex}`);
                if (img) img.src = 'data/main/NewFrontPageGuy.png';
            });
        }
    }

    async getBatchThumbnailUrls(placeIds, size = 128) {
        const uncachedIds = [];
        const result = {};
        
        // Check cache first
        placeIds.forEach(id => {
            const cacheKey = `${id}_${size}`;
            if (this.state.thumbnailCache.has(cacheKey)) {
                result[id] = this.state.thumbnailCache.get(cacheKey).url;
            } else {
                uncachedIds.push(id);
            }
        });
        
        if (uncachedIds.length === 0) return result;
        
        const apiUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${uncachedIds.join(',')}&size=${size}x${size}&format=Png&isCircular=false`;
        
        for (const proxy of this.PROXY_SERVERS) {
            try {
                const response = await fetch(proxy + encodeURIComponent(apiUrl), {
                    headers: {'Accept': 'image/webp'}
                });
                
                if (!response.ok) continue;
                
                const data = await response.json();
                if (data.data && Array.isArray(data.data)) {
                    data.data.forEach(item => {
                        if (item.imageUrl) {
                            const cacheKey = `${item.targetId}_${size}`;
                            this.state.thumbnailCache.set(cacheKey, item.imageUrl);
                            result[item.targetId] = item.imageUrl;
                        }
                    });
                    this.saveThumbnailCache();
                    return result;
                }
            } catch (e) {
                console.error(`Proxy error (${proxy}):`, e);
            }
        }
        
        // Cache failures
        uncachedIds.forEach(id => {
            const cacheKey = `${id}_${size}`;
            this.state.thumbnailCache.set(cacheKey, null);
            result[id] = null;
        });
        
        this.saveThumbnailCache();
        return result;
    }

    saveThumbnailCache() {
        if (this.state.thumbnailCache.size > 500) {
            const entries = [...this.state.thumbnailCache.entries()]
                .sort((a, b) => b[1].timestamp - a[1].timestamp)
                .slice(0, 300);
            this.state.thumbnailCache.clear();
            entries.forEach(([key, value]) => this.state.thumbnailCache.set(key, value));
        }
        
        const cacheObj = Object.fromEntries(
            [...this.state.thumbnailCache.entries()].map(([k, v]) => [k, v?.url || null])
        );
        this.storageSet('thumbnailCache', cacheObj);
    }

    clearThumbnailCache() {
        this.state.thumbnailCache.clear();
        this.storageSet('thumbnailCache', {});
    }

    // ==================== COOL PLACES ====================
    updateCoolPlaces() {
        const savedPlaces = this.storageGet('places', []);
        const container = document.querySelector('.UserPlaces');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (savedPlaces.length === 0) {
            for (let i = 0; i < 5; i++) {
                container.innerHTML += `<div class='UserPlace'><a href=''><img src='data/main/loading.webp'><br></a></div>`;
            }
            return;
        }
        
        const currentSet = this.state.coolPlacesHistory[this.state.currentCoolIndex] || [];
        currentSet.forEach(place => {
            container.innerHTML += `
                <div class='UserPlace'>
                    <a onclick="app.sound('splat.mp3')" href='${place.url}' target='_blank'>
                        <img src='data/main/loading.webp' data-place-id="${place.id}" alt="${place.name}" title='${place.name}'><br>
                    </a>
                </div>
            `;
        });
        
        this.loadCoolThumbnails(currentSet);
    }

    async loadCoolThumbnails(places) {
        for (let i = 0; i < places.length; i += this.BATCH_SIZE) {
            const batch = places.slice(i, i + this.BATCH_SIZE);
            const validPlaces = batch.filter(place => place.id && place.id.length >= 7);
            const placeIds = validPlaces.map(place => place.id);
            
            validPlaces.forEach(place => {
                const img = document.querySelector(`.UserPlace img[data-place-id="${place.id}"]`);
                if (img) img.src = 'data/main/loading.webp';
            });
            
            if (placeIds.length === 0) continue;
            
            try {
                const thumbnails = await this.getBatchThumbnailUrls(placeIds, 128);
                validPlaces.forEach(place => {
                    const img = document.querySelector(`.UserPlace img[data-place-id="${place.id}"]`);
                    if (img) {
                        img.src = thumbnails[place.id] || 'data/main/NewFrontPageGuy.png';
                    }
                });
            } catch (error) {
                console.error('Cool thumbnail batch error:', error);
                validPlaces.forEach(place => {
                    const img = document.querySelector(`.UserPlace img[data-place-id="${place.id}"]`);
                    if (img) img.src = 'data/main/NewFrontPageGuy.png';
                });
            }
        }
    }

    generateRandomPlaces() {
        const savedPlaces = this.storageGet('places', []);
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

    nextCoolSet() {
        const savedPlaces = this.storageGet('places', []);
        if (savedPlaces.length === 0) return;
        
        const newSet = this.generateRandomPlaces();
        this.state.coolPlacesHistory = this.state.coolPlacesHistory.slice(0, this.state.currentCoolIndex + 1);
        this.state.coolPlacesHistory.push(newSet);
        this.state.currentCoolIndex = this.state.coolPlacesHistory.length - 1;
        
        this.updateCoolPlaces();
        this.updateCoolNavigation();
        this.sound("click.mp3");
    }

    prevCoolSet() {
        if (this.state.currentCoolIndex > 0) {
            this.state.currentCoolIndex--;
            this.updateCoolPlaces();
            this.updateCoolNavigation();
        }
        this.sound("click.mp3");
    }

    updateCoolNavigation() {
        const prevBtn = document.getElementById('prevCoolBtn');
        const nextBtn = document.getElementById('nextCoolBtn');
        
        if (prevBtn) prevBtn.disabled = this.state.currentCoolIndex <= 0;
        if (nextBtn) nextBtn.disabled = false;
    }

    // ==================== IMPORT/EXPORT ====================
    downloadData() {
        const savedPlaces = this.storageGet('places', []);
        const categories = this.storageGet('categories', ['All', 'None']);
        
        const exportData = {
            version: 1,
            categories: categories,
            places: savedPlaces
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = 'saved.json';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        this.sound("click.mp3");
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                let importedPlaces = [];
                let importedCategories = null;
                
                if (importedData.places && importedData.categories) {
                    importedPlaces = importedData.places;
                    importedCategories = importedData.categories;
                } else if (Array.isArray(importedData)) {
                    importedPlaces = importedData;
                } else {
                    throw new Error("Invalid file format");
                }
                
                if (!Array.isArray(importedPlaces)) {
                    alert("Error: no data");
                    return;
                }
                
                this.importPlaces(importedPlaces, importedCategories);
            } catch (error) {
                console.error("Import Error:", error);
                alert(`Import Error: ${error.message}\nCheck file format`);
            }
        };
        reader.readAsText(file);
        this.sound("victory.mp3");
        this.startConfetti();
    }

    importPlaces(importedPlaces, importedCategories) {
        const savedPlaces = this.storageGet('places', []);
        let duplicates = 0;
        let imported = 0;
        let invalid = 0;
        
        // Import categories
        if (importedCategories && importedCategories.length > 0) {
            const currentCategories = this.storageGet('categories') || ['All', 'None'];
            const newCategories = importedCategories.filter(cat => 
                cat !== 'All' && cat !== 'None' && !currentCategories.includes(cat)
            );
            
            if (newCategories.length > 0) {
                this.state.categories = [...currentCategories, ...newCategories];
                this.storageSet('categories', this.state.categories);
                this.populateCategoryDropdowns();
            }
        }
        
        // Import places
        importedPlaces.forEach(place => {
            if (!place.url || !place.name) {
                invalid++;
                return;
            }
            
            const id = place.id || this.extractPlaceId(place.url);
            const normalizedUrl = place.normalizedUrl || this.normalizeRobloxUrl(place.url);
            
            const isDuplicate = savedPlaces.some(savedPlace => {
                return (id && savedPlace.id === id) || 
                       savedPlace.normalizedUrl === normalizedUrl || 
                       this.normalizeRobloxUrl(savedPlace.url) === normalizedUrl;
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
                        day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                    }).replace(',', '')
                };
                savedPlaces.push(completePlace);
                imported++;
            }
        });
        
        this.storageSet('places', savedPlaces);
        this.state.currentPage = Math.floor(savedPlaces.length / this.state.itemsPerPage);
        this.renderPlaces();
        
        alert(`Success import: ${imported}\nDuplicates: ${duplicates}\nInvalid: ${importedPlaces.length - imported - duplicates}`);
    }

    loadDefaultList() {
        fetch('My_Fav_List.json')
            .then(response => {
                if (!response.ok) throw new Error('File not found');
                return response.json();
            })
            .then(importedPlaces => {
                if (!Array.isArray(importedPlaces)) {
                    alert("Error: Invalid data format");
                    return;
                }
                this.importPlaces(importedPlaces);
                this.nextCoolSet();
                alert("Successfully imported default list!");
                this.sound("victory.mp3");
            })
            .catch(error => {
                alert(`Error loading default list: ${error.message}\nMake sure My_Fav_List.json is in the same directory`);
                console.error("Load error:", error);
                this.sound("ouch.mp3");
            });
    }

    // ==================== MUSIC PLAYER ====================
    loadTrack() {
        const trackPath = encodeURI(this.state.playlist[this.state.currentTrack]);
        console.log('Loading:', trackPath);
        
        this.state.player.src = trackPath;
        this.state.player.preload = "metadata";
        this.state.player.load();
        
        const trackName = this.state.playlist[this.state.currentTrack].split('/').pop().replace(/\.(mp3|wav)$/, '');
        const trackNameEl = document.getElementById('track-name');
        if (trackNameEl) trackNameEl.textContent = trackName;
        
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = '0%';
    }

    togglePlay() {
        this.state.userInteracted = true;
        
        if (!this.state.player.src) this.loadTrack();
        
        if (this.state.playing) {
            this.state.player.pause();
            document.getElementById('play-btn').textContent = "▶";
            this.state.playing = false;
        } else {
            this.playAudio();
        }
    }

    playAudio() {
        this.state.player.play().then(() => {
            document.getElementById('play-btn').textContent = "⏸";
            this.state.playing = true;
        }).catch(e => {
            this.setErrorMessage("Play error: " + e.message);
            document.getElementById('play-btn').textContent = "▶";
            this.state.playing = false;
        });
    }

    nextTrack() {
        this.state.userInteracted = true;
        this.state.currentTrack = (this.state.currentTrack + 1) % this.state.playlist.length;
        this.loadTrack();
        if (this.state.playing) this.playAudio();
    }

    previousTrack() {
        this.state.userInteracted = true;
        this.state.currentTrack = (this.state.currentTrack - 1 + this.state.playlist.length) % this.state.playlist.length;
        this.loadTrack();
        if (this.state.playing) this.playAudio();
    }

    updateProgress() {
        if (this.state.isSeeking || !this.state.playing || !this.state.player.duration) return;
        
        const progress = (this.state.player.currentTime / this.state.player.duration) * 100;
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = `${progress}%`;
    }

    handleSeek(e) {
        if (!this.state.player.duration || isNaN(this.state.player.duration)) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = percent * this.state.player.duration;
        
        this.state.isSeeking = true;
        document.getElementById('progress-bar').style.width = `${percent * 100}%`;
        this.state.player.currentTime = newTime;
    }

    // ==================== SPECIAL EFFECTS ====================
    startConfetti() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
        
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 4 - 2,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 5 - 2.5
            });
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
                
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;
                
                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
        setTimeout(() => canvas.remove(), 2500);
    }

    ExtraClearStorage() {
        const itemsCount = localStorage.length;
        localStorage.clear();
        alert(`Deleted: ${itemsCount}`);
    }
}

// Initialize the application
const app = new RoWebApp();

// Global functions for HTML onclick handlers
function sound(name) { return app.sound(name); }
function ExtraClearStorage() { return app.ExtraClearStorage(); }
function switchdiv(hideId, showId, displayType) { return app.switchdiv(hideId, showId, displayType); }
function switchSection(sectionId) { return app.switchSection(sectionId); }
function saveCategory() { return app.saveCategory(); }
function manageCategories() { return app.manageCategories(); }
function closeCategories() { return app.closeCategories(); }
function deleteCategory(category) { return app.deleteCategory(category); }
function savePlace() { return app.savePlace(); }
function downloadData() { return app.downloadData(); }
function toggleEditMode() { return app.toggleEditMode(); }
function deletePlace(index) { return app.deletePlace(index); }
function startEditPlace(index) { return app.startEditPlace(index); }
function saveEditedPlace(index) { return app.saveEditedPlace(index); }
function clearForm() { return app.clearForm(); }
function loadDefaultList() { return app.loadDefaultList(); }
function changePage(newPage) { return app.changePage(newPage); }
function clearAllPlaces() { return app.clearAllPlaces(); }

// Legacy functions for compatibility
function initPage() {
    document.querySelectorAll('.content-section').forEach((section, index) => {
        if (index !== 0) section.style.display = 'none';
    });
}

function extractPlaceId(url) { return app.extractPlaceId(url); }
function normalizeRobloxUrl(url) { return app.normalizeRobloxUrl(url); }