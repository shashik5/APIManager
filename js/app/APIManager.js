define('APIManagerApp', ['app/model/model', 'app/view/view', 'app/controller/controller', 'app/settingsManager'], function (Model, View, Controller, SettingsManager) {

    // API Manager Application.
    var APIManager = function (container) {

        this.appSettings = new SettingsManager();

        // Instantiation of Model, View and Controller.
        this.APIManagerView = new View({ APIManager: this, container: container || document.body });
        this.APIManagerModel = new Model({ APIManager: this, moduleDataPath: this.appSettings.getAllModulesPath() });
        this.APIManagerController = new Controller({ APIManager: this });
    };

    // Method to start API manager application. Takes no arguments.
    APIManager.prototype.start = function () {

        // Reading url string to load previously loaded page.
        var urlString = document.URL;
        var mainMenuName = urlString.match(/([?]menu)*?=[^&#]*/g),
            menuName = mainMenuName ? mainMenuName[0].split('=')[1] : this.appSettings.getAppSettings().DefaultMainMenu;

        if (menuName) {
            // This will load main menu item mentioned in url string if mentioned else default menu.
            try {
                this.appSettings.setAppSettings(menuName);
                this.APIManagerModel.selectObject(menuName);
                this.APIManagerView.textDescriptor.setDescriptionTextObject(menuName);
            }
            catch (error) {
                console.error(error);
                this.APIManager.APIManagerView.displayMessage('Error occured while selecting main menu. Please check console for more details!!!');
            };
        };

        // Generate main menu items.
        var mainMenuData = this.APIManagerModel.generateMainMenuList();

        // Create main menu.
        this.APIManagerView.createMainMenu(mainMenuData);

        // Generate menu list by excluding unwanted properties data object.
        var menuData = this.APIManagerModel.generateSubMenuList();

        // Create menu from ganerated menu list.
        this.APIManagerView.createSubMenu(menuData);

        // Initialze page by hash value in url.
        this.APIManagerController.initializePage(menuName);

        // Mark menu selection.
        this.APIManagerView.markSelectedMainMenu(menuName);

        // Remove loading animation.
        $('.loaderContainer').remove();
    };

    return APIManager;

});