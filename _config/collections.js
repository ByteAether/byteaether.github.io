export default function(eleventyConfig) {
    eleventyConfig.addCollection("series", function(collection) {
        const posts = collection.getAll();

        // this will store the mapping from series to lists of posts; it can be a
        // regular object if you prefer
        const mapping = new Map();

        // loop over the posts
        for (const post of posts) {

            // ignore anything with no series data
            if (post.data.series === undefined) {
                continue;
            }

            for(var key of post.data.series)
            {
                if(!mapping.has(key))
                {
                    mapping.set(key, []);
                }
                mapping.get(key).push(post);
            }
        }

        for(const [key, value] of mapping.entries())
        {
            value.sort((a, b) => a.date - b.date);
        }

        return Object.fromEntries(mapping);
    });

    eleventyConfig.addCollection("tags", function(collection) {
        const excludedTags = ["posts", "all"];
        const posts = collection.getAll();

        // this will store the mapping from series to lists of posts; it can be a
        // regular object if you prefer
        const mapping = new Map();

        // loop over the posts
        for (const post of posts) {

            // ignore anything with no series data
            if (post.data.tags === undefined) {
                continue;
            }

            for(var key of post.data.tags)
            {
                if(excludedTags.indexOf(key) !== -1) continue;

                if(!mapping.has(key))
                {
                    mapping.set(key, []);
                }
                mapping.get(key).push(post);
            }
        }

        for(const [key, value] of mapping.entries())
        {
            value.sort((a, b) => a.date - b.date);
        }

        return Object.fromEntries(mapping);
    });
}