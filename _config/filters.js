import { DateTime } from "luxon";
import striptags from "striptags";
import Image from "@11ty/eleventy-img";
import path from 'node:path';

export default function(eleventyConfig) {
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter("isoDate", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd');
	});

	eleventyConfig.addFilter("isoDateTime", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd HH:ii:ss');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (numbers) => {
		return Math.min.apply(null, numbers);
	});
	eleventyConfig.addFilter("max", (numbers) => {
		return Math.max.apply(null, numbers);
	});

	// Return the keys used in an object
	eleventyConfig.addFilter("getKeys", target => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "posts"].indexOf(tag) === -1);
	});
	
	// Extract reading time
    eleventyConfig.addFilter("readingTime", (wordcount) => {
        let readingTime = Math.ceil(wordcount / 220);
        if (readingTime === 1) {
            return readingTime + " minute";
        }
        return readingTime + " minutes";
    });

	// Extract word count
    eleventyConfig.addFilter("formatWords", (wordcount) => {
        return wordcount.toLocaleString("en");
    });

	eleventyConfig.addFilter("truncate", (string, limit) => {
        if(string.length <= limit) return string;

        return string.slice(0, limit - 3) + "...";
    });

	eleventyConfig.addFilter("excerpt", (post) => 
		extractExcerpt(post)
	);

	eleventyConfig.addFilter("pathRelative", pathRelative);
};

// Taken from here => https://keepinguptodate.com/pages/2019/06/creating-blog-with-eleventy/
function extractExcerpt(article) {
    if (!Object.prototype.hasOwnProperty.call(article, "templateContent")) {
        console.warn(
            'Failed to extract excerpt: Document has no property "templateContent".'
        );
        return null;
    }

    const content = article.templateContent;

	return striptags(content.slice(0, content.indexOf("\n")));
}

function pathRelative(to) {
	return path.relative(path.dirname(this.page.inputPath), to)
}