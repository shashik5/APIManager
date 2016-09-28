(function (window, define) {
    var registeredListeners = [],

        prevHash = '',

        extend = function () {
            var newObject = {};
            for (var idx in arguments) {
                for (var objName in arguments[idx]) {
                    newObject[objName] = arguments[idx][objName];
                };
            };

            return newObject;
        },

        getDefaultConfig = function () {
            return {
                canRepeat: false
            };
        },

        findIndex = function (handler) {
            return registeredListeners.indexOf(handler);
        },

        triggerHandlers = function (e) {
            var me = this,
                args = {
                    e: e,
                    prevHash: prevHash,
                    newHash: me.getHash()
                };

            if (me.config.canRepeat || args.newHash !== args.prevHash) {
                registeredListeners.forEach(function (handler) {
                    (typeof handler === 'function') && handler(args);
                });
            };

            prevHash = me.getHash();
        },

        trimHashString = function (hashString) {
            if (hashString[0] === '#')
                hashString = hashString.substring(1, hashString.length);
            return hashString;
        },

        hashHandler = Object.create({
            start: function (config) {
                var hashString = window.document.location.hash;

                this.config = extend(getDefaultConfig(), config || {});

                if (typeof window.onhashchange === 'object') {
                    window.onhashchange = triggerHandlers.bind(this);
                }
                else {
                    // TODO: Non-supported browser implementation.
                };

                prevHash = hashString ? trimHashString(hashString) : '';
            },

            addHandler: function (handler) {
                if (findIndex(handler) == -1) {
                    registeredListeners.push(handler);
                }
            },

            removeHandler: function (handler) {
                var index = findIndex(handler);
                if (index > -1) {
                    registeredListeners.splice(index, 1);
                }
            },

            reset: function (newConfig) {
                registeredListeners = [];
                this.config = extend(getDefaultConfig(), newConfig || {});
            },

            getHash: function () {
                var hashString = window.document.location.hash;
                return hashString ? trimHashString(hashString) : '';
            },

            setHash: function (hash) {
                window.document.location.hash = hash;
            }
        });

    // Export hashHandler.
    if (define && (typeof define === 'function') && define.amd) {
        define('hashHandler', function () { return hashHandler; })
    }
    else {
        window.hashHandler = hashHandler;
    };

})(window, define);