const themeManager = {
    init: function() {
        this.set(this.get());
    },

    toggle: function() {
        this.set(this.get() == 'dark' ? 'light' : 'dark');
        updateGiscusTheme();
    },

    set: function(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.theme = theme;
        updateGiscusTheme();
    },
    
    get: function() {
        return document.documentElement.dataset.theme
            ?? localStorage.theme
            ?? (window.matchMedia && window.matchMedia('prefers-color-scheme: dark') ? 'dark' : null)
            ?? 'light';
    },
};

themeManager.init();

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