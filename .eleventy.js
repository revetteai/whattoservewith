const { DateTime } = require("luxon");
const fs = require("fs");
const path = require("path");

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

      // ✅ Generate sitemap.xml dynamically (fixed)
      const homepage = "https://whattoservewith.netlify.app";
      const pages = [
        { loc: "/about/", lastmod: "2025-04-25", changefreq: "monthly", priority: 0.8 },
        { loc: "/contact/", lastmod: "2025-04-25", changefreq: "monthly", priority: 0.8 },
        { loc: "/privacy-policy/", lastmod: "2025-04-25", changefreq: "monthly", priority: 0.8 },
      ];
      const postsData = posts.map(post => ({
        loc: post.url, // <-- FIXED: use post.url directly without prepending /posts
        lastmod: DateTime.fromJSDate(post.date).toISODate(),
        changefreq: "daily",
        priority: 0.9,
      }));

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home page -->
  <url>
    <loc>${homepage}/</loc>
    <lastmod>${pages[0].lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static pages -->
  ${pages.map(page => `
  <url>
    <loc>${homepage}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `).join('')}

  <!-- Blog Posts -->
  ${postsData.map(post => `
  <url>
    <loc>${homepage}${post.loc}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>${post.changefreq}</changefreq>
    <priority>${post.priority}</priority>
  </url>
  `).join('')}
</urlset>`;

      fs.writeFileSync(path.join("_site", "sitemap.xml"), sitemapXml.trim());
      console.log("✅ sitemap.xml generated");
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
