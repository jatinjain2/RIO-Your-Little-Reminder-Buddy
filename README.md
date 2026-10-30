# 💧 RIO — Your Little Reminder Buddy
> **A cute, offline-first personal desktop companion for Windows that tracks hydration, manages custom drinking containers, schedules productivity reminders, and displays interactive floating overlays over active desktop applications.**

---

## 🌟 Key Features

### 1. 💧 Smart Hydration Tracking
- **Custom ML Input**: Log any exact positive volume (e.g., 50 ml, 175 ml, 275 ml, 650 ml, 1200 ml) with immediate validation.
- **Custom Drinking Containers**: Default containers (*Small Glass 150ml, Normal Glass 250ml, Large Glass 350ml, Bottle 500ml, Large Bottle 750ml, Water Jug 1000ml*) plus unlimited user-defined containers with custom capacities, colors, and default serving assignment.
- **Custom Date & Timestamp Entry**: Allows logging water for earlier times today or previous dates (e.g. drank at 11:30 AM, recorded at 12:15 PM) without misallocating water across days.
- **Accurate Calculations**: Real-time tracking of consumed water, remaining water, progress percentage (> 100% celebration state), and estimated servings remaining.

### 2. 🪟 Interactive Floating Desktop Overlays
- **Always-on-Top Frameless Window**: Floats unobtrusively over normal Windows software (Google Chrome, YouTube, VS Code, Notepad, Word, etc.).
- **Direct Action Buttons**:
  - `+100 ml`, `+250 ml`, `+500 ml` quick add.
  - Interactive **+ Custom ML** input directly inside the popup.
  - Snooze reminder (5m, 10m, 15m).
  - Safe Dismiss (`✕` / `Close`) without false data logging.

### 3. 🛡️ Master Notification Switch & Focus Mode
- **Master Kill-Switch ("Rio Popups")**: One click globally suppresses every floating popup and audio chime across Windows. Accessible from Header, Dashboard, Settings, and System Tray.
- **Focus Mode ("No Interruptions")**: Dedicated examination & deep-work mode that silences notifications while keeping background timers and manual logging operational.
- **Occurrence Deduplication**: Database-backed occurrence tracking prevents duplicate popups and prevents backlog floods when waking from sleep or restarting.

### 4. ⏰ Task & Productivity Reminders
- Schedule personal or professional reminders for meetings, study sessions, exams, calls, or deadlines.
- Supports flexible recurrences: **Once**, **Daily**, **Selected Weekdays (Mon-Fri)**, and **Weekly**.
- Full lifecycle: mark completed, edit, delete, snooze, and view execution history.

### 5. 🔒 Offline-First & Privacy Guaranteed
- **Local SQLite Engine**: 100% local database storage. Zero mandatory accounts, zero telemetry, and works completely offline.
- **JSON & CSV Backups**: One-click database export and restoration.

---

## 📐 Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Desktop**: Electron 34, Preload IPC Bridge (`contextIsolation: true`, `nodeIntegration: false`), Windows System Tray, Frameless Always-On-Top `BrowserWindow`.
- **Database**: Pure SQLite implementation (`sql.js`) with disk persistence and schema migrations.
- **Testing**: Automated Vitest suite for calculations, duplicate prevention, and scheduler gating.

```
rio/
├── electron/
│   ├── database/
│   │   ├── db.js                 # SQLite engine with disk persistence
│   │   └── repository.js         # Repositories for Water, Containers, Reminders, Settings
│   ├── scheduler/
│   │   └── reminderScheduler.js  # Main process scheduler with sleep/wake & gating
│   ├── tray/
│   │   └── trayManager.js        # Windows System Tray & Context Menu
│   ├── windows/
│   │   ├── overlayWindow.js      # Always-on-top frameless floating overlay controller
│   │   └── overlay.html          # HTML/CSS view for floating reminder
│   ├── main.js                   # Electron main process & IPC handlers
│   └── preload.js                # Context-isolated secure bridge
├── src/
│   ├── components/
│   │   ├── layout/               # Sidebar & Header
│   │   ├── mascot/               # RioMascot SVG expressions
│   │   └── modals/               # Custom ML, Containers, Reminders
│   ├── context/
│   │   └── RioContext.jsx        # React Provider with real-time IPC synchronization
│   ├── pages/
│   │   ├── Dashboard.jsx         # Live stats, timelines, next reminder
│   │   ├── WaterTracker.jsx      # Goals, containers CRUD, chronological logs
│   │   ├── Reminders.jsx         # Task manager with recurrences
│   │   ├── CalendarView.jsx      # Monthly habit & planner view
│   │   ├── Statistics.jsx        # Recharts hydration analytics
│   │   └── SettingsPage.jsx      # Gating, intervals, positions, backups
│   ├── services/
│   │   └── waterCalculator.js    # Hydration math and date utilities
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── tests/
│   ├── waterCalculator.test.js   # Automated unit tests
│   └── schedulerAndDb.test.js    # Gating and deduplication tests
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/rio-companion.git
cd rio-companion
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Launch Desktop App in Development Mode
```bash
npm run electron:dev
```

### 5. Build Standalone Windows Installer (.exe)
```bash
npm run electron:build
```
The setup installer (`RIO Setup 1.0.0.exe`) will be generated inside the `dist-electron/` folder.

---

## 🖥️ System Tray & Background Behavior

- **Closing with `✕`**: Minimizes Rio to the Windows System Tray near the taskbar clock. It will continue running silently in the background and pop up reminders when due.
- **Tray Menu Options**:
  - Open Rio Dashboard
  - Toggle Master Notifications (ON/OFF)
  - Activate / Deactivate Focus Mode
  - Quick Add Water (+250 ml)
  - Exit Rio (completely shuts down)

---

## 📜 License
This project is open-source and licensed under the [MIT License](LICENSE).
