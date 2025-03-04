export default function(eleventyConfig) {
    eleventyConfig.addPairedShortcode("ContentBlock", function(content, name) { 
        this.page['contentBlock'] = this.page['contentBlock'] || {};
        this.page['contentBlock'][name] = (this.page['contentBlock'][name] || "") + content;
        return '';
    });

    eleventyConfig.addShortcode("RenderContentBlock", function(name) {
        if(!this.page['contentBlock']) {
            return '';
        }
        if(!this.page['contentBlock'][name]) {
            return '';
        }
        return this.page['contentBlock'][name] || '';
    });
};