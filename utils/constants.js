// constants.js - Centralized configuration and default values

// Default settings for the extension
export const DEFAULT_SETTINGS = {
    apiKey: '',
    modelName: 'gemini-2.5-flash',
    style_fontSize: 14,
    style_autoHideSeconds: 10,
    style_textColor: '#FFFFFF',
    style_bgColor: '#000000',
    style_bgOpacity: 80,
    style_bottomPos: 20,
    style_leftPos: 20,
    style_maxHeight: 300,
    style_maxWidth: 400,
    style_padding: '10px 15px',
    style_borderRadius: '8px'
};

// Gemini API configuration
export const GEMINI_CONFIG = {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.5-flash',
    defaultPrompt: "Solve the problems on this page and only provide the answers. Skip the solution process and give concise answers. If the problems are cut off, ignore them and move on. If there are no problems, respond with 'No problems found.' Respond in the language used in the image. Answer in plain text without any additional formatting."
};

// Overlay configuration
export const OVERLAY_CONFIG = {
    id: 'examy-response-overlay',
    zIndex: '999999999'
};

// Message types for Chrome runtime messaging
export const MESSAGE_TYPES = {
    DISPLAY_RESULT: 'displayResult',
    TOGGLE_OVERLAY: 'toggleOverlay'
};

// Command names from manifest
export const COMMANDS = {
    CAPTURE_AND_QUERY: 'capture_and_query',
    TOGGLE_OVERLAY: 'toggle_overlay'
};

// Notification IDs
export const NOTIFICATION_IDS = {
    NO_API_KEY: 'no-api-key'
};

// Log message prefixes
export const LOG_PREFIX = {
    INFO: '[INFO]',
    ERROR: '[ERROR]'
};
