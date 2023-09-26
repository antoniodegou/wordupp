module.exports = {
    files: ["**/*.css", "**/*.html", "**/*.js", "!node_modules/**/*"],
    watchEvents: ["change"],
    watch: true,
    proxy: "http://127.0.0.1:8000/dashboard/",  // Point this to your local server address
    port: 3000,
    notify: true,
    open: true,
    logLevel: "info",
    logPrefix: "BrowserSync",
    reloadOnRestart: true,
    ghostMode: false
};
