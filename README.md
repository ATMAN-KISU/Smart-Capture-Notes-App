# Smart Capture & Notes App (CSK Edition)

A production-ready, local-first mobile and web application built with **React Native**, **Expo**, and **TypeScript**, styled in an iconic **CSK Yellow & Pitch Black** athletic theme with custom **SC** monogram branding.

Smart Capture & Notes allows users to capture photos via the device camera or photo gallery, add structured metadata (titles, multiline notes, category tags), and persist everything securely on the device without any mandatory cloud dependency.

---

## Technologies & Libraries Used

### Core Framework & Runtime
| Technology | Version | Purpose |
|---|---|---|
| **React** | `19.3.0` | Declarative UI component tree and state hooks (`useState`, `useCallback`, `useContext`). |
| **React Native** | `0.88.1` | Cross-platform native mobile UI primitives (`View`, `Text`, `FlatList`, `Modal`, `SafeAreaView`). |
| **Expo SDK** | `^58.0.21` | Managed native runtime, bridge modules, asset loaders, and bundling ecosystem. |
| **TypeScript** | `^5.3.3` | Compile-time type safety, models, interfaces, and strict prop checking. |
| **Babel** | `^7.25.2` | Transpilation pipeline with `babel-preset-expo`. |

### Native Device & Storage Modules
| Library | Version | Purpose |
|---|---|---|
| **`expo-sqlite`** | `~58.0.14` | High-performance local embedded SQLite database for relational metadata queries, indexing, and WAL mode. |
| **`expo-file-system`** | `~58.0.13` | Persistent on-device file storage (`${FileSystem.documentDirectory}smart_capture_images/`) and atomic file unlinking. |
| **`expo-image-picker`** | `~58.0.10` | Camera capture and photo library access with permission negotiation and fallback handling. |
| **`expo-image-manipulator`** | `~58.0.16` | On-device image optimization, resizing (max 1400px width), and quality compression (0.8 JPEG). |
| **`@expo/vector-icons`** | `^15.0.2` | Vector iconography (`Ionicons`) for categories, search, actions, and brand badges. |
| **`expo-status-bar`** | `~58.0.4` | Cross-platform status bar styling. |

### Web Platform Support
| Library | Version | Purpose |
|---|---|---|
| **`react-native-web`** | `~0.21.4` | Translates React Native components into standards-compliant HTML/DOM elements. |
| **`react-dom`** | `19.3.0` | React DOM renderer for browser environments. |
| **`@expo/metro-runtime`** | `~58.0.15` | Fast Refresh, module runtime, and error overlays for web Metro bundling. |
| **`expo-font`** | `~58.0.11` | Web font face loading for `@expo/vector-icons`. |

---

## Architecture Overview & Design Patterns

The application follows the **Model-View-ViewModel (MVVM)** pattern combined with modular hardware services and a platform-aware data access layer:

```
[UI Layer (Screens & Components)]
             │
             ▼
[State & ViewModel Layer (RecordsContext)]
             │
      ┌──────┴─────────────────────────────────┐
      ▼                                        ▼
[Data Access Layer (Repository)]      [Native Device Services]
  - RecordRepository                    - FileStorageService (expo-file-system)
  - DatabaseConnection (Platform-Split) - ImagePickerService (expo-image-picker)
      ├── DatabaseConnection.native.ts  - ImageOptimizerService (expo-image-manipulator)
      └── DatabaseConnection.web.ts
```

### Storage Architecture: SQLite + FileSystem Rationale

| Layer | Responsibility | Architectural Rationale |
|---|---|---|
| **SQLite (`expo-sqlite`)** | Stores structured record metadata: ID, title, notes, category, local file URI, file size, timestamps. | Enables instant indexed queries (`ORDER BY createdAt DESC`, category filters, and `LIKE` search) with transaction safety (WAL mode). |
| **FileSystem (`expo-file-system`)** | Stores raw compressed images in `${FileSystem.documentDirectory}smart_capture_images/`. | **Avoids SQLite database bloat.** Storing large base64 strings inside SQLite severely degrades page cache performance, increases app memory consumption, and slows query throughput. |
| **Atomic Deletion / Unlinking** | Both SQLite row and local image file are deleted in a coordinated operation. | **Eliminates orphaned storage.** When a record is deleted, `FileStorageService.deleteImage()` unlinks the physical file from disk so user device storage is always reclaimed. |
| **Cross-Platform Fallback** | Native uses SQLite; Web uses persistent `localStorage`. | Ensures the app runs identically in desktop browser previews while retaining native C/SQLite speed on iOS & Android. |

---

## Visual Design & Branding: CSK Edition

- **Primary**: Official **CSK Golden Yellow** (`#FDB913` / `#FFCE45`).
- **Canvas & Surfaces**: Pitch Black (`#09090B`), Deep Charcoal Card Surfaces (`#131316`), and Subtle Border Contrasts (`#2A2A33`).
- **Brand Monogram (`SC`)**: Custom vector-sharp emblem featuring interlocking **S** (Gold) and **C** (White) with a central golden lightning bolt.
- **Desktop Framing**: Centered mobile device frame (`maxWidth: 480px`, subtle shadow and borders) for web preview.
- **Category Accents**:
  - **Work**: Royal Blue (`#60A5FA`)
  - **Personal**: CSK Yellow (`#FDB913`)
  - **Ideas**: Radiant Tangerine (`#FB923C`)
  - **Receipts**: Mint Emerald (`#34D399`)
  - **Other**: Electric Purple (`#C084FC`)

---

## Project Structure

```
├── App.tsx                              # Root app controller, theme provider & frame
├── app.json                             # Expo metadata, permissions, icons & web config
├── index.js                             # Expo application entry point
├── package.json                         # Dependencies & npm scripts
├── tsconfig.json                        # TypeScript strict compiler configuration
├── babel.config.js                      # Babel configuration
├── README.md                            # Complete setup & technical documentation
├── assets/                              # Brand & application icons
│   ├── icon.png                         # App launcher icon (SC Monogram)
│   ├── adaptive-icon.png                # Android adaptive icon (SC Monogram)
│   ├── splash-icon.png                  # Splash screen icon
│   ├── favicon.png                      # Web tab favicon
│   └── logo.png                         # Master HD logo (512×512)
├── scripts/
│   └── generate-brand-assets.js         # Pure Node.js PNG asset generator
└── src/
    ├── types/                           # TypeScript models and interfaces
    │   ├── index.ts
    │   └── record.ts                    # NoteRecord, Category, FilterOptions, ViewMode
    ├── database/                        # Data access layer (DAL)
    │   ├── DatabaseConnection.ts        # Platform router
    │   ├── DatabaseConnection.native.ts # Native SQLite connection with WAL mode
    │   ├── DatabaseConnection.web.ts    # Web adapter
    │   └── RecordRepository.ts          # CRUD queries, category aggregation, LIKE search
    ├── services/                        # Native hardware & system utilities
    │   ├── FileStorageService.ts        # Local file persistence & unlinking
    │   ├── ImagePickerService.ts        # Camera/Gallery launch & permission dialogs
    │   └── ImageOptimizerService.ts     # Pre-save image downscaling & compression
    ├── state/                           # MVVM State & ViewModels
    │   └── RecordsContext.tsx           # Reactive records, active filters, search & toasts
    ├── theme/                           # Design tokens & color system
    │   ├── colors.ts                    # CSK Yellow & Pitch Black palette
    │   ├── typography.ts                # Typographic scale & weights
    │   └── spacing.ts                   # Spacings, border radii, shadows & gold glows
    ├── components/
    │   ├── common/
    │   │   ├── BrandLogo.tsx            # SC Monogram vector logo component
    │   │   ├── Header.tsx               # App bar with SC logo & list/grid toggle
    │   │   ├── SearchBar.tsx            # Real-time search with clear trigger
    │   │   ├── CategoryChips.tsx        # Horizontal category filter chips + counts
    │   │   ├── DashboardStats.tsx       # "Capture Vault" summary banner
    │   │   ├── Toast.tsx                # Auto-dismissing animated feedback banner
    │   │   ├── ConfirmDialog.tsx        # Modal confirmation for safe deletion
    │   │   ├── LoadingOverlay.tsx       # Activity indicator during file writes
    │   │   ├── EmptyState.tsx           # Contextual empty & no-search-results states
    │   │   └── PermissionBanner.tsx     # Graceful fallback banner if permissions denied
    │   └── record/
    │       ├── CategoryBadge.tsx        # Color-coded badge with category icon
    │       ├── RecordCard.tsx           # List view record card with thumbnail & snippet
    │       └── RecordGridItem.tsx       # 2-column grid view record card
    └── screens/
        ├── HomeScreen.tsx               # Main list/grid, search, filter, FAB action sheet
        ├── CaptureScreen.tsx            # Photo preview, category selector, title & notes
        └── DetailScreen.tsx             # Full-screen zoom, inline editing, share, delete
```

---

## Setup & Run Instructions

### Prerequisites
1. **Node.js**: v18.x or higher (v20+ supported).
2. **Package Manager**: `npm` (bundled with Node.js) or `yarn`.
3. **For Mobile Testing (Physical Device)**:
   - Install the free **Expo Go** app from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android) or [Apple App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS).
4. **For Simulators / Emulators (Optional)**:
   - **Android**: Android Studio with an Android Virtual Device (AVD) configured.
   - **iOS**: macOS with Xcode and Command Line Tools installed.

---

### Step-by-Step Installation

#### 1. Clone or Open the Workspace
Navigate into the project directory:
```bash
cd "Smart Capture & Notes App"
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Verify TypeScript Compilation
Ensure all types and imports compile cleanly with 0 errors:
```bash
npm run type-check
```

---

### Running the Application

#### Start the Development Server
```bash
npm start
```

> [!NOTE]
> **Windows Terminal Note**: Because the workspace directory contains an ampersand (`&` in `Smart Capture & Notes App`), running `npx expo start` in standard Windows `cmd.exe` fails with `'Notes' is not recognized as an internal or external command` (as Windows parses `&` as a command separator). 
> 
> Always use:
> ```bash
> npm start
> ```
> *(or `npm run web` / `node ./node_modules/expo/bin/cli start`)*
> The npm scripts are configured to invoke the CLI directly through Node.js, avoiding Windows batch command delimiter issues.

Once started, the interactive Metro Bundler menu will appear:

```
Waiting on http://localhost:8081

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
› Press r │ reload app
› Press j │ open debugger
```

---

### Target Execution Options

#### Option A: Web Browser
Press `w` in the terminal, or run:
```bash
npm run web
```
Then open your browser to **http://localhost:8081**.

#### Option B: Physical Phone (via Expo Go)
1. Ensure your computer and phone are connected to the **same Wi-Fi network**.
2. Run `npm start`.
3. **Android**: Open the **Expo Go** app and scan the QR code displayed in the terminal.
4. **iOS**: Open the native **Camera** app, scan the terminal QR code, and tap the prompt to open in **Expo Go**.

#### Option C: Android Emulator
1. Start an emulator from Android Studio.
2. In the running terminal, press `a`, or run:
   ```bash
   npm run android
   ```

#### Option D: iOS Simulator (macOS only)
1. Ensure Xcode is installed.
2. In the running terminal, press `i`, or run:
   ```bash
   npm run ios
   ```

---

## Available npm Scripts

| Script | Command | Description |
|---|---|---|
| `npm start` | `expo start` | Starts the unified Metro development server on port 8081. |
| `npm run web` | `expo start --web` | Starts Metro and immediately opens the web browser. |
| `npm run android` | `expo start --android` | Boots Metro and attaches to a running Android emulator or connected device. |
| `npm run ios` | `expo start --ios` | Boots Metro and attaches to an iOS Simulator. |
| `npm run type-check` | `tsc --noEmit` | Validates strict TypeScript compilation across all screens, DAL, and components. |

---

## Known Limitations & Planned Roadmap

| Area | Current Behavior | Planned Improvement |
|---|---|---|
| **OCR / Text Extraction** | Users manually enter note titles and descriptions. | Integrate on-device ML Kit / Apple Vision OCR to auto-extract text from receipts and business cards. |
| **Multi-Image Support** | 1 primary image per record. | Support multi-image carousels per note (e.g., front and back of documents). |
| **Cloud Sync & Backup** | 100% offline-first storage. | Optional end-to-end encrypted backup to Google Drive or iCloud. |
| **Biometric Security** | Protected by device lock screen. | In-app Face ID / Fingerprint lock for sensitive categories (e.g. *Receipts*, *Personal*). |
| **Batch Export** | Single-note system sharing. | Batch PDF generation and CSV/ZIP export for expense accounting. |
