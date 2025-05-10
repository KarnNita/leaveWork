/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  future: {
    v3_routeConvention: true
  },
  ignoredRouteFiles: ["**/.*"],
  server: false,
  appDirectory: "app/app",
  assetsBuildDirectory: "public/build",
  publicPath: "/leaveWork/build/",
  serverBuildPath: "build/index.js"
};
