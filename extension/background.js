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
