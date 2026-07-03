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
});

chrome.action.onClicked.addListener((tab) => {
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
        alert('Please pick a folder!');
      }
    }
  });
});
