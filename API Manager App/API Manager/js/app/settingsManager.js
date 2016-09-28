define(['text!../../appSettings/appSettings.json'], function (settings) {
    var currentSettings = {},
        modulesDataPath = {},

        // Method to read JSON settings file and returns settings object.
        readSettings = function () {
            var parsedSettingsData = JSON.parse(settings),
                settingsData = {},
                modulesPath = {};

            $.each(parsedSettingsData, function (moduleName, moduleSettings) {
                if (moduleName[0] != '_') {
                    settingsData[moduleName] = $.extend(true, {}, parsedSettingsData._CommonAppSettings, moduleSettings || {});
                    modulesPath[moduleName] = moduleSettings.DataPath;
                };
            });

            modulesDataPath = modulesPath;
            parsedSettingsData._CommonAppSettings.DefaultMainMenu && (currentSettings = settingsData[parsedSettingsData._CommonAppSettings.DefaultMainMenu]);

            // Return a function which returns settings object of key argument.
            return function (key) {
                currentSettings = settingsData[key];
            };
        };

    // Class to manage app settings.
    var SettingsManager = function () {
        this.setAppSettings = readSettings.call(this);
    };

    // Method to get current App settings object.
    SettingsManager.prototype.getAppSettings = function () {
        return currentSettings || {};
    };

    // Method to get all module path to be loaded.
    SettingsManager.prototype.getAllModulesPath = function () {
        return modulesDataPath;
    };

    return SettingsManager;
});