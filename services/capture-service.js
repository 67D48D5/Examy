// capture-service.js - Screen capture logic

import { LOG_PREFIX } from '../utils/constants.js';

/**
 * Captures the visible tab as an image
 * @param {number} windowId - ID of the window to capture
 * @returns {Promise<string|null>} Data URL of captured image or null on failure
 */
export async function captureVisibleTab(windowId) {
    try {
        const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "jpeg" });
        console.log(`${LOG_PREFIX.INFO} Captured page image (Data URL):`, dataUrl);
        return dataUrl;
    } catch (error) {
        console.error(`${LOG_PREFIX.ERROR} Capture failed:`, error);
        return null;
    }
}
