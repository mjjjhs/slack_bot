module.exports = {
    apps: [{
        name: "lqt-slack-bot",
        script: "dist/bin/www.js",
        instances: "1",
        exec_mode: 'cluster_mode',
    }]
};
