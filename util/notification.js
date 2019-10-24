const notifier = require('node-notifier');
  
  // windows notification
   const displayNotification = (title, message)=>{
    notifier.notify({
        title: title,
        message: message
    });
}

module.exports = {
    displayNotification
}