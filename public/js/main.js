const copyUrlToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(location.href);
    } catch (err) {
        console.error("Failed to copy: ", err);
    }
};

window.copyUrlToClipboard = copyUrlToClipboard;

function updateGiscusTheme() {
    const theme = themeManager.get() === 'dark' ? 'dark' : 'light';
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) {
        iframe.contentWindow.postMessage(
            { giscus: { setConfig: { theme: theme } } },
            'https://giscus.app'
        );
    }
}

window.updateGiscusTheme = updateGiscusTheme;