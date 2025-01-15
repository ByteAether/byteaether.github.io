import Image from "@11ty/eleventy-img"

export default function(eleventyConfig) {
    eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	});
};

