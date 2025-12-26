// background.js

import { COMMANDS, MESSAGE_TYPES, LOG_PREFIX, DEFAULT_SETTINGS } from './utils/constants.js';
import { getActiveTab, injectContentScript, sendMessageToTab } from './utils/chrome-helpers.js';
import { captureVisibleTab } from './services/capture-service.js';
import { queryGeminiWithImage } from './services/gemini-service.js';

// Command listener
chrome.commands.onCommand.addListener(async (command) => {
    try {
        if (command === COMMANDS.TOGGLE_OVERLAY) {
            await handleToggleOverlay();
        } else if (command === COMMANDS.CAPTURE_AND_QUERY) {
            await handleCaptureAndQuery();
        }
    } catch (error) {
        console.error(`${LOG_PREFIX.ERROR} Command execution failed:`, error);
    }
});

/**
 * Handles the toggle overlay command
 */
async function handleToggleOverlay() {
    const tab = await getActiveTab();
    if (!tab) return;

    // Inject content script if needed, then send toggle message
    await injectContentScript(tab.id, ['content.js']);
    await sendMessageToTab(tab.id, { type: MESSAGE_TYPES.TOGGLE_OVERLAY });
}

/**
 * Handles the capture and query command
 */
async function handleCaptureAndQuery() {
    try {
        const tab = await getActiveTab();
        if (!tab) return;

        // Inject content script if needed
        await injectContentScript(tab.id, ['content.js']);

        // Capture the page
        const dataUrl = await captureVisibleTab(tab.windowId);
        if (!dataUrl) {
            await notifyError(tab.id, `${LOG_PREFIX.ERROR} Page capture failed.`);
            return;
        }

        // Notify user that query is in progress
        await sendMessageToTab(tab.id, {
            type: MESSAGE_TYPES.DISPLAY_RESULT,
            text: `${LOG_PREFIX.INFO} Captured page and querying, please wait...`
        });

        // Query Gemini
        const geminiText = await queryGeminiWithImage(dataUrl);
        if (!geminiText) {
            await notifyError(tab.id, `${LOG_PREFIX.ERROR} Query to Gemini failed. Retry later.`);
            return;
        }

        // Display result
        await sendMessageToTab(tab.id, {
            type: MESSAGE_TYPES.DISPLAY_RESULT,
            text: geminiText
        });

    } catch (error) {
        console.error(`${LOG_PREFIX.ERROR} While executing command:`, error);
    }
}

/**
 * Sends an error message to the content script
 * @param {number} tabId - Tab ID to send message to
 * @param {string} errorMessage - Error message to display
 */
async function notifyError(tabId, errorMessage) {
    console.error(errorMessage);
    await sendMessageToTab(tabId, {
        type: MESSAGE_TYPES.DISPLAY_RESULT,
        text: errorMessage
    });
}

// Provide default settings to content scripts on request
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.type === 'GET_DEFAULT_SETTINGS') {
        sendResponse({ defaults: DEFAULT_SETTINGS });
    }
});
