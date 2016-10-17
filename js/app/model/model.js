define(function () {

    var selectedObject = {};

    // Utility object, where miscellaneous methods are written, these methods are used by Model.
    var modelUtils = {
        // Method to Remove properties that shouldn't be displayed in menu.
        removeDetailsFromDataObject: function (dataObject) {
            var me = this;
            _.each(dataObject, function (value, key) {

                var stringArray;

                if (_.isArray(value)) {
                    // If value is a array, first item consists of path in the object from where data to be fetched.
                    value = value[0];
                };

                if (_.isString(value)) {
                    // If value is a string, it may be a path to get required data from data Object.
                    stringArray = value.split('.');
                    // If it is a path then it will starts with '_CommonDescriptions'.
                    (stringArray[0] == '_CommonDescriptions') && (value = me.getObjectByPath(me.getSelectedDataObject(), value));
                };

                if (_.isObject(value) && !_.isArray(value)) {
                    // Executes if value is a object.
                    if (value['_extends']) {
                        // If value cointains '_extends' property then, replace the '_extends' property with object mentioned in path.
                        stringArray = value['_extends'];
                        value = _.omit(value, '_extends');
                        value = dataObject[key] = $.extend({}, me.getObjectByPath(me.getSelectedDataObject(), stringArray), value);
                    };

                    // Remove properties that shouldn't be displayed in menu.
                    dataObject[key] = _.omit(value, me.APIManager.appSettings.getAppSettings().DescriptiveFields);
                    (!_.isEmpty(dataObject[key])) && value['_InnerFields'] && (dataObject[key] = _.omit(value['_InnerFields'], me.APIManager.appSettings.getAppSettings().DescriptiveFields));

                    // Invoke same method and pass updated object.
                    dataObject[key] = modelUtils.removeDetailsFromDataObject.call(me, dataObject[key]);
                };
            });

            return dataObject;
        },

        // Method to build menu items using modified data object.
        buildMenuItems: function (dataObject, parentObj) {

            var me = this, menuItems = {}, list = [];

            parentObj = parentObj || [];    // keeps track of parent object keys to build url path.

            _.each(dataObject, function (value, key) {
                // Add new key to parentObj array.
                parentObj.push(key);

                if (_.isString(value) || _.isArray(value)) {
                    // If value is string or array then build menu item which will be data source for kendo menu or tree view.
                    menuItems = { text: me.APIManager.APIManagerView.textDescriptor.getDescriptionText(key), url: '#' + parentObj.join('.') };

                    // Remove last item from parentObj array.
                    parentObj.splice(parentObj.length - 1, 1);
                }
                else {
                    // If 'value' is a object then call same method 'value' and 'parentObj' as an arguments.
                    menuItems = { text: me.APIManager.APIManagerView.textDescriptor.getDescriptionText(key), url: '#' + parentObj.join('.'), items: modelUtils.buildMenuItems.call(me, value, parentObj) };
                };

                // Add menuItems object to 'list' array.
                list.push(menuItems);
            });

            // Remove last item from parentObj array.
            parentObj.splice(parentObj.length - 1, 1);

            // 'List' will be data scource for kendo menu or tree view.
            return list;
        },

        // Method to apply custom sort.
        customSort: function (dataObj, skipSort) {
            var sortedObj = {}, sortedList = [], me = this, settings = me.APIManager.appSettings.getAppSettings();

            if (!skipSort) {

                // Build a sorted list of widget properties in which data should be orderd.
                $.each(dataObj, function (key) {
                    (_.indexOf(_.union(settings.UpperSortedContents, settings.LowerSortedContents), key) == -1) && sortedList.push(key);
                });

                // Sort items.
                sortedList.sort(function (a, b) {
                    var a1 = a.toLowerCase(), b1 = b.toLowerCase();
                    if (a1 == b1) return 0;
                    return a1 > b1 ? 1 : -1;
                });

                sortedList = _.union(settings.UpperSortedContents, sortedList, settings.LowerSortedContents);
            }
            else {
                // It skips custom sorting for the properties of current dataObj.
                $.each(dataObj, function (key) {
                    sortedList.push(key)
                });
            };

            // Create object in sortedList order.
            _.each(sortedList, function (item) {
                if (dataObj[item]) {

                    _.isObject(dataObj[item]) &&
                    !_.isArray(dataObj[item]) &&
                    (dataObj[item] = modelUtils.customSort.call(me, dataObj[item], _.indexOf(settings.SkipSortingFields, item) > -1));

                    sortedObj[item] = dataObj[item]
                };
            });

            return sortedObj;
        },

        // Method to make load module data by ajax call.
        loadAllModules: function (modulePathObject) {
            var me = this,
                moduleData = {};

            try {
                $.each(modulePathObject, function (moduleName, modulePath) {
                    $.ajax({
                        url: modulePath + '.json',
                        context: me,
                        cache: false,
                        async: false,
                        dataType: 'text',
                        success: function (rawModuleData) {
                            moduleData[moduleName] = modelUtils.customSort.call(me, JSON.parse(rawModuleData));
                        }
                    });
                });
            }
            catch (error) {
                console.error(error);
                me.APIManager.APIManagerView.displayMessage('Error occured while parsing data or sorting. Please check console for more details!!!');
            };

            return function () {
                return moduleData;
            }
        },

        getDataToExport: function (dataPath) {
            var data = this.getSelectedDataObject();
            return dataPath ? this.getObjectByPath(data, dataPath) : data;
        }
    };

    // Model Class.
    var Model = function (Args) {
        this.APIManager = Args.APIManager;

        this.selectObject = function (name) { selectedObject = this.getAllModulesData()[name]; };

        // Now getAllModulesData method will return all JSON parsed data.
        this.getAllModulesData = modelUtils.loadAllModules.call(this, Args.moduleDataPath);
    };

    // Method to generates data for kendo menu or tree view data source.
    Model.prototype.generateSubMenuList = function () {
        var menuTree = {};

        try {
            if (this.getSelectedDataObject()) {
                // Get parsed JSON data and remove unwanted properties to which shouldn't be displayed in menu and then build menu data.
                menuTree = modelUtils.buildMenuItems.call(this, modelUtils.removeDetailsFromDataObject.call(this, _.omit(this.getSelectedDataObject(), '_CommonDescriptions')));
            }
        }
        catch (error) {
            console.error(error);
            this.APIManager.APIManagerView.displayMessage('Error occured while building sub menu items. Please check console for more details!!!');
        };

        return menuTree;
    };

    // Method to generates data for kendo menu data source.
    Model.prototype.generateMainMenuList = function () {
        var mainMenuList = [], me = this;

        try {
            $.each(this.getAllModulesData(), function (key) {
                mainMenuList.push({ text: me.APIManager.APIManagerView.textDescriptor.getDescriptionText(key), url: '?menu=' + key });
            });
        }
        catch (error) {
            console.error(error);
            this.APIManager.APIManagerView.displayMessage('Error occured while building main menu items. Please check console for more details!!!');
        };

        return mainMenuList;
    };

    // Method to get required property or object by path - '.' separated string value.
    Model.prototype.getObjectByPath = function (dataObject, pathString) {
        if (_.isString(pathString)) {
            var paths = pathString.split('.');  // Split string by dot.

            try {
                // Loop through path and get object or property.
                _.each(paths, function (key, index) {
                    dataObject = dataObject[key];
                });
            }
            catch (error) {
                console.error(error);
                this.APIManager.APIManagerView.displayMessage('Module data object is undefined. Please check console for more details!!!');
            };

            return dataObject;
        };
    };

    // Method that will return currently selected module's data.
    Model.prototype.getSelectedDataObject = function () {
        return selectedObject;
    };

    Model.prototype.buildFileToExport = function (dataPath) {
        var dataToExport = modelUtils.getDataToExport.call(this, dataPath);
    };

    return Model;
});