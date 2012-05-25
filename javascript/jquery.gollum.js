(function ($) {
    var defaults = {
        toolbar: {
            "h1": ["h1", "Header 1", "h1"],
            "h2": ["h2", "Header 2", "h2"],
            "h3": ["h3", "Header 3", "h3"],
            "divider": "-",
            "link": ["link", "Link", "link"],
            "image": ["image", "Image", "download-media"],
            "divider": "-",
            "bold": ["bold", "Bold", "bold"],
            "italic": ["italic", "Italic", "italic"],
            "code": ["code", "Code", "code"],
            "divider": "-",
            "ul": ["ul", "Unordered List", "u-list"],
            "ol": ["ol", "Ordered List", "o-list"],
            "blockquote": ["blockquote", "Blockquote", "quotemark"],
            "hr": ["hr", "Horizontal Rule", "horizontal-rule"],
            "divider": "-",
            "help": ["help", "Help", "help"],
        }
    };
    
    var methods = {
    	init : function (options) {
    	    options = $.extend(defaults, options);
    	    
    	    $(this).attr('format', 'markdown')
    	        .wrap($('<div>', {'id': 'gollum-editor', 'class': 'gollum-editor'}));

    	    var wrapper = $('#gollum-editor');
    	        
    	    var functionbar = $('<div>', {'id': 'gollum-editor-function-bar', 'class': 'gollum-editor-function-bar'});
    	    wrapper.prepend(functionbar);
    	    
    	    var buttons = $('<div>', {'id': 'gollum-editor-function-buttons', 'class': 'gollum-editor-function-buttons'});
    	    functionbar.append(buttons);
    	    
    	    $.each(options.toolbar, function(key, val){
    	        if (key == 'divider')
    	            button = $('<span>', {'class': 'function-divider'}).html('&nbsp;');
    	        else
    	            button = $('<a>', {'href': '#', 'class': 'function-button function-' + val[0], 'id': 'function-' + val[0], 'title': val[1], 'tabindex': -1})
    	                .append($('<span>', {'class': 'mini-icon '+val[2]}));
    	        buttons.append(button);
    	    });
    	    
    	    functionbar.after('<div id="gollum-editor-help" class="gollum-editor-help"><ul id="gollum-editor-help-parent" class="gollum-editor-help-parent"><li></li></ul><ul id="gollum-editor-help-list" class="gollum-editor-help-list"><li></li></ul><div id="gollum-editor-help-wrapper" class="gollum-editor-help-wrapper"><div id="gollum-editor-help-content" class="gollum-editor-help-content"><p></p></div></div></div>');
    	           

    	    $.GollumEditor();
    		return this;
    	}
    };
    
    $.fn.gollum = function (method) {
    	if (methods[method]) {
    		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    	} else if (typeof method === 'object' || ! method) {
    		return methods.init.apply(this, arguments);
    	} else {
    		$.error('Method ' +  method + ' does not exist on $.gollum');
    	}
    };
}) (jQuery)