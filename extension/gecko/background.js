const ICON_PATHS = {
  colorful: { 16: 'icons/16.png', 32: 'icons/32.png', 48: 'icons/48.png', 128: 'icons/128.png' },
  black:    { 16: 'icons/black/16.png', 32: 'icons/black/32.png', 48: 'icons/black/48.png', 128: 'icons/black/128.png' },
  white:    { 16: 'icons/white/16.png', 32: 'icons/white/32.png', 48: 'icons/white/48.png', 128: 'icons/white/128.png' },
  gray:     { 16: 'icons/gray/16.png', 32: 'icons/gray/32.png', 48: 'icons/gray/48.png', 128: 'icons/gray/128.png' },
};

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function applyIconStyle(style, customDataUrls) {
  if (style === 'custom' && customDataUrls) {
    const sizes = [16, 32, 48, 128];
    const imageData = {};
    await Promise.all(sizes.map(async size => {
      const blob = dataUrlToBlob(customDataUrls[size]);
      const bmp = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bmp, 0, 0, size, size);
      imageData[size] = ctx.getImageData(0, 0, size, size);
    }));
    await chrome.action.setIcon({ imageData });
  } else {
    const paths = ICON_PATHS[style] || ICON_PATHS.colorful;
    await chrome.action.setIcon({ path: paths });
  }
}

async function restoreIcon() {
  const data = await chrome.storage.local.get(['extensionIconStyle', 'customIconData']);
  const style = data.extensionIconStyle || 'colorful';
  await applyIconStyle(style, data.customIconData || null);
}

chrome.runtime.onStartup.addListener(() => {
  restoreIcon();
});

chrome.runtime.onInstalled.addListener(() => {
  restoreIcon();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SET_EXTENSION_ICON') {
    applyIconStyle(msg.style, msg.customData || null)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }
});

let pinnedIds = new Set();
let isFixingPinOrder = false;

async function loadPinnedIds() {
  const data = await chrome.storage.local.get(['pinnedBookmarks']);
  pinnedIds = new Set(Array.isArray(data.pinnedBookmarks) ? data.pinnedBookmarks : []);
}
loadPinnedIds();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pinnedBookmarks) {
    pinnedIds = new Set(Array.isArray(changes.pinnedBookmarks.newValue) ? changes.pinnedBookmarks.newValue : []);
  }
});

async function enforcePinOrder(parentId) {
  if (isFixingPinOrder || pinnedIds.size === 0 || !parentId) return;
  try {
    const siblings = await chrome.bookmarks.getChildren(parentId);
    if (!siblings || siblings.length < 2) return;
    const pinnedSiblings = siblings.filter(s => pinnedIds.has(s.id));
    if (pinnedSiblings.length === 0) return;
    const isCorrect = siblings.slice(0, pinnedSiblings.length).every(s => pinnedIds.has(s.id));
    if (isCorrect) return;
    isFixingPinOrder = true;
    for (let i = 0; i < pinnedSiblings.length; i++) {
      await chrome.bookmarks.move(pinnedSiblings[i].id, { parentId, index: i });
    }
  } catch (e) {

  } finally {
    isFixingPinOrder = false;
  }
}

chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
  if (isFixingPinOrder) return;
  enforcePinOrder(moveInfo.parentId);
});

chrome.bookmarks.onRemoved.addListener((id) => {
  if (pinnedIds.has(id)) {
    pinnedIds.delete(id);
    chrome.storage.local.set({ pinnedBookmarks: Array.from(pinnedIds) });
  }
  chrome.storage.local.get(['folderStack', 'lastVisitedFolderStack', 'defaultFolderId'], (data) => {
    const updates = {};
    if (Array.isArray(data.lastVisitedFolderStack)) {
      const idx = data.lastVisitedFolderStack.indexOf(id);
      if (idx !== -1) {
        const trimmed = data.lastVisitedFolderStack.slice(0, idx);
        updates.lastVisitedFolderStack = trimmed.length > 1 ? trimmed : null;
      }
    }
    if (Array.isArray(data.folderStack)) {
      const idx = data.folderStack.indexOf(id);
      if (idx !== -1) {
        const trimmed = data.folderStack.slice(0, idx);
        updates.folderStack = trimmed.length > 0 ? trimmed : [data.defaultFolderId || '1'];
      }
    }
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }
  });
});

console.log('[Markleaf][bg] background script loaded');
const FAVICON_CACHE_KEY = 'faviconCache';
const MAX_FAVICON_CACHE_ENTRIES = 1500;
function faviconHostname(url) {
  try { return new URL(url).hostname; } catch { return null; }
}
async function blobToDataUrl(blob) {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return `data:${blob.type || 'image/x-icon'};base64,${btoa(binary)}`;
}

const faviconFetchedFrom = {};
async function persistFaviconIcon(host, iconUrl) {
  if (!host || !iconUrl) {
    console.log('[Markleaf][bg] persistFaviconIcon skipped (missing host/iconUrl)', host, iconUrl);
    return;
  }
  if (faviconFetchedFrom[host] === iconUrl) {
    console.log('[Markleaf][bg] persistFaviconIcon skipped (already fetched this exact icon)', host);
    return;
  }
  faviconFetchedFrom[host] = iconUrl;
  const saveToCache = async (dataUrl) => {
    const cache = await new Promise((resolve) => {
      chrome.storage.local.get([FAVICON_CACHE_KEY], (d) => resolve((d && d[FAVICON_CACHE_KEY]) || {}));
    });
    cache[host] = { d: dataUrl, t: Date.now() };
    const hosts = Object.keys(cache);
    if (hosts.length > MAX_FAVICON_CACHE_ENTRIES) {
      hosts.sort((a, b) => (cache[a] && cache[a].t || 0) - (cache[b] && cache[b].t || 0));
      hosts.slice(0, hosts.length - MAX_FAVICON_CACHE_ENTRIES).forEach((h) => delete cache[h]);
    }
    chrome.storage.local.set({ [FAVICON_CACHE_KEY]: cache }, () => {
      console.log('[Markleaf][bg] favicon SAVED for', host, '— cache size:', Object.keys(cache).length);
    });
  };

  if (iconUrl.startsWith('data:')) {
    console.log('[Markleaf][bg] favicon for', host, 'was already inline data: — storing directly');
    await saveToCache(iconUrl);
    return;
  }
  if (!/^https?:/.test(iconUrl)) {
    console.log('[Markleaf][bg] persistFaviconIcon skipped (unsupported scheme)', host, iconUrl);
    return;
  }
  console.log('[Markleaf][bg] fetching favicon for', host, 'from', iconUrl);
  try {
    const res = await fetch(iconUrl);
    console.log('[Markleaf][bg] fetch response for', host, '→ status', res.status, 'ok:', res.ok);
    if (!res.ok) return;
    const blob = await res.blob();
    console.log('[Markleaf][bg] blob for', host, '→ size:', blob.size, 'type:', blob.type);
    if (blob.size === 0) return;
    const dataUrl = await blobToDataUrl(blob);
    await saveToCache(dataUrl);
  } catch (e) {
    console.warn('[Markleaf][bg] could not fetch favicon for', host, e);
  }
}
function cacheFaviconForTab(tab) {
  if (!tab || !tab.url || !tab.favIconUrl) {
    console.log('[Markleaf][bg] cacheFaviconForTab: no favIconUrl on tab', tab && tab.url);
    return;
  }
  const host = faviconHostname(tab.url);
  if (host) persistFaviconIcon(host, tab.favIconUrl);
}

const pendingOriginHosts = {};
chrome.tabs.onRemoved.addListener((tabId) => { delete pendingOriginHosts[tabId]; });

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg) return;
  if (msg.type === 'trackBookmarkTab' && msg.tabId != null && msg.originHost) {
    console.log('[Markleaf][bg] tracking tab', msg.tabId, 'for bookmark host', msg.originHost);
    pendingOriginHosts[msg.tabId] = msg.originHost;
  } else if (msg.type === 'cacheFaviconForTab' && msg.tab) {
    console.log('[Markleaf][bg] got cacheFaviconForTab message for', msg.tab.url);
    cacheFaviconForTab(msg.tab);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.favIconUrl) return;
  console.log('[Markleaf][bg] onUpdated favIconUrl for tab', tabId, '→', changeInfo.favIconUrl, '(tab.url:', tab.url, ')');
  const finalHost = faviconHostname(tab.url);
  if (finalHost) persistFaviconIcon(finalHost, changeInfo.favIconUrl);
  const originHost = pendingOriginHosts[tabId];
  if (originHost && originHost !== finalHost) persistFaviconIcon(originHost, changeInfo.favIconUrl);
});

chrome.action.onClicked.addListener((tab) => {
  cacheFaviconForTab(tab);
  chrome.storage.local.get(['directAdd', 'selectedFolder', 'newItemPosition'], async (data) => {
    if (data.directAdd) {
      const selectedFolder = data.selectedFolder;
      if (selectedFolder) {
        let index;
        if (data.newItemPosition === 'start') {
          try {
            const siblings = await chrome.bookmarks.getChildren(selectedFolder);
            index = siblings.filter(s => pinnedIds.has(s.id)).length;
          } catch (e) {
            index = undefined;
          }
        }
        chrome.bookmarks.create({
          parentId: selectedFolder,
          title: tab.title,
          url: tab.url,
          index
        });
      } else {

        console.warn('Markleaf: "Add directly" is on but no target folder is selected.');
      }
    }
  });
});
