// content.js

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
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
            prompt: "Solve the problems on this page and only provide the answers. Skip the solution process and give concise answers. If the problems are cut off, ignore them and move on. If there are no problems, respond with 'No problems found.' Respond in the language used in the image. Answer in plain text without any additional formatting.",
            style_fontSize: 12,
            style_autoHideSeconds: 0,
            style_textColor: '#e8e8e8',
            style_bgColor: '#ffffff',
            style_bgOpacity: 1,
            style_bottomPos: 458,
            style_leftPos: 384,
            style_maxHeight: 384,
            style_maxWidth: 384,
            style_padding: '10px 15px',
            style_borderRadius: '8px'
        };

        async function loadSettings() {
            return chrome.storage.local.get(DEFAULT_SETTINGS);
        }

        // Utility: Convert hex color to RGBA
        function hexToRgba(hex, opacityPercent = 80) {
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
            const alpha = Math.max(0, Math.min(1, opacityPercent / 100));

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
            // Create Host element
            const host = document.createElement('div');
            host.id = OVERLAY_CONFIG.id;

            // Create Shadow DOM to isolate styles
            const shadow = host.attachShadow({ mode: 'open' });

            // Create Container
            const overlay = document.createElement('div');
            overlay.textContent = text;

            applyOverlayStyles(overlay, settings);

            // Ensure Host sits on top of everything
            host.style.position = 'fixed';
            host.style.zIndex = OVERLAY_CONFIG.zIndex;
            host.style.left = '0';
            host.style.top = '0';

            shadow.appendChild(overlay);
            return host;
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

            if (!isNaN(autoHideMs) && autoHideMs > 0) {
                setTimeout(() => {
                    removeOverlay();
                }, autoHideMs);
            }
        }

        async function showOverlay(text) {
            const settings = await loadSettings();
            removeOverlay();

            const overlay = createOverlayElement(text, settings);
            document.body.appendChild(overlay);
            setupAutoHide(settings.style_autoHideSeconds);
        }

        async function toggleOverlay() {
            const overlay = document.getElementById(OVERLAY_CONFIG.id);
            if (!overlay) {
                await showOverlay("[INFO] Examy Overlay\nPress the shortcut again to hide this overlay.");
                return;
            }

            // Check the computed style to get the actual display value
            const currentStyle = window.getComputedStyle(overlay).display;

            // Toggle display based on current style
            overlay.style.display = currentStyle === "none" ? "block" : "none";
        }

        // Message Handler
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.type === 'PING') {
                sendResponse({ status: 'pong' });
                return false;
            }

            if (request.type === MESSAGE_TYPES.DISPLAY_RESULT) {
                showOverlay(request.text)
                    .then(() => sendResponse({ status: 'displayed' }))
                    .catch(err => sendResponse({ status: 'error', error: err.message }));
                return true; // Keep message channel open for async response
            } else if (request.type === MESSAGE_TYPES.TOGGLE_OVERLAY) {
                toggleOverlay()
                    .then(() => sendResponse({ status: "toggled" }))
                    .catch(err => sendResponse({ status: 'error', error: err.message }));
                return true; // Keep message channel open for async response
            }

            return false;
        });
    })();
}