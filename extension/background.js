const TRASH_FOLDER_ID = '2';
const TRASH_PREFIX = '__TRASH__:';

function parseTrashTitle(title) {
  if (!title || !title.startsWith(TRASH_PREFIX)) return null;
  const rest = title.slice(TRASH_PREFIX.length);
  const firstColon = rest.indexOf(':');
  const ts = parseInt(rest.slice(0, firstColon), 10);
  const rest2 = rest.slice(firstColon + 1);
  const secondColon = rest2.indexOf(':');
  const parentId = rest2.slice(0, secondColon);
  const rest3 = rest2.slice(secondColon + 1);
  const thirdColon = rest3.indexOf(':');
  const index = parseInt(rest3.slice(0, thirdColon), 10);
  const originalTitle = rest3.slice(thirdColon + 1);
  return { ts, parentId, index, originalTitle };
}

async function purgeExpiredTrashItems() {
  try {
    const children = await chrome.bookmarks.getChildren(TRASH_FOLDER_ID);
    if (!children || children.length === 0) return;
    
    const now = Date.now();
    const toDelete = [];
    
    for (const item of children) {
      const parsed = parseTrashTitle(item.title);
      if (parsed) {
        const deleteTime = parsed.ts + (30 * 24 * 60 * 60 * 1000);
        if (now >= deleteTime) {
          toDelete.push(item);
        }
      }
    }
    
    for (const item of toDelete) {
      if (item.url) {
        await chrome.bookmarks.remove(item.id);
      } else {
        await chrome.bookmarks.removeTree(item.id);
      }
    }
    
    if (toDelete.length > 0) {
      console.log(`Purged ${toDelete.length} expired trash items`);
    }
  } catch (error) {
    console.error('Error purging trash:', error);
  }
}

async function setupTrashCleanupAlarm() {
  await chrome.alarms.create('purgeTrash', {
    periodInMinutes: 30,
    delayInMinutes: 0.5
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'purgeTrash') {
    purgeExpiredTrashItems();
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "donate",
    title: "Support the developer (Buy Me a Coffee)",
    contexts: ["action"]
  });
  chrome.contextMenus.create({
    id: "home",
    title: "Home page (GitHub)",
    contexts: ["action"]
  });
  chrome.contextMenus.create({
    id: "source",
    title: "Source code (GitHub)",
    contexts: ["action"]
  });
  
  await setupTrashCleanupAlarm();
  await purgeExpiredTrashItems();
});

chrome.runtime.onStartup.addListener(async () => {
  await purgeExpiredTrashItems();
  await setupTrashCleanupAlarm();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "donate":
      chrome.tabs.create({ url: "https://buymeacoffee.com/bakinazik" });
      break;
    case "home":
      chrome.tabs.create({ url: "https://bakinazik.github.io/markleaf/" });
      break;
    case "source":
      chrome.tabs.create({ url: "https://github.com/bakinazik/markleaf" });
      break;
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