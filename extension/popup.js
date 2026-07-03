document.addEventListener('DOMContentLoaded', () => {
  const bookmarksList = document.getElementById('bookmarksList');
  const addBookmarkBtn = document.getElementById('addBookmark');
  const createFolderBtn = document.getElementById('createFolder');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const upButton = document.getElementById('upButton');
  const header = document.querySelector('header');
  const moveModal = document.getElementById('moveModal');
  const editModal = document.getElementById('editModal');
  const folderList = document.getElementById('folderList');
  const closeMoveModalBtn = document.getElementById('closeMoveModal');
  const moveBtn = document.getElementById('moveBtn');
  const folderSearchInput = document.getElementById('folderSearchInput');
  const createFolderModal = document.getElementById('createFolderModal');
  const closeCreateFolderModalBtn = document.getElementById('closeCreateFolderModal');
  const createFolderInModalBtn = document.getElementById('createFolderInModalBtn');
  const newFolderNameInput = document.getElementById('newFolderNameInput');
  const closeEditModalBtn = document.getElementById('cancelEditBtn');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const editTitleInput = document.getElementById('editTitleInput');
  const editUrlInput = document.getElementById('editUrlInput');
  const viewToggleBtn = document.getElementById('viewToggleBtn');
  const viewToggleIcon = document.getElementById('viewToggleIcon');
  const isMobile = matchMedia('(hover: none) and (pointer: coarse)').matches;
  let currentBookmarkId = null;
  let allItems = [];
  let currentFolderId = '1';
  let folderStack = ['1'];
  let activeMenu = null;
  let activeBookmarkButtons = null;
  let itemToMoveId = null;
  let selectedFolderId = null;
  let itemToEditId = null;
  let newFolderParentId = null;
  let newFolderIndex = null;
  let openAllModal = document.getElementById('openAllModal');
  let isGridView = false;
  let isFolderStackMode = false;
  let keyboardSelectedIndex = -1;
  let scrollToTopBtn = document.getElementById('scrollToTop');
  
  let pinnedBookmarks = new Set();
  let allBookmarksCache = null;   
  let searchRenderToken = 0;      
  let searchDebounceTimer = null; 
  let trashSearchDebounceTimer = null; 
  const contextMenuOverlay = document.getElementById('contextMenuOverlay');
  
  const ICONS = {
    plus: (size = 18) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>`,
    close: (size = 18) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>`,
    openExternal: (size = 16) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg>`,
    dragHandle: (accent = false) => `<svg class="ctx-drag-handle"${accent ? ' style="color: var(--accent);"' : ''} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /></svg>`,
    folder: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-folder"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" /></svg>`,
    folderLarge: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" /></svg>`,
    folderAdd: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v4" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
    menu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>`,
    question: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 8a3.5 3.5 0 0 1 3.5 -3h1a3.5 3.5 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4" /><path d="M12 19l0 .01" /></svg>`,
    move: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 4l3 3l-3 3" /><path d="M18 7h-14l3 3" /><path d="M7 20l-3 -3l3 -3" /><path d="M7 17h14l-3 -3" /></svg>`,
    moveToFolder: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 21v-4a3 3 0 0 1 3 -3h5" /><path d="M9 17l3 -3l-3 -3" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 11v-6a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-9.5" /></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`,
    libraryPlus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-library-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 5.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" /><path d="M4.012 7.26a2.005 2.005 0 0 0 -1.012 1.737v10c0 1.1 .9 2 2 2h10c.75 0 1.158 -.385 1.5 -1" /><path d="M11 10h6" /><path d="M14 7v6" /></svg>`,
    libraryPlusSmall: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>`,
    restore: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/></svg>`,
    deleteForever: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></svg>`,
    pin: (size = 16) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h6l-.5 6.5l2.5 4v1.5h-10v-1.5l2.5 -4z"/><path d="M12 16l0 5"/></svg>`,
    pinFilled: (size = 16) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h6l-.5 6.5l2.5 4v1.5h-10v-1.5l2.5 -4z"/><path d="M12 16l0 5" fill="none"/></svg>`,
  };

  let isSelectionMode = false;
  let selectedItemIds = new Set();
  let isTrashSelectionMode = false;
  let selectedTrashIds = new Set();
  let selectionMoveMode = false;
  let selectionFolderMode = false;
  const i18nElements = document.querySelectorAll('[data-i18n]');
  i18nElements.forEach(element => {
    const messageKey = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(messageKey);
    if (message) {
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = message;
      } else {
        element.textContent = message;
      }
    }
  });
  function setToggleIcon() {
    if (isGridView) {
      bookmarksList.classList.add('grid-mode');
    } else {
      bookmarksList.classList.remove('grid-mode');
    }
    renderSelectBtnIcon();
  }
function renderSelectBtnIcon() {
  viewToggleIcon.innerHTML = '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>';

  viewToggleBtn.classList.toggle('select-mode-on', isSelectionMode);
}
  viewToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isSelectionMode) {
      exitSelectionMode();
    } else {
      enterSelectionMode();
    }
  });
  function enterSelectionMode() {
    isSelectionMode = true;
    selectedItemIds.clear();
    bookmarksList.classList.add('selection-mode');
    renderSelectBtnIcon();
    if (window.bookmarksSortable) {
      window.bookmarksSortable.option('disabled', true);
    }
    document.querySelectorAll('#bookmarksList li a').forEach(a => {
      a.draggable = false;
    });
  }
  function exitSelectionMode() {
    isSelectionMode = false;
    selectedItemIds.clear();
    bookmarksList.classList.remove('selection-mode');
    renderSelectBtnIcon();
    document.querySelectorAll('#bookmarksList li.selection-selected').forEach(el => el.classList.remove('selection-selected'));
    closeBulkContextMenu();
    if (window.bookmarksSortable) {
      window.bookmarksSortable.option('disabled', false);
    }
    document.querySelectorAll('#bookmarksList li a').forEach(a => {
      a.draggable = true;
    });
  }
  function toggleItemSelection(listItem, id) {
    if (selectedItemIds.has(id)) {
      selectedItemIds.delete(id);
      listItem.classList.remove('selection-selected');
    } else {
      selectedItemIds.add(id);
      listItem.classList.add('selection-selected');
    }
  }
function renderTrashSelectBtnIcon() {
  const svg = trashSelectBtn.querySelector('svg');
  if (!svg) return;

  svg.innerHTML = '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>';
}
  function enterTrashSelectionMode() {
    isTrashSelectionMode = true;
    selectedTrashIds.clear();
    trashList.classList.add('selection-mode');
    trashSelectBtn.classList.add('select-mode-on');
    renderTrashSelectBtnIcon();
  }
  function exitTrashSelectionMode() {
    isTrashSelectionMode = false;
    selectedTrashIds.clear();
    trashList.classList.remove('selection-mode');
    trashSelectBtn.classList.remove('select-mode-on');
    renderTrashSelectBtnIcon();
    document.querySelectorAll('#trashList .trash-item.selection-selected').forEach(el => el.classList.remove('selection-selected'));
    closeBulkContextMenu();
  }
  function toggleTrashItemSelection(li, id) {
    if (selectedTrashIds.has(id)) {
      selectedTrashIds.delete(id);
      li.classList.remove('selection-selected');
    } else {
      selectedTrashIds.add(id);
      li.classList.add('selection-selected');
    }
  }
  
  function closeBulkContextMenu() {
    const existing = document.getElementById('bulkContextMenu');
    if (existing) existing.remove();
    contextMenuOverlay.classList.remove('active');
  }
  function showBulkContextMenu(x, y, mode) {
    closeBulkContextMenu();
    const menu = document.createElement('div');
    menu.classList.add('context-menu', 'bulk-context-menu');
    menu.id = 'bulkContextMenu';
    if (mode === 'bookmarks') {
      const count = selectedItemIds.size;
      if (count === 0) return;
      const label = document.createElement('div');
      label.classList.add('selection-count-label');
      label.textContent = chrome.i18n.getMessage('selectionCount', [String(count)]);
      menu.appendChild(label);
      
      const selectedNodes = allItems.filter(item => selectedItemIds.has(item.id));
      const bookmarkNodes = selectedNodes.filter(n => n.url);
      
      if (bookmarkNodes.length > 0) {
        const openBtn = document.createElement('button');
        openBtn.classList.add('context-menu-item');
        openBtn.innerHTML = `${ICONS.openExternal()} ${chrome.i18n.getMessage('bulkOpenSelected', [String(bookmarkNodes.length)])}`;
        openBtn.onclick = () => {
          bookmarkNodes.forEach(n => chrome.tabs.create({ url: n.url, active: false }));
          closeBulkContextMenu();
          exitSelectionMode();
        };
        menu.appendChild(openBtn);
      }
      
      const moveBtn2 = document.createElement('button');
      moveBtn2.classList.add('context-menu-item');
      moveBtn2.innerHTML = `${ICONS.move} ${chrome.i18n.getMessage('bulkMoveToFolder')}`;
      moveBtn2.onclick = () => {
        closeBulkContextMenu();
        selectionMoveMode = true;
        itemToMoveId = null;
        openMoveModal();
      };
      menu.appendChild(moveBtn2);
      
      const newFolderBtn = document.createElement('button');
      newFolderBtn.classList.add('context-menu-item');
      newFolderBtn.innerHTML = `${ICONS.folderAdd} ${chrome.i18n.getMessage('bulkNewFolderAndMove')}`;
      newFolderBtn.onclick = () => {
        closeBulkContextMenu();
        selectionFolderMode = true;
        newFolderParentId = currentFolderId;
        newFolderIndex = null;
        openCreateFolderModal();
      };
      menu.appendChild(newFolderBtn);
      
      const deleteBtn2 = document.createElement('button');
      deleteBtn2.classList.add('context-menu-item');
      deleteBtn2.dataset.state = 'initial';
      deleteBtn2.innerHTML = `${ICONS.close(16)} ${chrome.i18n.getMessage('bulkDelete')}`;
      deleteBtn2.onclick = () => {
        if (deleteBtn2.dataset.state === 'initial') {
          deleteBtn2.innerHTML = `${ICONS.question} ${chrome.i18n.getMessage('bulkConfirmDelete')}`;
          deleteBtn2.dataset.state = 'confirm';
        } else {
          closeBulkContextMenu();
          deleteBulkSelectedItems();
        }
      };
      menu.appendChild(deleteBtn2);
    } else if (mode === 'trash') {
      const count = selectedTrashIds.size;
      if (count === 0) return;
      const label = document.createElement('div');
      label.classList.add('selection-count-label');
      label.textContent = chrome.i18n.getMessage('selectionCount', [String(count)]);
      menu.appendChild(label);
      
      const restoreBtn2 = document.createElement('button');
      restoreBtn2.classList.add('context-menu-item');
      restoreBtn2.innerHTML = `${ICONS.restore} ${chrome.i18n.getMessage('bulkRestoreSelected')}`;
      restoreBtn2.onclick = async () => {
        closeBulkContextMenu();
        await restoreBulkTrashItems();
        exitTrashSelectionMode();
      };
      menu.appendChild(restoreBtn2);
      
      const permDeleteBtn = document.createElement('button');
      permDeleteBtn.classList.add('context-menu-item');
      permDeleteBtn.dataset.state = 'initial';
      permDeleteBtn.innerHTML = `${ICONS.deleteForever} ${chrome.i18n.getMessage('bulkDeletePermanently')}`;
      permDeleteBtn.style.color = 'var(--hover-color-remove)';
      permDeleteBtn.onclick = async () => {
        if (permDeleteBtn.dataset.state === 'initial') {
          permDeleteBtn.innerHTML = `${ICONS.question} ${chrome.i18n.getMessage('bulkConfirmDelete')}`;
          permDeleteBtn.dataset.state = 'confirm';
        } else {
          closeBulkContextMenu();
          await deleteBulkTrashItems();
          exitTrashSelectionMode();
        }
      };
      menu.appendChild(permDeleteBtn);
    }
    document.body.appendChild(menu);
    menu.style.display = 'flex';
    menu.style.visibility = 'hidden';
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    menu.style.visibility = '';
    let left = x, top = y;
    if (left + mw > window.innerWidth - 4) left = window.innerWidth - mw - 4;
    if (top + mh > window.innerHeight - 4) top = window.innerHeight - mh - 4;
    if (left < 4) left = 4;
    if (top < 4) top = 4;
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    menu.style.right = 'auto';
    menu.style.bottom = 'auto';
    contextMenuOverlay.classList.add('active');
  }
  async function deleteBulkSelectedItems() {
    const ids = Array.from(selectedItemIds);
    for (const id of ids) {
      const node = allItems.find(n => n.id === id);
      if (!node) continue;
      if (deleteMode === 'trash') {
        const items = await getTrashItems();
        const entry = {
          id: 'trash_' + Date.now() + '_' + Math.random().toString(36).slice(2),
          ts: Date.now(),
          title: node.title,
          url: node.url || null,
          parentId: node.parentId || currentFolderId,
          index: node.index !== undefined ? node.index : 0
        };
        
        if (!node.url) {
          entry.children = await getFolderTreeForTrash(node.id);
        }
        items.push(entry);
        await saveTrashItems(items);
      }
      await new Promise(resolve => {
        if (node.url) chrome.bookmarks.remove(id, resolve);
        else chrome.bookmarks.removeTree(id, resolve);
      });
    }
    exitSelectionMode();
    listItems(currentFolderId);
  }
  async function restoreBulkTrashItems() {
    const ids = Array.from(selectedTrashIds);
    const all = await getTrashItems();
    const toRestore = all.filter(i => ids.includes(i.id));
    for (const entry of toRestore) {
      await safeRestoreBookmark(entry);
    }
    await saveTrashItems(all.filter(i => !ids.includes(i.id)));
    loadTrashPanel(trashSearchInput.value);
    listItems(currentFolderId);
  }
  async function deleteBulkTrashItems() {
    const ids = Array.from(selectedTrashIds);
    const all = await getTrashItems();
    await saveTrashItems(all.filter(i => !ids.includes(i.id)));
    loadTrashPanel(trashSearchInput.value);
  }
  function updateAddBookmarkButton(isBookmarked) {
    addBookmarkBtn.innerHTML = isBookmarked ? ICONS.close(18) : ICONS.plus(18);
  }
  function closeMenu() {
    if (activeMenu) {
      const menuToClose = activeMenu;
      const bbToClose = activeBookmarkButtons;
      activeMenu = null;
      activeBookmarkButtons = null;
      contextMenuOverlay.classList.remove('active');
      if (menuToClose.classList.contains('open-upwards')) {
        menuToClose.style.animation = 'menuFadeOutUp 0.15s ease-in forwards';
      } else {
        menuToClose.style.animation = 'menuFadeOut 0.15s ease-in forwards';
      }
      setTimeout(() => {
        menuToClose.style.display = 'none';
        menuToClose.style.animation = '';
        menuToClose.style.opacity = '';
        menuToClose.style.transform = '';
        if (bbToClose) bbToClose.classList.remove('is-visible');
        menuToClose.classList.remove('open-upwards');
        const removeItems = menuToClose.querySelectorAll('[data-state]');
        removeItems.forEach(item => {
          item.dataset.state = 'initial';
          const isQuick = item.classList.contains('quick-action-btn');
          if (isQuick) {
            item.innerHTML = ICONS.close(16);
            item.title = chrome.i18n.getMessage('removeButton');
          } else {
            if (!menuToClose.classList.contains('trash-context-menu')) {
              item.innerHTML = `${ICONS.close(16)} ${chrome.i18n.getMessage('removeButton')}`;
            } else {
              item.innerHTML = `${ICONS.deleteForever} ${chrome.i18n.getMessage('trashDeletePermanently')}`;
              item.style.color = 'var(--hover-color-remove)';
            }
          }
        });
        if (!isMobile) {
          if (tabTrash.classList.contains('active')) trashSearchInput.focus();
          else if (tabBookmarks.classList.contains('active')) searchInput.focus();
        }
      }, 150);
    }
  }
  contextMenuOverlay.addEventListener('click', () => { closeMenu(); closeBulkContextMenu(); closeEmptyAreaMenu(); });

  const tabBookmarks = document.getElementById('tabBookmarks');
  const tabTrash = document.getElementById('tabTrash');
  const tabSettings = document.getElementById('tabSettings');
  const settingsPanel = document.getElementById('settingsPanel');
  const trashPanel = document.getElementById('trashPanel');
  const trashList = document.getElementById('trashList');
  const emptyTrashBtn = document.getElementById('emptyTrashBtn');
  const trashSearchInput = document.getElementById('trashSearchInput');
  const emptyTrashModal = document.getElementById('emptyTrashModal');
  const cancelEmptyTrashBtn = document.getElementById('cancelEmptyTrashBtn');
  const confirmEmptyTrashBtn = document.getElementById('confirmEmptyTrashBtn');
  const restoreAllTrashModal = document.getElementById('restoreAllTrashModal');
  const cancelRestoreAllTrashBtn = document.getElementById('cancelRestoreAllTrashBtn');
  const confirmRestoreAllTrashBtn = document.getElementById('confirmRestoreAllTrashBtn');
  const restoreAllTrashBtn = document.getElementById('restoreAllTrashBtn');
  const trashSelectBtn = document.getElementById('trashSelectBtn');
  const importConfirmModal = document.getElementById('importConfirmModal');
  const cancelImportBtn = document.getElementById('cancelImportBtn');
  const confirmImportBtn = document.getElementById('confirmImportBtn');
  const mainSection = document.querySelector('section');
  const settingFolderBadgeToggle = document.getElementById('settingFolderBadge');
  let showFolderBadge = true;
  const settingShowUpButtonToggle = document.getElementById('settingShowUpButton');
  let showUpButton = true;
  const settingShowScrollTopToggle = document.getElementById('settingShowScrollTop');
  let showScrollTopButton = true;
  const settingShowBreadcrumbToggle = document.getElementById('settingShowBreadcrumb');
  let showBreadcrumb = false;
  const settingShowScrollbarToggle = document.getElementById('settingShowScrollbar');
  let showScrollbar = true;
  const settingShowQuickActionsToggle = document.getElementById('settingShowQuickActions');
  const rootFolderSelect = document.getElementById('rootFolderSelect');
  const settingButtons = document.querySelectorAll('.setting-btn');
  const folderStyleSettingsRow = document.querySelector('[data-i18n="settingFolderStyleLabel"]')?.closest('.settings-row');
  const gridColumnsSettingsRow = document.getElementById('gridColumnsSettingsRow');
  let gridColumns = 3;
  const gridWidthSettingsRow = document.getElementById('gridWidthSettingsRow');
  let gridWidth = 300;
  const gridShowTitlesSettingsRow = document.getElementById('gridShowTitlesSettingsRow');
  const settingShowGridTitlesToggle = document.getElementById('settingShowGridTitles');
  let showGridTitles = true;

  function snapToNearest(value, options, fallback) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return fallback;
    return options.reduce((closest, opt) => Math.abs(opt - num) < Math.abs(closest - num) ? opt : closest, options[0]);
  }

  const GRID_WIDTH_OPTIONS = [300, 400, 500];
  const GRID_COLUMNS_OPTIONS = [2, 3, 4];
  let deleteMode = 'trash';
  let trashExpiryDays = 30;
  let checkBeforeAdd = false;
  let searchInFolder = false;
  let newItemPosition = 'end';

  const DEFAULT_CTX_ITEMS = [
    { id: 'edit', labelKey: 'editButton', enabled: true },
    { id: 'move', labelKey: 'moveButton', enabled: true },
    { id: 'remove', labelKey: 'removeButton', enabled: true },
    { id: 'createFolder', labelKey: 'createFolderButton', enabled: true },
    { id: 'addCurrentSite', labelKey: 'addCurrentSiteButton', enabled: true },
    { id: 'addAllTabs', labelKey: 'addAllTabsButton', enabled: true },
    { id: 'openAll', labelKey: 'confirmOpenAllTitle', enabled: true },
    { id: 'pin', labelKey: 'pinButton', enabled: true },
    { id: 'copyLink', labelKey: 'copyLinkButton', enabled: true },
    { id: 'openInCurrentTab', labelKey: 'openInCurrentTab', enabled: true },
    { id: 'openInNewTab', labelKey: 'openInNewTab', enabled: true }
  ];
  let ctxMenuItems = DEFAULT_CTX_ITEMS.map(i => ({ ...i }));
  let showQuickActions = true;
  
  const TRASH_STORAGE_KEY = 'markleaf_trash';

  async function getTrashItems() {
    return new Promise(resolve => {
      chrome.storage.local.get([TRASH_STORAGE_KEY], data => {
        resolve(data[TRASH_STORAGE_KEY] || []);
      });
    });
  }

  async function saveTrashItems(items) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [TRASH_STORAGE_KEY]: items }, resolve);
    });
  }

  async function purgeExpiredTrashItems() {
    const expiryMs = trashExpiryDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const items = await getTrashItems();
    const alive = items.filter(i => (now - i.ts) < expiryMs);
    if (alive.length !== items.length) await saveTrashItems(alive);
  }

  function syncFolderStyleVisibility() {
    if (folderStyleSettingsRow) folderStyleSettingsRow.style.display = isGridView ? '' : 'none';
    if (gridColumnsSettingsRow) gridColumnsSettingsRow.style.display = isGridView ? '' : 'none';
    if (gridWidthSettingsRow) gridWidthSettingsRow.style.display = isGridView ? '' : 'none';
    if (gridShowTitlesSettingsRow) gridShowTitlesSettingsRow.style.display = isGridView ? '' : 'none';
  }

  function applyGridColumns() {
    bookmarksList.style.setProperty('--grid-cols', gridColumns);
    if (isGridView) {
      document.body.style.width = gridWidth + 'px';
    } else {
      document.body.style.width = '300px';
    }
    bookmarksList.classList.toggle('hide-grid-titles', !showGridTitles);
  }

  settingButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const setting = btn.dataset.setting;
      const value = btn.dataset.value;
      document.querySelectorAll(`.setting-btn[data-setting="${setting}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (setting === 'deleteMode') {
        deleteMode = value;
        chrome.storage.local.set({ deleteMode });
        tabTrash.style.display = deleteMode === 'trash' ? '' : 'none';
        const expiryRow = document.getElementById('trashExpiryRow');
        if (expiryRow) expiryRow.classList.toggle('hidden', deleteMode !== 'trash');

        const parentRow = expiryRow?.closest('.settings-row');
        if (parentRow) {
          const descriptionParagraph = parentRow.querySelector('p:not(.trash-expiry-row p)');
          if (descriptionParagraph && descriptionParagraph.innerText.includes(chrome.i18n.getMessage('deleteModeText'))) {
            descriptionParagraph.style.display = deleteMode === 'trash' ? '' : 'none';
          }
        }

        if (deleteMode !== 'trash' && tabTrash.classList.contains('active')) {
          showTab('bookmarks');
        }
      } else if (setting === 'trashExpiry') {
        trashExpiryDays = parseInt(value, 10);
        chrome.storage.local.set({ trashExpiryDays });
        
        purgeExpiredTrashItems();
      } else if (setting === 'view') {
        isGridView = value === 'grid';
        chrome.storage.local.set({ isGridView });
        syncFolderStyleVisibility();
        applyGridColumns();
        setToggleIcon();
        listItems(currentFolderId);
      } else if (setting === 'folderStyle') {
        isFolderStackMode = value === 'stack';
        bookmarksList.classList.toggle('folder-stack-mode', isFolderStackMode);
        chrome.storage.local.set({ isFolderStackMode });
        listItems(currentFolderId);
      } else if (setting === 'gridColumns') {
        gridColumns = parseInt(value, 10) || 3;
        chrome.storage.local.set({ gridColumns });
        applyGridColumns();
        listItems(currentFolderId);
      } else if (setting === 'gridWidth') {
        gridWidth = parseInt(value, 10) || 300;
        chrome.storage.local.set({ gridWidth });
        applyGridColumns();
      } else if (setting === 'newItemPosition') {
        newItemPosition = value;
        chrome.storage.local.set({ newItemPosition });
      }
    });
  });

  settingFolderBadgeToggle.addEventListener('change', () => {
    showFolderBadge = settingFolderBadgeToggle.checked;
    chrome.storage.local.set({ showFolderBadge });
    listItems(currentFolderId);
  });

  settingShowUpButtonToggle.addEventListener('change', () => {
    showUpButton = settingShowUpButtonToggle.checked;
    chrome.storage.local.set({ showUpButton });
    updateUpButtonVisibility();
  });

  settingShowBreadcrumbToggle.addEventListener('change', () => {
    showBreadcrumb = settingShowBreadcrumbToggle.checked;
    chrome.storage.local.set({ showBreadcrumb });
    updateUpButtonVisibility();
  });

  function applyScrollbarVisibility() {
    document.documentElement.classList.toggle('scrollbar-hidden', !showScrollbar);
  }

  settingShowScrollbarToggle.addEventListener('change', () => {
    showScrollbar = settingShowScrollbarToggle.checked;
    chrome.storage.local.set({ showScrollbar });
    applyScrollbarVisibility();
  });

  settingShowScrollTopToggle.addEventListener('change', () => {
    showScrollTopButton = settingShowScrollTopToggle.checked;
    chrome.storage.local.set({ showScrollTopButton });
    if (!showScrollTopButton) hideScrollToTop();
  });

  settingShowQuickActionsToggle.addEventListener('change', () => {
    showQuickActions = settingShowQuickActionsToggle.checked;
    chrome.storage.local.set({ showQuickActions });
    renderCtxMenuSettings();
    listItems(currentFolderId);
  });

  const settingCheckBeforeAddToggle = document.getElementById('settingCheckBeforeAdd');
  settingCheckBeforeAddToggle.addEventListener('change', () => {
    checkBeforeAdd = settingCheckBeforeAddToggle.checked;
    chrome.storage.local.set({ checkBeforeAdd });
  });

  const settingSearchInFolderToggle = document.getElementById('settingSearchInFolder');
  settingSearchInFolderToggle.addEventListener('change', () => {
    searchInFolder = settingSearchInFolderToggle.checked;
    chrome.storage.local.set({ searchInFolder });
  });

  const extensionIconSelect = document.getElementById('extensionIconSelect');
  const customIconArea = document.getElementById('customIconArea');
  const chooseCustomIconBtn = document.getElementById('chooseCustomIconBtn');
  const customIconFileInput = document.getElementById('customIconFileInput');
  const customIconPreview = document.getElementById('customIconPreview');
  const customIconPreviewImg = document.getElementById('customIconPreviewImg');
  const removeCustomIconBtn = document.getElementById('removeCustomIconBtn');
  const iconCropCanvas = document.getElementById('iconCropCanvas');

  const ICON_SIZES = [16, 32, 48, 128];

  function processImageToIcons(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const icons = {};
        ICON_SIZES.forEach(size => {
          iconCropCanvas.width = size;
          iconCropCanvas.height = size;
          const ctx = iconCropCanvas.getContext('2d');
          ctx.clearRect(0, 0, size, size);
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
          icons[size] = iconCropCanvas.toDataURL('image/png');
        });
        resolve(icons);
      };
      img.onerror = () => reject(new Error('Invalid image'));
      img.src = dataUrl;
    });
  }

  function applyExtensionIcon(iconStyle, customIconData) {
    chrome.runtime.sendMessage({
      type: 'SET_EXTENSION_ICON',
      style: iconStyle,
      customData: iconStyle === 'custom' ? customIconData : null
    });
  }

  function updateCustomIconUI(customIconData) {
    if (customIconData && customIconData[32]) {
      customIconPreviewImg.src = customIconData[32];
      customIconPreview.style.display = 'flex';
    } else {
      customIconPreview.style.display = 'none';
    }
  }

  extensionIconSelect.addEventListener('change', () => {
    const val = extensionIconSelect.value;
    customIconArea.style.display = val === 'custom' ? 'flex' : 'none';
    if (val !== 'custom') {
      chrome.storage.local.remove('customIconData');
      customIconPreview.style.display = 'none';
      chrome.storage.local.set({ extensionIconStyle: val });
      applyExtensionIcon(val, null);
    } else {
      chrome.storage.local.set({ extensionIconStyle: val });
    }
  });

  chooseCustomIconBtn.addEventListener('click', () => customIconFileInput.click());

  customIconFileInput.addEventListener('change', () => {
    const file = customIconFileInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(chrome.i18n.getMessage('settingIconInvalidFile') || 'Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const icons = await processImageToIcons(e.target.result);
        chrome.storage.local.set({ customIconData: icons, extensionIconStyle: 'custom' }, () => {
          extensionIconSelect.value = 'custom';
          customIconArea.style.display = 'flex';
          updateCustomIconUI(icons);
          applyExtensionIcon('custom', icons);
        });
      } catch (err) {
        alert(chrome.i18n.getMessage('settingIconInvalidFile') || 'Could not process image. Please try another file.');
      }
    };
    reader.readAsDataURL(file);
    customIconFileInput.value = '';
  });

  removeCustomIconBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['customIconData'], () => {
      customIconPreview.style.display = 'none';
      extensionIconSelect.value = 'colorful';
      customIconArea.style.display = 'none';
      chrome.storage.local.set({ extensionIconStyle: 'colorful' });
      applyExtensionIcon('colorful', null);
    });
  });

  chrome.storage.local.get(['extensionIconStyle', 'customIconData'], (d) => {
    const style = d.extensionIconStyle || 'colorful';
    extensionIconSelect.value = style;
    if (style === 'custom') {
      customIconArea.style.display = 'flex';
      updateCustomIconUI(d.customIconData);
    }
    applyExtensionIcon(style, d.customIconData);
  });

  const faviconProviderSelect = document.getElementById('faviconProviderSelect');

  faviconProviderSelect.addEventListener('change', () => {
    const val = faviconProviderSelect.value;
    window._faviconProvider = val;
    chrome.storage.local.set({ faviconProvider: val });
    listItems(currentFolderId);
  });

  chrome.storage.local.get(['faviconProvider'], (d) => {
    const provider = d.faviconProvider || 'browser';
    faviconProviderSelect.value = provider;
    window._faviconProvider = provider;
  });

  function syncGridColumnsButtons() {
    document.querySelectorAll('.setting-btn[data-setting="gridColumns"]').forEach(b => {
      b.classList.toggle('active', b.dataset.value === String(gridColumns));
    });
  }

  function syncGridWidthButtons() {
    document.querySelectorAll('.setting-btn[data-setting="gridWidth"]').forEach(b => {
      b.classList.toggle('active', b.dataset.value === String(gridWidth));
    });
  }

  if (settingShowGridTitlesToggle) {
    settingShowGridTitlesToggle.addEventListener('change', () => {
      showGridTitles = settingShowGridTitlesToggle.checked;
      chrome.storage.local.set({ showGridTitles });
      applyGridColumns();
    });
  }

  async function getFolderTreeForTrash(nodeId) {
    const children = await new Promise(resolve =>
      chrome.bookmarks.getChildren(nodeId, r => { chrome.runtime.lastError; resolve(r || []); })
    );
    const result = [];
    for (const child of children) {
      if (child.url) {
        result.push({ title: child.title, url: child.url });
      } else {
        const subChildren = await getFolderTreeForTrash(child.id);
        result.push({ title: child.title, children: subChildren });
      }
    }
    return result;
  }

  async function sendToTrash(node) {
    const items = await getTrashItems();
    const entry = {
      id: 'trash_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      ts: Date.now(),
      title: node.title,
      url: node.url || null,
      parentId: node.parentId || currentFolderId,
      index: node.index !== undefined ? node.index : 0
    };
    
    if (!node.url) {
      entry.children = await getFolderTreeForTrash(node.id);
    }
    items.push(entry);
    await saveTrashItems(items);
    if (node.url) {
      chrome.bookmarks.remove(node.id, () => listItems(currentFolderId));
    } else {
      chrome.bookmarks.removeTree(node.id, () => listItems(currentFolderId));
    }
  }

  function sortItemsByPin(items) {
    if (pinnedBookmarks.size === 0) return items;
    const pinned = items.filter(n => pinnedBookmarks.has(n.id));
    const unpinned = items.filter(n => !pinnedBookmarks.has(n.id));
    return pinned.concat(unpinned);
  }
  
  async function resolveNewItemIndex(parentId) {
    if (newItemPosition !== 'start') return undefined;
    const siblings = await new Promise(resolve => chrome.bookmarks.getChildren(parentId, resolve));
    if (!siblings) return 0;
    return siblings.filter(s => pinnedBookmarks.has(s.id)).length;
  }

  async function togglePin(node) {
    const wasPinned = pinnedBookmarks.has(node.id);
    if (wasPinned) {
      pinnedBookmarks.delete(node.id);
    } else {
      pinnedBookmarks.add(node.id);
    }
    await new Promise(resolve => chrome.storage.local.set({ pinnedBookmarks: Array.from(pinnedBookmarks) }, resolve));
    await new Promise(resolve => {
      chrome.bookmarks.getChildren(node.parentId, (siblings) => {
        if (!siblings) { resolve(); return; }
        const pinnedSiblings = siblings.filter(s => pinnedBookmarks.has(s.id));
        const newIndex = wasPinned ? pinnedSiblings.length : 0;
        chrome.bookmarks.move(node.id, { index: newIndex }, () => resolve());
      });
    });
    listItems(currentFolderId);
  }

  function renderCtxMenuSettings() {
    const list = document.getElementById('ctxMenuItemList');
    if (!list) return;
    
    list.innerHTML = '';

    const enabledItems = ctxMenuItems.filter(item => item.enabled);
    const actionIds = showQuickActions ? enabledItems.slice(-3).map(i => i.id) : [];

    ctxMenuItems.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'ctx-menu-sort-item';
      li.dataset.id = item.id;
      const label = chrome.i18n.getMessage(item.labelKey) || item.id;
      
      const isAction = actionIds.includes(item.id);
      const dragSvg = ICONS.dragHandle(isAction);

      li.innerHTML = `${dragSvg}<span class="ctx-item-label">${label}</span><label class="ctx-item-toggle"><input type="checkbox" ${item.enabled ? 'checked' : ''}><span class="ctx-toggle-slider"></span></label>`;
      
      const checkbox = li.querySelector('input');
      li.addEventListener('click', (e) => {
        
        if (!e.target.closest('.ctx-item-toggle')) {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });
      
      li.querySelector('.ctx-drag-handle').addEventListener('mousedown', (e) => e.stopPropagation());
      li.querySelector('.ctx-drag-handle').addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
      
      li.querySelector('.ctx-item-toggle').addEventListener('mousedown', (e) => e.stopPropagation());
      li.querySelector('.ctx-item-toggle').addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
      
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        const it = ctxMenuItems.find(x => x.id === item.id);
        if (it) it.enabled = e.target.checked;
        chrome.storage.local.set({ ctxMenuItems });
        const track = li.querySelector('.ctx-toggle-slider');
        track.addEventListener('transitionend', () => {
          renderCtxMenuSettings();
          listItems(currentFolderId);
        }, { once: true });
      });
      list.appendChild(li);
    });
    
    if (window.ctxMenuSortable) { window.ctxMenuSortable.destroy(); window.ctxMenuSortable = null; }
    window.ctxMenuSortable = new Sortable(list, {
      animation: 150,
      handle: '.ctx-drag-handle',
      onEnd: () => {
        const newOrder = Array.from(list.children).map(li => li.dataset.id);
        ctxMenuItems.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
        chrome.storage.local.set({ ctxMenuItems });
        renderCtxMenuSettings();
        listItems(currentFolderId);
      }
    });
  }

  function showTab(tab) {
    tabBookmarks.classList.remove('active');
    tabTrash.classList.remove('active');
    tabSettings.classList.remove('active');
    bookmarksList.style.display = 'none';
    mainSection.style.display = 'none';
    upButton.style.display = 'none';
    if (breadcrumbBar) breadcrumbBar.style.display = 'none';
    settingsPanel.classList.remove('active');
    trashPanel.classList.remove('active');
    hideScrollToTop();
    
    if (isSelectionMode) exitSelectionMode();
    if (isTrashSelectionMode) exitTrashSelectionMode();
    if (tab === 'bookmarks') {
      tabBookmarks.classList.add('active');
      bookmarksList.style.display = '';
      mainSection.style.display = '';
      updateUpButtonVisibility();
      !isMobile && searchInput.focus();
    } else if (tab === 'trash') {
      tabTrash.classList.add('active');
      trashPanel.classList.add('active');
      trashSearchInput.value = '';
      loadTrashPanel();
      !isMobile && trashSearchInput.focus();
    } else if (tab === 'settings') {
      tabSettings.classList.add('active');
      settingsPanel.classList.add('active');
      updateSettingsUI();
      !isMobile && settingsSearchInput && settingsSearchInput.focus();
    }
  }

  let previousTab = 'bookmarks';
  let currentTab = 'bookmarks';

  tabBookmarks.addEventListener('click', () => { previousTab = currentTab; currentTab = 'bookmarks'; showTab('bookmarks'); });
  tabTrash.addEventListener('click', () => { previousTab = currentTab; currentTab = 'trash'; showTab('trash'); });
  tabSettings.addEventListener('click', () => { previousTab = currentTab; currentTab = 'settings'; showTab('settings'); });
  
  const settingsBackBtn = document.getElementById('settingsBackBtn');
  if (settingsBackBtn) {
    settingsBackBtn.addEventListener('click', () => {
      const dest = (previousTab && previousTab !== 'settings') ? previousTab : 'bookmarks';
      currentTab = dest;
      showTab(dest);
    });
  }
  
  const settingsSearchInput = document.getElementById('settingsSearchInput');
  const clearSettingsSearchBtn = document.getElementById('clearSettingsSearchBtn');

  function filterSettingsRows(term) {
    const rows = settingsPanel.querySelectorAll('.settings-row');
    const q = term.trim().toLowerCase();
    let visibleCount = 0;
    rows.forEach(row => {
      if (!q) {
        row.classList.remove('settings-hidden');
        visibleCount++;
      } else {
        const text = row.innerText.toLowerCase();
        const visible = text.includes(q);
        row.classList.toggle('settings-hidden', !visible);
        if (visible) visibleCount++;
      }
    });
    
    let noResultsEl = settingsPanel.querySelector('.settings-no-results');
    if (!q || visibleCount > 0) {
      if (noResultsEl) noResultsEl.remove();
    } else {
      if (!noResultsEl) {
        noResultsEl = document.createElement('div');
        noResultsEl.className = 'settings-no-results empty-message';
        settingsPanel.appendChild(noResultsEl);
      }
      noResultsEl.textContent = chrome.i18n.getMessage('settingsNoResults');
    }
  }

  if (settingsSearchInput) {
    settingsSearchInput.addEventListener('input', () => {
      const val = settingsSearchInput.value;
      clearSettingsSearchBtn.style.display = val ? '' : 'none';
      filterSettingsRows(val);
    });
  }

  if (clearSettingsSearchBtn) {
    clearSettingsSearchBtn.addEventListener('click', () => {
      settingsSearchInput.value = '';
      clearSettingsSearchBtn.style.display = 'none';
      filterSettingsRows('');
      settingsSearchInput.focus();
    });
  }

  function refocusSettingsSearch() {
    if (currentTab === 'settings' && !isMobile && settingsSearchInput) {
      settingsSearchInput.focus();
    }
  }

  if (settingsPanel) {
    settingsPanel.addEventListener('change', () => {
      setTimeout(refocusSettingsSearch, 0);
    });

    settingsPanel.addEventListener('click', (e) => {
      if (e.target === settingsSearchInput || e.target === clearSettingsSearchBtn) return;
      if (e.target.closest('select, input[type="file"]')) return;
      setTimeout(refocusSettingsSearch, 0);
    });
  }
  
  async function loadTrashPanel(filterTerm = '') {
    trashList.innerHTML = '';
    document.querySelectorAll('body > .trash-context-menu').forEach(el => el.remove());

    await purgeExpiredTrashItems();
    let items = await getTrashItems();

    const now = Date.now();
    const THIRTY_DAYS = trashExpiryDays * 24 * 60 * 60 * 1000;
    
    items = items.slice().sort((a, b) => b.ts - a.ts);

    if (filterTerm) {
      const lower = filterTerm.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(lower) ||
        (i.url && i.url.toLowerCase().includes(lower))
      );
    }

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.classList.add('empty-message');
      empty.textContent = filterTerm
        ? chrome.i18n.getMessage('trashNoResults')
        : chrome.i18n.getMessage('trashIsEmpty');
      empty.style.marginTop = '30px';
      trashList.appendChild(empty);
      return;
    }

    if (!isMobile && tabTrash.classList.contains('active')) {
      setTimeout(() => trashSearchInput.focus(), 0);
    }

    items.forEach(trashEntry => {
      const daysLeft = Math.max(0, Math.ceil((THIRTY_DAYS - (now - trashEntry.ts)) / (24 * 60 * 60 * 1000)));
      const li = document.createElement('li');
      li.classList.add('trash-item');
      li.dataset.trashId = trashEntry.id;

      const a = document.createElement('a');
      a.href = '#';

      if (trashEntry.url) {
        a.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.ctrlKey || event.metaKey) {
            chrome.tabs.create({ url: trashEntry.url, active: false });
            return false;
          }
          if (event.shiftKey) {
            chrome.windows.create({ url: trashEntry.url });
            return false;
          }
          chrome.tabs.update({ url: trashEntry.url });
          return false;
        });
        a.addEventListener('auxclick', (event) => {
          if (event.button === 1) {
            event.preventDefault();
            event.stopPropagation();
            chrome.tabs.create({ url: trashEntry.url, active: false });
            return false;
          }
        });
      } else {
        a.addEventListener('click', (e) => e.preventDefault());
      }

      const iconSpan = document.createElement('span');
      iconSpan.classList.add('item-icon');
      if (trashEntry.url) {
        const img = document.createElement('img');
        img.src = getFaviconUrl(trashEntry.url);
        img.alt = '';
        img.style.cssText = 'width:16px;height:16px;margin-right:8px;border-radius:100%;';
        iconSpan.appendChild(img);
      } else {
        iconSpan.innerHTML = ICONS.folder;
        iconSpan.style.marginRight = '8px';
      }

      const contentDiv = document.createElement('div');
      contentDiv.classList.add('bookmark-content');
      contentDiv.style.flex = '1';
      contentDiv.style.overflow = 'hidden';
      const titleSpan = document.createElement('span');
      titleSpan.classList.add('bookmark-title');
      titleSpan.textContent = trashEntry.title;
      contentDiv.appendChild(titleSpan);
      if (trashEntry.url) {
        const urlSpan = document.createElement('span');
        urlSpan.classList.add('bookmark-url');
        urlSpan.textContent = trashEntry.url;
        contentDiv.appendChild(urlSpan);
      }

      const daysBadge = document.createElement('span');
      daysBadge.classList.add('trash-days');
      daysBadge.textContent = daysLeft + chrome.i18n.getMessage('trashDaysLeft');

      a.appendChild(iconSpan);
      a.appendChild(contentDiv);
      a.appendChild(daysBadge);
      li.appendChild(a);

      const bookmarkButtons = document.createElement('div');
      bookmarkButtons.classList.add('bookmark-buttons');

      const menuBtn = document.createElement('button');
      menuBtn.classList.add('menu-button');
      menuBtn.innerHTML = ICONS.menu;

      const ctxMenu = document.createElement('div');
      ctxMenu.classList.add('context-menu', 'trash-context-menu');

      const restoreBtn = document.createElement('button');
      restoreBtn.classList.add('context-menu-item');
      restoreBtn.innerHTML = `${ICONS.restore} ${chrome.i18n.getMessage('trashRestoreButton')}`;

      restoreBtn.onclick = async (e) => {
        e.stopPropagation();
        closeMenu();
        if (ctxMenu && ctxMenu.parentNode) ctxMenu.remove();

        await safeRestoreBookmark(trashEntry);
        const all = await getTrashItems();
        await saveTrashItems(all.filter(i => i.id !== trashEntry.id));
        loadTrashPanel(trashSearchInput.value);
        listItems(currentFolderId);
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('context-menu-item');
      deleteBtn.innerHTML = `${ICONS.deleteForever} ${chrome.i18n.getMessage('trashDeletePermanently')}`;
      deleteBtn.style.color = 'var(--hover-color-remove)';
      deleteBtn.dataset.state = 'initial';

      deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        if (deleteBtn.dataset.state === 'initial') {
          deleteBtn.innerHTML = `${ICONS.question} ${chrome.i18n.getMessage('trashConfirmDelete')}`;
          deleteBtn.dataset.state = 'confirm';
        } else {
          closeMenu();
          if (ctxMenu && ctxMenu.parentNode) ctxMenu.remove();
          const all = await getTrashItems();
          await saveTrashItems(all.filter(i => i.id !== trashEntry.id));
          loadTrashPanel(trashSearchInput.value);
        }
      };

      const TRASH_QUICK_ACTIONS = {
        copyLink: {
          icon: ICONS.libraryPlusSmall,
          label: chrome.i18n.getMessage('copyLinkButton'),
          onClick: (e) => {
            e.stopPropagation();
            if (trashEntry.url) navigator.clipboard.writeText(trashEntry.url);
            closeMenu();
          }
        },
        openInCurrentTab: {
          icon: ICONS.moveToFolder,
          label: chrome.i18n.getMessage('openInCurrentTab'),
          onClick: (e) => {
            e.stopPropagation();
            if (trashEntry.url) chrome.tabs.update({ url: trashEntry.url });
            closeMenu();
          }
        },
        openInNewTab: {
          icon: ICONS.openExternal(14),
          label: chrome.i18n.getMessage('openInNewTab'),
          onClick: (e) => {
            e.stopPropagation();
            if (trashEntry.url) chrome.tabs.create({ url: trashEntry.url, active: false });
            closeMenu();
          }
        }
      };

      ctxMenu.appendChild(restoreBtn);
      ctxMenu.appendChild(deleteBtn);

      if (trashEntry.url && showQuickActions) {
        const enabledAndApplicable = ctxMenuItems.filter(cfg => {
          if (!cfg.enabled) return false;
          if (cfg.id === 'openAll') return false;
          return true;
        });
        const qaCount = Math.min(3, enabledAndApplicable.length);
        const qaIds = enabledAndApplicable.slice(enabledAndApplicable.length - qaCount).map(i => i.id);

        const filteredQa = document.createElement('div');
        filteredQa.classList.add('quick-actions');

        qaIds.forEach(id => {
          const actionDef = TRASH_QUICK_ACTIONS[id];
          if (actionDef) {
            const btn = document.createElement('button');
            btn.classList.add('quick-action-btn');
            btn.innerHTML = actionDef.icon;
            btn.title = actionDef.label;
            btn.onclick = actionDef.onClick;
            filteredQa.appendChild(btn);
          }
        });

        if (filteredQa.childElementCount > 0) ctxMenu.appendChild(filteredQa);
      }

      document.body.appendChild(ctxMenu);

      menuBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (activeMenu && activeMenu !== ctxMenu) closeMenu();
        if (activeMenu === ctxMenu && ctxMenu.style.display === 'flex') { closeMenu(); return; }

        const btnRect = menuBtn.getBoundingClientRect();
        const availableSpaceBelow = window.innerHeight - btnRect.bottom;

        ctxMenu.style.display = 'flex';
        ctxMenu.style.visibility = 'hidden';
        const mw = ctxMenu.offsetWidth;
        const mh = ctxMenu.offsetHeight;
        ctxMenu.style.visibility = '';
        ctxMenu.classList.remove('open-upwards');

        let top = btnRect.bottom + 4;
        let left = btnRect.right - mw;
        if (availableSpaceBelow < mh && btnRect.top > mh) {
          top = btnRect.top - mh - 4;
          ctxMenu.classList.add('open-upwards');
        }
        if (left < 4) left = 4;

        ctxMenu.style.top = top + 'px';
        ctxMenu.style.left = left + 'px';
        ctxMenu.style.right = 'auto';
        ctxMenu.style.bottom = 'auto';
        ctxMenu.style.display = 'flex';

        bookmarkButtons.classList.add('is-visible');
        contextMenuOverlay.classList.add('active');
        document.activeElement.blur();

        activeMenu = ctxMenu;
        activeBookmarkButtons = bookmarkButtons;

        deleteBtn.dataset.state = 'initial';
        deleteBtn.innerHTML = `${ICONS.deleteForever} ${chrome.i18n.getMessage('trashDeletePermanently')}`;
        deleteBtn.style.color = 'var(--hover-color-remove)';
      };

      bookmarkButtons.appendChild(menuBtn);
      
      const selCheck = document.createElement('div');
      selCheck.classList.add('sel-check');
      selCheck.innerHTML = ICONS.check;
      li.appendChild(selCheck);
      li.appendChild(bookmarkButtons);

      li.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isTrashSelectionMode) {
          if (!selectedTrashIds.has(trashEntry.id)) toggleTrashItemSelection(li, trashEntry.id);
          showBulkContextMenu(e.clientX, e.clientY, 'trash');
          return;
        }
        menuBtn.onclick(e);
      });
      
      a.addEventListener('click', (e) => {
        if (isTrashSelectionMode) {
          e.preventDefault();
          e.stopPropagation();
          toggleTrashItemSelection(li, trashEntry.id);
          return false;
        }
      }, true); 

      li.draggable = false;
      a.draggable = false;
      li.addEventListener('dragstart', (e) => { e.preventDefault(); e.stopPropagation(); return false; });
      a.addEventListener('dragstart', (e) => { e.preventDefault(); e.stopPropagation(); return false; });

      trashList.appendChild(li);
    });
  }

  trashSearchInput.addEventListener('input', () => {
    if (trashSearchDebounceTimer) clearTimeout(trashSearchDebounceTimer);
    clearTrashSearchBtn.style.display = trashSearchInput.value ? 'flex' : 'none';
    trashSearchDebounceTimer = setTimeout(() => {
      loadTrashPanel(trashSearchInput.value);
    }, 100);
  });

  const clearTrashSearchBtn = document.getElementById('clearTrashSearchBtn');
  clearTrashSearchBtn.addEventListener('click', () => {
    trashSearchInput.value = '';
    clearTrashSearchBtn.style.display = 'none';
    loadTrashPanel('');
    !isMobile && trashSearchInput.focus();
  });

  trashSelectBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isTrashSelectionMode) {
      exitTrashSelectionMode();
    } else {
      enterTrashSelectionMode();
    }
  });

  emptyTrashBtn.addEventListener('click', () => {
    emptyTrashModal.classList.add('active');
  });

  cancelEmptyTrashBtn.addEventListener('click', () => {
    emptyTrashModal.classList.remove('active');
    !isMobile && trashSearchInput.focus();
  });

  confirmEmptyTrashBtn.addEventListener('click', async () => {
    emptyTrashModal.classList.remove('active');
    await saveTrashItems([]);
    trashSearchInput.value = '';
    loadTrashPanel();
    !isMobile && trashSearchInput.focus();
  });
  
  async function safeRestoreBookmark(entry) {
    const parentExists = await new Promise(resolve => {
      chrome.bookmarks.get(entry.parentId, (results) => {
        const err = chrome.runtime.lastError;
        resolve(!err && results && results.length > 0);
      });
    });
    const parentId = parentExists ? entry.parentId : '1';

    const siblings = await new Promise(resolve =>
      chrome.bookmarks.getChildren(parentId, r => { chrome.runtime.lastError; resolve(r || []); })
    );
    const safeIndex = (entry.index !== undefined && entry.index !== null)
      ? Math.min(entry.index, siblings.length)
      : siblings.length;

    if (entry.url) {
      await new Promise(resolve =>
        chrome.bookmarks.create({ parentId, title: entry.title, url: entry.url, index: safeIndex }, resolve)
      );
    } else {
      const newFolder = await new Promise(resolve =>
        chrome.bookmarks.create({ parentId, title: entry.title || 'Klasör', index: safeIndex }, resolve)
      );
      if (newFolder && Array.isArray(entry.children)) {
        await restoreFolderChildren(entry.children, newFolder.id);
      }
    }
  }

  async function restoreFolderChildren(children, parentId) {
    for (const child of children) {
      if (child.url) {
        await new Promise(resolve =>
          chrome.bookmarks.create({ parentId, title: child.title || child.url, url: child.url }, resolve)
        );
      } else {
        const newFolder = await new Promise(resolve =>
          chrome.bookmarks.create({ parentId, title: child.title || 'Klasör' }, resolve)
        );
        if (newFolder && Array.isArray(child.children)) {
          await restoreFolderChildren(child.children, newFolder.id);
        }
      }
    }
  }

  restoreAllTrashBtn.addEventListener('click', () => {
    restoreAllTrashModal.classList.add('active');
  });

  cancelRestoreAllTrashBtn.addEventListener('click', () => {
    restoreAllTrashModal.classList.remove('active');
    !isMobile && trashSearchInput.focus();
  });

  confirmRestoreAllTrashBtn.addEventListener('click', async () => {
    restoreAllTrashModal.classList.remove('active');
    const items = await getTrashItems();
    for (const trashEntry of items) {
      await safeRestoreBookmark(trashEntry);
    }
    await saveTrashItems([]);
    trashSearchInput.value = '';
    loadTrashPanel();
    listItems(currentFolderId);
    !isMobile && trashSearchInput.focus();
  });

  window.onclick = (event) => {
    if (event.target == moveModal) closeMoveModal();
    if (event.target == createFolderModal) closeCreateFolderModal();
    if (event.target == editModal) closeEditModal();
    if (event.target == openAllModal) openAllModal.classList.remove('active');
    if (event.target == emptyTrashModal) { emptyTrashModal.classList.remove('active'); !isMobile && trashSearchInput.focus(); }
    if (event.target == restoreAllTrashModal) { restoreAllTrashModal.classList.remove('active'); !isMobile && trashSearchInput.focus(); }
    if (event.target == aboutModal) { aboutModal.classList.remove('active'); refocusSettingsSearch(); }
    if (event.target == exportOptionsModal) cancelExportOptionsBtn.click();
    if (event.target == importOptionsModal) cancelImportOptionsBtn.click();
    if (event.target == importConfirmModal) cancelImportBtn.click();
  };

function updateSettingsUI() {
  syncFolderStyleVisibility();
  settingFolderBadgeToggle.checked = showFolderBadge;
  settingCheckBeforeAddToggle.checked = checkBeforeAdd;
  settingShowUpButtonToggle.checked = showUpButton;
  settingShowScrollTopToggle.checked = showScrollTopButton;
  settingShowBreadcrumbToggle.checked = showBreadcrumb;
  settingShowScrollbarToggle.checked = showScrollbar;
  applyScrollbarVisibility();
  settingSearchInFolderToggle.checked = searchInFolder;
  settingShowQuickActionsToggle.checked = showQuickActions;
  populateRootFolderSelect(folderStack[0] || (isMobile ? '3' : '1'));
  const htmlCls = document.documentElement.classList;
  let currentTheme = 'auto';
  if (htmlCls.contains('theme-force-dark')) currentTheme = 'dark';
  else if (htmlCls.contains('theme-force-light')) currentTheme = 'light';
  const viewVal = isGridView ? 'grid' : 'list';
  const folderStyleVal = isFolderStackMode ? 'stack' : 'icon';
  document.querySelectorAll('.setting-btn[data-setting="view"]').forEach(b => b.classList.toggle('active', b.dataset.value === viewVal));
  document.querySelectorAll('.setting-btn[data-setting="folderStyle"]').forEach(b => b.classList.toggle('active', b.dataset.value === folderStyleVal));
  document.querySelectorAll('.setting-btn[data-setting="deleteMode"]').forEach(b => b.classList.toggle('active', b.dataset.value === deleteMode));
  document.querySelectorAll('.setting-btn[data-setting="trashExpiry"]').forEach(b => b.classList.toggle('active', parseInt(b.dataset.value, 10) === trashExpiryDays));
  document.querySelectorAll('.setting-btn[data-setting="newItemPosition"]').forEach(b => b.classList.toggle('active', b.dataset.value === newItemPosition));
  
  const expiryRow = document.getElementById('trashExpiryRow');
  const parentSettingsRow = expiryRow?.closest('.settings-row');
  
  if (expiryRow) {
    expiryRow.classList.toggle('hidden', deleteMode !== 'trash');
  }
  
  if (parentSettingsRow) {
    const descriptionParagraph = parentSettingsRow.querySelector('p:not(.trash-expiry-row p)');
    if (descriptionParagraph && descriptionParagraph.innerText.includes(chrome.i18n.getMessage('deleteModeText'))) {
      descriptionParagraph.style.display = deleteMode === 'trash' ? '' : 'none';
    }
  }

}

  function autoSecondaryColor(cardHex) {
    const hex = (cardHex || '#f0f0f5').replace('#', '');
    const norm = hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex;
    const f = parseInt(norm, 16);
    const r = (f >> 16) & 0xff, g = (f >> 8) & 0xff, b = f & 0xff;
    const toHex = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    const p = 0.10; 
    return '#' + toHex(r + (255 - r) * p) + toHex(g + (255 - g) * p) + toHex(b + (255 - b) * p);
  }

  function applyTheme(theme, customColors) {
    const html = document.documentElement;
    html.classList.remove('theme-force-dark', 'theme-force-light', 'theme-force-black', 'theme-force-custom');
    html.removeAttribute('style');
    if (theme === 'dark')   html.classList.add('theme-force-dark');
    else if (theme === 'light')  html.classList.add('theme-force-light');
    else if (theme === 'black')  html.classList.add('theme-force-black');
    else if (theme === 'custom' && customColors) {
      const c = customColors;
      html.style.setProperty('--background-color', c.bg);
      html.style.setProperty('--text-color', c.text);
      html.style.setProperty('--accent', c.accent);
      html.style.setProperty('--border-color', c.border);
      html.style.setProperty('--card-bg', c.card);
      html.style.setProperty('--card-hover-bg', c.card);
      html.style.setProperty('--primary-button-background', c.card);
      html.style.setProperty('--primary-button-text', c.text);
      html.style.setProperty('--secondary-button-background', autoSecondaryColor(c.card));
      html.style.setProperty('--secondary-button-text', c.text);
      html.style.setProperty('--link-background', c.card);
      html.style.setProperty('--link-color', c.text);
      html.style.setProperty('--form-background', c.card);
      html.style.setProperty('--input-background', 'transparent');
      html.style.setProperty('--input-border-color', c.border);
      html.style.setProperty('--input-text-color', c.text);
      html.style.setProperty('--placeholder-color', c.border);
      html.style.setProperty('--context-menu-background', c.card);
      html.style.setProperty('--context-menu-item-hover', c.border);
      html.style.setProperty('--icon-chip-bg', c.border);
    }
  }

  const themeSelect = document.getElementById('themeSelect');
  const customThemeArea = document.getElementById('customThemeArea');
  const customThemeBg = document.getElementById('customThemeBg');
  const customThemeText = document.getElementById('customThemeText');
  const customThemeAccent = document.getElementById('customThemeAccent');
  const customThemeBorder = document.getElementById('customThemeBorder');
  const customThemeCard = document.getElementById('customThemeCard');

  function getCustomColors() {
    return {
      bg:     customThemeBg.value,
      text:   customThemeText.value,
      accent: customThemeAccent.value,
      border: customThemeBorder.value,
      card:   customThemeCard.value,
    };
  }

  function loadCustomColorInputs(c) {
    if (!c) return;
    customThemeBg.value     = c.bg     || '#ffffff';
    customThemeText.value   = c.text   || '#111111';
    customThemeAccent.value = c.accent || '#00b017';
    customThemeBorder.value = c.border || '#dddddd';
    customThemeCard.value   = c.card   || '#f0f0f5';
  }

  themeSelect.addEventListener('change', () => {
    const val = themeSelect.value;
    customThemeArea.style.display = val === 'custom' ? 'flex' : 'none';
    if (val === 'custom') {
      chrome.storage.local.get(['customThemeColors'], (d) => {
        if (d.customThemeColors) {
          loadCustomColorInputs(d.customThemeColors);
          applyTheme('custom', d.customThemeColors);
        } else {
          const colors = getCustomColors();
          applyTheme('custom', colors);
        }
        chrome.storage.local.set({ appTheme: val });
      });
    } else {
      applyTheme(val, null);
      chrome.storage.local.set({ appTheme: val });
    }
  });

  [customThemeBg, customThemeText, customThemeAccent, customThemeBorder, customThemeCard].forEach(input => {
    input.addEventListener('input', () => {
      const colors = getCustomColors();
      applyTheme('custom', colors);
      chrome.storage.local.set({ appTheme: 'custom', customThemeColors: colors });
    });
  });

  function populateRootFolderSelect(selectedId) {
    chrome.bookmarks.getTree((tree) => {
      rootFolderSelect.innerHTML = '';
      const root = tree[0];
      if (!root || !root.children) return;
      root.children.forEach(node => {
        if (node.url) return;
        const opt = document.createElement('option');
        opt.value = node.id;
        opt.textContent = node.title || chrome.i18n.getMessage('settingRootFolderUnnamed');
        opt.selected = node.id === String(selectedId);
        rootFolderSelect.appendChild(opt);
      });
    });
  }

  rootFolderSelect.addEventListener('change', () => {
    const newRootId = rootFolderSelect.value;
    chrome.storage.local.set({ defaultFolderId: newRootId });
    folderStack = [newRootId];
    currentFolderId = newRootId;
    chrome.storage.local.set({ folderStack });
    listItems(currentFolderId);
  });
  function getVisibleItems() {
    return Array.from(bookmarksList.children).filter(
      el => el.tagName === 'LI' && el.dataset.bookmarkId
    );
  }
  function clearKeyboardSelection() {
    getVisibleItems().forEach(el => el.classList.remove('keyboard-selected'));
    keyboardSelectedIndex = -1;
  }
  function setKeyboardSelection(idx) {
    const items = getVisibleItems();
    items.forEach(el => el.classList.remove('keyboard-selected'));
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('keyboard-selected');
      items[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      keyboardSelectedIndex = idx;
    } else {
      keyboardSelectedIndex = -1;
    }
  }
  function activateSelectedItem() {
    const items = getVisibleItems();
    if (keyboardSelectedIndex >= 0 && items[keyboardSelectedIndex]) {
      items[keyboardSelectedIndex].querySelector('a').click();
    }
  }
  document.addEventListener('click', (event) => {
    if (activeMenu &&
        !activeMenu.contains(event.target) &&
        !event.target.closest('.menu-button') &&
        !event.target.closest('.quick-action-btn')) {
      closeMenu();
    }
  });
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (activeMenu &&
        !activeMenu.contains(event.target) &&
        !event.target.closest('.menu-button') &&
        !event.target.closest('.quick-action-btn')) {
      closeMenu();
    }
  });
  bookmarksList.addEventListener('scroll', () => {
    if (activeMenu) closeMenu();
  }, { passive: true });
  bookmarksList.addEventListener('mousemove', () => {
    if (keyboardSelectedIndex >= 0) clearKeyboardSelection();
  }, { passive: true });
  function countItemsInSubtree(node) {
    if (node.url) return 1;
    if (!node.children) return 0;
    let count = 0;
    for (const child of node.children) {
      count += countItemsInSubtree(child);
    }
    return count;
  }
  function collectFaviconsFromTree(node, needed) {
    const usedDomains = new Set();
    const result = [];
    function getDomain(url) {
      try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
    }
    function traverse(n) {
      if (result.length >= needed) return;
      if (n.url) {
        const d = getDomain(n.url);
        if (!usedDomains.has(d)) {
          usedDomains.add(d);
          result.push(n.url);
        }
      } else if (n.children) {
        for (const child of n.children) {
          if (result.length >= needed) break;
          traverse(child);
        }
      }
    }
    if (node.children) {
      for (const child of node.children) {
        if (result.length >= needed) break;
        traverse(child);
      }
    }
    return result;
  }
  function listItems(folderId, newlyAddedId) {
    
    if (isSelectionMode) {
      isSelectionMode = false;
      selectedItemIds.clear();
      bookmarksList.classList.remove('selection-mode');
      renderSelectBtnIcon();
      closeBulkContextMenu();
    }
    chrome.storage.local.set({ folderStack: folderStack });
    chrome.bookmarks.getSubTree(folderId, (bookmarkNodes) => {
      if (window.bookmarksSortable) {
        window.bookmarksSortable.destroy();
        window.bookmarksSortable = null;
      }
      bookmarksList.innerHTML = '';
      allItems = [];
      document.querySelectorAll('body > .context-menu').forEach(el => el.remove());
      if (isGridView) bookmarksList.classList.add('grid-mode');
      else bookmarksList.classList.remove('grid-mode');
      if (bookmarkNodes && bookmarkNodes.length > 0 && bookmarkNodes[0].children) {
        const children = bookmarkNodes[0].children;
        allItems = sortItemsByPin(children);
        if (allItems.length > 0) {
          allItems.forEach((node) => {
            let precomputedData = {};
            if (!node.url) {
              precomputedData.count = countItemsInSubtree(node);
              precomputedData.faviconUrls = collectFaviconsFromTree(node, 4);
            }
            const listItem = createListItem(node, precomputedData);
            bookmarksList.appendChild(listItem);
          });
        } else {
          appendEmptyMessage(chrome.i18n.getMessage('noBookmarksMessage'));
        }
      } else {
        appendEmptyMessage(chrome.i18n.getMessage('noBookmarksMessage'));
      }
      if (allItems.length > 1 && searchInput.value === '') {
        const initSortable = () => {
          if (window.bookmarksSortable) {
            window.bookmarksSortable.destroy();
            window.bookmarksSortable = null;
          }
          window.bookmarksSortable = new Sortable(bookmarksList, {
            animation: 150,
            onStart: function () {
              bookmarksList.classList.add('sortable-active');
            },
            onMove: function (evt) {
              if (pinnedBookmarks.size === 0) return true;
              const draggedId = evt.dragged.dataset.bookmarkId;
              if (!draggedId) return true;
              const children = Array.from(bookmarksList.children).filter(el => el.dataset.bookmarkId);
              const pinnedCount = children.filter(el => pinnedBookmarks.has(el.dataset.bookmarkId)).length;
              const isDraggedPinned = pinnedBookmarks.has(draggedId);
              const relatedIndex = children.indexOf(evt.related);
              if (isDraggedPinned) return relatedIndex > -1 && relatedIndex < pinnedCount;
              return relatedIndex === -1 || relatedIndex >= pinnedCount;
            },
            onEnd: function (evt) {
              bookmarksList.classList.remove('sortable-active');
              window.bookmarksSortable.option('disabled', true);
              const newOrder = Array.from(bookmarksList.children)
                .filter(el => el.dataset.bookmarkId)
                .map(item => item.dataset.bookmarkId);
              let pending = newOrder.length;
              if (pending === 0) { window.bookmarksSortable.option('disabled', false); return; }
              newOrder.forEach((itemId, index) => {
                chrome.bookmarks.move(itemId, { index: index }, () => {
                  pending--;
                  if (pending === 0) {
                    allItems.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
                    if (window.bookmarksSortable) {
                      window.bookmarksSortable.option('disabled', false);
                    }
                  }
                });
              });
            }
          });
        };
        initSortable();
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        const bookmarkInFolder = allItems.find(item => item.url === tab.url);
        currentBookmarkId = bookmarkInFolder ? bookmarkInFolder.id : null;
        updateAddBookmarkButton(!!currentBookmarkId);
      });
      updateUpButtonVisibility();
      clearKeyboardSelection();
      !isMobile && searchInput.focus();
      
      buildBookmarksCache();
    });
  }
  function appendEmptyMessage(text) {
    const div = document.createElement('div');
    div.classList.add('empty-message');
    div.textContent = text;
    bookmarksList.appendChild(div);
  }

  function closeEmptyAreaMenu() {
    const m = document.getElementById('emptyAreaContextMenu');
    if (m) m.remove();
    contextMenuOverlay.classList.remove('active');
  }

  async function urlExistsInFolder(url, folderId) {
    const children = await new Promise(resolve =>
      chrome.bookmarks.getChildren(folderId, r => { chrome.runtime.lastError; resolve(r || []); })
    );
    return children.some(c => c.url === url);
  }

async function showEmptyAreaContextMenu(x, y) {
  closeMenu();
  closeBulkContextMenu();
  const menu = document.createElement('div');
  menu.classList.add('context-menu');
  menu.id = 'emptyAreaContextMenu';
  menu.style.display = 'flex';

  const addCurrentBtn = document.createElement('button');
  addCurrentBtn.classList.add('context-menu-item');
  addCurrentBtn.innerHTML = `${ICONS.plus(16)} ${chrome.i18n.getMessage('addCurrentSiteButton')}`;
  addCurrentBtn.onclick = () => {
    closeEmptyAreaMenu();
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
      if (checkBeforeAdd && await urlExistsInFolder(tab.url, currentFolderId)) return;
      const idx = await resolveNewItemIndex(currentFolderId);
      chrome.bookmarks.create({ parentId: currentFolderId, title: tab.title, url: tab.url, index: idx }, () => listItems(currentFolderId));
    });
  };
  menu.appendChild(addCurrentBtn);

  const addAllBtn = document.createElement('button');
  addAllBtn.classList.add('context-menu-item');
  addAllBtn.innerHTML = `${ICONS.libraryPlus} ${chrome.i18n.getMessage('addAllTabsButton')}`;
  addAllBtn.onclick = async () => {
    closeEmptyAreaMenu();
    const tabs = await new Promise(resolve => chrome.tabs.query({ currentWindow: true }, resolve));
    let nextIndex = await resolveNewItemIndex(currentFolderId);
    for (const tab of tabs) {
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) continue;
      if (checkBeforeAdd && await urlExistsInFolder(tab.url, currentFolderId)) continue;
      await new Promise(resolve => chrome.bookmarks.create({ parentId: currentFolderId, title: tab.title, url: tab.url, index: nextIndex }, resolve));
      if (nextIndex !== undefined) nextIndex++;
    }
    listItems(currentFolderId);
  };
  menu.appendChild(addAllBtn);

  const createFolderBtn2 = document.createElement('button');
  createFolderBtn2.classList.add('context-menu-item');
  createFolderBtn2.innerHTML = `${ICONS.folderAdd} ${chrome.i18n.getMessage('createFolderButton')}`;
  createFolderBtn2.onclick = async () => {
    closeEmptyAreaMenu();
    newFolderParentId = currentFolderId;
    newFolderIndex = await resolveNewItemIndex(currentFolderId);
    openCreateFolderModal();
  };
  menu.appendChild(createFolderBtn2);

  document.body.appendChild(menu);

  menu.style.visibility = 'hidden';
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  menu.style.visibility = '';
  let left = x, top = y;
  if (left + mw > window.innerWidth - 4) left = window.innerWidth - mw - 4;
  if (top + mh > window.innerHeight - 4) top = window.innerHeight - mh - 4;
  if (left < 4) left = 4;
  if (top < 4) top = 4;
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
  menu.style.right = 'auto';
  menu.style.bottom = 'auto';
  contextMenuOverlay.classList.add('active');
}

  bookmarksList.addEventListener('contextmenu', (e) => {
    if (e.target.closest('li[data-bookmark-id]')) return;
    if (isSelectionMode) return;
    if (searchInput.value !== '') return;
    e.preventDefault();
    e.stopPropagation();
    showEmptyAreaContextMenu(e.clientX, e.clientY);
  });
  function createListItem(node, precomputedData = {}) {
    const listItem = document.createElement('li');
    listItem.dataset.bookmarkId = node.id;
    listItem.classList.add(node.url ? 'bookmark-item' : 'folder-item');
    if (pinnedBookmarks.has(node.id)) {
      listItem.classList.add('is-pinned');
      const pinBadge = document.createElement('span');
      pinBadge.classList.add('pin-indicator');
      pinBadge.innerHTML = ICONS.pinFilled(12);
      pinBadge.title = chrome.i18n.getMessage('unpinButton');
      listItem.appendChild(pinBadge);
    }
    listItem.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (isSelectionMode) {
        if (!selectedItemIds.has(node.id)) toggleItemSelection(listItem, node.id);
        showBulkContextMenu(event.clientX, event.clientY, 'bookmarks');
        return false;
      }
      const menuBtn = listItem.querySelector('.menu-button');
      if (menuBtn) menuBtn.click();
      return false;
    });
    const link = document.createElement('a');
    const faviconTargets = [];
    const scheduleFaviconRefresh = () => {
      if (!node.url || faviconTargets.length === 0) return;
      [1000, 2000, 3000].forEach((delay, idx) => {
        setTimeout(() => {
          faviconTargets.forEach(({ img, size }) => {
            img.src = `${getFaviconUrl(node.url, size)}&retry=${Date.now()}_${idx}`;
          });
        }, delay);
      });
    };
    if (!node.url) {
      link.href = '#';
    } else {
      link.href = node.url;
      link.target = '_blank';
    }
    link.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (isSelectionMode) {
        if (!selectedItemIds.has(node.id)) toggleItemSelection(listItem, node.id);
        showBulkContextMenu(event.clientX, event.clientY, 'bookmarks');
        return false;
      }
      const menuBtn = listItem.querySelector('.menu-button');
      if (menuBtn) menuBtn.click();
      return false;
    });
    if (!node.url) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (isSelectionMode) {
          toggleItemSelection(listItem, node.id);
          return;
        }
        folderStack.push(node.id);
        currentFolderId = node.id;
        listItems(node.id);
      });
      const handleMiddleClick = (event) => {
        if (event.button === 1) {
          event.preventDefault();
          event.stopPropagation();
          confirmOpenAllBookmarks(node.title, node.id);
          return false;
        }
      };
      listItem.addEventListener('mousedown', handleMiddleClick);
      link.addEventListener('mousedown', handleMiddleClick);
      link.addEventListener('auxclick', (event) => {
        if (event.button === 1) { event.preventDefault(); event.stopPropagation(); return false; }
      });
    } else {
      link.addEventListener('mousedown', (event) => {
        if (event.button !== 0 || event.ctrlKey || event.shiftKey || event.metaKey) {
          event.preventDefault(); event.stopPropagation(); return false;
        }
      });
      link.addEventListener('click', (event) => {
        event.preventDefault(); event.stopPropagation();
        if (isSelectionMode) { toggleItemSelection(listItem, node.id); return false; }
        scheduleFaviconRefresh();
        if (event.ctrlKey || event.metaKey) { chrome.tabs.create({ url: node.url, active: false }); return false; }
        if (event.shiftKey) { chrome.windows.create({ url: node.url }); return false; }
        chrome.tabs.update({ url: node.url }); return false;
      });
      link.addEventListener('auxclick', (event) => {
        if (event.button === 1) {
          event.preventDefault(); event.stopPropagation();
          scheduleFaviconRefresh();
          chrome.tabs.create({ url: node.url, active: false }); return false;
        }
      });
    }
    const icon = document.createElement('span');
    icon.classList.add('item-icon');
    if (node.url) {
      const img = document.createElement('img');
      img.src = getFaviconUrl(node.url);
      img.alt = 'Favicon';
      img.style.cssText = 'width:16px;height:16px;margin-right:8px;border-radius:100%;';
      img.dataset.faviconMissing = '0';
      img.addEventListener('load', () => { img.dataset.faviconMissing = '0'; });
      img.addEventListener('error', () => { img.dataset.faviconMissing = '1'; });
      faviconTargets.push({ img, size: 16 });
      icon.appendChild(img);
    } else {
      icon.innerHTML = ICONS.folder;
      icon.style.marginRight = '8px';
    }
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('bookmark-content');
    const titleSpan = document.createElement('span');
    titleSpan.textContent = node.title;
    titleSpan.classList.add('bookmark-title');
    if (!node.url) {
      const countSpan = document.createElement('span');
      countSpan.classList.add('folder-count');
      countSpan.textContent = precomputedData.count !== undefined ? precomputedData.count : '0';
      if (!showFolderBadge) countSpan.style.display = 'none';
      const titleWrapper = document.createElement('div');
      titleWrapper.appendChild(titleSpan);
      titleWrapper.appendChild(countSpan);
      titleDiv.appendChild(titleWrapper);
    } else {
      titleDiv.appendChild(titleSpan);
      const urlSpan = document.createElement('span');
      urlSpan.textContent = node.url;
      urlSpan.classList.add('bookmark-url');
      titleDiv.appendChild(urlSpan);
    }
    const gridIconWrap = document.createElement('div');
    gridIconWrap.classList.add('grid-icon-wrap');
    if (node.url) {
      const gridImg = document.createElement('img');
      gridImg.src = getFaviconUrl(node.url, 32);
      gridImg.alt = '';
      gridImg.dataset.faviconMissing = '0';
      gridImg.addEventListener('load', () => { gridImg.dataset.faviconMissing = '0'; });
      gridImg.addEventListener('error', () => { gridImg.dataset.faviconMissing = '1'; });
      faviconTargets.push({ img: gridImg, size: 32 });
      gridIconWrap.appendChild(gridImg);
    } else {
      if (isFolderStackMode) {
        gridIconWrap.classList.add('grid-folder-collage');
        const faviconUrls = precomputedData.faviconUrls || [];
        for (let i = 0; i < 4; i++) {
          const cell = document.createElement('div');
          cell.classList.add('collage-cell');
          if (faviconUrls[i]) {
            const img = document.createElement('img');
            img.src = getFaviconUrl(faviconUrls[i], 32);
            img.alt = '';
            cell.appendChild(img);
          }
          gridIconWrap.appendChild(cell);
        }
        const gridBadge = document.createElement('span');
        gridBadge.classList.add('grid-folder-badge');
        gridBadge.textContent = precomputedData.count !== undefined ? precomputedData.count : '';
        if (!showFolderBadge) gridBadge.style.display = 'none';
        gridIconWrap.appendChild(gridBadge);
      } else {
        gridIconWrap.innerHTML = ICONS.folderLarge;
        const gridBadge = document.createElement('span');
        gridBadge.classList.add('grid-folder-badge');
        gridBadge.textContent = precomputedData.count !== undefined ? precomputedData.count : '';
        if (!showFolderBadge) gridBadge.style.display = 'none';
        gridIconWrap.appendChild(gridBadge);
      }
    }
    const gridLabel = document.createElement('span');
    gridLabel.classList.add('grid-label');
    gridLabel.textContent = node.title;
    link.appendChild(gridIconWrap);
    link.appendChild(gridLabel);
    const bookmarkButtons = document.createElement('div');
    bookmarkButtons.classList.add('bookmark-buttons');
    const menuBtn = document.createElement('button');
    menuBtn.classList.add('menu-button');
    menuBtn.innerHTML = ICONS.menu;
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');

    const ITEM_DEFINITIONS = {
      pin: {
        icon: pinnedBookmarks.has(node.id) ? ICONS.pinFilled(16) : ICONS.pin(16),
        label: chrome.i18n.getMessage(pinnedBookmarks.has(node.id) ? 'unpinButton' : 'pinButton'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation(); closeMenu();
          togglePin(node);
        }
      },
      edit: {
        icon: ICONS.edit,
        label: chrome.i18n.getMessage('editButton'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation(); closeMenu();
          itemToEditId = node.id;
          openEditModal(node);
        }
      },
      move: {
        icon: ICONS.move,
        label: chrome.i18n.getMessage('moveButton'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation(); closeMenu();
          itemToMoveId = node.id;
          openMoveModal();
        }
      },
      remove: {
        icon: ICONS.close(16),
        label: chrome.i18n.getMessage('removeButton'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation();
          const state = btn.dataset.state || 'initial';
          if (state === 'initial') {
            btn.dataset.state = 'confirm';
            if (isQuick) {
              btn.innerHTML = ICONS.question;
              btn.title = chrome.i18n.getMessage('confirmRemoval');
            } else {
              btn.innerHTML = `${ICONS.question} ${chrome.i18n.getMessage('confirmRemoval')}`;
            }
          } else if (state === 'confirm') {
            closeMenu();
            if (deleteMode === 'trash') {
              sendToTrash(node);
            } else {
              if (node.url) {
                chrome.bookmarks.remove(node.id, () => listItems(currentFolderId));
              } else {
                chrome.bookmarks.removeTree(node.id, () => listItems(currentFolderId));
              }
            }
          }
        }
      },
      createFolder: {
        icon: ICONS.folderAdd,
        label: chrome.i18n.getMessage('createFolderButton'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation();
          closeMenu();
          newFolderParentId = currentFolderId;
          if (!node.url) {
            newFolderParentId = node.id;
            newFolderIndex = 0;
          } else {
            const children = Array.from(bookmarksList.children).filter(el => el.dataset.bookmarkId);
            newFolderIndex = children.indexOf(listItem) + 1;
          }
          openCreateFolderModal();
        }
      },
      addCurrentSite: {
        icon: ICONS.plus(16),
        label: chrome.i18n.getMessage(node.url ? 'addCurrentSiteButton' : 'addCurrentSiteToFolderButton'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation();
          closeMenu();
          const targetParentId = node.url ? node.parentId : node.id;
          chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];
            if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
            if (checkBeforeAdd && await urlExistsInFolder(tab.url, targetParentId)) return;
            const idx = node.url ? node.index + 1 : await resolveNewItemIndex(targetParentId);
            chrome.bookmarks.create({
              parentId: targetParentId,
              title: tab.title,
              url: tab.url,
              index: idx
            }, () => listItems(currentFolderId));
          });
        }
      },
      addAllTabs: {
        icon: ICONS.libraryPlus,
        label: chrome.i18n.getMessage(node.url ? 'addAllTabsButton' : 'addAllTabsToFolderButton'),
        onClick: async (event, btn, isQuick) => {
          event.stopPropagation();
          closeMenu();
          const targetParentId = node.url ? node.parentId : node.id;
          const tabs = await new Promise(resolve => chrome.tabs.query({ currentWindow: true }, resolve));
          let nextIndex = await resolveNewItemIndex(targetParentId);
          for (const tab of tabs) {
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) continue;
            if (checkBeforeAdd && await urlExistsInFolder(tab.url, targetParentId)) continue;
            await new Promise(resolve => chrome.bookmarks.create({ parentId: targetParentId, title: tab.title, url: tab.url, index: nextIndex }, resolve));
            if (nextIndex !== undefined) nextIndex++;
          }
          listItems(currentFolderId);
        }
      },
      openAll: {
        icon: ICONS.openExternal(16),
        label: chrome.i18n.getMessage('confirmOpenAllTitle'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation();
          closeMenu();
          confirmOpenAllBookmarks(node.title, node.id);
        }
      },
      copyLink: {
        icon: ICONS.libraryPlusSmall,
        label: chrome.i18n.getMessage('copyLinkButton'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation(); closeMenu();
          navigator.clipboard.writeText(node.url);
        }
      },
      openInCurrentTab: {
        icon: ICONS.moveToFolder,
        label: chrome.i18n.getMessage('openInCurrentTab'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation(); closeMenu();
          chrome.tabs.update({ url: node.url });
        }
      },
      openInNewTab: {
        icon: ICONS.openExternal(14),
        label: chrome.i18n.getMessage('openInNewTab'),
        onClick: (event, btn, isQuick) => {
          event.stopPropagation(); closeMenu();
          chrome.tabs.create({ url: node.url, active: false });
        }
      }
    };

    document.body.appendChild(contextMenu);
    menuBtn.onclick = (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (activeMenu === contextMenu && contextMenu.style.display === 'flex') {
        closeMenu(); return;
      }
      if (activeMenu && activeMenu !== contextMenu) {
        closeMenu();
      }

      contextMenu.innerHTML = '';

      const enabledAndApplicable = ctxMenuItems.filter(cfg => {
        if (!cfg.enabled) return false;
        if (cfg.id === 'openAll' && node.url) return false;
        if (['copyLink', 'openInCurrentTab', 'openInNewTab'].includes(cfg.id) && !node.url) return false;
        return true;
      });

      let qaIds = [];
      let verticalIds = [];

      if (showQuickActions) {
        const qaCount = Math.min(3, enabledAndApplicable.length);
        const qas = enabledAndApplicable.slice(enabledAndApplicable.length - qaCount);
        qaIds = qas.map(i => i.id);
        verticalIds = enabledAndApplicable.slice(0, enabledAndApplicable.length - qaCount).map(i => i.id);
      } else {
        verticalIds = enabledAndApplicable.map(i => i.id);
      }

      verticalIds.forEach(id => {
        const def = ITEM_DEFINITIONS[id];
        if (def) {
          const btn = document.createElement('button');
          btn.classList.add('context-menu-item');
          if (id === 'remove') btn.dataset.state = 'initial';
          btn.innerHTML = `${def.icon} ${def.label}`;
          btn.onclick = (e) => def.onClick(e, btn, false);
          contextMenu.appendChild(btn);
        }
      });

      if (qaIds.length > 0) {
        const qaContainer = document.createElement('div');
        qaContainer.classList.add('quick-actions');
        qaIds.forEach(id => {
          const def = ITEM_DEFINITIONS[id];
          if (def) {
            const btn = document.createElement('button');
            btn.classList.add('quick-action-btn');
            if (id === 'remove') btn.dataset.state = 'initial';
            btn.innerHTML = def.icon;
            btn.title = def.label;
            btn.onclick = (e) => def.onClick(e, btn, true);
            qaContainer.appendChild(btn);
          }
        });
        contextMenu.appendChild(qaContainer);
      }

      const menuBtnRect = menuBtn.getBoundingClientRect();
      const availableSpaceBelow = window.innerHeight - menuBtnRect.bottom;
      contextMenu.style.display = 'flex';
      contextMenu.style.visibility = 'hidden';
      const menuWidth = contextMenu.offsetWidth;
      const menuHeight = contextMenu.offsetHeight;
      contextMenu.style.visibility = '';
      contextMenu.style.opacity = '';
      contextMenu.style.transform = '';
      contextMenu.style.animation = '';
      contextMenu.classList.remove('open-upwards');
      if (isGridView) {
        const cardRect = listItem.getBoundingClientRect();
        let top = cardRect.bottom + 4 - 60;
        let left = cardRect.left + (cardRect.width / 2) - (menuWidth / 2);
        if (top + menuHeight > window.innerHeight - 4) {
          top = cardRect.top - menuHeight - 4 + 60;
          contextMenu.classList.add('open-upwards');
        }
        if (left < 4) left = 4;
        if (left + menuWidth > window.innerWidth - 4) left = window.innerWidth - menuWidth - 4;
        contextMenu.style.top = top + 'px';
        contextMenu.style.left = left + 'px';
        contextMenu.style.right = 'auto';
        contextMenu.style.bottom = 'auto';
      } else {
        let top = menuBtnRect.bottom + 4;
        let left = menuBtnRect.right - menuWidth;
        if (availableSpaceBelow < menuHeight && menuBtnRect.top > menuHeight) {
          top = menuBtnRect.top - menuHeight - 4;
          contextMenu.classList.add('open-upwards');
        }
        if (left < 4) left = 4;
        contextMenu.style.top = top + 'px';
        contextMenu.style.left = left + 'px';
        contextMenu.style.right = 'auto';
        contextMenu.style.bottom = 'auto';
      }
      contextMenu.style.display = 'flex';
      bookmarkButtons.classList.add('is-visible');
      contextMenuOverlay.classList.add('active');
      document.activeElement.blur();
      activeMenu = contextMenu;
      activeBookmarkButtons = bookmarkButtons;
      const thisRemoveItem = contextMenu.querySelector('.context-menu-item[data-state], .quick-action-btn[data-state]');
      if (thisRemoveItem) {
        thisRemoveItem.dataset.state = 'initial';
        if (thisRemoveItem.classList.contains('quick-action-btn')) {
          thisRemoveItem.innerHTML = ITEM_DEFINITIONS.remove.icon;
          thisRemoveItem.title = ITEM_DEFINITIONS.remove.label;
        } else {
          thisRemoveItem.innerHTML = `${ITEM_DEFINITIONS.remove.icon} ${ITEM_DEFINITIONS.remove.label}`;
        }
      }
    };
    link.appendChild(icon);
    link.appendChild(titleDiv);
    bookmarkButtons.appendChild(menuBtn);
    listItem.appendChild(link);
    
    const selCheck = document.createElement('div');
    selCheck.classList.add('sel-check');
    selCheck.innerHTML = ICONS.check;
    listItem.appendChild(selCheck);
    listItem.appendChild(bookmarkButtons);
    return listItem;
  }
  function confirmOpenAllBookmarks(folderName, folderId) {
    function countAllBookmarks(nodeId, callback) {
      chrome.bookmarks.getChildren(nodeId, (children) => {
        if (!children || children.length === 0) { callback(0); return; }
        let totalCount = 0, processed = 0;
        children.forEach(child => {
          if (child.url) {
            totalCount++; processed++;
            if (processed === children.length) callback(totalCount);
          } else {
            countAllBookmarks(child.id, (subCount) => {
              totalCount += subCount; processed++;
              if (processed === children.length) callback(totalCount);
            });
          }
        });
      });
    }
    countAllBookmarks(folderId, (totalCount) => {
      if (totalCount === 0) return;
      const openAllMessage = document.getElementById('openAllMessage');
      const confirmOpenAllBtn = document.getElementById('confirmOpenAllBtn');
      const cancelOpenAllBtn = document.getElementById('cancelOpenAllBtn');
      openAllMessage.innerHTML = chrome.i18n.getMessage('confirmOpenAllMessage', [folderName, totalCount.toString()]);
      confirmOpenAllBtn.onclick = null;
      cancelOpenAllBtn.onclick = null;
      confirmOpenAllBtn.onclick = () => { openAllModal.classList.remove('active'); openAllBookmarksInFolder(folderId); };
      cancelOpenAllBtn.onclick = () => { openAllModal.classList.remove('active'); };
      openAllModal.classList.add('active');
    });
  }
  function openAllBookmarksInFolder(folderId) {
    function openBookmarksRecursive(nodeId) {
      chrome.bookmarks.getChildren(nodeId, (children) => {
        if (children) {
          children.forEach((child) => {
            if (child.url) chrome.tabs.create({ url: child.url, active: false });
            else openBookmarksRecursive(child.id);
          });
        }
      });
    }
    openBookmarksRecursive(folderId);
  }
  function getFaviconUrl(url, size = 16) {
    const provider = window._faviconProvider || 'browser';
    const isOpera = navigator.userAgent.includes('OPR') || navigator.userAgent.includes('Opera');
    if (provider === 'google' || (provider === 'browser' && isOpera)) {
      try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
      } catch { return `https://www.google.com/s2/favicons?domain=google.com&sz=${size}`; }
    } else if (provider === 'duckduckgo') {
      try {
        const domain = new URL(url).hostname;
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      } catch { return `https://icons.duckduckgo.com/ip3/duckduckgo.com.ico`; }
    } else {
      const faviconUrl = new URL(`chrome-extension://${chrome.runtime.id}/_favicon/`);
      faviconUrl.searchParams.set('pageUrl', url);
      faviconUrl.searchParams.set('size', String(size));
      return faviconUrl.href;
    }
  }
  function getAllBookmarks(nodeId, callback) {
    let allBookmarks = [];
    chrome.bookmarks.getSubTree(nodeId, (treeNodes) => {
      function traverse(nodes) {
        for (const node of nodes) {
          if (node.url) allBookmarks.push(node);
          if (node.children) traverse(node.children);
        }
      }
      if (treeNodes && treeNodes.length > 0) traverse(treeNodes[0].children);
      callback(allBookmarks);
    });
  }
  
  function buildBookmarksCache(callback) {
    chrome.bookmarks.getSubTree('0', (treeNodes) => {
      const flat = [];
      function traverse(nodes) {
        for (const node of nodes) {
          if (node.url) flat.push(node);
          if (node.children) traverse(node.children);
        }
      }
      if (treeNodes && treeNodes.length > 0) traverse(treeNodes);
      allBookmarksCache = flat;
      if (callback) callback();
    });
  }
  
  function renderSearchResultsProgressive(results) {
    const token = ++searchRenderToken;
    bookmarksList.innerHTML = '';
    clearKeyboardSelection();
    if (isGridView) bookmarksList.classList.add('grid-mode');
    else bookmarksList.classList.remove('grid-mode');

    if (results.length === 0) {
      appendEmptyMessage(chrome.i18n.getMessage('noSearchResultsMessage'));
      return;
    }

    const BATCH_SIZE = 40;
    let index = 0;

    function renderBatch() {
      if (token !== searchRenderToken) return; 
      const fragment = document.createDocumentFragment();
      const end = Math.min(index + BATCH_SIZE, results.length);
      for (let i = index; i < end; i++) {
        const item = results[i];
        if (item.url) {
          const li = createListItem(item);
          fragment.appendChild(li);
        }
      }
      bookmarksList.appendChild(fragment);
      const isFirstBatch = index === 0;
      index = end;
      if (index < results.length) {
        requestAnimationFrame(renderBatch); 
      }
      if (isFirstBatch) setKeyboardSelection(0);
    }

    requestAnimationFrame(renderBatch);
  }

  addBookmarkBtn.addEventListener('click', () => {
    if (currentBookmarkId) {
      chrome.bookmarks.remove(currentBookmarkId, () => {
        currentBookmarkId = null;
        updateAddBookmarkButton(false);
        listItems(currentFolderId);
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        const idx = await resolveNewItemIndex(currentFolderId);
        chrome.bookmarks.create({
          parentId: currentFolderId,
          title: tab.title,
          url: tab.url,
          index: idx
        }, (newBookmark) => {
          currentBookmarkId = newBookmark.id;
          updateAddBookmarkButton(true);
          listItems(currentFolderId, newBookmark.id);
        });
      });
    }
  });
  createFolderBtn.addEventListener('click', async () => {
    newFolderParentId = currentFolderId;
    newFolderIndex = await resolveNewItemIndex(currentFolderId);
    openCreateFolderModal();
  });
  const originalUpText = upButton.innerHTML;
  upButton.addEventListener('dragover', (e) => {
    e.preventDefault();
    upButton.querySelector('span').textContent = chrome.i18n.getMessage('moveButton');
  });
  const resetUpButton = () => {
    upButton.style.background = '';
    upButton.innerHTML = originalUpText;
  };
  upButton.addEventListener('dragleave', resetUpButton);
  upButton.addEventListener('drop', (e) => {
    e.preventDefault(); resetUpButton();
    const draggedItem = document.querySelector('.sortable-chosen');
    const draggedId = draggedItem?.dataset.bookmarkId;
    const parentId = folderStack[folderStack.length - 2];
    if (draggedId && parentId) {
      chrome.bookmarks.move(draggedId, { parentId: parentId }, () => listItems(currentFolderId));
    }
  });
  upButton.addEventListener('click', () => {
    if (folderStack.length > 1) {
      folderStack.pop();
      currentFolderId = folderStack[folderStack.length - 1];
      listItems(currentFolderId);
    }
    window.scrollTo(0, 0);
  });
  function updateUpButtonVisibility() {
    const inSubFolder = folderStack.length > 1;
    if (inSubFolder && showUpButton) {
      upButton.style.display = 'flex';
      addBookmarkBtn.style.display = 'flex';
      header.style.justifyContent = 'space-between';
    } else {
      upButton.style.display = 'none';
      addBookmarkBtn.style.display = 'flex';
      header.style.justifyContent = 'flex-end';
    }
    updateBreadcrumb();
  }

  const breadcrumbBar = document.getElementById('breadcrumbBar');

  function updateBreadcrumb() {
    if (!breadcrumbBar) return;
    if (folderStack.length <= 1 || !showBreadcrumb) {
      breadcrumbBar.style.display = 'none';
      breadcrumbBar.innerHTML = '';
      return;
    }
    const ids = folderStack.slice();
    const getNames = ids.map(id => new Promise(resolve => {
      chrome.bookmarks.get(id, (results) => {
        const err = chrome.runtime.lastError;
        if (err || !results || results.length === 0) {
          resolve({ id, title: '…' });
        } else {
          resolve({ id, title: results[0].title || '…' });
        }
      });
    }));
    Promise.all(getNames).then(folders => {
      breadcrumbBar.innerHTML = '';
      folders.forEach((folder, idx) => {
        const isLast = idx === folders.length - 1;
        const btn = document.createElement('button');
        btn.className = 'breadcrumb-item' + (isLast ? ' active' : '');
        btn.title = folder.title;
        btn.innerHTML = `<span>${folder.title}</span>`;
        if (!isLast) {
          btn.addEventListener('click', () => {
            folderStack = folderStack.slice(0, idx + 1);
            currentFolderId = folder.id;
            listItems(currentFolderId);
          });
        }
        breadcrumbBar.appendChild(btn);
        if (!isLast) {
          const sep = document.createElement('span');
          sep.className = 'breadcrumb-sep';
          sep.textContent = '›';
          breadcrumbBar.appendChild(sep);
        }
      });
      breadcrumbBar.style.display = 'flex';
      requestAnimationFrame(() => {
        breadcrumbBar.scrollLeft = breadcrumbBar.scrollWidth;
      });
    });
  }
  function updateItemsList(itemsToDisplay) {
    bookmarksList.innerHTML = '';
    clearKeyboardSelection();
    if (isGridView) bookmarksList.classList.add('grid-mode');
    else bookmarksList.classList.remove('grid-mode');
    if (itemsToDisplay.length > 0) {
      itemsToDisplay.forEach(item => {
        if (item.url) {
          bookmarksList.appendChild(createListItem(item));
        }
      });
    } else {
      appendEmptyMessage(chrome.i18n.getMessage('noSearchResultsMessage'));
    }
  }
  function initScrollToTop() {
    const bList = document.getElementById('bookmarksList');
    bList.addEventListener('scroll', function () {
      if (!tabBookmarks.classList.contains('active')) return;
      const scrollPosition = bList.scrollTop;
      if (scrollPosition > 100) showScrollToTop();
      else hideScrollToTop();
    }, { passive: true });

    const tList = document.getElementById('trashList');
    tList.addEventListener('scroll', function () {
      if (!tabTrash.classList.contains('active')) return;
      const scrollPosition = tList.scrollTop;
      if (scrollPosition > 100) showScrollToTop();
      else hideScrollToTop();
    }, { passive: true });

    scrollToTopBtn.addEventListener('click', function () { smoothScrollToTop(); });
  }
  function showScrollToTop() {
    if (!showScrollTopButton) return;
    if (!scrollToTopBtn.classList.contains('active')) {
      scrollToTopBtn.classList.remove('hiding');
      scrollToTopBtn.classList.add('active');
    }
  }
  function hideScrollToTop() {
    if (scrollToTopBtn.classList.contains('active')) {
      scrollToTopBtn.classList.remove('active');
      scrollToTopBtn.classList.add('hiding');
      setTimeout(() => scrollToTopBtn.classList.remove('hiding'), 300);
    }
  }
  function smoothScrollToTop() {
    if (tabTrash.classList.contains('active')) {
      const tList = document.getElementById('trashList');
      tList.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const bList = document.getElementById('bookmarksList');
      bList.scrollTo({ top: 0, behavior: 'smooth' });
      !isMobile && searchInput.focus();
    }
    hideScrollToTop();
  }
  searchInput.addEventListener('input', () => {
    clearKeyboardSelection();
    const searchTerm = searchInput.value.trim().toLowerCase();
    clearSearchBtn.style.display = searchInput.value ? 'flex' : 'none';
    
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

    if (searchTerm === '') {
      ++searchRenderToken; 
      listItems(currentFolderId);
      addBookmarkBtn.style.display = 'flex';
      createFolderBtn.style.display = 'flex';
      updateUpButtonVisibility();
      return;
    }

    addBookmarkBtn.style.display = 'none';
    upButton.style.display = 'none';
    if (breadcrumbBar) breadcrumbBar.style.display = 'none';
    createFolderBtn.style.display = 'none';
    header.style.justifyContent = 'center';
    
    searchDebounceTimer = setTimeout(() => {
      const doSearch = () => {
        if (searchInFolder) {
          chrome.bookmarks.getSubTree(currentFolderId, (treeNodes) => {
            const folderFlat = [];
            function traverseFolder(nodes) {
              for (const node of nodes) {
                if (node.url) folderFlat.push(node);
                if (node.children) traverseFolder(node.children);
              }
            }
            if (treeNodes && treeNodes.length > 0) traverseFolder(treeNodes);
            const results = folderFlat.filter(item =>
              item.title.toLowerCase().includes(searchTerm) ||
              (item.url && item.url.toLowerCase().includes(searchTerm))
            );
            renderSearchResultsProgressive(results);
          });
        } else {
          const results = allBookmarksCache.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            (item.url && item.url.toLowerCase().includes(searchTerm))
          );
          renderSearchResultsProgressive(results);
        }
      };

      if (searchInFolder) {
        doSearch();
      } else if (allBookmarksCache) {
        doSearch();
      } else {
        buildBookmarksCache(doSearch);
      }
    }, 100);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    ++searchRenderToken;
    listItems(currentFolderId);
    addBookmarkBtn.style.display = 'flex';
    createFolderBtn.style.display = 'flex';
    updateUpButtonVisibility();
    !isMobile && searchInput.focus();
  });

  chrome.storage.local.get(['folderStack', 'isGridView', 'isFolderStackMode', 'appTheme', 'customThemeColors', 'defaultFolderId', 'deleteMode', 'trashExpiryDays', 'showFolderBadge', 'checkBeforeAdd', 'showUpButton', 'showScrollTopButton', 'showBreadcrumb', 'showScrollbar', 'searchInFolder', 'ctxMenuItems', 'showQuickActions', 'gridColumns', 'gridWidth', 'showGridTitles', 'pinnedBookmarks', 'newItemPosition'], (data) => {
    pinnedBookmarks = new Set(Array.isArray(data.pinnedBookmarks) ? data.pinnedBookmarks : []);
    newItemPosition = data.newItemPosition === 'start' ? 'start' : 'end';
    if (data.folderStack && data.folderStack.length > 0) {
      folderStack = data.folderStack;
      currentFolderId = folderStack[folderStack.length - 1];
    } else {
      const defaultId = data.defaultFolderId || (isMobile ? '3' : '1');
      folderStack = [defaultId];
      currentFolderId = defaultId;
    }
    isGridView = !!data.isGridView;
    isFolderStackMode = !!data.isFolderStackMode;
    gridColumns = snapToNearest(data.gridColumns, GRID_COLUMNS_OPTIONS, 3);
    gridWidth = snapToNearest(data.gridWidth, GRID_WIDTH_OPTIONS, 300);
    showGridTitles = data.showGridTitles !== false;
    if (settingShowGridTitlesToggle) settingShowGridTitlesToggle.checked = showGridTitles;
    syncGridColumnsButtons();
    syncGridWidthButtons();
    syncFolderStyleVisibility();
    applyGridColumns();
    if (isFolderStackMode) bookmarksList.classList.add('folder-stack-mode');
    const theme = data.appTheme || 'auto';
    themeSelect.value = theme;
    if (theme === 'custom') {
      customThemeArea.style.display = 'flex';
      loadCustomColorInputs(data.customThemeColors);
      applyTheme('custom', data.customThemeColors);
    } else {
      applyTheme(theme);
    }
    deleteMode = data.deleteMode || 'trash';
    trashExpiryDays = data.trashExpiryDays || 30;
    showFolderBadge = data.showFolderBadge !== undefined ? !!data.showFolderBadge : true;
    checkBeforeAdd = !!data.checkBeforeAdd;
    showUpButton = data.showUpButton !== undefined ? !!data.showUpButton : true;
    showScrollTopButton = data.showScrollTopButton !== undefined ? !!data.showScrollTopButton : true;
    showBreadcrumb = data.showBreadcrumb !== undefined ? !!data.showBreadcrumb : false;
    showScrollbar = data.showScrollbar !== undefined ? !!data.showScrollbar : true;
    if (settingShowScrollbarToggle) settingShowScrollbarToggle.checked = showScrollbar;
    applyScrollbarVisibility();
    searchInFolder = !!data.searchInFolder;
    showQuickActions = data.showQuickActions !== undefined ? !!data.showQuickActions : true;
    if (data.ctxMenuItems) {
      
      const savedMap = new Map(data.ctxMenuItems.map(i => [i.id, i]));
      ctxMenuItems = data.ctxMenuItems.map(i => ({ ...i }));
      DEFAULT_CTX_ITEMS.forEach(def => {
        if (!savedMap.has(def.id)) ctxMenuItems.push({ ...def });
      });
    }
    renderCtxMenuSettings();
    tabTrash.style.display = deleteMode === 'trash' ? '' : 'none';
    setToggleIcon();
    const resolvedDefaultId = data.defaultFolderId || (isMobile ? '3' : '1');
    populateRootFolderSelect(resolvedDefaultId);
    listItems(currentFolderId);
    purgeExpiredTrashItems();
  });
  
  document.addEventListener('keydown', e => {
    const popupOpen =
      moveModal.classList.contains('active') ||
      createFolderModal.classList.contains('active') ||
      editModal.classList.contains('active') ||
      openAllModal?.classList.contains('active');
    if (popupOpen) return;
    const inBookmarksTab = tabBookmarks.classList.contains('active');
    if (e.key === 'Escape') {
      if (isSelectionMode) { exitSelectionMode(); return; }
      if (isTrashSelectionMode) { exitTrashSelectionMode(); return; }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (inBookmarksTab) document.getElementById('upButton').click();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (inBookmarksTab) document.getElementById('upButton').click();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const items = getVisibleItems();
      if (items.length === 0) return;
      const newIdx = Math.min(keyboardSelectedIndex + 1, items.length - 1);
      setKeyboardSelection(newIdx);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (keyboardSelectedIndex <= 0) {
        clearKeyboardSelection();
        !isMobile && searchInput.focus();
      } else {
        setKeyboardSelection(keyboardSelectedIndex - 1);
      }
      return;
    }
    if (e.key === 'ArrowRight') {
      if (keyboardSelectedIndex >= 0) {
        e.preventDefault();
        activateSelectedItem();
      }
      return;
    }
    if (e.key === 'Enter') {
      if (keyboardSelectedIndex >= 0) {
        e.preventDefault();
        activateSelectedItem();
      }
      return;
    }
  });
  function openMoveModal() {
    moveModal.classList.add('active');
    folderSearchInput.placeholder = chrome.i18n.getMessage('searchFolderPlaceholder');
    populateFolderList();
    moveBtn.disabled = true;
    selectedFolderId = null;
    setTimeout(() => folderSearchInput.focus(), 300);
  }
  function openEditModal(node) {
    editModal.classList.add('active');
    editTitleInput.placeholder = chrome.i18n.getMessage('editTitlePlaceholder');
    editUrlInput.placeholder = chrome.i18n.getMessage('editUrlPlaceholder');
    editTitleInput.value = node.title;
    editUrlInput.value = node.url || '';
    editUrlInput.style.display = node.url ? 'block' : 'none';
    saveEditBtn.disabled = false;
    setTimeout(() => { editTitleInput.focus(); editTitleInput.select(); }, 300);
  }
  function closeMoveModal() {
    moveModal.classList.remove('active');
    folderList.innerHTML = '';
    folderSearchInput.value = '';
    selectionMoveMode = false;
    !isMobile && searchInput.focus();
  }
  function closeEditModal() {
    editModal.classList.remove('active');
    editTitleInput.value = '';
    editUrlInput.value = '';
    !isMobile && searchInput.focus();
  }
  function openCreateFolderModal() {
    createFolderModal.classList.add('active');
    newFolderNameInput.placeholder = chrome.i18n.getMessage('newFolderNamePlaceholder');
    newFolderNameInput.value = chrome.i18n.getMessage('newFolderName');
    createFolderInModalBtn.disabled = false;
    
    if (selectionFolderMode && selectedItemIds.size > 0) {
      const firstSelectedId = Array.from(selectedItemIds)[0];
      const selectedNode = allItems.find(item => item.id === firstSelectedId);
      if (selectedNode && selectedNode.index !== undefined) {
        newFolderIndex = selectedNode.index;
      } else {
        newFolderIndex = 0;
      }
    }
    
    setTimeout(() => { newFolderNameInput.focus(); newFolderNameInput.select(); }, 300);
  }
  function closeCreateFolderModal() {
    createFolderModal.classList.remove('active');
    newFolderNameInput.value = '';
    selectionFolderMode = false;
    !isMobile && searchInput.focus();
    newFolderParentId = null;
    newFolderIndex = null;
  }
  createFolderInModalBtn.addEventListener('click', () => {
    const folderName = newFolderNameInput.value.trim() || chrome.i18n.getMessage('newFolderName');
    if (folderName) {
      const parentId = newFolderParentId || currentFolderId;
      let finalIndex = newFolderIndex !== null ? newFolderIndex : undefined;
      
      if (selectionFolderMode && finalIndex === undefined && selectedItemIds.size > 0) {
        const firstSelectedId = Array.from(selectedItemIds)[0];
        const selectedNode = allItems.find(item => item.id === firstSelectedId);
        if (selectedNode && selectedNode.index !== undefined) {
          finalIndex = selectedNode.index;
        }
      }
      
      chrome.bookmarks.create({
        parentId: parentId,
        title: folderName,
        index: finalIndex
      }, (newFolder) => {
        if (selectionFolderMode && newFolder) {
          const ids = Array.from(selectedItemIds);
          if (ids.length === 0) {
            selectionFolderMode = false;
            closeCreateFolderModal();
            listItems(currentFolderId);
            exitSelectionMode();
            return;
          }
          let done = 0;
          ids.forEach(id => {
            chrome.bookmarks.move(id, { parentId: newFolder.id }, () => {
              done++;
              if (done === ids.length) {
                selectionFolderMode = false;
                newFolderParentId = null;
                newFolderIndex = null;
                closeCreateFolderModal();
                exitSelectionMode();
                listItems(currentFolderId);
              }
            });
          });
        } else {
          const newId = (parentId === currentFolderId && newFolder) ? newFolder.id : null;
          listItems(currentFolderId, newId);
          closeCreateFolderModal();
          newFolderParentId = null;
          newFolderIndex = null;
        }
      });
    }
  });
  saveEditBtn.addEventListener('click', () => {
    if (itemToEditId) {
      const newTitle = editTitleInput.value;
      const newUrl = editUrlInput.style.display === 'block' ? editUrlInput.value : undefined;
      chrome.bookmarks.update(itemToEditId, { title: newTitle, url: newUrl }, () => {
        listItems(currentFolderId); closeEditModal(); itemToEditId = null;
      });
    }
  });
  newFolderNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') createFolderInModalBtn.click(); });
  editTitleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { if (editUrlInput.style.display === 'block') editUrlInput.focus(); else saveEditBtn.click(); }
  });
  editUrlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveEditBtn.click(); });
  function getAllFolders(nodes, callback) {
    let folders = [];
    function traverse(nodes) {
      nodes.forEach(node => {
        if (!node.url) { folders.push(node); if (node.children) traverse(node.children); }
      });
    }
    traverse(nodes);
    callback(folders);
  }
  function populateFolderList(searchTerm = '') {
    folderList.innerHTML = '';
    chrome.bookmarks.getTree((treeNodes) => {
      const rootNode = treeNodes[0];
      getAllFolders(rootNode.children, (allFolders) => {
        const excludedIds = new Set();
        function collectDescendantFolderIds(node) {
          excludedIds.add(node.id);
          if (node.children) {
            node.children.forEach(child => { if (!child.url) collectDescendantFolderIds(child); });
          }
        }
        if (selectionMoveMode) {
          selectedItemIds.forEach(id => {
            const n = allFolders.find(f => f.id === id);
            if (n) collectDescendantFolderIds(n);
          });
        } else if (itemToMoveId) {
          const movingNode = allFolders.find(f => f.id === itemToMoveId);
          if (movingNode) collectDescendantFolderIds(movingNode);
        }
        const filteredFolders = allFolders.filter(folder =>
          !excludedIds.has(folder.id) &&
          folder.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredFolders.length > 0) {
          filteredFolders.forEach(node => {
            const li = document.createElement('li');
            li.dataset.folderId = node.id;
            li.innerHTML = `${ICONS.folder} ${node.title}`;
            li.addEventListener('click', () => {
              if (selectedFolderId) {
                const prev = document.querySelector(`[data-folder-id="${selectedFolderId}"]`);
                if (prev) prev.classList.remove('selected');
              }
              li.classList.add('selected');
              selectedFolderId = node.id;
              moveBtn.disabled = false;
            });
            folderList.appendChild(li);
          });
        } else {
          const emptyMessage = document.createElement('li');
          emptyMessage.classList.add('empty-message');
          emptyMessage.textContent = chrome.i18n.getMessage('noFoldersFoundMessage');
          folderList.appendChild(emptyMessage);
        }
      });
    });
  }
  folderSearchInput.addEventListener('input', (event) => populateFolderList(event.target.value));
  moveBtn.addEventListener('click', () => {
    if (selectionMoveMode && selectedFolderId) {
      const ids = Array.from(selectedItemIds);
      let done = 0;
      if (ids.length === 0) { closeMoveModal(); selectionMoveMode = false; exitSelectionMode(); return; }
      ids.forEach(id => {
        chrome.bookmarks.move(id, { parentId: selectedFolderId }, () => {
          done++;
          if (done === ids.length) {
            selectionMoveMode = false;
            selectedFolderId = null;
            closeMoveModal();
            exitSelectionMode();
            listItems(currentFolderId);
          }
        });
      });
    } else if (itemToMoveId && selectedFolderId) {
      chrome.bookmarks.move(itemToMoveId, { parentId: selectedFolderId }, () => {
        listItems(currentFolderId); closeMoveModal();
        itemToMoveId = null; selectedFolderId = null;
      });
    }
  });
  closeMoveModalBtn.addEventListener('click', closeMoveModal);
  closeCreateFolderModalBtn.addEventListener('click', closeCreateFolderModal);
  closeEditModalBtn.addEventListener('click', closeEditModal);
  
  async function replaceBookmarksBarWith(sourceChildren) {
    if (!Array.isArray(sourceChildren) || sourceChildren.length === 0) return;

    const existingChildren = await new Promise(resolve =>
      chrome.bookmarks.getChildren('1', r => { chrome.runtime.lastError; resolve(r || []); })
    );
    for (const child of existingChildren) {
      await new Promise(resolve => {
        if (!child.url) {
          chrome.bookmarks.removeTree(child.id, () => { chrome.runtime.lastError; resolve(); });
        } else {
          chrome.bookmarks.remove(child.id, () => { chrome.runtime.lastError; resolve(); });
        }
      });
    }

    async function createNodes(nodes, parentId) {
      for (const node of nodes) {
        if (!node.title && !node.url) continue;
        if (node.url) {
          await new Promise(resolve =>
            chrome.bookmarks.create({ parentId, title: node.title || node.url, url: node.url }, () => { chrome.runtime.lastError; resolve(); })
          );
        } else {
          const newFolder = await new Promise(resolve =>
            chrome.bookmarks.create({ parentId, title: node.title || 'Klasör' }, r => { chrome.runtime.lastError; resolve(r); })
          );
          if (newFolder && Array.isArray(node.children) && node.children.length > 0) {
            await createNodes(node.children, newFolder.id);
          }
        }
      }
    }
    await createNodes(sourceChildren, '1');
  }

  function finishBookmarksImportUI() {
    tabTrash.style.display = deleteMode === 'trash' ? '' : 'none';
    setToggleIcon();
    updateSettingsUI();
    folderStack = ['1'];
    currentFolderId = '1';
    listItems(currentFolderId);
  }
  
  function escapeNetscapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function decodeHtmlEntities(str) {
    const el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
  }

  function bookmarkNodeToNetscape(node, indent) {
    const pad = '    '.repeat(indent);
    if (node.url) {
      const addDate = node.dateAdded ? Math.floor(node.dateAdded / 1000) : Math.floor(Date.now() / 1000);
      return `${pad}<DT><A HREF="${escapeNetscapeHtml(node.url)}" ADD_DATE="${addDate}">${escapeNetscapeHtml(node.title || node.url)}</A>\n`;
    }
    const addDate = node.dateAdded ? Math.floor(node.dateAdded / 1000) : Math.floor(Date.now() / 1000);
    const isBar = node.id === '1';
    const toolbarAttr = isBar ? ' PERSONAL_TOOLBAR_FOLDER="true"' : '';
    let out = `${pad}<DT><H3 ADD_DATE="${addDate}" LAST_MODIFIED="${addDate}"${toolbarAttr}>${escapeNetscapeHtml(node.title || 'Klasör')}</H3>\n`;
    out += `${pad}<DL><p>\n`;
    if (Array.isArray(node.children)) {
      for (const child of node.children) out += bookmarkNodeToNetscape(child, indent + 1);
    }
    out += `${pad}</DL><p>\n`;
    return out;
  }
  
  async function exportBookmarksAsHtml() {
    const tree = await new Promise(resolve => chrome.bookmarks.getTree(resolve));
    const root = tree[0];
    const topFolders = root.children || [];
    let body = '';
    for (const folder of topFolders) {
      body += bookmarkNodeToNetscape(folder, 1);
    }
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${body}</DL><p>
`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const d = new Date();
    const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}_${String(d.getDate()).padStart(2, '0')}_${d.getFullYear()}`;
    a.download = `bookmarks_${dateStr}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  function parseNetscapeBookmarksHtml(html) {
    const cleaned = html.replace(/<p>/gi, '');
    const tokenRegex = /<DL>|<\/DL>|<DT>\s*<H3([^>]*)>([\s\S]*?)<\/H3>|<DT>\s*<A\s+([^>]*)>([\s\S]*?)<\/A>/gi;
    const root = { title: 'root', children: [] };
    const stack = [root];
    let pendingFolder = null;
    let match;
    while ((match = tokenRegex.exec(cleaned)) !== null) {
      const [full, h3Attrs, h3Text, aAttrs, aText] = match;
      if (full === '<DL>') {
        if (pendingFolder) {
          stack.push(pendingFolder);
          pendingFolder = null;
        }
        continue;
      }
      if (full === '</DL>') {
        if (stack.length > 1) stack.pop();
        continue;
      }
      if (h3Text !== undefined) {
        const attrs = h3Attrs || '';
        const isToolbar = /PERSONAL_TOOLBAR_FOLDER\s*=\s*["']?true["']?/i.test(attrs);
        const folder = { title: decodeHtmlEntities(h3Text.trim()), children: [], isPersonalToolbar: isToolbar };
        stack[stack.length - 1].children.push(folder);
        pendingFolder = folder;
        continue;
      }
      if (aText !== undefined) {
        const attrs = aAttrs || '';
        const hrefMatch = attrs.match(/HREF\s*=\s*"([^"]*)"/i) || attrs.match(/HREF\s*=\s*'([^']*)'/i);
        const url = hrefMatch ? decodeHtmlEntities(hrefMatch[1]) : '';
        stack[stack.length - 1].children.push({ title: decodeHtmlEntities(aText.trim()), url });
        pendingFolder = null;
        continue;
      }
    }
    return root.children;
  }

  function findPersonalToolbarFolder(nodes) {
    for (const node of nodes) {
      if (node.isPersonalToolbar) return node;
      if (Array.isArray(node.children)) {
        const found = findPersonalToolbarFolder(node.children);
        if (found) return found;
      }
    }
    return null;
  }
  
  async function importBookmarksFromHtml(file) {
    try {
      const text = await file.text();
      const confirmed = await showImportConfirmModal('bookmarksOnly');
      if (!confirmed) return;

      const parsedTopNodes = parseNetscapeBookmarksHtml(text);
      const toolbarFolder = findPersonalToolbarFolder(parsedTopNodes);
      const sourceChildren = toolbarFolder ? toolbarFolder.children : parsedTopNodes;

      await replaceBookmarksBarWith(sourceChildren);
      finishBookmarksImportUI();
    } catch (err) {
      console.error('Bookmark HTML import error:', err);
    }
  }

  async function exportData(options) {
    const includeSettings = !options || options.includeSettings !== false;
    const includeBookmarks = !options || options.includeBookmarks !== false;

    const storageData = await new Promise(resolve => {
      chrome.storage.local.get(
        ['deleteMode', 'trashExpiryDays', 'isGridView', 'gridColumns', 'gridWidth', 'showGridTitles', 'isFolderStackMode', 'appTheme', 'customThemeColors', 'showFolderBadge', 'checkBeforeAdd', 'defaultFolderId', 'showUpButton', 'showScrollTopButton', 'showBreadcrumb', 'showScrollbar', 'searchInFolder', 'extensionIconStyle', 'customIconData', 'faviconProvider', 'ctxMenuItems', 'showQuickActions', 'exportIncludeSettings', 'exportIncludeBookmarks', 'importIncludeSettings', 'importIncludeBookmarks', 'pinnedBookmarks', 'newItemPosition', TRASH_STORAGE_KEY],
        resolve
      );
    });

    const exportObj = {
      version: chrome.runtime.getManifest().version,
      exportedAt: new Date().toISOString(),
      settings: includeSettings ? {
        deleteMode: storageData.deleteMode || 'trash',
        trashExpiryDays: storageData.trashExpiryDays || 30,
        isGridView: storageData.isGridView || false,
        gridColumns: storageData.gridColumns || 3,
        gridWidth: storageData.gridWidth || 300,
        showGridTitles: storageData.showGridTitles !== undefined ? storageData.showGridTitles : true,
        isFolderStackMode: storageData.isFolderStackMode || false,
        appTheme: storageData.appTheme || 'auto',
        customThemeColors: storageData.customThemeColors || null,
        showFolderBadge: storageData.showFolderBadge !== undefined ? storageData.showFolderBadge : true,
        checkBeforeAdd: !!storageData.checkBeforeAdd,
        showUpButton: storageData.showUpButton !== undefined ? storageData.showUpButton : true,
        showScrollTopButton: storageData.showScrollTopButton !== undefined ? storageData.showScrollTopButton : true,
        showBreadcrumb: !!storageData.showBreadcrumb,
        showScrollbar: storageData.showScrollbar !== undefined ? storageData.showScrollbar : true,
        searchInFolder: !!storageData.searchInFolder,
        newItemPosition: storageData.newItemPosition === 'start' ? 'start' : 'end',
        defaultFolderId: storageData.defaultFolderId || null,
        extensionIconStyle: storageData.extensionIconStyle || 'colorful',
        customIconData: (storageData.extensionIconStyle === 'custom') ? (storageData.customIconData || null) : null,
        faviconProvider: storageData.faviconProvider || 'browser',
        ctxMenuItems: storageData.ctxMenuItems || null,
        showQuickActions: storageData.showQuickActions !== undefined ? storageData.showQuickActions : true,
        
        exportIncludeSettings: storageData.exportIncludeSettings !== undefined ? storageData.exportIncludeSettings : true,
        exportIncludeBookmarks: storageData.exportIncludeBookmarks !== undefined ? storageData.exportIncludeBookmarks : true,
        importIncludeSettings: storageData.importIncludeSettings !== undefined ? storageData.importIncludeSettings : true,
        importIncludeBookmarks: storageData.importIncludeBookmarks !== undefined ? storageData.importIncludeBookmarks : true
      } : null,
      trash: includeBookmarks ? (storageData[TRASH_STORAGE_KEY] || []) : [],
      pinnedBookmarks: includeBookmarks ? (storageData.pinnedBookmarks || []) : [],
      bookmarks: includeBookmarks ? await new Promise(resolve => chrome.bookmarks.getTree(resolve)) : null
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markleaf-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function importData(file, options) {
    try {
      const includeSettings = !options || options.includeSettings !== false;
      const includeBookmarks = !options || options.includeBookmarks !== false;

      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version) throw new Error('Invalid format');

      const importScope = includeSettings && includeBookmarks ? 'all'
        : includeBookmarks ? 'bookmarksAndTrash'
        : includeSettings ? 'settingsOnly'
        : 'all';
      const confirmed = await showImportConfirmModal(importScope);
      if (!confirmed) return;
      
      const s = (includeSettings && data.settings) ? data.settings : null;
      if (s) {
      await new Promise(resolve => chrome.storage.local.set(s, resolve));
      deleteMode = s.deleteMode || 'trash';
      trashExpiryDays = s.trashExpiryDays || 30;
      isGridView = !!s.isGridView;
      gridColumns = snapToNearest(s.gridColumns, GRID_COLUMNS_OPTIONS, 3);
      gridWidth = snapToNearest(s.gridWidth, GRID_WIDTH_OPTIONS, 300);
      chrome.storage.local.set({ gridColumns, gridWidth });
      showGridTitles = s.showGridTitles !== undefined ? s.showGridTitles : true;
      if (settingShowGridTitlesToggle) settingShowGridTitlesToggle.checked = showGridTitles;
      syncGridColumnsButtons();
      syncGridWidthButtons();
      syncFolderStyleVisibility();
      applyGridColumns();
      isFolderStackMode = !!s.isFolderStackMode;
      showFolderBadge = s.showFolderBadge !== undefined ? !!s.showFolderBadge : true;
      checkBeforeAdd = !!s.checkBeforeAdd;
      showUpButton = s.showUpButton !== undefined ? !!s.showUpButton : true;
      showScrollTopButton = s.showScrollTopButton !== undefined ? !!s.showScrollTopButton : true;
      if (settingShowScrollTopToggle) settingShowScrollTopToggle.checked = showScrollTopButton;
      if (!showScrollTopButton) hideScrollToTop();
      showBreadcrumb = !!s.showBreadcrumb;
      showScrollbar = s.showScrollbar !== undefined ? !!s.showScrollbar : true;
      if (settingShowScrollbarToggle) settingShowScrollbarToggle.checked = showScrollbar;
      applyScrollbarVisibility();
      searchInFolder = !!s.searchInFolder;
      newItemPosition = s.newItemPosition === 'start' ? 'start' : 'end';
      document.querySelectorAll('.setting-btn[data-setting="newItemPosition"]').forEach(b => b.classList.toggle('active', b.dataset.value === newItemPosition));
      if (s.defaultFolderId) {
        folderStack = [s.defaultFolderId];
        currentFolderId = s.defaultFolderId;
        chrome.storage.local.set({ folderStack });
      }
      if (s.appTheme) {
        themeSelect.value = s.appTheme;
        if (s.appTheme === 'custom' && s.customThemeColors) {
          customThemeArea.style.display = 'flex';
          loadCustomColorInputs(s.customThemeColors);
          applyTheme('custom', s.customThemeColors);
          chrome.storage.local.set({ customThemeColors: s.customThemeColors });
        } else {
          customThemeArea.style.display = 'none';
          applyTheme(s.appTheme);
        }
      }

      if (s.extensionIconStyle) {
        extensionIconSelect.value = s.extensionIconStyle;
        const isCustom = s.extensionIconStyle === 'custom';
        customIconArea.style.display = isCustom ? 'flex' : 'none';
        if (isCustom && s.customIconData) updateCustomIconUI(s.customIconData);
        chrome.runtime.sendMessage({ type: 'SET_EXTENSION_ICON', style: s.extensionIconStyle, customData: s.customIconData || null });
      }

      if (s.faviconProvider) {
        faviconProviderSelect.value = s.faviconProvider;
        window._faviconProvider = s.faviconProvider;
        chrome.storage.local.set({ faviconProvider: s.faviconProvider });
      }

      if (Array.isArray(s.ctxMenuItems) && s.ctxMenuItems.length > 0) {
        const savedMap = new Map(s.ctxMenuItems.map(i => [i.id, i]));
        ctxMenuItems = s.ctxMenuItems.map(i => ({ ...i }));
        DEFAULT_CTX_ITEMS.forEach(def => {
          if (!savedMap.has(def.id)) ctxMenuItems.push({ ...def });
        });
        chrome.storage.local.set({ ctxMenuItems });
        renderCtxMenuSettings();
      }

      if (s.showQuickActions !== undefined) {
        showQuickActions = !!s.showQuickActions;
        if (settingShowQuickActionsToggle) settingShowQuickActionsToggle.checked = showQuickActions;
        chrome.storage.local.set({ showQuickActions });
      }
      }
      
      if (includeBookmarks && Array.isArray(data.trash)) {
        await saveTrashItems(data.trash);
      }

      if (includeBookmarks && Array.isArray(data.pinnedBookmarks)) {
        pinnedBookmarks = new Set(data.pinnedBookmarks);
        await new Promise(resolve => chrome.storage.local.set({ pinnedBookmarks: Array.from(pinnedBookmarks) }, resolve));
      }
      
      if (includeBookmarks && data.bookmarks && Array.isArray(data.bookmarks)) {
        const root = data.bookmarks[0];

        const findBookmarksBar = (node) => {
          if (!node) return null;
          if (node.id === '1' || node.title === 'Bookmarks bar' || node.title === 'Bookmarks Bar') return node;
          if (Array.isArray(node.children)) {
            for (const child of node.children) {
              const found = findBookmarksBar(child);
              if (found) return found;
            }
          }
          return null;
        };

        const bookmarksBar = findBookmarksBar(root);
        const sourceChildren = bookmarksBar?.children || root?.children || [];
        await replaceBookmarksBarWith(sourceChildren);
      }

      finishBookmarksImportUI();
    } catch (err) {
      console.error('Import error:', err);
    }
  }

  function showImportConfirmModal(scope) {
    return new Promise(resolve => {
      const messageKeyByScope = {
        all: 'importConfirmMessage',
        bookmarksAndTrash: 'importConfirmMessageBookmarksTrash',
        settingsOnly: 'importConfirmMessageSettingsOnly',
        bookmarksOnly: 'importConfirmMessageBookmarksOnly'
      };
      const messageKey = messageKeyByScope[scope] || messageKeyByScope.all;
      const messageEl = importConfirmModal.querySelector('[data-i18n="importConfirmMessage"]');
      if (messageEl) messageEl.textContent = chrome.i18n.getMessage(messageKey);
      importConfirmModal.classList.add('active');
      const onConfirm = () => {
        importConfirmModal.classList.remove('active');
        confirmImportBtn.removeEventListener('click', onConfirm);
        cancelImportBtn.removeEventListener('click', onCancel);
        resolve(true);
      };
      const onCancel = () => {
        importConfirmModal.classList.remove('active');
        confirmImportBtn.removeEventListener('click', onConfirm);
        cancelImportBtn.removeEventListener('click', onCancel);
        resolve(false);
      };
      confirmImportBtn.addEventListener('click', onConfirm);
      cancelImportBtn.addEventListener('click', onCancel);
    });
  }

  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFileInput = document.getElementById('importFileInput');

  const exportOptionsModal = document.getElementById('exportOptionsModal');
  const exportIncludeSettingsToggle = document.getElementById('exportIncludeSettingsToggle');
  const exportIncludeBookmarksToggle = document.getElementById('exportIncludeBookmarksToggle');
  const cancelExportOptionsBtn = document.getElementById('cancelExportOptionsBtn');
  const confirmExportOptionsBtn = document.getElementById('confirmExportOptionsBtn');

  const importOptionsModal = document.getElementById('importOptionsModal');
  const importIncludeSettingsToggle = document.getElementById('importIncludeSettingsToggle');
  const importIncludeBookmarksToggle = document.getElementById('importIncludeBookmarksToggle');
  const cancelImportOptionsBtn = document.getElementById('cancelImportOptionsBtn');
  const confirmImportOptionsBtn = document.getElementById('confirmImportOptionsBtn');

  let pendingImportOptions = null;

  function syncIeConfirmBtnState(settingsToggle, bookmarksToggle, confirmBtn) {
    confirmBtn.disabled = !settingsToggle.checked && !bookmarksToggle.checked;
  }

  function showExportOptionsModal() {
    return new Promise(resolve => {
      chrome.storage.local.get(['exportIncludeSettings', 'exportIncludeBookmarks'], (res) => {
        exportIncludeSettingsToggle.checked = res.exportIncludeSettings !== undefined ? res.exportIncludeSettings : true;
        exportIncludeBookmarksToggle.checked = res.exportIncludeBookmarks !== undefined ? res.exportIncludeBookmarks : true;
        syncIeConfirmBtnState(exportIncludeSettingsToggle, exportIncludeBookmarksToggle, confirmExportOptionsBtn);
        exportOptionsModal.classList.add('active');
      });

      const onToggleChange = () => syncIeConfirmBtnState(exportIncludeSettingsToggle, exportIncludeBookmarksToggle, confirmExportOptionsBtn);
      exportIncludeSettingsToggle.addEventListener('change', onToggleChange);
      exportIncludeBookmarksToggle.addEventListener('change', onToggleChange);

      const cleanup = () => {
        exportOptionsModal.classList.remove('active');
        confirmExportOptionsBtn.removeEventListener('click', onConfirm);
        cancelExportOptionsBtn.removeEventListener('click', onCancel);
        exportIncludeSettingsToggle.removeEventListener('change', onToggleChange);
        exportIncludeBookmarksToggle.removeEventListener('change', onToggleChange);
      };
      const onConfirm = () => {
        const options = {
          includeSettings: exportIncludeSettingsToggle.checked,
          includeBookmarks: exportIncludeBookmarksToggle.checked
        };
        chrome.storage.local.set({ exportIncludeSettings: options.includeSettings, exportIncludeBookmarks: options.includeBookmarks });
        cleanup();
        resolve(options);
      };
      const onCancel = () => { cleanup(); resolve(null); };
      confirmExportOptionsBtn.addEventListener('click', onConfirm);
      cancelExportOptionsBtn.addEventListener('click', onCancel);
    });
  }

  function showImportOptionsModal() {
    return new Promise(resolve => {
      chrome.storage.local.get(['importIncludeSettings', 'importIncludeBookmarks'], (res) => {
        importIncludeSettingsToggle.checked = res.importIncludeSettings !== undefined ? res.importIncludeSettings : true;
        importIncludeBookmarksToggle.checked = res.importIncludeBookmarks !== undefined ? res.importIncludeBookmarks : true;
        syncIeConfirmBtnState(importIncludeSettingsToggle, importIncludeBookmarksToggle, confirmImportOptionsBtn);
        importOptionsModal.classList.add('active');
      });

      const onToggleChange = () => syncIeConfirmBtnState(importIncludeSettingsToggle, importIncludeBookmarksToggle, confirmImportOptionsBtn);
      importIncludeSettingsToggle.addEventListener('change', onToggleChange);
      importIncludeBookmarksToggle.addEventListener('change', onToggleChange);

      const cleanup = () => {
        importOptionsModal.classList.remove('active');
        confirmImportOptionsBtn.removeEventListener('click', onConfirm);
        cancelImportOptionsBtn.removeEventListener('click', onCancel);
        importIncludeSettingsToggle.removeEventListener('change', onToggleChange);
        importIncludeBookmarksToggle.removeEventListener('change', onToggleChange);
      };
      const onConfirm = () => {
        const options = {
          includeSettings: importIncludeSettingsToggle.checked,
          includeBookmarks: importIncludeBookmarksToggle.checked
        };
        chrome.storage.local.set({ importIncludeSettings: options.includeSettings, importIncludeBookmarks: options.includeBookmarks });
        cleanup();
        resolve(options);
      };
      const onCancel = () => { cleanup(); resolve(null); };
      confirmImportOptionsBtn.addEventListener('click', onConfirm);
      cancelImportOptionsBtn.addEventListener('click', onCancel);
    });
  }

  function isBookmarksOnly(options) {
    return !!options && options.includeBookmarks && !options.includeSettings;
  }

  if (exportBtn) exportBtn.addEventListener('click', async () => {
    const options = await showExportOptionsModal();
    if (!options) return;
    if (isBookmarksOnly(options)) {
      exportBookmarksAsHtml();
    } else {
      exportData(options);
    }
  });
  if (importBtn) importBtn.addEventListener('click', async () => {
    const options = await showImportOptionsModal();
    if (options) {
      pendingImportOptions = options;
      importFileInput.accept = isBookmarksOnly(options) ? '.html,.htm' : '.json';
      importFileInput.click();
    }
  });
  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (isBookmarksOnly(pendingImportOptions)) {
          importBookmarksFromHtml(file);
        } else {
          importData(file, pendingImportOptions);
        }
        importFileInput.value = '';
      }
    });
  }

  const aboutWebsiteBtn = document.getElementById('aboutWebsiteBtn');
  const aboutGithubBtn = document.getElementById('aboutGithubBtn');
  const aboutStoreBtn = document.getElementById('aboutStoreBtn');
  if (aboutWebsiteBtn) aboutWebsiteBtn.addEventListener('click', () => chrome.tabs.create({ url: 'https://bakinazik.github.io/markleaf/' }));
  if (aboutGithubBtn) aboutGithubBtn.addEventListener('click', () => chrome.tabs.create({ url: 'https://github.com/bakinazik/markleaf' }));
  if (aboutStoreBtn) aboutStoreBtn.addEventListener('click', () => chrome.tabs.create({ url: 'https://chromewebstore.google.com/detail/markleaf-bookmark-manager/oicclpmppdfmaplopjgjjmdnkeolmamg' }));
  const aboutVersionNumber = document.getElementById('aboutVersionNumber');
  if (aboutVersionNumber) aboutVersionNumber.textContent = chrome.runtime.getManifest().version;

  const aboutModal = document.getElementById('aboutModal');
  const settingsInfoBtn = document.getElementById('settingsInfoBtn');
  const closeAboutModal = document.getElementById('closeAboutModal');
  if (settingsInfoBtn && aboutModal) {
    settingsInfoBtn.addEventListener('click', () => aboutModal.classList.add('active'));
  }
  if (closeAboutModal && aboutModal) {
    closeAboutModal.addEventListener('click', () => { aboutModal.classList.remove('active'); refocusSettingsSearch(); });
  }

  const setI18nTexts = () => {
    addBookmarkBtn.textContent = chrome.i18n.getMessage('addBookmark');
    searchInput.placeholder = chrome.i18n.getMessage('searchPlaceholder');
    moveBtn.textContent = chrome.i18n.getMessage('moveBtnText');
    closeMoveModalBtn.textContent = chrome.i18n.getMessage('cancelButton');
    closeCreateFolderModalBtn.textContent = chrome.i18n.getMessage('cancelButton');
    createFolderInModalBtn.textContent = chrome.i18n.getMessage('createFolderModalButton');
    upButton.querySelector('span').textContent = chrome.i18n.getMessage('upFolderButton');
    closeEditModalBtn.textContent = chrome.i18n.getMessage('cancelButton');
    saveEditBtn.textContent = chrome.i18n.getMessage('saveButton');
  };
  setI18nTexts();
  initScrollToTop();
});