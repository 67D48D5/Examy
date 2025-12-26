// color-utils.js

/**
 * Converts a hex color code to RGBA string with opacity
 * @param {string} hex - Hex color code (e.g., '#FF0033' or '#F03')
 * @param {number} opacityPercent - Opacity percentage (0-100), defaults to 80
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, opacityPercent = 80) {
    let r = 0, g = 0, b = 0;

    // Handle 3-digit hex code (#F03)
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    // Handle 6-digit hex code (#FF0033)
    else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }

    // Convert opacity from percentage to decimal and clamp between 0 and 1
    const alpha = Math.max(0, Math.min(1, opacityPercent / 100));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
