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


chrome.runtime.onInstalled.addListener(() => {
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