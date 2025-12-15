// options.js - Options page logic

import { DEFAULT_SETTINGS } from './utils/constants.js';
import { hexToRgba } from './utils/color-utils.js';
import { getStorageValues, setStorageValues } from './utils/chrome-helpers.js';

/**
 * Saves options to storage
 */
function saveOptions() {
    const settings = collectFormValues();

    setStorageValues(settings).then(() => {
        showStatusMessage('Settings saved!');
    });
}

/**
 * Collects all form values into a settings object
 * @returns {Object} Settings object
 */
function collectFormValues() {
    return {
        apiKey: document.getElementById('apiKey').value,
        modelName: document.getElementById('modelName').value,
        style_fontSize: Number(document.getElementById('fontSize').value),
        style_autoHideSeconds: Number(document.getElementById('autoHideSeconds').value),
        style_textColor: document.getElementById('textColor').value,
        style_bgColor: document.getElementById('bgColor').value,
        style_bgOpacity: Number(document.getElementById('bgOpacity').value),
        style_bottomPos: Number(document.getElementById('bottomPos').value),
        style_leftPos: Number(document.getElementById('leftPos').value),
        style_maxHeight: Number(document.getElementById('maxHeight').value),
        style_maxWidth: Number(document.getElementById('maxWidth').value)
    };
}

/**
 * Sets form values from a settings object
 * @param {Object} items - Settings to apply to form
 */
function setFormValues(items) {
    document.getElementById('apiKey').value = items.apiKey;
    document.getElementById('modelName').value = items.modelName;
    document.getElementById('fontSize').value = items.style_fontSize;
    document.getElementById('autoHideSeconds').value = items.style_autoHideSeconds;
    document.getElementById('textColor').value = items.style_textColor;
    document.getElementById('bgColor').value = items.style_bgColor;
    document.getElementById('bgOpacity').value = items.style_bgOpacity;
    document.getElementById('bottomPos').value = items.style_bottomPos;
    document.getElementById('leftPos').value = items.style_leftPos;
    document.getElementById('maxHeight').value = items.style_maxHeight;
    document.getElementById('maxWidth').value = items.style_maxWidth;

    updatePreview();
}

/**
 * Restores options from storage
 */
function restoreOptions() {
    getStorageValues(DEFAULT_SETTINGS).then((items) => {
        setFormValues(items);
    });
}

/**
 * Resets options to default values
 */
function resetOptions() {
    if (confirm('Are you sure you want to reset all settings to their default values? The API key will not be retained.')) {
        setFormValues(DEFAULT_SETTINGS);
        saveOptions();
    }
}

/**
 * Updates the preview overlay with current form values
 */
function updatePreview() {
    const preview = document.getElementById('previewOverlay');
    if (!preview) return;

    // Get current input values (use default if empty)
    const fontSize = document.getElementById('fontSize').value || DEFAULT_SETTINGS.style_fontSize;
    const textColor = document.getElementById('textColor').value || DEFAULT_SETTINGS.style_textColor;
    const bgColor = document.getElementById('bgColor').value || DEFAULT_SETTINGS.style_bgColor;
    const bgOpacity = document.getElementById('bgOpacity').value || DEFAULT_SETTINGS.style_bgOpacity;
    const bottomPos = document.getElementById('bottomPos').value || DEFAULT_SETTINGS.style_bottomPos;
    const leftPos = document.getElementById('leftPos').value || DEFAULT_SETTINGS.style_leftPos;
    const maxHeight = document.getElementById('maxHeight').value || DEFAULT_SETTINGS.style_maxHeight;
    const maxWidth = document.getElementById('maxWidth').value || DEFAULT_SETTINGS.style_maxWidth;

    // Apply styles to preview
    preview.style.fontSize = `${fontSize}px`;
    preview.style.color = textColor;
    preview.style.backgroundColor = hexToRgba(bgColor, bgOpacity);
    preview.style.bottom = `${bottomPos}px`;
    preview.style.left = `${leftPos}px`;
    preview.style.maxHeight = `${maxHeight}px`;
    preview.style.maxWidth = `${maxWidth}px`;
}

/**
 * Shows a status message temporarily
 * @param {string} message - Message to display
 */
function showStatusMessage(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.classList.add('show');

    setTimeout(() => {
        status.classList.remove('show');
    }, 2000);
}

/**
 * Initializes event listeners
 */
function initializeEventListeners() {
    document.getElementById('saveButton').addEventListener('click', saveOptions);
    document.getElementById('resetButton').addEventListener('click', resetOptions);

    // Update preview whenever style-related inputs change
    const styleInputs = document.querySelectorAll('.style-input');
    styleInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();
    initializeEventListeners();
});
