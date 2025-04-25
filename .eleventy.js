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

  // Generate Sitemap
  eleventyConfig.on("afterBuild", () => {
    const sitemapData = {
      homepage: "https://whattoservewith.netlify.app/",
      pages: [
        { loc: "/about/", lastmod: "2025-04-25", changefreq: "monthly", priority: 0.8 },
        { loc: "/contact/", lastmod: "2025-04-25", changefreq: "monthly", priority: 0.8 },
        { loc: "/privacy-policy/", lastmod: "2025-04-25", changefreq: "monthly", priority: 0.8 },
      ],
      posts: [
        { loc: "/posts/what-to-eat-with-bacon/", lastmod: "2025-04-25", changefreq: "daily", priority: 0.9 },
        { loc: "/posts/what-to-eat-with-cabbage/", lastmod: "2025-04-25", changefreq: "daily", priority: 0.9 },
        // Add other posts here as they are created.
      ]
    };

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Home page -->
      <url>
        <loc>${sitemapData.homepage}</loc>
        <lastmod>${sitemapData.pages[0].lastmod}</lastmod>
        <changefreq>${sitemapData.pages[0].changefreq}</changefreq>
        <priority>${sitemapData.pages[0].priority}</priority>
      </url>
      <!-- Other pages -->
      ${sitemapData.pages.map(page => `
        <url>
          <loc>${sitemapData.homepage}${page.loc}</loc>
          <lastmod>${page.lastmod}</lastmod>
          <changefreq>${page.changefreq}</changefreq>
          <priority>${page.priority}</priority>
        </url>
      `).join('')}
      <!-- Blog Posts -->
      ${sitemapData.posts.map(post => `
        <url>
          <loc>${sitemapData.homepage}${post.loc}</loc>
          <lastmod>${post.lastmod}</lastmod>
          <changefreq>${post.changefreq}</changefreq>
          <priority>${post.priority}</priority>
        </url>
      `).join('')}
    </urlset>`;

    fs.writeFileSync("_site/sitemap.xml", sitemapXml);
    console.log("✅ sitemap.xml generated");
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
