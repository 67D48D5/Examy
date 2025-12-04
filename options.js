// options.js

// Default values for the settings
const DEFAULT_OPTIONS = {
    apiKey: '',
    modelName: 'gemini-2.5-flash',
    style_fontSize: 12,
    style_autoHideSeconds: 14,
    style_textColor: '#ededed',
    style_bgColor: '#ffffff',
    style_bgOpacity: 4,
    style_bottomPos: 384,
    style_leftPos: 458,
    style_maxHeight: 128,
    style_maxWidth: 384
};

// Helper function to convert hex color to RGBA
function hexToRgba(hex, opacityPercent) {
    let r = 0, g = 0, b = 0;

    // Handle 3-digit (#FFF) format
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    // Handle 6-digit (#FFFFFF) format
    else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }

    const alpha = (Number(opacityPercent) || 80) / 100;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Save options function
function saveOptions() {
    const settings = {
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

    chrome.storage.local.set(settings, () => {
        const status = document.getElementById('status');

        status.textContent = 'Settings saved!';
        status.classList.add('show');

        setTimeout(() => {
            status.classList.remove('show');
        }, 2000);
    });
}

// Fill UI with values function
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

    updatePreview(); // Update preview after setting values
}

// Restore options function
function restoreOptions() {
    chrome.storage.local.get(DEFAULT_OPTIONS, (items) => {
        setFormValues(items);
    });
}

// Reset options to default function
function resetOptions() {
    if (confirm('Are you sure you want to reset all settings to their default values? The API key will not be retained.')) {
        setFormValues(DEFAULT_OPTIONS);
        saveOptions(); // Save immediately after reset
    }
}

// Update preview function
function updatePreview() {
    const preview = document.getElementById('previewOverlay');
    if (!preview) return;

    // Get current input values (use default if empty)
    const fontSize = document.getElementById('fontSize').value || DEFAULT_OPTIONS.style_fontSize;
    const textColor = document.getElementById('textColor').value || DEFAULT_OPTIONS.style_textColor;
    const bgColor = document.getElementById('bgColor').value || DEFAULT_OPTIONS.style_bgColor;
    const bgOpacity = document.getElementById('bgOpacity').value || DEFAULT_OPTIONS.style_bgOpacity;
    const bottomPos = document.getElementById('bottomPos').value || DEFAULT_OPTIONS.style_bottomPos;
    const leftPos = document.getElementById('leftPos').value || DEFAULT_OPTIONS.style_leftPos;
    const maxHeight = document.getElementById('maxHeight').value || DEFAULT_OPTIONS.style_maxHeight;
    const maxWidth = document.getElementById('maxWidth').value || DEFAULT_OPTIONS.style_maxWidth;

    // Apply styles to preview
    preview.style.fontSize = `${fontSize}px`;
    preview.style.color = textColor;
    preview.style.backgroundColor = hexToRgba(bgColor, bgOpacity);
    preview.style.bottom = `${bottomPos}px`;
    preview.style.left = `${leftPos}px`;
    preview.style.maxHeight = `${maxHeight}px`;
    preview.style.maxWidth = `${maxWidth}px`;
}

// Register event listeners
document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();

    document.getElementById('saveButton').addEventListener('click', saveOptions);
    document.getElementById('resetButton').addEventListener('click', resetOptions);

    // Update preview whenever style-related inputs change
    const styleInputs = document.querySelectorAll('.style-input');
    styleInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
});