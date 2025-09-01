import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

function setupGlobalLightbox() {
    if (document.getElementById('global-image-lightbox')) return;
    const lightboxId = 'global-image-lightbox';
    const lightboxHTML = `
        <div id="${lightboxId}" class="lightbox-overlay">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
            <div class="lightbox-content">
                <img src="" alt="Preview" style="display: none;">
                <pre class="lightbox-text" style="display: none;"></pre>
            </div>
        </div>
    `;
    const lightboxCSS = `
        #${lightboxId} { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.85); display: none; align-items: center; justify-content: center; z-index: 10000; box-sizing: border-box; -webkit-user-select: none; user-select: none; }
        #${lightboxId} .lightbox-content { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        #${lightboxId} img { max-width: 95%; max-height: 95%; object-fit: contain; transition: transform 0.1s ease-out; transform: scale(1) translate(0, 0); }
        #${lightboxId} .lightbox-text { max-width: 95%; max-height: 95%; overflow: auto; background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
        #${lightboxId} img { cursor: grab; }
        #${lightboxId} img.panning { cursor: grabbing; }
        #${lightboxId} .lightbox-close { position: absolute; top: 15px; right: 20px; width: 35px; height: 35px; background-color: rgba(0,0,0,0.5); color: #fff; border-radius: 50%; border: 2px solid #fff; font-size: 24px; line-height: 30px; text-align: center; cursor: pointer; z-index: 10002; }
        #${lightboxId} .lightbox-prev, #${lightboxId} .lightbox-next { position: absolute; top: 50%; transform: translateY(-50%); width: 45px; height: 60px; background-color: rgba(0,0,0,0.4); color: #fff; border: none; font-size: 30px; cursor: pointer; z-index: 10001; transition: background-color 0.2s; }
        #${lightboxId} .lightbox-prev:hover, #${lightboxId} .lightbox-next:hover { background-color: rgba(0,0,0,0.7); }
        #${lightboxId} .lightbox-prev { left: 15px; }
        #${lightboxId} .lightbox-next { right: 15px; }
        #${lightboxId} [disabled] { display: none; }
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    const styleEl = document.createElement('style');
    styleEl.textContent = lightboxCSS;
    document.head.appendChild(styleEl);
}

setupGlobalLightbox();

app.registerExtension({
    name: "Comfy.LocalFileGallery",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "LocalFileGallery") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);
                const galleryContainer = document.createElement("div");
                const uniqueId = `local-gallery-${Math.random().toString(36).substring(2, 9)}`;
                galleryContainer.id = uniqueId;
                const folderSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M928 320H488L416 232c-15.1-18.9-38.3-29.9-63.1-29.9H128c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h800c35.3 0 64-28.7 64-64V384c0-35.3-28.7-64-64-64z" fill="#F4D03F"></path></svg>`;
                galleryContainer.innerHTML = `
                    <style>
                        #${uniqueId} .local-gallery-container-wrapper { width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e8e8e8; box-sizing: border-box; display: flex; flex-direction: column; height: 100%; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
                        #${uniqueId} .local-gallery-controls { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 10px; align-items: center; flex-shrink: 0; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; backdrop-filter: blur(10px); }
                        #${uniqueId} .local-gallery-controls label { margin-left: 0px; font-size: 12px; white-space: nowrap; color: #f0f0f0; font-weight: 500; }
                        #${uniqueId} .local-gallery-controls input, #${uniqueId} .local-gallery-controls select { background: linear-gradient(145deg, #2a2a3e, #1e1e32); color: #e8e8e8; border: 1px solid #4a5568; border-radius: 6px; padding: 6px 10px; font-size: 12px; transition: all 0.3s ease; }
                        #${uniqueId} .local-gallery-controls input:focus, #${uniqueId} .local-gallery-controls select:focus { outline: none; border-color: #4299e1; box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1); }
                        #${uniqueId} .local-gallery-controls input[type=text] { flex-grow: 1; min-width: 150px;}
                        #${uniqueId} .local-gallery-controls button { cursor: pointer; font-weight: 500; transition: all 0.3s ease; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; }
                        #${uniqueId} .up-button { background: linear-gradient(145deg, #667eea, #764ba2); color: white; }
                        #${uniqueId} .up-button:hover { background: linear-gradient(145deg, #5a6fd8, #6a4190); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
                        #${uniqueId} .folder-selector-button { background: linear-gradient(145deg, #f093fb, #f5576c); color: white; }
                        #${uniqueId} .folder-selector-button:hover { background: linear-gradient(145deg, #e081e9, #e3455a); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4); }
                        #${uniqueId} .local-gallery-controls button:disabled { background: linear-gradient(145deg, #4a5568, #2d3748); color: #a0aec0; cursor: not-allowed; transform: none; box-shadow: none; }
                        #${uniqueId} .path-navigation { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; padding: 8px 12px; background: rgba(255, 255, 255, 0.03); border-radius: 6px; }
                        #${uniqueId} .path-segment { background: linear-gradient(145deg, #4299e1, #3182ce); color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; border: none; font-weight: 500; transition: all 0.3s ease; }
                        #${uniqueId} .path-segment:hover { background: linear-gradient(145deg, #3182ce, #2c5aa0); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3); }
                        #${uniqueId} .path-separator { color: #a0aec0; font-size: 14px; font-weight: bold; }
                        #${uniqueId} .image-cardholder { position: relative; overflow-y: auto; background: linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 50%, rgba(15, 52, 96, 0.8) 100%); padding: 12px; border-radius: 12px; flex-grow: 1; min-height: 100px; width: 100%; transition: opacity 0.2s ease-in-out; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
                        #${uniqueId} .gallery-card { position: absolute; border: 3px solid transparent; border-radius: 12px; box-sizing: border-box; transition: all 0.3s ease; cursor: pointer; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(5px); }
                        #${uniqueId} .gallery-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); border-color: rgba(255, 255, 255, 0.2); }
                        #${uniqueId} .gallery-card.selected { border: 3px solid; border-image: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57) 1; box-shadow: 0 0 20px rgba(255, 107, 107, 0.5); }
                        #${uniqueId} .info-overlay { position: absolute; bottom: 8px; left: 8px; right: 8px; background-color: rgba(0, 0, 0, 0.5); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 11px; line-height: 1.3; box-sizing: border-box; z-index: 100; pointer-events: none; backdrop-filter: blur(2px); }
                        #${uniqueId} .info-overlay .info-title { font-weight: bold; margin-bottom: 4px; word-break: break-all; }
                        #${uniqueId} .info-overlay .info-details { opacity: 0.9; }
                        #${uniqueId} .gallery-card img { width: 100%; height: auto; border-radius: 5px; display: block; }
                        #${uniqueId} .gallery-card *:hover { filter: brightness(1.2); }
                        #${uniqueId} .dir-card { background: linear-gradient(145deg, #4a5568, #2d3748); padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); }
                        #${uniqueId} .dir-card:hover { background: linear-gradient(145deg, #5a6578, #3d4758); }
                        #${uniqueId} .dir-card .dir-icon { width: 60%; height: 60%; margin-bottom: 8px; }
                        #${uniqueId} .dir-card .dir-name { font-size: 12px; word-break: break-all; user-select: none; }
                        #${uniqueId} .text-card { background: linear-gradient(145deg, #667eea, #764ba2); padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 180px; height: 300px; border: 1px solid rgba(255, 255, 255, 0.2); }
                        #${uniqueId} .text-card:hover { background: linear-gradient(145deg, #5a6fd8, #6a4190); }
                        #${uniqueId} .text-card .text-icon { width: 60%; height: 60%; margin-bottom: 8px; font-size: 48px; display: flex; align-items: center; justify-content: center; }
                        #${uniqueId} .text-card .text-name { font-size: 12px; word-break: break-all; user-select: none; }
                        #${uniqueId} .image-cardholder::-webkit-scrollbar { width: 8px; }
                        #${uniqueId} .image-cardholder::-webkit-scrollbar-track { background: #2a2a2a; border-radius: 4px; }
                        #${uniqueId} .image-cardholder::-webkit-scrollbar-thumb { background-color: #555; border-radius: 4px; }
                    </style>
                    <div class="local-gallery-container-wrapper">
                         <div class="local-gallery-controls">
                            <label>Path:</label>
                            <input type="text" placeholder="Enter full path to media folder"> 
                            <button class="up-button" title="Return to the previous directory" disabled>⬆️Up</button>
                            <button class="folder-selector-button" title="Browse folders">📁Browse</button>
                        </div>
                        <div class="path-navigation"></div>
                        <div class="local-gallery-controls" style="gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 2px;"><label>Display Mode:</label> <select class="display-mode"> <option value="manual">Manual</option> <option value="auto">Auto Scan</option> </select></div>
                            <div style="display: flex; align-items: center; gap: 2px;"><label>Sort by:</label> <select class="sort-by"> <option value="name">Name</option> <option value="date">Date</option> </select></div>
                            <div style="display: flex; align-items: center; gap: 2px;"><label>Order:</label> <select class="sort-order"> <option value="asc">Ascending</option> <option value="desc">Descending</option> </select></div>
                            <div style="margin-left: auto; display: flex; align-items: center; gap: 5px;">
                <label>Show:</label>
                <input type="checkbox" class="show-images" checked><label>🖼️Images</label>
                <input type="checkbox" class="show-text"><label>📄Text</label>
                            </div>
                        </div>
                        <div class="image-cardholder"><p>Enter folder path to view media files.</p></div>
                    </div>
                `;
                this.addDOMWidget("local_file_gallery", "div", galleryContainer, {});
                this.size = [800, 670];
                const cardholder = galleryContainer.querySelector(".image-cardholder");
                const controls = galleryContainer.querySelector(".local-gallery-container-wrapper");
                const pathInput = controls.querySelector("input[type='text']");
                const upButton = controls.querySelector(".up-button");
                const displayModeSelect = controls.querySelector(".display-mode");
                const showTextCheckbox = controls.querySelector(".show-text");
                const showImagesCheckbox = controls.querySelector(".show-images");
                const pathNavigation = controls.querySelector(".path-navigation");
                const folderSelectorButton = controls.querySelector(".folder-selector-button");
                let isLoading = false, currentPage = 1, totalPages = 1, parentDir = null;
                const debounce = (func, delay) => { let timeoutId; return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); }; };
                const updatePathNavigation = async (path) => {
                    if (!path) {
                        pathNavigation.innerHTML = '';
                        return;
                    }
                    try {
                        const response = await api.fetchApi(`/local_file_gallery/get_path_segments?path=${encodeURIComponent(path)}`);
                        const data = await response.json();
                        if (data.segments) {
                            pathNavigation.innerHTML = '';
                            data.segments.forEach((segment, index) => {
                                if (index > 0) {
                                    const separator = document.createElement('span');
                                    separator.className = 'path-separator';
                                    separator.textContent = '>';
                                    pathNavigation.appendChild(separator);
                                }
                                const segmentEl = document.createElement('span');
                                segmentEl.className = 'path-segment';
                                segmentEl.textContent = segment.name;
                                segmentEl.title = segment.path;
                                segmentEl.addEventListener('click', () => {
                                    pathInput.value = segment.path;
                                    fetchImages(1, false);
                                });
                                pathNavigation.appendChild(segmentEl);
                            });
                        }
                    } catch (error) {
                        console.error('Error updating path navigation:', error);
                    }
                };
                const applyMasonryLayout = () => {
                    const minCardWidth = 150, gap = 5, containerWidth = cardholder.clientWidth;
                    if (containerWidth === 0) return;
                    const columnCount = Math.max(1, Math.floor(containerWidth / (minCardWidth + gap)));
                    const totalGapSpace = (columnCount - 1) * gap;
                    const actualCardWidth = (containerWidth - totalGapSpace) / columnCount;
                    const columnHeights = new Array(columnCount).fill(0);
                    const cards = cardholder.querySelectorAll(".gallery-card");
                    cards.forEach(card => {
                        card.style.width = `${actualCardWidth}px`;
                        if (card.classList.contains('dir-card')) {
                            card.style.height = `${actualCardWidth * 0.9}px`;
                        }
                        const minHeight = Math.min(...columnHeights);
                        const columnIndex = columnHeights.indexOf(minHeight);
                        card.style.left = `${columnIndex * (actualCardWidth + gap)}px`;
                        card.style.top = `${minHeight}px`;
                        columnHeights[columnIndex] += card.offsetHeight + gap;
                    });
                    const newHeight = Math.max(...columnHeights);
                    if (newHeight > 0) cardholder.style.height = `${newHeight}px`;
                };
                const debouncedLayout = debounce(applyMasonryLayout, 20);
                new ResizeObserver(debouncedLayout).observe(cardholder);
                const fetchImages = async (page = 1, append = false) => {
                    if (isLoading) return; 
                    isLoading = true;
                    if (!append) {
                        cardholder.style.opacity = 0;
                        await new Promise(resolve => setTimeout(resolve, 200));
                        cardholder.innerHTML = "<p>Loading...</p>";
                        currentPage = 1;
                    }
                    const directory = pathInput.value;
                    const showText = showTextCheckbox.checked;
                    const showImages = showImagesCheckbox.checked;
                    const displayMode = displayModeSelect.value;
                    if (!directory) { 
                        try {
                            const response = await api.fetchApi('/local_file_gallery/get_folder_tree');
                            const data = await response.json();
                            cardholder.innerHTML = "";
                            if (data.folders && data.folders.length > 0) {
                                data.folders.forEach(folder => {
                                    const card = document.createElement("div");
                                    card.className = "gallery-card dir-card";
                                    card.dataset.type = "dir";
                                    card.dataset.path = folder.path;
                                    card.innerHTML = `<div class="dir-icon">${folderSVG}</div><div class="dir-name">${folder.name}</div>`;
                                    cardholder.appendChild(card);
                                });
                            } else {
                                cardholder.innerHTML = "<p>No accessible drives found.</p>";
                            }
                            updatePathNavigation('');
                            upButton.disabled = true;
                            applyMasonryLayout();
                            cardholder.style.opacity = 1;
                            isLoading = false;
                            return;
                        } catch (error) {
                            console.error('Error loading root directories:', error);
                            cardholder.innerHTML = "<p>Enter folder path to view media files.</p>"; 
                            cardholder.style.opacity = 1;
                            isLoading = false; 
                            return;
                        }
                    }
                    const sortBy = controls.querySelector(".sort-by").value;
                    const sortOrder = controls.querySelector(".sort-order").value;
                    let url = `/local_file_gallery/images?directory=${encodeURIComponent(directory)}&page=${page}&sort_by=${sortBy}&sort_order=${sortOrder}&show_text=${showText}&show_images=${showImages}&display_mode=${displayMode}`;
                    try {
                        const response = await api.fetchApi(url);
                        if (!response.ok) { const errorData = await response.json(); throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`); }
                        const api_data = await response.json();
                        const items = api_data.items || [];
                        if (!append) cardholder.innerHTML = "";
                        totalPages = api_data.total_pages; parentDir = api_data.parent_directory;
                        pathInput.value = api_data.current_directory; 
                const isDriveRoot = /^[A-Za-z]:(\\)?$/.test(api_data.current_directory);
                upButton.disabled = !parentDir && !isDriveRoot;
                        updatePathNavigation(api_data.current_directory);
                        items.forEach(item => {
                            const card = document.createElement("div");
                            card.className = "gallery-card";
                            card.dataset.path = item.path;
                            card.dataset.type = item.type;
                            card.title = item.name;
                            if (item.type === 'dir') {
                                card.classList.add("dir-card");
                                card.innerHTML = `<div class="dir-icon">${folderSVG}</div><div class="dir-name">${item.name}</div>`;
                            } else if (item.type === 'image') {
                                const img = document.createElement("img");
                                img.src = `/local_file_gallery/thumbnail?filepath=${encodeURIComponent(item.path)}`;
                                img.loading = "lazy";
                                img.onload = debouncedLayout;
                                card.appendChild(img);
                            } else if (item.type === 'text') {
                                card.classList.add("text-card");
                                const textIconSVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M192 128h640c35.3 0 64 28.7 64 64v640c0 35.3-28.7 64-64 64H192c-35.3 0-64-28.7-64-64V192c0-35.3 28.7-64 64-64z" fill="#FFD700" stroke="#FFA500" stroke-width="8"/><path d="M128 256h768v32H128z" fill="#FFA500"/><path d="M128 320h768v32H128z" fill="#FFA500"/><path d="M128 384h768v32H128z" fill="#FFA500"/><path d="M128 448h768v32H128z" fill="#FFA500"/><path d="M128 512h768v32H128z" fill="#FFA500"/><path d="M128 576h768v32H128z" fill="#FFA500"/><path d="M128 640h768v32H128z" fill="#FFA500"/><path d="M128 704h768v32H128z" fill="#FFA500"/><circle cx="96" cy="192" r="16" fill="#FF6B6B"/><circle cx="96" cy="256" r="16" fill="#FF6B6B"/><circle cx="96" cy="320" r="16" fill="#FF6B6B"/></svg>`;
                                card.innerHTML = `<div class="text-icon">${textIconSVG}</div><div class="text-name">${item.name}</div>`;
                            }
                            cardholder.appendChild(card);
                        });
                        if (items.length === 0 && !append) cardholder.innerHTML = "<p>The folder is empty.</p>";
                        requestAnimationFrame(debouncedLayout); 
                        currentPage = page;
                    } catch (error) { 
                        cardholder.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`; 
                    } 
                    finally { 
                        isLoading = false; 
                        if (!append) cardholder.style.opacity = 1;
                    }
                };
                cardholder.addEventListener('click', async (event) => {
                    const card = event.target.closest('.gallery-card');
                    if (!card) return;
                    const type = card.dataset.type, path = card.dataset.path;
                    if (type === 'dir') {
                        pathInput.value = path; fetchImages(1, false);
                    } else if (['image', 'text'].includes(type)) {
                        const currentlySelected = cardholder.querySelector('.selected');
                        if (currentlySelected) {
                            currentlySelected.classList.remove('selected');
                        }
                        card.classList.add('selected');
                        try { 
                            const response = await fetch("/local_file_gallery/set_image_path", { 
                                method: "POST", 
                                headers: { "Content-Type": "application/json" }, 
                                body: JSON.stringify({ path: path, type: type }), 
                            });
                        } catch(e) { console.error("An error occurred while sending data to the backend:", e); }
                    }
                });
                cardholder.addEventListener('mouseenter', async (event) => {
                    const card = event.target.closest('.gallery-card');
                    if (!card || !['image', 'text'].includes(card.dataset.type)) return;
                    const existingOverlay = card.querySelector('.info-overlay');
                    if (existingOverlay) {
                        existingOverlay.remove();
                    }
                    const type = card.dataset.type, path = card.dataset.path;
                    const fileName = path.split(/[/\\]/).pop();
                    const infoOverlay = document.createElement('div');
                    infoOverlay.className = 'info-overlay';
                    let infoContent = `<div class="info-title">${fileName}</div>`;
                    infoContent += `<div class="info-details">Type: ${type}</div>`;
                    if (type === 'image') {
                        try {
                            const response = await fetch(`/local_file_gallery/image_info?path=${encodeURIComponent(path)}`);
                            if (response.ok) {
                                const imageInfo = await response.json();
                                infoContent += `<div class="info-details">Size: ${imageInfo.width} × ${imageInfo.height}</div>`;
                                infoContent += `<div class="info-details">Color: ${imageInfo.color_type}</div>`;
                            } else {
                                const existingImg = card.querySelector('img');
                                if (existingImg && existingImg.naturalWidth > 0) {
                                    infoContent += `<div class="info-details">Size: ${existingImg.naturalWidth} × ${existingImg.naturalHeight}</div>`;
                                }
                            }
                        } catch (error) {
                            console.error('Failed to get image info:', error);
                            const existingImg = card.querySelector('img');
                            if (existingImg && existingImg.naturalWidth > 0) {
                                infoContent += `<div class="info-details">Size: ${existingImg.naturalWidth} × ${existingImg.naturalHeight}</div>`;
                            }
                        }
                    } else if (type === 'text') {
                        infoContent += `<div class="info-details">Text File</div>`;
                    }
                    infoOverlay.innerHTML = infoContent;
                    card.appendChild(infoOverlay);
                }, true);
                cardholder.addEventListener('mouseleave', (event) => {
                    const card = event.target.closest('.gallery-card');
                    if (!card) return;
                    const infoOverlay = card.querySelector('.info-overlay');
                    if (infoOverlay) {
                        infoOverlay.remove();
                    }
                }, true);
                const lightbox = document.getElementById('global-image-lightbox');
                const lightboxImg = lightbox.querySelector("img");
                const lightboxText = lightbox.querySelector(".lightbox-text");
                const prevButton = lightbox.querySelector(".lightbox-prev");
                const nextButton = lightbox.querySelector(".lightbox-next");
                let scale = 1, panning = false, pointX = 0, pointY = 0, start = { x: 0, y: 0 };
                let currentMediaList = [];
                let currentMediaIndex = -1;
                function setTransform() { lightboxImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`; }
                function resetLightboxState() { scale = 1; pointX = 0; pointY = 0; setTransform(); }
                function showMediaAtIndex(index) {
                    if (index < 0 || index >= currentMediaList.length) return;
                    currentMediaIndex = index;
                    const media = currentMediaList[index];
                    resetLightboxState();
                    lightboxImg.style.display = 'none';
                    lightboxText.style.display = 'none';
                    if (media.type === 'image') {
                        lightboxImg.style.display = 'block';
                        lightboxImg.src = `/local_file_gallery/view?filepath=${encodeURIComponent(media.path)}`;
                    } else if (media.type === 'text') {
                        lightboxText.style.display = 'block';
                        fetch(`/local_file_gallery/view?filepath=${encodeURIComponent(media.path)}`)
                            .then(response => response.text())
                            .then(text => {
                                lightboxText.textContent = text;
                            })
                            .catch(error => {
                                lightboxText.textContent = 'Error loading text file: ' + error.message;
                            });
                    }
                    prevButton.disabled = currentMediaIndex === 0;
                    nextButton.disabled = currentMediaIndex === currentMediaList.length - 1;
                }
                prevButton.addEventListener('click', () => showMediaAtIndex(currentMediaIndex - 1));
                nextButton.addEventListener('click', () => showMediaAtIndex(currentMediaIndex + 1));
                lightboxImg.addEventListener('mousedown', (e) => { e.preventDefault(); panning = true; lightboxImg.classList.add('panning'); start = { x: e.clientX - pointX, y: e.clientY - pointY }; });
                window.addEventListener('mouseup', () => { panning = false; lightboxImg.classList.remove('panning'); });
                window.addEventListener('mousemove', (e) => { if (!panning) return; e.preventDefault(); pointX = e.clientX - start.x; pointY = e.clientY - start.y; setTransform(); });
                lightbox.addEventListener('wheel', (e) => {
                    if (lightboxImg.style.display !== 'block') return;
                    e.preventDefault(); const rect = lightboxImg.getBoundingClientRect(); const delta = -e.deltaY; const oldScale = scale; scale *= (delta > 0 ? 1.1 : 1 / 1.1); scale = Math.max(0.2, scale); pointX = (1 - scale / oldScale) * (e.clientX - rect.left) + pointX; pointY = (1 - scale / oldScale) * (e.clientY - rect.top) + pointY; setTransform(); 
                });
                cardholder.addEventListener('dblclick', (event) => {
                    const card = event.target.closest('.gallery-card');
                    if (!card || !['image', 'text'].includes(card.dataset.type)) return;
                    event.preventDefault(); event.stopPropagation();
                    const allMediaCards = Array.from(cardholder.querySelectorAll(".gallery-card[data-type='image'], .gallery-card[data-type='text']"));
                    currentMediaList = allMediaCards.map(c => ({ path: c.dataset.path, type: c.dataset.type }));
                    const clickedPath = card.dataset.path;
                    const startIndex = currentMediaList.findIndex(item => item.path === clickedPath);
                    if (startIndex !== -1) {
                        lightbox.style.display = 'flex';
                        showMediaAtIndex(startIndex);
                    }
                });
                const closeLightbox = () => { 
                    lightbox.style.display = 'none'; 
                    lightboxImg.src = ""; 
                    lightboxText.textContent = "";
                };
                lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
                lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
                window.addEventListener('keydown', (e) => {
                    if (lightbox.style.display !== 'flex') return;
                    if (e.key === 'ArrowLeft') { e.preventDefault(); prevButton.click(); } 
                    else if (e.key === 'ArrowRight') { e.preventDefault(); nextButton.click(); } 
                    else if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
                });
                const resetAndReload = () => { fetchImages(1, false); };
                pathInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') resetAndReload(); });
                controls.querySelectorAll('select').forEach(select => { select.addEventListener('change', resetAndReload); });
                [showTextCheckbox, showImagesCheckbox].forEach(checkbox => {
                    checkbox.addEventListener('change', resetAndReload);
                });
                upButton.onclick = () => { 
                    if(parentDir){ 
                        pathInput.value = parentDir; 
                        resetAndReload(); 
                    } else {
                        const currentPath = pathInput.value.trim();
                        const isDriveRoot = /^[A-Za-z]:(\\)?$/.test(currentPath);
                        if(isDriveRoot) {
                            pathInput.value = '';
                            resetAndReload();
                        }
                    }
                };
                cardholder.onscroll = () => { if (cardholder.scrollTop + cardholder.clientHeight >= cardholder.scrollHeight - 300 && !isLoading && currentPage < totalPages) { fetchImages(currentPage + 1, true); } };
                folderSelectorButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const currentPath = pathInput.value.trim();
                    if (currentPath === '') {
                        pathInput.value = '';
                        fetchImages(1, false);
                    } else {
                        fetchImages(1, false);
                    }
                });
                pathInput.addEventListener('input', debounce(() => {
                    updatePathNavigation(pathInput.value);
                }, 500));
                return r;
            };
        }
    },
});