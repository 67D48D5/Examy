// options.js

import { DEFAULT_SETTINGS } from './utils/constants.js';
import { hexToRgba } from './utils/color-utils.js';
import { getStorageValues, setStorageValues } from './utils/chrome-helpers.js';

/**
 * Mapping between form field IDs and settings keys
 */
const FORM_FIELD_MAPPING = {
    'apiKey': 'apiKey',
    'modelName': 'modelName',
    'baseUrl': 'gemini_baseUrl',
    'prompt': 'gemini_prompt',
    'fontSize': 'style_fontSize',
    'autoHideSeconds': 'style_autoHideSeconds',
    'textColor': 'style_textColor',
    'bgColor': 'style_bgColor',
    'bgOpacity': 'style_bgOpacity',
    'bottomPos': 'style_bottomPos',
    'leftPos': 'style_leftPos',
    'maxHeight': 'style_maxHeight',
    'maxWidth': 'style_maxWidth',
    'padding': 'style_padding',
    'borderRadius': 'style_borderRadius'
};

/**
 * Numeric field IDs that need numeric parsing
 */
const NUMERIC_FIELDS = new Set([
    'fontSize', 'autoHideSeconds', 'bgOpacity',
    'bottomPos', 'leftPos', 'maxHeight', 'maxWidth'
]);

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
            saveButton.disabled = false;
        });
}

/**
 * Validates settings object
 * @param {Object} settings - Settings to validate
 * @returns {boolean} True if valid
 */
function validateSettings(settings) {
    // Check numeric values are not NaN using the same set
    for (const fieldId of NUMERIC_FIELDS) {
        const settingsKey = FORM_FIELD_MAPPING[fieldId];
        const value = settings[settingsKey];
        if (isNaN(value) || !isFinite(value)) {
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
    const settings = {};

    for (const [fieldId, settingsKey] of Object.entries(FORM_FIELD_MAPPING)) {
        if (NUMERIC_FIELDS.has(fieldId)) {
            settings[settingsKey] = getNumberValue(fieldId, DEFAULT_SETTINGS[settingsKey]);
        } else {
            const element = document.getElementById(fieldId);
            settings[settingsKey] = element?.value || '';
        }
    }

    return settings;
}

/**
 * Sets form values from a settings object
 * @param {Object} items - Settings to apply to form
 */
function setFormValues(items) {
    for (const [fieldId, settingsKey] of Object.entries(FORM_FIELD_MAPPING)) {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = items[settingsKey];
        }
    }

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
