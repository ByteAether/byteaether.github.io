import slugify from "slugify"; // Import slugify
import path from 'node:path';
import Image from "@11ty/eleventy-img";

export default {
	tags: [
		"posts"
	],
	"layout": "layouts/post.njk",
	"aside": true,
	"eleventyComputed": {
		"imageUrl": data => headerImageUrl(data),
		"permalink": data => blogUrl(data),
	},
};

async function headerImageUrl(data) {

	if(!data.image || !data.page.url)
	{
		return null;
	}

	const inputDir = path.dirname(data.page.inputPath);
	const imagePath = path.resolve(inputDir, data.image);

	const imageOptions = {
		formats: ["png"],
		urlPath: data.page.url,
		outputDir: path.dirname(data.page.outputPath),
		filenameFormat: function (hash, src, width, format) {
			return `${hash}-${width}.${format}`;
		},
		cacheOptions: {
		  duration: "1w"
		}
	};

	const img = await Image(imagePath, imageOptions);

	// Get the generated image URL
	const formatData = img[imageOptions.formats[0]];
	if (!formatData || !formatData[0]) {
	  throw new Error(`Image processing failed for ${src}`);
	}

	return formatData[0].url; // Return the URL of the processed image
}

function blogUrl(data) {
	if (!data.permalink) {
		// Automatically slugify titles for URLs if no permalink is explicitly set
		var year = data.date
			? new Date(data.date).getFullYear() + "/"
			: "";
		var name = slugify(data.title ?? data.page.fileSlug, { lower: true, strict: true }) + "/";
		return `/${year}${name}`;
	}
	return data.permalink; // Use the explicitly set permalink if available
}