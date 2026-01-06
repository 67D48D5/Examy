// constants.js

const DEFAULT_PROMPT = "Solve the problems on this page and only provide the answers. Skip the solution process and give concise answers. If the problems are cut off, ignore them and move on. If there are no problems, respond with 'No problems found.' Respond in the language used in the image. Answer in plain text without any additional formatting.";

// Default settings for the extension
export const DEFAULT_SETTINGS = {
    provider: 'gemini',
    apiKey: '',
    modelName: 'gemini-2.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    prompt: DEFAULT_PROMPT,
    openai_apiKey: '',
    openai_model: 'gpt-4o',
    openai_baseUrl: 'https://api.openai.com/v1/chat/completions',
    openai_prompt: DEFAULT_PROMPT,
    custom_apiKey: '',
    custom_model: 'llava',
    custom_baseUrl: 'http://localhost:11434/v1/chat/completions',
    custom_prompt: DEFAULT_PROMPT,
    style_fontSize: 12,
    style_autoHideSeconds: 0,
    style_textColor: '#e8e8e8',
    style_bgColor: '#ffffff',
    style_bgOpacity: 1,
    style_bottomPos: 458,
    style_leftPos: 384,
    style_maxHeight: 384,
    style_maxWidth: 384,
    style_padding: '10px 15px',
    style_borderRadius: '8px'
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
