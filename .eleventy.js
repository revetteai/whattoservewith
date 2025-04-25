const { DateTime } = require("luxon");
const fs = require("fs");

module.exports = function (eleventyConfig) {
  // ✅ Copy static assets
  eleventyConfig.addPassthroughCopy("assets");

  // ✅ Blog post collection
  eleventyConfig.addCollection("post", function (collectionApi) {
    const posts = collectionApi.getFilteredByGlob("./posts/*.md");

    // ✅ Generate search.json from posts
    eleventyConfig.on("afterBuild", () => {
      const searchData = posts.map(post => ({
        title: post.data.title,
        url: post.url,
        excerpt: post.templateContent.replace(/<[^>]+>/g, '').slice(0, 200) + "..."
      }));

      fs.writeFileSync("_site/search.json", JSON.stringify(searchData, null, 2));
      console.log("✅ search.json generated");
    });

    return posts;
  });

  // ✅ Date formatting filters
  eleventyConfig.addFilter("date", (value, format = "yyyy") => {
    return DateTime.fromJSDate(new Date(value)).toFormat(format);
  });

  eleventyConfig.addFilter("readableDate", (value) => {
    return DateTime.fromJSDate(new Date(value)).toFormat("MMMM d, yyyy");
  });

  eleventyConfig.addFilter("year", () => {
    return new Date().getFullYear();
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk"
  };
};
