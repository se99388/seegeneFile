const notifier = require('node-notifier');

// windows notification
const displayNotification = (title, message) => {
    notifier.notify({
        title,
        message,
    });
};

module.exports = {
    displayNotification,
};
