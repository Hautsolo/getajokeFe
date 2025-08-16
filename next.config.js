module.exports = {
  reactStrictMode: true,
  // I don't want it to run when compiling as I trust the CI stage of the pipeline and Husky.
  ignoreDuringBuilds: true,
  // Enable static export for Netlify
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features for static export
  output: 'export'
};
