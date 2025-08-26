let rtlEnabled = false;

browser.storage.local.get(['rtlEnabled']).then(result => {
    rtlEnabled = result.rtlEnabled || false;
    updateRTL();
});

browser.runtime.onMessage.addListener((request) => {
    if (request.rtlEnabled !== undefined) {
        rtlEnabled = request.rtlEnabled;
        updateRTL();
    }
});

function updateRTL() {
    const isChatPage = window.location.pathname.includes('/chat/');
    
    if (rtlEnabled && isChatPage) {
        document.body.classList.add('rtl-enabled');
        
        const selectors = [
            'div[data-testid*="message"] *:not(code):not(pre):not(.hljs)',
            'div[data-testid*="conversation-turn"] *:not(code):not(pre)',
            'div[class*="message"] *:not(code):not(pre)',
            '.whitespace-pre-wrap:not(code):not(pre)',
            '.prose *:not(code):not(pre)',
            '[role="textbox"]',
            '[contenteditable="true"]',
            'textarea',
            '.ProseMirror',
            'p:not(:has(code)):not(:has(pre))',
            'main *:not(code):not(pre):not(.hljs)'
        ];

        const elements = document.querySelectorAll(selectors.join(','));

        elements.forEach(el => {

            if (el.tagName && el.tagName.toLowerCase().match(/^(code|pre)$/)) return;
            if (el.classList && (el.classList.contains('hljs') || 
                el.className.includes('language-') || 
                el.className.includes('token'))) return;
                
            if (!el.classList.contains('rtl-applied')) {
                el.classList.add('rtl-applied');
            }
        });
    } else {
        document.body.classList.remove('rtl-enabled');
        document.querySelectorAll('.rtl-applied').forEach(el => {
            el.classList.remove('rtl-applied');
        });
    }
}

const observer = new MutationObserver((mutations) => {
    if (rtlEnabled) {
        let shouldUpdate = false;
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldUpdate = true;
            }
        });
        if (shouldUpdate) {
            setTimeout(updateRTL, 100);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateRTL);
} else {
    updateRTL();
}
window.addEventListener('load', updateRTL);
