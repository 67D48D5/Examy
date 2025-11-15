// options.js

// Helper function from `content.js`
function hexToRgba(hex, opacityPercent) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    const alpha = (Number(opacityPercent) || 80) / 100;
    return `rgba(${+r}, ${+g}, ${+b}, ${alpha})`;
}

// Object to store and retrieve options
function saveOptions() {
    const apiKey = document.getElementById('apiKey').value;
    const modelName = document.getElementById('modelName').value;

    // Style values
    const fontSize = document.getElementById('fontSize').value;
    const autoHideSeconds = document.getElementById('autoHideSeconds').value;
    const textColor = document.getElementById('textColor').value;
    const bgColor = document.getElementById('bgColor').value;
    const bgOpacity = document.getElementById('bgOpacity').value;
    const bottomPos = document.getElementById('bottomPos').value;
    const leftPos = document.getElementById('leftPos').value;
    const maxHeight = document.getElementById('maxHeight').value;
    const maxWidth = document.getElementById('maxWidth').value;

    // Save all settings
    chrome.storage.local.set({
        apiKey: apiKey,
        modelName: modelName,
        style_fontSize: fontSize,
        style_autoHideSeconds: autoHideSeconds,
        style_textColor: textColor,
        style_bgColor: bgColor,
        style_bgOpacity: bgOpacity,
        style_bottomPos: bottomPos,
        style_leftPos: leftPos,
        style_maxHeight: maxHeight,
        style_maxWidth: maxWidth
    }, () => {
        // Save confirmation message
        const status = document.getElementById('status');
        status.textContent = 'Settings saved!';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
}

// Load saved settings
function restoreOptions() {
    // Load all keys at once with default values
    chrome.storage.local.get({
        apiKey: '',
        modelName: 'gemini-2.5-flash',
        style_fontSize: '12',
        style_autoHideSeconds: '14',
        style_textColor: '#d6d6d6',
        style_bgColor: '#ffffff',
        style_bgOpacity: '20',
        style_bottomPos: '20',
        style_leftPos: '20',
        style_maxHeight: '20',
        style_maxWidth: '200'
    }, (items) => {
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

        // Update preview after loading options
        updatePreview();
    });
}

// Update preview function
function updatePreview() {
    const preview = document.getElementById('previewOverlay');
    if (!preview) return;

    // Read current values from the form.
    const fontSize = document.getElementById('fontSize').value || '12';
    const textColor = document.getElementById('textColor').value;
    const bgColor = document.getElementById('bgColor').value;
    const bgOpacity = document.getElementById('bgOpacity').value || '20';
    const bottomPos = document.getElementById('bottomPos').value || '20';
    const leftPos = document.getElementById('leftPos').value || '20';
    const maxHeight = document.getElementById('maxHeight').value || '20';
    const maxWidth = document.getElementById('maxWidth').value || '200';

    // Apply styles to the preview element in real-time.
    preview.style.fontSize = `${fontSize}px`;
    preview.style.color = textColor;
    preview.style.backgroundColor = hexToRgba(bgColor, bgOpacity);
    preview.style.bottom = `${bottomPos}px`;
    preview.style.left = `${leftPos}px`;
    preview.style.maxHeight = `${maxHeight}px`;
    preview.style.maxWidth = `${maxWidth}px`;
}

// Update preview and restore options on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Existing logic
    restoreOptions();
    document.getElementById('saveButton').addEventListener('click', saveOptions);

    // Add 'input' event listeners to all style input fields
    const styleInputs = document.querySelectorAll('.style-input');
    styleInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
});