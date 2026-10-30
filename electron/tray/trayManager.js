import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSettings, updateSetting } from '../database/repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray = null;

export function createTray({ mainWindow, onQuickAddWater }) {
  if (tray) return tray;

  // Create tray icon from 16x16 / 32x32 transparent canvas/buffer
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('RIO — Your Little Reminder Buddy');

  updateTrayMenu(mainWindow, onQuickAddWater);

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });

  return tray;
}

export function updateTrayMenu(mainWindow, onQuickAddWater) {
  if (!tray) return;

  const settings = getSettings();
  const notificationsOn = Number(settings.notificationEnabled) === 1;
  const focusOn = Number(settings.focusModeEnabled) === 1;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open RIO Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: notificationsOn ? '✓ Notifications: ON' : 'Notifications: OFF',
      click: () => {
        const newVal = notificationsOn ? 0 : 1;
        updateSetting('notificationEnabled', newVal);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('settings:updated', getSettings());
        }
        updateTrayMenu(mainWindow, onQuickAddWater);
      },
    },
    {
      label: focusOn ? '✓ Focus Mode: ACTIVE' : 'Activate Focus Mode',
      click: () => {
        const newVal = focusOn ? 0 : 1;
        updateSetting('focusModeEnabled', newVal);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('settings:updated', getSettings());
        }
        updateTrayMenu(mainWindow, onQuickAddWater);
      },
    },
    { type: 'separator' },
    {
      label: 'Quick Add Water (+250 ml)',
      click: () => {
        if (typeof onQuickAddWater === 'function') {
          onQuickAddWater(250);
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Exit RIO',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function createTrayIcon() {
  // Generate a 16x16 clean blue water droplet icon as raw PNG buffer
  // Minimal valid 16x16 PNG representation
  const pngBase64 = 
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8' +
    'YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACNSURBVDhPY/wPBAwUACaoeoxACgP4dDExMAApRjTFyABd' +
    'M4oBxI6mGAYYwNnIAF0zugHIZvDgV8fAwACzCGU1igGEtXF5l5GBgQGkBq8L0DWDg/F5E4zPioGBgQFn' +
    'XEC+gfMh2vEZBvBhxGkAF8b/b0F8FIBL478FkG/w6ccXG3B6k0R9DAwMAB4Zk5j4l6hDAAAAAElFTkSu' +
    'QmCC';
  const buffer = Buffer.from(pngBase64, 'base64');
  return nativeImage.createFromBuffer(buffer);
}
