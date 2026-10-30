import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let overlayWindow = null;
let autoDismissTimeout = null;

export function createOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    return overlayWindow;
  }

  overlayWindow = new BrowserWindow({
    width: 380,
    height: 480,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Always keep on top of normal Windows applications (VS Code, Chrome, YouTube, Notepad)
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');

  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

export function showOverlayNotification(payload, settings = {}) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    createOverlayWindow();
  }

  // Clear previous auto-dismiss
  if (autoDismissTimeout) {
    clearTimeout(autoDismissTimeout);
    autoDismissTimeout = null;
  }

  // Reposition window based on display settings
  positionOverlay(settings.popupPosition || 'top-right');

  overlayWindow.webContents.send('overlay:data', payload);
  overlayWindow.showInactive();

  const durationSec = settings.popupDuration !== undefined ? Number(settings.popupDuration) : 15;
  if (durationSec > 0) {
    autoDismissTimeout = setTimeout(() => {
      dismissOverlay();
    }, durationSec * 1000);
  }
}

export function dismissOverlay() {
  if (autoDismissTimeout) {
    clearTimeout(autoDismissTimeout);
    autoDismissTimeout = null;
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide();
  }
}

function positionOverlay(position = 'top-right') {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workArea;
  const [winWidth, winHeight] = overlayWindow.getSize();

  const margin = 24;
  let x = screenWidth - winWidth - margin;
  let y = margin;

  switch (position) {
    case 'top-left':
      x = margin;
      y = margin;
      break;
    case 'bottom-left':
      x = margin;
      y = screenHeight - winHeight - margin;
      break;
    case 'bottom-right':
      x = screenWidth - winWidth - margin;
      y = screenHeight - winHeight - margin;
      break;
    case 'center':
      x = Math.round((screenWidth - winWidth) / 2);
      y = Math.round((screenHeight - winHeight) / 2);
      break;
    case 'top-right':
    default:
      x = screenWidth - winWidth - margin;
      y = margin;
      break;
  }

  overlayWindow.setPosition(x, y);
}

export function getOverlayWindow() {
  return overlayWindow;
}
