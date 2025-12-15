# Examy - Architecture Documentation

## Overview
Examy is a Chrome extension that captures screenshots and queries the Gemini AI API for answers. This document describes the refactored architecture.

## Architecture

### Directory Structure
```
Examy/
├── background.js          # Background service worker (entry point)
├── content.js            # Content script (injected into pages)
├── options.js            # Options page logic
├── options.html          # Options page UI
├── manifest.json         # Extension manifest
├── services/            # Business logic services
│   ├── capture-service.js    # Screen capture functionality
│   └── gemini-service.js     # Gemini API integration
├── utils/               # Shared utilities
│   ├── constants.js          # Configuration and constants
│   ├── color-utils.js        # Color conversion utilities
│   └── chrome-helpers.js     # Chrome API wrappers
├── modules/             # Feature modules (for service worker only)
│   └── overlay-manager.js    # Overlay display logic
└── images/              # Extension icons
```

## Module Responsibilities

### background.js
- **Purpose**: Background service worker that handles keyboard commands
- **Key Functions**:
  - `handleToggleOverlay()`: Handles overlay toggle command
  - `handleCaptureAndQuery()`: Orchestrates capture and query flow
  - `notifyError()`: Sends error messages to content script
- **Dependencies**: Uses services and utilities modules

### content.js
- **Purpose**: Content script for displaying overlays on web pages
- **Key Functions**:
  - `showOverlay()`: Creates and displays overlay with text
  - `toggleOverlay()`: Shows/hides existing overlay
  - Message listener for background script communication
- **Note**: Contains inlined utilities since content scripts can't use ES6 modules when dynamically injected

### options.js
- **Purpose**: Options page logic for managing settings
- **Key Functions**:
  - `saveOptions()`: Saves settings to Chrome storage
  - `restoreOptions()`: Loads settings from Chrome storage
  - `resetOptions()`: Resets to default settings
  - `updatePreview()`: Updates live preview of overlay styles
- **Dependencies**: Uses utility modules

### Services

#### capture-service.js
- **Purpose**: Handles screen capture operations
- **Key Functions**:
  - `captureVisibleTab()`: Captures the visible tab as a JPEG image
- **Returns**: Data URL of captured image or null on failure

#### gemini-service.js
- **Purpose**: Manages Gemini API integration
- **Key Functions**:
  - `queryGeminiWithImage()`: Sends image to Gemini API and returns response
  - `buildGeminiRequest()`: Constructs API request body
  - `notifyMissingApiKey()`: Handles missing API key scenario
- **Configuration**: Uses constants for API endpoints and prompts

### Utilities

#### constants.js
- **Purpose**: Centralized configuration and constants
- **Exports**:
  - `DEFAULT_SETTINGS`: Default extension settings
  - `GEMINI_CONFIG`: Gemini API configuration
  - `OVERLAY_CONFIG`: Overlay display configuration
  - `MESSAGE_TYPES`: Message type constants
  - `COMMANDS`: Command name constants
  - `LOG_PREFIX`: Logging prefixes

#### color-utils.js
- **Purpose**: Color conversion utilities
- **Key Functions**:
  - `hexToRgba()`: Converts hex color to RGBA with opacity

#### chrome-helpers.js
- **Purpose**: Wrappers for Chrome extension APIs
- **Key Functions**:
  - `getActiveTab()`: Gets currently active tab
  - `injectContentScript()`: Injects content script into tab
  - `sendMessageToTab()`: Sends message to content script
  - `getStorageValues()`: Gets values from Chrome storage
  - `setStorageValues()`: Sets values in Chrome storage
  - `createNotification()`: Creates Chrome notification
  - `openOptionsPage()`: Opens extension options page

## Data Flow

### Capture and Query Flow
1. User presses `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
2. `background.js` receives command via Chrome API
3. `handleCaptureAndQuery()` orchestrates the flow:
   - Gets active tab via `chrome-helpers`
   - Injects `content.js` into the tab
   - Calls `capture-service` to capture screenshot
   - Sends "querying..." message to content script
   - Calls `gemini-service` to query API
   - Sends result to content script for display
4. `content.js` receives message and displays overlay

### Toggle Overlay Flow
1. User presses `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
2. `background.js` receives command
3. `handleToggleOverlay()` sends toggle message to content script
4. `content.js` shows/hides overlay

### Settings Management Flow
1. User opens options page
2. `options.js` loads settings from Chrome storage
3. User modifies settings, preview updates in real-time
4. User clicks Save
5. Settings saved to Chrome storage
6. Content script uses settings when displaying overlay

## Design Principles

### Separation of Concerns
- **Services**: Business logic (API calls, captures)
- **Utilities**: Shared helper functions
- **Main Files**: Orchestration and UI

### Single Responsibility
- Each module has one clear purpose
- Functions are small and focused
- Constants are centralized

### DRY (Don't Repeat Yourself)
- Shared code extracted to utilities
- Common patterns abstracted to helpers
- Configuration centralized in constants

### Error Handling
- Errors logged with consistent prefixes
- User-friendly error messages displayed
- Graceful fallbacks for missing data

## Future Improvements
- Add unit tests for services and utilities
- Add integration tests for command handlers
- Consider TypeScript for better type safety
- Add telemetry/analytics module
- Add settings validation module
