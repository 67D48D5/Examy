// overlay-manager.js - Overlay display and management logic

import { OVERLAY_CONFIG, DEFAULT_SETTINGS } from '../utils/constants.js';
import { hexToRgba } from '../utils/color-utils.js';
import { getStorageValues } from '../utils/chrome-helpers.js';

/**
 * Shows or updates the overlay with given text
 * @param {string} text - Text to display in the overlay
 */
export async function showOverlay(text) {
    // Load style settings from storage
    const settings = await getStorageValues(DEFAULT_SETTINGS);

    // Remove existing overlay if present
    removeOverlay();

    // Create and configure overlay element
    const overlay = createOverlayElement(text, settings);
    
    // Append to document
    document.body.appendChild(overlay);

    // Set up auto-hide if configured
    setupAutoHide(settings.style_autoHideSeconds);
}

/**
 * Toggles overlay visibility
 */
export function toggleOverlay() {
    const overlay = document.getElementById(OVERLAY_CONFIG.id);

    // If overlay doesn't exist, create and show it
    if (!overlay) {
        showOverlay("[INFO] Examy Overlay\nPress the shortcut again to hide this overlay.");
        return;
    }

    // Check the computed style to get the actual display value
    const currentStyle = window.getComputedStyle(overlay).display;

    // Toggle display based on current style
    overlay.style.display = currentStyle === "none" ? "" : "none";
}

/**
 * Removes the overlay from the DOM
 */
export function removeOverlay() {
    const existingOverlay = document.getElementById(OVERLAY_CONFIG.id);
    if (existingOverlay) {
        existingOverlay.remove();
    }
}

/**
 * Creates the overlay DOM element with styling
 * @param {string} text - Text to display
 * @param {Object} settings - Style settings
 * @returns {HTMLElement} Configured overlay element
 */
function createOverlayElement(text, settings) {
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_CONFIG.id;
    overlay.textContent = text;

    // Apply all styles
    applyOverlayStyles(overlay, settings);

    return overlay;
}

/**
 * Applies all style settings to the overlay element
 * @param {HTMLElement} overlay - The overlay element
 * @param {Object} settings - Style settings object
 */
function applyOverlayStyles(overlay, settings) {
    overlay.style.position = 'fixed';
    overlay.style.bottom = `${settings.style_bottomPos}px`;
    overlay.style.left = `${settings.style_leftPos}px`;
    overlay.style.backgroundColor = hexToRgba(
        settings.style_bgColor,
        settings.style_bgOpacity
    );
    overlay.style.color = settings.style_textColor;
    overlay.style.padding = settings.style_padding;
    overlay.style.borderRadius = settings.style_borderRadius;
    overlay.style.fontSize = `${settings.style_fontSize}px`;
    overlay.style.fontFamily = 'sans-serif';
    overlay.style.zIndex = OVERLAY_CONFIG.zIndex;
    overlay.style.maxWidth = `${settings.style_maxWidth}px`;
    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.maxHeight = `${settings.style_maxHeight}px`;
    overlay.style.overflowY = 'auto';
}

/**
 * Sets up auto-hide timer for the overlay
 * @param {number} autoHideSeconds - Number of seconds before auto-hide (0 = disabled)
 */
function setupAutoHide(autoHideSeconds) {
    const autoHideMs = Number(autoHideSeconds) * 1000;
    
    if (autoHideMs > 0) {
        setTimeout(() => {
            removeOverlay();
        }, autoHideMs);
    }
}
