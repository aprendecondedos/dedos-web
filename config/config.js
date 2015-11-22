var defaults = {
    root: path.join(__dirname, '..'),
    notifier: notifier
};

module.exports = {
    development: extend(development, defaults),
    production: extend(production, defaults),
    test: extend(test, defaults)
};