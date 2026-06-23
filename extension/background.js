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

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get(['directAdd', 'selectedFolder'], (data) => {
    if (data.directAdd) {
      const selectedFolder = data.selectedFolder;
      if (selectedFolder) {
        chrome.bookmarks.create({
          parentId: selectedFolder,
          title: tab.title,
          url: tab.url
        });
      } else {
        alert('Please pick a folder!');
      }
    }
  });
});
