import { deleteSync } from "del";
import CleanCSS from "clean-css";

export default function (eleventyConfig) {
  const dir = {
    input: "src",
    output: "_site",
  };

  // Clean output directory on build
  deleteSync(`${dir.output}/*`);

  // Passthrough copy all images
  eleventyConfig.addPassthroughCopy(
    `${dir.input}/**/*.{png,ico,jpg,avif,webp}`,
  );
  eleventyConfig.addPassthroughCopy(`${dir.input}/fonts`);

  // Minify CSS filter, used to inline all styles
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  return { dir };
}
