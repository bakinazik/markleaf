(function () {
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode') === 'import' ? 'import' : 'icon';
  const importKind = params.get('kind') === 'bookmarksOnly' ? 'bookmarksOnly' : 'full';

  const status = document.getElementById('status');
  const intro = document.getElementById('intro');
  const fileInput = document.getElementById('fileInput');
  const cropCanvas = document.getElementById('cropCanvas');

  function initIconMode() {
    const ICON_SIZES = [16, 32, 48, 128];

    function processImageToIcons(dataUrl) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const icons = {};
          ICON_SIZES.forEach(size => {
            cropCanvas.width = size;
            cropCanvas.height = size;
            const ctx = cropCanvas.getContext('2d');
            ctx.clearRect(0, 0, size, size);
            const side = Math.min(img.width, img.height);
            const sx = (img.width - side) / 2;
            const sy = (img.height - side) / 2;
            ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
            icons[size] = cropCanvas.toDataURL('image/png');
          });
          resolve(icons);
        };
        img.onerror = () => reject(new Error('Invalid image'));
        img.src = dataUrl;
      });
    }

    fileInput.accept = 'image/*';
    intro.textContent = chrome.i18n.getMessage('settingIconPickerIntro');

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        status.textContent = chrome.i18n.getMessage('settingIconInvalidFile');
        return;
      }
      status.textContent = chrome.i18n.getMessage('settingIconProcessing');
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const icons = await processImageToIcons(e.target.result);
          chrome.storage.local.set({ customIconData: icons, extensionIconStyle: 'custom' }, () => {
            chrome.runtime.sendMessage({ type: 'SET_EXTENSION_ICON', style: 'custom', customData: icons });
            window.close();
          });
        } catch (err) {
          status.textContent = chrome.i18n.getMessage('settingIconProcessFailed');
        }
      };
      reader.onerror = () => {
        status.textContent = chrome.i18n.getMessage('settingIconProcessFailed');
      };
      reader.readAsDataURL(file);
    });

    fileInput.focus();
  }

  function initImportMode() {
    fileInput.accept = importKind === 'bookmarksOnly' ? '.html,.htm' : '.json';
    intro.textContent = chrome.i18n.getMessage('filePickerImportIntro');

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      status.textContent = chrome.i18n.getMessage('filePickerImportReading');
      const reader = new FileReader();
      reader.onload = () => {
        const payload = {
          kind: importKind,
          text: reader.result,
          filename: file.name,
          ts: Date.now()
        };
        chrome.storage.local.set({ pendingImportPayload: payload }, () => {
          chrome.runtime.sendMessage({ type: 'IMPORT_FILE_READY' });
          window.close();
        });
      };
      reader.onerror = () => {
        status.textContent = chrome.i18n.getMessage('filePickerImportFailed');
      };
      reader.readAsText(file);
    });

    fileInput.focus();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (mode === 'import') {
      initImportMode();
    } else {
      initIconMode();
    }
  });
})();
