module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/static");

  eleventyConfig.addCollection("expeditions", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/expeditions/*.md")
      .filter(item => !item.data.draft)
      .sort((a, b) => {
        return new Date(b.data.date) - new Date(a.data.date);
      });
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

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
