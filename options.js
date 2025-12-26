// options.js

import { DEFAULT_SETTINGS } from './utils/constants.js';
import { hexToRgba } from './utils/color-utils.js';
import { getStorageValues, setStorageValues } from './utils/chrome-helpers.js';

/**
 * Saves options to storage
 */
function saveOptions() {
    const settings = collectFormValues();

    // Validate settings before saving
    if (!validateSettings(settings)) {
        showStatusMessage('Invalid settings. Please check your inputs.', 'error');
        return;
    }

    const saveButton = document.getElementById('saveButton');
    if (!saveButton) return;

    saveButton.disabled = true;

    setStorageValues(settings)
        .then(() => {
            showStatusMessage('Settings saved!', 'success');
        })
        .catch((error) => {
            console.error('Failed to save settings:', error);
            showStatusMessage('Failed to save settings!', 'error');
        })
        .finally(() => {
            if (saveButton) saveButton.disabled = false;
        });
}

/**
 * Validates settings object
 * @param {Object} settings - Settings to validate
 * @returns {boolean} True if valid
 */
function validateSettings(settings) {
    // Check numeric values are not NaN
    const numericKeys = ['style_fontSize', 'style_autoHideSeconds', 'style_bgOpacity',
        'style_bottomPos', 'style_leftPos', 'style_maxHeight', 'style_maxWidth'];

    for (const key of numericKeys) {
        if (isNaN(settings[key]) || !isFinite(settings[key])) {
            return false;
        }
    }

    // Validate opacity range
    if (settings.style_bgOpacity < 0 || settings.style_bgOpacity > 100) {
        return false;
    }

    return true;
}

/**
 * Collects all form values into a settings object
 * @returns {Object} Settings object
 */
function collectFormValues() {
    const getValue = (id) => document.getElementById(id)?.value || '';

    return {
        apiKey: getValue('apiKey'),
        modelName: getValue('modelName'),
        gemini_baseUrl: getValue('baseUrl'),
        gemini_prompt: getValue('prompt'),
        style_fontSize: getNumberValue('fontSize', DEFAULT_SETTINGS.style_fontSize),
        style_autoHideSeconds: getNumberValue('autoHideSeconds', DEFAULT_SETTINGS.style_autoHideSeconds),
        style_textColor: getValue('textColor'),
        style_bgColor: getValue('bgColor'),
        style_bgOpacity: getNumberValue('bgOpacity', DEFAULT_SETTINGS.style_bgOpacity),
        style_bottomPos: getNumberValue('bottomPos', DEFAULT_SETTINGS.style_bottomPos),
        style_leftPos: getNumberValue('leftPos', DEFAULT_SETTINGS.style_leftPos),
        style_maxHeight: getNumberValue('maxHeight', DEFAULT_SETTINGS.style_maxHeight),
        style_maxWidth: getNumberValue('maxWidth', DEFAULT_SETTINGS.style_maxWidth),
        style_padding: getValue('padding'),
        style_borderRadius: getValue('borderRadius')
    };
}

/**
 * Sets form values from a settings object
 * @param {Object} items - Settings to apply to form
 */
function setFormValues(items) {
    const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    };

    setValue('apiKey', items.apiKey);
    setValue('modelName', items.modelName);
    setValue('baseUrl', items.gemini_baseUrl);
    setValue('prompt', items.gemini_prompt);
    setValue('fontSize', items.style_fontSize);
    setValue('autoHideSeconds', items.style_autoHideSeconds);
    setValue('textColor', items.style_textColor);
    setValue('bgColor', items.style_bgColor);
    setValue('bgOpacity', items.style_bgOpacity);
    setValue('bottomPos', items.style_bottomPos);
    setValue('leftPos', items.style_leftPos);
    setValue('maxHeight', items.style_maxHeight);
    setValue('maxWidth', items.style_maxWidth);
    setValue('padding', items.style_padding);
    setValue('borderRadius', items.style_borderRadius);

    updatePreview();
}

/**
 * Restores options from storage
 */
function restoreOptions() {
    getStorageValues(DEFAULT_SETTINGS)
        .then((items) => {
            setFormValues(items);
        })
        .catch((error) => {
            console.error('Failed to restore settings:', error);
            // Fall back to defaults on error
            setFormValues(DEFAULT_SETTINGS);
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
 * Gets a numeric value from input, with validation
 * @param {string} id - Input element ID
 * @param {number} fallback - Fallback value if invalid
 * @returns {number} Valid numeric value
 */
function getNumberValue(id, fallback) {
    const element = document.getElementById(id);
    if (!element) return fallback;

    const raw = element.value;
    if (raw === '' || raw === null || raw === undefined) return fallback;

    const num = Number(raw);
    return !isNaN(num) && isFinite(num) ? num : fallback;
}

/**
 * Updates the preview overlay with current form values
 */
function updatePreview() {
    const preview = document.getElementById('previewOverlay');
    if (!preview) return;

    const settings = collectFormValues();

    // Apply styles to preview
    preview.style.fontSize = `${settings.style_fontSize}px`;
    preview.style.color = settings.style_textColor;
    preview.style.backgroundColor = hexToRgba(settings.style_bgColor, settings.style_bgOpacity);
    preview.style.bottom = `${settings.style_bottomPos}px`;
    preview.style.left = `${settings.style_leftPos}px`;
    preview.style.maxHeight = `${settings.style_maxHeight}px`;
    preview.style.maxWidth = `${settings.style_maxWidth}px`;
    preview.style.padding = settings.style_padding;
    preview.style.borderRadius = settings.style_borderRadius;
}

/**
 * Shows a status message temporarily
 * @param {string} message - Message to display
 * @param {string} type - Message type: 'success' or 'error'
 */
function showStatusMessage(message, type = 'success') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.classList.remove('success', 'error');
    status.classList.add('show', type);

    setTimeout(() => {
        status.classList.remove('show');
    }, 2500);
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
