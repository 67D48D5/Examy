// chrome-helpers.js - Chrome API helper utilities

/**
 * Gets the currently active tab
 * @returns {Promise<chrome.tabs.Tab|null>} Active tab or null if not found
 */
export async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs.length > 0 ? tabs[0] : null;
}

/**
 * Injects a content script into a tab
 * @param {number} tabId - ID of the tab to inject into
 * @param {string[]} files - Array of script file paths to inject
 * @returns {Promise<void>}
 */
export async function injectContentScript(tabId, files) {
    await chrome.scripting.executeScript({
        target: { tabId },
        files
    });
}

/**
 * Sends a message to a tab's content script
 * @param {number} tabId - ID of the tab to send message to
 * @param {Object} message - Message object to send
 * @returns {Promise<void>}
 */
export async function sendMessageToTab(tabId, message) {
    chrome.tabs.sendMessage(tabId, message);
}

/**
 * Gets values from Chrome storage
 * @param {Object|string[]} keys - Keys to retrieve or default values object
 * @returns {Promise<Object>} Retrieved values
 */
export async function getStorageValues(keys) {
    return await chrome.storage.local.get(keys);
}

/**
 * Sets values in Chrome storage
 * @param {Object} items - Key-value pairs to store
 * @returns {Promise<void>}
 */
export async function setStorageValues(items) {
    return await chrome.storage.local.set(items);
}

/**
 * Creates a Chrome notification
 * @param {string} notificationId - ID for the notification
 * @param {Object} options - Notification options
 * @returns {Promise<void>}
 */
export async function createNotification(notificationId, options) {
    chrome.notifications.create(notificationId, options);
}

/**
 * Opens the extension's options page
 * @returns {Promise<void>}
 */
export async function openOptionsPage() {
    chrome.runtime.openOptionsPage();
}
