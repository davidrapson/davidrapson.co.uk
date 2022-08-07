const del = require("del");
const CleanCSS = require("clean-css");

module.exports = function (eleventyConfig) {
  const dir = {
    input: "src",
    output: "_site",
  };

  // Clean output directory on build
  del(`${dir.output}/*`);

  // Passthrough copy all images
  eleventyConfig.addPassthroughCopy({
    [`${dir.input}/*.{png,ico,jpg}`]: ".",
  });

  // Minify CSS filter, used to inline all styles
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.setBrowserSyncConfig({
    snippet: false,
  });

  return { dir };
};
