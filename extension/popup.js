document.addEventListener('DOMContentLoaded', () => {
  const bookmarksList = document.getElementById('bookmarksList');
  const addBookmarkBtn = document.getElementById('addBookmark');
  const createFolderBtn = document.getElementById('createFolder');
  const searchInput = document.getElementById('searchInput');
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
  
  let allBookmarksCache = null;   
  let searchRenderToken = 0;      
  let searchDebounceTimer = null; 
  let trashSearchDebounceTimer = null; 
  const contextMenuOverlay = document.getElementById('contextMenuOverlay');
  const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>`;
  const getXIcon = (size = 18) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>`;
  const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /></svg>`;
  const folderIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-folder"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" /></svg>`;
  const folderIconLargeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" /></svg>`;
  const menuIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>`;
  const addFolderIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v4" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`;
  const questionIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 8a3.5 3.5 0 0 1 3.5 -3h1a3.5 3.5 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4" /><path d="M12 19l0 .01" /></svg>`;
  const moveIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 4l3 3l-3 3" /><path d="M18 7h-14l3 3" /><path d="M7 20l-3 -3l3 -3" /><path d="M7 17h14l-3 -3" /></svg>`;
  const gridIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;
  const listIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l11 0" /><path d="M9 12l11 0" /><path d="M9 18l11 0" /><path d="M5 6l0 .01" /><path d="M5 12l0 .01" /><path d="M5 18l0 .01" /></svg>`;
  let isSelectionMode = false;
  let selectedItemIds = new Set();
  let isTrashSelectionMode = false;
  let selectedTrashIds = new Set();
  let selectionMoveMode = false;
  let selectionFolderMode = false;
  const selectModeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="16" height="16" rx="2"/><path d="M9 12l2 2 4-4"/></svg>`;
  const checkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
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
  viewToggleIcon.innerHTML = isSelectionMode
    ? '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>'
    : '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>';

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

  svg.innerHTML = isTrashSelectionMode
    ? '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>'
    : '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>';
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
        openBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg> ${chrome.i18n.getMessage('bulkOpenSelected', [String(bookmarkNodes.length)])}`;
        openBtn.onclick = () => {
          bookmarkNodes.forEach(n => chrome.tabs.create({ url: n.url, active: false }));
          closeBulkContextMenu();
          exitSelectionMode();
        };
        menu.appendChild(openBtn);
      }
      
      const moveBtn2 = document.createElement('button');
      moveBtn2.classList.add('context-menu-item');
      moveBtn2.innerHTML = `${moveIcon} ${chrome.i18n.getMessage('bulkMoveToFolder')}`;
      moveBtn2.onclick = () => {
        closeBulkContextMenu();
        selectionMoveMode = true;
        itemToMoveId = null;
        openMoveModal();
      };
      menu.appendChild(moveBtn2);
      
      const newFolderBtn = document.createElement('button');
      newFolderBtn.classList.add('context-menu-item');
      newFolderBtn.innerHTML = `${addFolderIcon} ${chrome.i18n.getMessage('bulkNewFolderAndMove')}`;
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
      deleteBtn2.innerHTML = `${getXIcon(16)} ${chrome.i18n.getMessage('bulkDelete')}`;
      deleteBtn2.style.color = 'var(--hover-color-remove)';
      deleteBtn2.onclick = () => {
        if (deleteBtn2.dataset.state === 'initial') {
          deleteBtn2.innerHTML = `${questionIcon} ${chrome.i18n.getMessage('bulkConfirmDelete')}`;
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
      restoreBtn2.innerHTML = `${restoreIcon} ${chrome.i18n.getMessage('bulkRestoreSelected')}`;
      restoreBtn2.onclick = async () => {
        closeBulkContextMenu();
        await restoreBulkTrashItems();
        exitTrashSelectionMode();
      };
      menu.appendChild(restoreBtn2);
      
      const permDeleteBtn = document.createElement('button');
      permDeleteBtn.classList.add('context-menu-item');
      permDeleteBtn.dataset.state = 'initial';
      permDeleteBtn.innerHTML = `${deleteForeverIcon} ${chrome.i18n.getMessage('bulkDeletePermanently')}`;
      permDeleteBtn.style.color = 'var(--hover-color-remove)';
      permDeleteBtn.onclick = async () => {
        if (permDeleteBtn.dataset.state === 'initial') {
          permDeleteBtn.innerHTML = `${questionIcon} ${chrome.i18n.getMessage('bulkConfirmDelete')}`;
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
    addBookmarkBtn.innerHTML = isBookmarked ? getXIcon(18) : plusIcon;
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
        const removeItem = menuToClose.querySelector('.context-menu-item[data-state]');
        if (removeItem) {
          removeItem.dataset.state = 'initial';
          if (!menuToClose.classList.contains('trash-context-menu')) {
            removeItem.innerHTML = `${getXIcon(16)} ${chrome.i18n.getMessage('removeButton')}`;
          } else {
            removeItem.innerHTML = `${deleteForeverIcon} ${chrome.i18n.getMessage('trashDeletePermanently')}`;
            removeItem.style.color = 'var(--hover-color-remove)';
          }
        }
        if (!isMobile) {
          if (tabTrash.classList.contains('active')) trashSearchInput.focus();
          else if (tabBookmarks.classList.contains('active')) searchInput.focus();
        }
      }, 150);
    }
  }
  contextMenuOverlay.addEventListener('click', () => { closeMenu(); closeBulkContextMenu(); });

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
  const themeButtons = document.querySelectorAll('.theme-btn[data-theme]');
  const settingButtons = document.querySelectorAll('.setting-btn');
  let deleteMode = 'trash';
  let trashExpiryDays = 30;

  
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
        setToggleIcon();
        listItems(currentFolderId);
      } else if (setting === 'folderStyle') {
        isFolderStackMode = value === 'stack';
        bookmarksList.classList.toggle('folder-stack-mode', isFolderStackMode);
        chrome.storage.local.set({ isFolderStackMode });
        listItems(currentFolderId);
      }
    });
  });

  settingFolderBadgeToggle.addEventListener('change', () => {
    showFolderBadge = settingFolderBadgeToggle.checked;
    chrome.storage.local.set({ showFolderBadge });
    listItems(currentFolderId);
  });

  
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

  function showTab(tab) {
    tabBookmarks.classList.remove('active');
    tabTrash.classList.remove('active');
    tabSettings.classList.remove('active');
    bookmarksList.style.display = 'none';
    mainSection.style.display = 'none';
    upButton.style.display = 'none';
    settingsPanel.classList.remove('active');
    trashPanel.classList.remove('active');
    hideScrollToTop();
    
    if (isSelectionMode) exitSelectionMode();
    if (isTrashSelectionMode) exitTrashSelectionMode();
    if (tab === 'bookmarks') {
      tabBookmarks.classList.add('active');
      bookmarksList.style.display = '';
      mainSection.style.display = '';
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
    }
  }

  tabBookmarks.addEventListener('click', () => showTab('bookmarks'));
  tabTrash.addEventListener('click', () => showTab('trash'));
  tabSettings.addEventListener('click', () => showTab('settings'));

  const restoreIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/></svg>`;
  const deleteForeverIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></svg>`;

  
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
        iconSpan.innerHTML = folderIconSVG;
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
      menuBtn.innerHTML = menuIcon;

      const ctxMenu = document.createElement('div');
      ctxMenu.classList.add('context-menu', 'trash-context-menu');

      const restoreBtn = document.createElement('button');
      restoreBtn.classList.add('context-menu-item');
      restoreBtn.innerHTML = `${restoreIcon} ${chrome.i18n.getMessage('trashRestoreButton')}`;

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
      deleteBtn.innerHTML = `${deleteForeverIcon} ${chrome.i18n.getMessage('trashDeletePermanently')}`;
      deleteBtn.style.color = 'var(--hover-color-remove)';
      deleteBtn.dataset.state = 'initial';

      deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        if (deleteBtn.dataset.state === 'initial') {
          deleteBtn.innerHTML = `${questionIcon} ${chrome.i18n.getMessage('trashConfirmDelete')}`;
          deleteBtn.dataset.state = 'confirm';
        } else {
          closeMenu();
          if (ctxMenu && ctxMenu.parentNode) ctxMenu.remove();
          const all = await getTrashItems();
          await saveTrashItems(all.filter(i => i.id !== trashEntry.id));
          loadTrashPanel(trashSearchInput.value);
        }
      };

      const quickActionsContainer = document.createElement('div');
      quickActionsContainer.classList.add('quick-actions');

      const copyLinkBtn = document.createElement('button');
      copyLinkBtn.classList.add('quick-action-btn');
      copyLinkBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>`;
      copyLinkBtn.title = chrome.i18n.getMessage('copyLinkButton');
      copyLinkBtn.onclick = (e) => {
        e.stopPropagation();
        if (trashEntry.url) navigator.clipboard.writeText(trashEntry.url);
        closeMenu();
      };

      const openInCurrentTabBtn = document.createElement('button');
      openInCurrentTabBtn.classList.add('quick-action-btn');
      openInCurrentTabBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 21v-4a3 3 0 0 1 3 -3h5" /><path d="M9 17l3 -3l-3 -3" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 11v-6a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-9.5" /></svg>`;
      openInCurrentTabBtn.title = chrome.i18n.getMessage('openInCurrentTab');
      openInCurrentTabBtn.onclick = (e) => {
        e.stopPropagation();
        if (trashEntry.url) chrome.tabs.update({ url: trashEntry.url });
        closeMenu();
      };

      const openInNewTabBtn = document.createElement('button');
      openInNewTabBtn.classList.add('quick-action-btn');
      openInNewTabBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg>`;
      openInNewTabBtn.title = chrome.i18n.getMessage('openInNewTab');
      openInNewTabBtn.onclick = (e) => {
        e.stopPropagation();
        if (trashEntry.url) chrome.tabs.create({ url: trashEntry.url, active: false });
        closeMenu();
      };

      quickActionsContainer.appendChild(copyLinkBtn);
      quickActionsContainer.appendChild(openInCurrentTabBtn);
      quickActionsContainer.appendChild(openInNewTabBtn);

      if (!trashEntry.url) {
        quickActionsContainer.style.display = 'none';
      }

      ctxMenu.appendChild(restoreBtn);
      ctxMenu.appendChild(deleteBtn);
      ctxMenu.appendChild(quickActionsContainer);

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
        deleteBtn.innerHTML = `${deleteForeverIcon} ${chrome.i18n.getMessage('trashDeletePermanently')}`;
        deleteBtn.style.color = 'var(--hover-color-remove)';
      };

      bookmarkButtons.appendChild(menuBtn);
      
      const selCheck = document.createElement('div');
      selCheck.classList.add('sel-check');
      selCheck.innerHTML = checkSVG;
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
    trashSearchDebounceTimer = setTimeout(() => {
      loadTrashPanel(trashSearchInput.value);
    }, 100);
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
  };

  function updateSettingsUI() {
    settingFolderBadgeToggle.checked = showFolderBadge;
    const htmlCls = document.documentElement.classList;
    let currentTheme = 'auto';
    if (htmlCls.contains('theme-force-dark')) currentTheme = 'dark';
    else if (htmlCls.contains('theme-force-light')) currentTheme = 'light';
    themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === currentTheme));
    const viewVal = isGridView ? 'grid' : 'list';
    const folderStyleVal = isFolderStackMode ? 'stack' : 'icon';
    document.querySelectorAll('.setting-btn[data-setting="view"]').forEach(b => b.classList.toggle('active', b.dataset.value === viewVal));
    document.querySelectorAll('.setting-btn[data-setting="folderStyle"]').forEach(b => b.classList.toggle('active', b.dataset.value === folderStyleVal));
    document.querySelectorAll('.setting-btn[data-setting="deleteMode"]').forEach(b => b.classList.toggle('active', b.dataset.value === deleteMode));
    document.querySelectorAll('.setting-btn[data-setting="trashExpiry"]').forEach(b => b.classList.toggle('active', parseInt(b.dataset.value, 10) === trashExpiryDays));
    
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

  function applyTheme(theme) {
    document.documentElement.classList.remove('theme-force-dark', 'theme-force-light');
    if (theme === 'dark') document.documentElement.classList.add('theme-force-dark');
    else if (theme === 'light') document.documentElement.classList.add('theme-force-light');
  }

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      applyTheme(theme);
      chrome.storage.local.set({ appTheme: theme });
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
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
        allItems = children;
        if (allItems.length > 0) {
          allItems.forEach((node) => {
            let precomputedData = {};
            if (!node.url) {
              precomputedData.count = countItemsInSubtree(node);
              precomputedData.faviconUrls = collectFaviconsFromTree(node, 4);
            }
            const listItem = createListItem(node, precomputedData);
            if (newlyAddedId && node.id === newlyAddedId) {
              listItem.classList.add('item-new');
            }
            bookmarksList.appendChild(listItem);
          });
        } else {
          appendEmptyMessage(chrome.i18n.getMessage('noBookmarksMessage'));
        }
      } else {
        appendEmptyMessage(chrome.i18n.getMessage('noBookmarksMessage'));
      }
      if (allItems.length > 1 && searchInput.value === '') {
        window.bookmarksSortable = new Sortable(bookmarksList, {
          animation: 150,
          onEnd: function (evt) {
            const newOrder = Array.from(bookmarksList.children)
              .filter(el => el.dataset.bookmarkId)
              .map(item => item.dataset.bookmarkId);
            newOrder.forEach((itemId, index) => {
              chrome.bookmarks.move(itemId, { index: index });
            });
            allItems.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
          }
        });
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
  function createListItem(node, precomputedData = {}) {
    const listItem = document.createElement('li');
    listItem.dataset.bookmarkId = node.id;
    listItem.classList.add(node.url ? 'bookmark-item' : 'folder-item');
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
        if (event.ctrlKey || event.metaKey) { chrome.tabs.create({ url: node.url, active: false }); return false; }
        if (event.shiftKey) { chrome.windows.create({ url: node.url }); return false; }
        chrome.tabs.update({ url: node.url }); return false;
      });
      link.addEventListener('auxclick', (event) => {
        if (event.button === 1) {
          event.preventDefault(); event.stopPropagation();
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
      icon.appendChild(img);
    } else {
      icon.innerHTML = folderIconSVG;
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
        gridIconWrap.innerHTML = folderIconLargeSVG;
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
    menuBtn.innerHTML = menuIcon;
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    const editMenuItem = document.createElement('button');
    editMenuItem.classList.add('context-menu-item');
    editMenuItem.innerHTML = `${editIcon} ${chrome.i18n.getMessage('editButton')}`;
    const moveMenuItem = document.createElement('button');
    moveMenuItem.classList.add('context-menu-item');
    moveMenuItem.innerHTML = `${moveIcon} ${chrome.i18n.getMessage('moveButton')}`;
    const removeMenuItem = document.createElement('button');
    removeMenuItem.classList.add('context-menu-item');
    removeMenuItem.innerHTML = `${getXIcon(16)} ${chrome.i18n.getMessage('removeButton')}`;
    removeMenuItem.dataset.state = 'initial';
    const createFolderMenuItem = document.createElement('button');
    createFolderMenuItem.classList.add('context-menu-item');
    createFolderMenuItem.innerHTML = `${addFolderIcon} ${chrome.i18n.getMessage('createFolderButton')}`;
    contextMenu.appendChild(editMenuItem);
    contextMenu.appendChild(moveMenuItem);
    contextMenu.appendChild(removeMenuItem);
    contextMenu.appendChild(createFolderMenuItem);
    const addCurrentSiteMenuItem = document.createElement('button');
    addCurrentSiteMenuItem.classList.add('context-menu-item');
    addCurrentSiteMenuItem.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg> ${chrome.i18n.getMessage(node.url ? 'addCurrentSiteButton' : 'addCurrentSiteToFolderButton')}`;
    contextMenu.appendChild(addCurrentSiteMenuItem);
    addCurrentSiteMenuItem.onclick = (event) => {
      event.stopPropagation();
      closeMenu();
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.bookmarks.create({
          parentId: node.url ? node.parentId : node.id,
          title: tab.title,
          url: tab.url,
          index: node.url ? node.index + 1 : undefined
        }, () => listItems(currentFolderId));
      });
    };
    if (!node.url) {
      const openAllMenuItem = document.createElement('button');
      openAllMenuItem.classList.add('context-menu-item');
      openAllMenuItem.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg> ${chrome.i18n.getMessage('confirmOpenAllTitle')}`;
      openAllMenuItem.onclick = (event) => {
        event.stopPropagation();
        closeMenu();
        confirmOpenAllBookmarks(node.title, node.id);
      };
      contextMenu.appendChild(openAllMenuItem);
    }
    if (node.url) {
      const quickActionsContainer = document.createElement('div');
      quickActionsContainer.classList.add('quick-actions');
      const copyLinkBtn = document.createElement('button');
      copyLinkBtn.classList.add('quick-action-btn');
      copyLinkBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>`;
      copyLinkBtn.title = chrome.i18n.getMessage('copyLinkButton');
      copyLinkBtn.onclick = (event) => { event.stopPropagation(); closeMenu(); navigator.clipboard.writeText(node.url); };
      const openInCurrentTabBtn = document.createElement('button');
      openInCurrentTabBtn.classList.add('quick-action-btn');
      openInCurrentTabBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 21v-4a3 3 0 0 1 3 -3h5" /><path d="M9 17l3 -3l-3 -3" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 11v-6a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-9.5" /></svg>`;
      openInCurrentTabBtn.title = chrome.i18n.getMessage('openInCurrentTab');
      openInCurrentTabBtn.onclick = (event) => { event.stopPropagation(); closeMenu(); chrome.tabs.update({ url: node.url }); };
      const openInNewTabBtn = document.createElement('button');
      openInNewTabBtn.classList.add('quick-action-btn');
      openInNewTabBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg>`;
      openInNewTabBtn.title = chrome.i18n.getMessage('openInNewTab');
      openInNewTabBtn.onclick = (event) => { event.stopPropagation(); closeMenu(); chrome.tabs.create({ url: node.url, active: false }); };
      quickActionsContainer.appendChild(copyLinkBtn);
      quickActionsContainer.appendChild(openInCurrentTabBtn);
      quickActionsContainer.appendChild(openInNewTabBtn);
      contextMenu.appendChild(quickActionsContainer);
    }
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
      const thisRemoveItem = contextMenu.querySelector('.context-menu-item[data-state]');
      if (thisRemoveItem) {
        thisRemoveItem.dataset.state = 'initial';
        thisRemoveItem.innerHTML = `${getXIcon(16)} ${chrome.i18n.getMessage('removeButton')}`;
      }
    };
    editMenuItem.onclick = (event) => {
      event.stopPropagation(); closeMenu();
      itemToEditId = node.id;
      openEditModal(node);
    };
    moveMenuItem.onclick = (event) => {
      event.stopPropagation(); closeMenu();
      itemToMoveId = node.id;
      openMoveModal();
    };
    removeMenuItem.onclick = (event) => {
      event.stopPropagation();
      if (removeMenuItem.dataset.state === 'initial') {
        removeMenuItem.innerHTML = `${questionIcon} ${chrome.i18n.getMessage('confirmRemoval')}`;
        removeMenuItem.dataset.state = 'confirm';
      } else if (removeMenuItem.dataset.state === 'confirm') {
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
    };
  createFolderMenuItem.onclick = (event) => {
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
  };
    link.appendChild(icon);
    link.appendChild(titleDiv);
    bookmarkButtons.appendChild(menuBtn);
    listItem.appendChild(link);
    
    const selCheck = document.createElement('div');
    selCheck.classList.add('sel-check');
    selCheck.innerHTML = checkSVG;
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
    const isOpera = navigator.userAgent.includes('OPR') || navigator.userAgent.includes('Opera');
    if (!isOpera) {
      const faviconUrl = new URL(`chrome-extension://${chrome.runtime.id}/_favicon/`);
      faviconUrl.searchParams.set('pageUrl', url);
      faviconUrl.searchParams.set('size', String(size));
      return faviconUrl.href;
    } else {
      try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
      } catch { return `https://www.google.com/s2/favicons?domain=google.com&sz=${size}`; }
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
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.bookmarks.create({
          parentId: currentFolderId,
          title: tab.title,
          url: tab.url,
          index: allItems.length
        }, (newBookmark) => {
          currentBookmarkId = newBookmark.id;
          updateAddBookmarkButton(true);
          listItems(currentFolderId, newBookmark.id);
        });
      });
    }
  });
  createFolderBtn.addEventListener('click', () => {
    newFolderParentId = currentFolderId;
    newFolderIndex = allItems.length;
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
    if (folderStack.length > 1) {
      upButton.style.display = 'flex';
      addBookmarkBtn.style.display = 'flex';
      header.style.justifyContent = 'space-between';
    } else {
      upButton.style.display = 'none';
      addBookmarkBtn.style.display = 'flex';
      header.style.justifyContent = 'flex-end';
    }
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
    createFolderBtn.style.display = 'none';
    header.style.justifyContent = 'center';

    
    searchDebounceTimer = setTimeout(() => {
      const doSearch = () => {
        const results = allBookmarksCache.filter(item =>
          item.title.toLowerCase().includes(searchTerm) ||
          (item.url && item.url.toLowerCase().includes(searchTerm))
        );
        renderSearchResultsProgressive(results);
      };

      if (allBookmarksCache) {
        doSearch();
      } else {
        buildBookmarksCache(doSearch);
      }
    }, 100);
  });
  
  chrome.storage.local.get(['folderStack', 'isGridView', 'isFolderStackMode', 'appTheme', 'defaultFolderId', 'deleteMode', 'trashExpiryDays', 'showFolderBadge'], (data) => {
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
    if (isFolderStackMode) bookmarksList.classList.add('folder-stack-mode');
    if (data.appTheme) applyTheme(data.appTheme);
    deleteMode = data.deleteMode || 'trash';
    trashExpiryDays = data.trashExpiryDays || 30;
    showFolderBadge = data.showFolderBadge !== undefined ? !!data.showFolderBadge : true;
    tabTrash.style.display = deleteMode === 'trash' ? '' : 'none';
    setToggleIcon();
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
            li.innerHTML = `${folderIconSVG} ${node.title}`;
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
  
  async function exportData() {
    const storageData = await new Promise(resolve => {
      chrome.storage.local.get(
        ['deleteMode', 'trashExpiryDays', 'isGridView', 'isFolderStackMode', 'appTheme', 'showFolderBadge', TRASH_STORAGE_KEY],
        resolve
      );
    });
    const bookmarksTree = await new Promise(resolve => chrome.bookmarks.getTree(resolve));
    const exportObj = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: {
        deleteMode: storageData.deleteMode || 'trash',
        trashExpiryDays: storageData.trashExpiryDays || 30,
        isGridView: storageData.isGridView || false,
        isFolderStackMode: storageData.isFolderStackMode || false,
        appTheme: storageData.appTheme || 'auto',
        showFolderBadge: storageData.showFolderBadge !== undefined ? storageData.showFolderBadge : true
      },
      trash: storageData[TRASH_STORAGE_KEY] || [],
      bookmarks: bookmarksTree
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

  async function importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version || !data.settings) throw new Error('Invalid format');

      const confirmed = await showImportConfirmModal();
      if (!confirmed) return;

      
      const s = data.settings;
      await new Promise(resolve => chrome.storage.local.set(s, resolve));
      deleteMode = s.deleteMode || 'trash';
      trashExpiryDays = s.trashExpiryDays || 30;
      isGridView = !!s.isGridView;
      isFolderStackMode = !!s.isFolderStackMode;
      showFolderBadge = s.showFolderBadge !== undefined ? !!s.showFolderBadge : true;
      if (s.appTheme) applyTheme(s.appTheme);

      
      if (Array.isArray(data.trash)) {
        await saveTrashItems(data.trash);
      }

      
      if (data.bookmarks && Array.isArray(data.bookmarks)) {
        
        
        const root = data.bookmarks[0];
        let sourceChildren = null;

        
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
        sourceChildren = bookmarksBar?.children || root?.children || [];

        if (sourceChildren.length > 0) {
          
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
      }

      
      tabTrash.style.display = deleteMode === 'trash' ? '' : 'none';
      setToggleIcon();
      updateSettingsUI();
      folderStack = ['1'];
      currentFolderId = '1';
      listItems(currentFolderId);
    } catch (err) {
      console.error('Import error:', err);
    }
  }

  function showImportConfirmModal() {
    return new Promise(resolve => {
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

  if (exportBtn) exportBtn.addEventListener('click', () => exportData());
  if (importBtn) importBtn.addEventListener('click', () => importFileInput.click());
  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) { importData(file); importFileInput.value = ''; }
    });
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