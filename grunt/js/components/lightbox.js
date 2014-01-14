/*global jQuery:false */
if (typeof toolkit==='undefined') toolkit={};
toolkit.lightbox = (function ($, keyboardFocus, hash) {
    "use strict";
	var classes = {
            main: 'lightbox',
            closing: 'lightbox-closing',
            content: 'lightbox-content',
            closeButton: 'lightbox-close',
            open: 'lightbox-open'
        },
        scrollbarWidth = function() {
            var scrollDiv = document.createElement("div"),
                scrollbarWidth;
            scrollDiv.className = "lightbox-scrollbar-measure";
            document.body.appendChild(scrollDiv);
            scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            return scrollbarWidth;
        }();

    var html = {
        waitingForAjax: '<div class="lightbox-content"><div class="skycom-container"><div class="skycom-12"><div class="spinner-blue"><p>Please wait...</p></div></div></div></div>'
    };

	function disableElementTabbing(index, element) {
		var $element = $(element);
		$element.attr('data-tabindex', $element.attr('tabindex'));
		$element.attr('tabindex', -1);
	}
    function enableElementTabIndex(index, element) {
        var $element = $(element);
        if ($element.attr('data-tabindex')) {
            $element.attr('tabindex', $element.attr('data-tabindex'));
            $element.removeAttr('data-tabindex');
        } else {
            $element.removeAttr('tabindex');
        }
    }

    function disablePageTabbing(){
        $('a, input, select, textarea, button, *[tabindex]').each(disableElementTabbing);
    }
    function enablePageTabbing($container){
        $container.find('*[tabindex]').each(enableElementTabIndex);
    }

    function focusOnLightboxLink(link){
        if (!link) { return; }
        link.focus();
    }
    function focusOnCloseButton($lightboxLink, $closeIcon){
        if ($lightboxLink.hasClass(keyboardFocus.className)) {
            keyboardFocus.apply($closeIcon[0]);
        }else{
            $closeIcon[0].focus();
        }
    }

    function hideBodyScrollBar(){
        $('body').css( {
            'overflow':		'hidden',
            'padding-right': scrollbarWidth + 'px'
        });
    }
    function showBodyScrollBar(){
        $('body').removeAttr('style');
    }

    function Lightbox(href, $lightboxLink, options){
        this.ajax = false;
        if (href.substring(0,1) === '#') {
            this.setup(href.replace('#!',''), $lightboxLink, options);
        }
        else {
            this.ajax = true;
            this.$lightboxLink = $lightboxLink;
            this.$lightboxLink.on("click", this.openAjax.bind(this));
        }
    }

	Lightbox.prototype = {

        setup: function(href, $lightboxLink, options) {
            var $element = $('#' + href.replace('lightbox/',''));

            this.id = href;
            this.$container = ($element.hasClass(classes.main)) ? $element : $element.closest('.' + classes.main);
            this.$contents = (this.$container.length) ? this.$container.find('.' + classes.content) : $element ;
            this.$closeIcon = this.$container.find('.' + classes.closeButton);
            this.$lightboxLink = $lightboxLink;

            if (!this.$container.length){
                this.create();
                this.bindEvents();
            }
            if (options){
                this.onShow = options.onShow;
                this.onClose = options.onClose;
            }
        },

        bindEvents: function() {
            if (!this.ajax) {
                hash.register([this.id],this.open.bind(this) );
                this.$lightboxLink.on("click", this.open.bind(this));
            }
            this.$contents.on("click", function(e) { return false; });
            this.$closeIcon.on("click", this.close.bind(this));
            this.$container.on("click", this.close.bind(this));
		},

        create: function(){
            var $contents = this.$contents,
                $parent = this.$contents.parent(),
                $lightboxDiv = $('<div class="' + classes.main + '"></div>'),
                $container = $('<div class="skycom-container lightbox-container clearfix"></div>'),
                $close = $('<a class="internal-link ' + classes.closeButton + ' skycon-close" href="#!"><span class="speak">Close</span></a>');

            $contents.addClass(classes.content + ' skycom-10 skycom-offset1').attr('role','dialog');
            $contents.prepend($close);

            $container.append($contents);
            $lightboxDiv.append($container);
            $parent.append($lightboxDiv);

            this.$container = $lightboxDiv;
            this.$closeIcon = $close;
        },

		open: function() {
            if (this.$container.hasClass(classes.open)) { return ; }
            if (this.onShow){
                this.onShow();
            }
            hideBodyScrollBar();

            this.$container.addClass(classes.open);

            focusOnCloseButton(this.$lightboxLink, this.$closeIcon);
            disablePageTabbing();
            enablePageTabbing(this.$container);
		},

        openAjax: function() {
            var lightbox = this;
            lightbox.$contents = $( html.waitingForAjax n);
            $("body").append(lightbox.$contents);
            lightbox.create();
            lightbox.bindEvents();
            lightbox.open();

            var promise = $.get(this.$lightboxLink.attr('href'));
            promise.done(function(data) {
                lightbox.$contents.html(data);
            });

            return false;
        },

		close: function(event) {
            var lightbox = this;
			event.preventDefault();
            if (this.$container.hasClass(classes.closing)) { return ; }

            this.$container.addClass(classes.closing);
            hash.remove();

            window.setTimeout(function() {
                lightbox.$container.removeClass(classes.open + ' ' + classes.closing);
                focusOnLightboxLink(lightbox.$lightboxLink);
                showBodyScrollBar();
                enablePageTabbing($('body'));
                if (lightbox.onClose){
                    lightbox.onClose();
                }
                if (lightbox.ajax) {
                    lightbox.destroy();
                }
            }, 500);
		},

        destroy: function() {
            this.$contents.closest('.' + classes.main).remove();
        }
	};

	$.fn.lightbox = function(options) {
		return this.each(function() {
			var lb = new Lightbox($(this).attr('href'),$(this), options);
		});
	};

});

if (typeof window.define === "function" && window.define.amd) {
    define('components/lightbox', ['utils/focus', 'utils/hashManager'], function(focus, hash) {
        'use strict';
        return toolkit.lightbox(jQuery, focus, hash);
    });
} else {
    toolkit.lightbox = toolkit.lightbox(jQuery, toolkit.focus, toolkit.hashManager);
}