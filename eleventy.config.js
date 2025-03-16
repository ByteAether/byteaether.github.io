import { InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import pluginTOC from "@uncenter/eleventy-plugin-toc";
import faviconsPlugin from "eleventy-plugin-gen-favicons";
import Minifier from "html-minifier-terser";
import Uglify from "uglify-js"

import pluginFilters from "./_config/filters.js";
import pluginShortcodes from "./_config/shortcodes.js";
import pluginCollections from "./_config/collections.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	// Drafts, see also _data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if(data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	eleventyConfig.addGlobalData("renderDate", new Date());

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig
		.addPassthroughCopy("./assets")
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");
	eleventyConfig.addWatchTarget("public/**/*.*");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Adds the {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "css",
		transforms: [ minify ],
	});
	// Adds the {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "js",
		transforms: [ uglify ],
	});
	eleventyConfig.addBundle("jsraw", {
		toFileDirectory: "js",
		outputFileExtension: "js",
	});

	// Official plugins
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
	eleventyConfig.addPlugin(faviconsPlugin, {
		'manifestData': { 'name': 'ByteAether' }
	});

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		collection: {
			name: "posts",
			limit: 10,
		},
		metadata: {
			language: "en",
			title: "ByteAether",
			base: "https://byteaether.github.io/",
			author: {
				name: "Joonatan Uusväli"
			}
		}
	});

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// File extensions to process in _site folder
		extensions: "html",

		// Output formats for each image.
		formats: ["png", "auto"],

		// widths: ["auto"],

		defaultAttributes: {
			// e.g. <img loading decoding> assigned on the HTML tag will override these values.
			loading: "lazy",
			decoding: "async",
		}
	});

	eleventyConfig.setLibrary('md', markdownIt().use(markdownItAnchor));
	eleventyConfig.addPlugin(pluginTOC);

	eleventyConfig.addPlugin(pluginFilters);
	eleventyConfig.addPlugin(pluginShortcodes);
	eleventyConfig.addPlugin(pluginCollections);

	eleventyConfig.addTransform('minifier', (value, outputPath) => {
		if(!outputPath || outputPath.indexOf('.html') <= 0)
		{
			return value;
		}

		return minify(value);
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11tydata.js",
	],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "./content",          // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: "./_site"
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};

async function minify(input) {
	return Minifier.minify(input, {
		useShortDoctype: true,
		removeComments: true,
		collapseWhitespace: true,
		minifyCSS: true,
		minifyJS: false,
	});
}

async function uglify(input) {
	return Uglify.minify(input).code;
}