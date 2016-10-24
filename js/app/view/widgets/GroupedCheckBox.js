(function (define, $) {
    var getDefaultConfig = function () {
        return {
            items: null,
            change: function (e) { }
        };
    };

    var CheckboxGroup = function (container, options) {
        this.config = $.extend(true, {}, getDefaultConfig(), options);
        this.$checkboxPool = null;
        this.$container = container.jquery ? container : $(container);
        this.$group = $('<div>').addClass('CheckboxGroup');
        this.render();
    };

    CheckboxGroup.prototype.render = function () {
        var config = this.config,
            items = config.items || [],
            $items = [];

        items.forEach(function (item) {
            $items.push($('<div class="CheckboxContainer"><input type="checkbox" name="' + item.name || '' + '" class="CheckboxItem" /><span class="ItemText">' + item.text || item.name || 'No name' + '</span></div>'));
        });

        this.$group.append($items).appendTo(this.$container);

        this.$checkboxPool = this.$group.find('.CheckboxItem');
    };

    CheckboxGroup.prototype._initChangeHandler = function () {
        var me = this;
        me.$group.on('change', '.CheckboxItem', function (e) {
            var $currentTarget = $(e.currentTarget);
            me.$checkboxPool.not($currentTarget).prop('checked', false);
            me.config.change.call(me, e);
        });
    };

    CheckboxGroup.prototype.getSelectedItem = function () {
        this.$checkboxPool.filter(function () {
            return this.checked;
        });
    };

    CheckboxGroup.prototype.destroy = function () {
        this.$group.off('change').remove();
    };
})(define, $);