define(['app/controller/events', 'hashHandler'], function (events, hashHandler) {

    // Utility object, where miscellaneous methods are written, these methods are used by Controller.
    var utils = {
        // Method to compare url of current page and href and returns boolean value.
        isPrimaryObjectPathChanged: function (newHash, prevHash) {
            var newHashArray = [], prevHashArray = [];

            // Returns 'true' if newHash is undefined or doesn't matches with prevHash.
            if (!newHash) return true;
            newHashArray = newHash.split('.');
            prevHashArray = prevHash.split('.');
            for (var i = 0; i < 2; i++) {
                if (newHashArray[i] != prevHashArray[i]) {
                    return true;
                };
            };

            return false;
        },

        // Method to handle hash changed event.
        hashChanged: function (e) {
            var me = this;
            try {
                var mainMenuName = document.URL.match(/([?]menu)*?=[^&#]*/g),
                    menuName = mainMenuName ? mainMenuName[0].split('=')[1] : me.APIManager.appSettings.getAppSettings().DefaultMainMenu,
                    prevHash = e.prevHash,
                    newHash = e.newHash;

                // loadContentPage method is called if 'href' attribute of current target element starts with '#'.
                if (newHash) {
                    me.APIManagerEvents[menuName] ? me.APIManagerEvents[menuName].call(me, e, newHash, { isPrimaryObjectPathChanged: utils.isPrimaryObjectPathChanged(newHash, prevHash) }) : (console.warn('There is no Event handler defined for this module!!!'), this.APIManagerEvents.Default.call(this, null, hashPath, { isPrimaryObjectPathChanged: true }));
                };
            }
            catch (error) {
                console.error(error);
                me.APIManager.APIManagerView.displayMessage('Error occured while loading content. Please check console for more details!!!');
            };
        }
    };

    // Controller class.
    var Controller = function (Args) {
        this.APIManager = Args.APIManager;
        this.APIManagerEvents = events;

        // Initialize HashHandler.
        hashHandler.addHandler($.proxy(utils.hashChanged, this));
        hashHandler.start();
    };

    Controller.prototype.initializePage = function (menuName) {
        var hashPath = hashHandler.getHash();

        // This will load data when page is refreshed and also object path is mentioned in url.
        if (hashPath) {
            // Pass hashPath as argument to loadContentPage method.
            this.APIManagerEvents[menuName] ? this.APIManagerEvents[menuName].call(this, null, hashPath, { isPrimaryObjectPathChanged: true }) : (console.warn('There is no Event handler defined for this module!!!'), this.APIManagerEvents.Default.call(this, null, hashPath, { isPrimaryObjectPathChanged: true }));    // Here 'null' is passed beacuse method is not called by event handler.
        };
    };

    return Controller;
});