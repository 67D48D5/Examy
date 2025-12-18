// content.js - Content script for overlay display

if (typeof window.examyInjected === 'undefined') {
    window.examyInjected = true;

    (() => {
        const MESSAGE_TYPES = {
            DISPLAY_RESULT: 'displayResult',
            TOGGLE_OVERLAY: 'toggleOverlay'
        };

        const OVERLAY_CONFIG = {
            id: 'examy-response-overlay',
            zIndex: '999999999'
        };

        const DEFAULT_SETTINGS = {
            apiKey: '',
            modelName: 'gemini-2.5-flash',
            style_fontSize: 14,
            style_autoHideSeconds: 10,
            style_textColor: '#FFFFFF',
            style_bgColor: '#000000',
            style_bgOpacity: 80,
            style_bottomPos: 20,
            style_leftPos: 20,
            style_maxHeight: 300,
            style_maxWidth: 400,
            style_padding: '10px 15px',
            style_borderRadius: '8px'
        };

        // Utility: Convert hex color to RGBA
        function hexToRgba(hex, opacityPercent) {
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex[1] + hex[2], 16);
                g = parseInt(hex[3] + hex[4], 16);
                b = parseInt(hex[5] + hex[6], 16);
            }
            const alpha = (Number(opacityPercent) || 80) / 100;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        // Overlay Management Functions
        function removeOverlay() {
            const existingOverlay = document.getElementById(OVERLAY_CONFIG.id);
            if (existingOverlay) {
                existingOverlay.remove();
            }
        }

        function createOverlayElement(text, settings) {
            const overlay = document.createElement('div');
            overlay.id = OVERLAY_CONFIG.id;
            overlay.textContent = text;
            applyOverlayStyles(overlay, settings);
            return overlay;
        }

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

        function setupAutoHide(autoHideSeconds) {
            const autoHideMs = Number(autoHideSeconds) * 1000;
            if (autoHideMs > 0) {
                setTimeout(() => {
                    removeOverlay();
                }, autoHideMs);
            }
        }

        async function showOverlay(text) {
            const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
            removeOverlay();
            const overlay = createOverlayElement(text, settings);
            document.body.appendChild(overlay);
            setupAutoHide(settings.style_autoHideSeconds);
        }

        function toggleOverlay() {
            const overlay = document.getElementById(OVERLAY_CONFIG.id);
            if (!overlay) {
                showOverlay("[INFO] Examy Overlay\nPress the shortcut again to hide this overlay.");
                return;
            }
            const currentStyle = window.getComputedStyle(overlay).display;
            overlay.style.display = currentStyle === "none" ? "" : "none";
        }

        // Message Handler
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.type === 'PING') {
                sendResponse({ status: 'pong' });
                return;
            }

            if (request.type === MESSAGE_TYPES.DISPLAY_RESULT) {
                showOverlay(request.text);
            } else if (request.type === MESSAGE_TYPES.TOGGLE_OVERLAY) {
                toggleOverlay();
                sendResponse({ status: "toggled" });
            }
        });
    })();
}