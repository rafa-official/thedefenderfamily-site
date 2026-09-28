const Image = require("@11ty/eleventy-img");
const path = require("path");

module.exports = function(eleventyConfig) {

  // Async image shortcode — converts to WebP + JPEG, generates srcset
  eleventyConfig.addAsyncShortcode("image", async function(src, alt, loading, sizes, cls, style) {
    if (!src) return "";
    loading = loading || "lazy";
    sizes   = sizes   || "(max-width: 768px) 100vw, 50vw";

    let filePath = src.startsWith("/") ? `./src${src}` : src;

    try {
      let metadata = await Image(filePath, {
        widths: [400, 800, 1200],
        formats: ["webp", "jpeg"],
        outputDir: "./_site/img/",
        urlPath: "/img/",
        filenameFormat: (id, src, width, format) => {
          const name = path.basename(src, path.extname(src));
          return `${name}-${width}w.${format}`;
        }
      });

      let attrs = { alt: alt || "", sizes, loading, decoding: "async" };
      if (cls)   attrs.class = cls;
      if (style) attrs.style = style;

      return Image.generateHTML(metadata, attrs);
    } catch (e) {
      console.warn(`[image] Could not process: ${src} — ${e.message}`);
      return `<img src="${src}" alt="${alt || ""}" loading="${loading}">`;
    }
  });
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/.htaccess");

  // Expose SITE_ENV so staging can be marked noindex (set SITE_ENV=staging on the staging host)
  eleventyConfig.addGlobalData("env", {
    SITE_ENV: process.env.SITE_ENV || "production"
  });

  eleventyConfig.addCollection("stories", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/stories/*.md")
      .filter(item => !item.data.draft)
      .sort((a, b) => {
        return new Date(b.data.date) - new Date(a.data.date);
      });
  });

  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n));

  eleventyConfig.addFilter("striptags", (str) => {
    if (!str) return "";
    return String(str).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const d = new Date(dateObj);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  });

  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return '';
    const text = content.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ').trim();
    return text.length > 160 ? text.substring(0, 160) + '…' : text;
  });

  // T17: Tag-based archive — unique topic tags across all story posts
  eleventyConfig.addCollection("storiesByTag", (collection) => {
    const tagSet = new Set();
    collection.getAll().forEach((item) => {
      if (item.data.tags && Array.isArray(item.data.tags)) {
        item.data.tags.forEach((tag) => {
          if (tag !== "stories") tagSet.add(tag);
        });
      }
    });
    return [...tagSet];
  });

  // T17: Filter a collection to posts that include a specific tag
  eleventyConfig.addFilter("filterByTag", (collection, tag) => {
    if (!collection) return [];
    return collection.filter((item) =>
      item.data.tags && item.data.tags.includes(tag)
    );
  });

  // T18: Related posts — filter by any matching topic tag (excludes "stories" membership tag)
  eleventyConfig.addFilter("filterByAnyTag", (collection, tags = []) => {
    const topicTags = (tags || []).filter(t => t !== "stories");
    if (!topicTags.length) return [];
    return (collection || []).filter((item) =>
      item.data.tags && item.data.tags.some((t) => topicTags.includes(t))
    );
  });

  // T18: Exclude a URL from a collection (used to remove current post from related list)
  eleventyConfig.addFilter("rejectByUrl", (collection, url) => {
    return (collection || []).filter((item) => item.url !== url);
  });

  // T18: Take first N items from an array (alias for limit — used in related posts)
  eleventyConfig.addFilter("head", (array, n) => {
    return array ? array.slice(0, n) : [];
  });

  // B7: Find a collection item by its URL (used in language switcher to resolve translation links)
  eleventyConfig.addFilter("findByUrl", (collection, url) => {
    return (collection || []).find((item) => item.url === url) || null;
  });

  // T20: Project case studies collection (src/projects/*.md, sorted newest first by year)
  eleventyConfig.addCollection("projects", (collection) => {
    return collection.getFilteredByGlob("src/projects/*.md")
      .filter((item) => !item.data.draft)
      .sort((a, b) => (b.data.year || 0) - (a.data.year || 0));
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
