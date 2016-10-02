define(['text!../../../data/descriptionText.json'], function (descriptionTextJSON) {
    
    var currentDescriptionTextObject = {},

        // This method returns a method that will fetch corresponding customKeywordText or description text.
        loadDescriptionText = function () {
            var parsedDescriptionTextObject = JSON.parse(descriptionTextJSON), descriptionTextObject = {};

            $.each(parsedDescriptionTextObject, function (moduleName, descriptionObject) {
                if (moduleName[0] != '_') {
                    descriptionTextObject[moduleName] = $.extend(true, {}, parsedDescriptionTextObject._CommonDescriptions, descriptionObject || {});
                };
            });

            return function (key) {
                currentDescriptionTextObject = descriptionTextObject[key];
            };
        };

    // textDescriptor class to render description text.
    var TextDescriptor = function () {
        this.setDescriptionTextObject = loadDescriptionText();
    };

    // This method returns corresponding customKeywordText or description text.
    TextDescriptor.prototype.getDescriptionText = function (key) {
        return currentDescriptionTextObject[key] || key;
    };

    return new TextDescriptor();
});