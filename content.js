// content.js

// Listen for messages from `background.js`
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "displayResult") {
        showOverlay(request.text);
    }
});

// Helper function to convert Hex color code to RGBA string with opacity
function hexToRgba(hex, opacityPercent) {
    // 1. Parse Hex code
    let r = 0, g = 0, b = 0;

    // 3-digit Hex code (#F03)
    if (hex.length === 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
        // 6-digit Hex code (#FF0033)
    } else if (hex.length === 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }

    // Convert opacity (percent 0-100 -> decimal 0-1)
    const alpha = (Number(opacityPercent) || 80) / 100;

    // Return rgba string
    return `rgba(${+r}, ${+g}, ${+b}, ${alpha})`;
}

// Main function to show overlay with text
async function showOverlay(text) {
    const OVERLAY_ID = "examy-response-overlay";

    // Load style settings from chrome.storage
    const settings = await chrome.storage.local.get({
        style_fontSize: '14',
        style_autoHideSeconds: '10',
        style_textColor: '#FFFFFF',
        style_bgColor: '#000000',
        style_bgOpacity: '80',
        style_bottomPos: '20',
        style_leftPos: '20',
        style_padding: '10px 15px',
        style_borderRadius: '8px',
        style_maxWidth: '400px',
        style_maxHeight: '300'
    });

    // Remove existing overlay if present
    const existingOverlay = document.getElementById(OVERLAY_ID);
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;

    // Apply styles
    overlay.style.position = 'fixed';
    overlay.style.bottom = `${settings.style_bottomPos}px`;
    overlay.style.left = `${settings.style_leftPos}px`;

    // Apply rgba by combining Hex code and opacity
    overlay.style.backgroundColor = hexToRgba(
        settings.style_bgColor,
        settings.style_bgOpacity
    );

    overlay.style.color = settings.style_textColor; // Apply text color as is
    overlay.style.padding = settings.style_padding;
    overlay.style.borderRadius = settings.style_borderRadius;
    overlay.style.fontSize = `${settings.style_fontSize}px`;
    overlay.style.fontFamily = 'sans-serif';
    overlay.style.zIndex = '999999999';
    overlay.style.maxWidth = settings.style_maxWidth;
    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.maxHeight = `${settings.style_maxHeight}px`;
    overlay.style.overflowY = 'auto';

    overlay.textContent = text;
    document.body.appendChild(overlay);

    // Apply saved auto-hide timeout
    const autoHideMs = Number(settings.style_autoHideSeconds) * 1000;
    if (autoHideMs > 0) {
        setTimeout(() => {
            const currentOverlay = document.getElementById(OVERLAY_ID);
            if (currentOverlay) {
                currentOverlay.remove();
            }
        }, autoHideMs);
    }
}