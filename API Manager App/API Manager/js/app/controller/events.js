define([], function () {

    // Utility object, where miscellaneous methods are written, these methods are used by event handlers.
    var utils = {
        // Method to parse url link and breaks down int primary link and secondary link.
        parseObjectLink: function (link) {
            var linkArray = link.split('.'),
                primaryLink = [],   // PrimaryLink holds the object path of the content to be loaded.
                secondaryLink = []; // SecondaryLink holds the property name to where scroll is to be adjusted.

            (linkArray[0].charAt(0) == '#') && (linkArray[0] = linkArray[0].slice(1, linkArray[0].length));
            primaryLink.push(linkArray[0]);
            if (linkArray.length > 1) {
                primaryLink.push(linkArray[1]);
                if (linkArray.length > 2) {
                    for (var i = 2; i < linkArray.length; i++) {
                        secondaryLink.push(linkArray[i]);
                    }
                    secondaryLink = secondaryLink.join('.');
                }
            };

            primaryLink = primaryLink.join('.');

            return { 'primaryLink': primaryLink, 'secondaryLink': secondaryLink, 'scrollToProperty': linkArray[linkArray.length - 1], 'templatePath': link }
        }
    },

        // Methods to load data in main content.
        loadMainContent = function (Args) {
            // Parse contentpath and pass it to loadMainContent method.
            Args.parsedLink = utils.parseObjectLink.call(this, Args.contentPath);

            if (Args.isPrimaryObjectPathChanged) {

                var dataObject = this.APIManager.APIManagerModel.getSelectedDataObject(), compiledTemplate = '';

                // Get required Object by passing data object and path as a arguments.
                Args.dataObject = this.APIManager.APIManagerModel.getObjectByPath(dataObject, Args.parsedLink.primaryLink);

                try {
                    // Load template with Args object all information regarding displaying data on page and store the compiled template in compiledTemplate variable.
                    Args.dataObject && (compiledTemplate = this.APIManager.APIManagerView.templates.renderTemplate(Args.templatePath, Args));
                }
                catch (err) {
                    console.error(err);
                    this.APIManager.APIManagerView.displayMessage('Error occured while loading template. Please check console for more details!!!');
                };

                // If template is complied successfully then load the template in container.
                if (compiledTemplate) {
                    this.APIManager.APIManagerView.mainContainer.html('');
                    this.APIManager.APIManagerView.mainContainer.html(compiledTemplate);
                };
            }


            // Adjust scroll after loading content.
            this.APIManager.APIManagerView.adjustScroll(Args.parsedLink.scrollToProperty);

            // Set attribute for anchors in content page to redirect url with new tab
            this.APIManager.APIManagerView.mainContainer.find('a[href^=http]')
                .attr('target', '_blank')
                .addClass('externalLink');
        };

    // Object where all event Handlers are defined.
    var eventHandlers = {

        // Method to load required content on page.
        EnterpriseManager: function (e, contentPath, options) {
            // Call loadMainContent to load content.
            loadMainContent.call(this, _.extend({}, { 'APIManager': this.APIManager, 'e': e, 'templatePath': this.APIManager.appSettings.getAppSettings().TemplatePath, 'contentPath': contentPath }, options));
        },

        // Default Handler Method to load required content on page.
        Default: function (e, contentPath, options) {
            // Call loadMainContent to load content.
            loadMainContent.call(this, _.extend({}, { 'APIManager': this.APIManager, 'e': e, 'templatePath': this.APIManager.appSettings.getAppSettings().TemplatePath, 'contentPath': contentPath }, options));
        }
    };

    return eventHandlers;
});