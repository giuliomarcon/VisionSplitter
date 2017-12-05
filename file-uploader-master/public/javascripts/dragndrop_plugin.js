ko.bindingHandlers.drag = {
    init: function(element, valueAccessor, allBindingsAccessor, 
                   viewModel, context) {
        var value = valueAccessor();
        $(element).draggable({
            containment: 'window',
            helper: function(evt, ui) {
                var h = $(element).clone().css({
                    width: $(element).width(),
                    height: $(element).height()
                });
                h.data('ko.draggable.data', value(context, evt));
                return h;
            },
            appendTo: 'body'
        });
    }
};

ko.bindingHandlers.drop = {
    init: function(element, valueAccessor, allBindingsAccessor, 
                   viewModel, context) {
        var value = valueAccessor();
        $(element).droppable({
            tolerance: 'pointer',
            hoverClass: 'dragHover',
            activeClass: 'dragActive',
            drop: function(evt, ui) {
                value(ui.helper.data('ko.draggable.data'), context);
            }
        });
    }
};