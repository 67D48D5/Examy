// constants.js

// Default settings for the extension
export const DEFAULT_SETTINGS = {
    apiKey: '',
    modelName: 'gemini-2.5-flash',
    gemini_baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    gemini_prompt: "Solve the problems on this page and only provide the answers. Skip the solution process and give concise answers. If the problems are cut off, ignore them and move on. If there are no problems, respond with 'No problems found.' Respond in the language used in the image. Answer in plain text without any additional formatting.",
    style_fontSize: 12,
    style_autoHideSeconds: 0,
    style_textColor: '#e8e8e8',
    style_bgColor: '#ffffff',
    style_bgOpacity: 80,
    style_bottomPos: 458,
    style_leftPos: 384,
    style_maxHeight: 384,
    style_maxWidth: 384,
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
