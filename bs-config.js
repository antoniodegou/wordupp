module.exports = {
    files: ["**/*.css", "**/*.html", "**/*.js", "!node_modules/**/*"],
    watchEvents: ["change"],
    watch: true,
    proxy: "127.0.0.1:8000",  // Point this to your local server address
    port: 3000,
    notify: true,
    open: true,
    logLevel: "info",
    logPrefix: "BrowserSync",
    reloadOnRestart: true
};
