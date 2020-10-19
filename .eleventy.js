module.exports = function (eleventyConfig) {
    // Find and copy any image files to _site
    // Does not maintain directory structure.
    eleventyConfig.addPassthroughCopy({ "*.{png,ico,jpg}": "." });
};
