define(['app/controller/events', 'hashHandler'], function (events, hashHandler) {

    // Controller class.
    var Controller = function (Args) {
        this.APIManager = Args.APIManager;

        // Initialize HashHandler.
        hashHandler.changed.addHandler($.proxy(events.hashChanged, this));
        hashHandler.start();
    };

    Controller.prototype.initializePage = function (menuName) {
        var hashPath = hashHandler.getHash();

        // This will load data when page is refreshed and also object path is mentioned in url.
        if (hashPath) {
            // Pass hashPath as argument to loadContentPage method.
            events[menuName] ? events[menuName].call(this, null, hashPath, { isPrimaryObjectPathChanged: true }) : (console.warn('There is no Event handler defined for this module!!!'), events.Default.call(this, null, hashPath, { isPrimaryObjectPathChanged: true }));    // Here 'null' is passed beacuse method is not called by event handler.

            this.APIManager.APIManagerView.expandSubMenu(hashPath);
        };
    };

    Controller.prototype.triggerEvent = function (eventName, eventArguments) {
        events[eventName] && events[eventName].call(this, eventArguments);
    };

    return Controller;
});