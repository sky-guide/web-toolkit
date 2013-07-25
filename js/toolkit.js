!function(a,b){"use strict";function c(a,b){this.options=b,this.$viewport=a,this.$slideContainer=a.find(".skycom-carousel-container"),this.$slides=this.$slideContainer.find(">"),this.currentIndex=0,this.slideCount=this.$slides.length,this.timerId=!1,this.touchReset(),this.bindEvents()}function d(a,c,d){this.carousel=c,this.wrapper=a,this.videoId=this.wrapper.data("video-id"),this.player=this.wrapper.find("video"),this.player.sky_html5player(b.extend(!0,{videoId:this.videoId},d.player)),this.videocontrolcontainer=this.wrapper.find(".videocontrolcontainer"),this.videocontrolcontainer.find("img").on("error",function(){this.src=d.placeHolderImage}),this.bindEvents()}var e=function(){return"WebKitCSSMatrix"in a&&"m11"in new a.WebKitCSSMatrix}(),f=function(){var a=document.body.style;return void 0!==a.transform||void 0!==a.WebkitTransform||void 0!==a.MozTransform||void 0!==a.OTransform}(),g="ontouchend"in document.documentElement?"touchend":"click";c.prototype={unbindTouchEvents:function(){this.$slideContainer.off("touchstart touchmove touchend touchcancel")},bindTouchEvents:function(){this.$slideContainer.on("touchstart",this.touchstart.bind(this)).on("touchmove",this.touchmove.bind(this)).on("touchend",this.touchend.bind(this)).on("touchcancel",this.touchReset.bind(this))},bindEvents:function(){this.bindTouchEvents(),this.$slideContainer.find("a").on("click",this.pause.bind(this))},unbindEvents:function(){this.unbindTouchEvents(),this.$slideContainer.find("a").off("click")},setOffset:function(a,b){var c=this.$slideContainer.removeClass("animate");return b&&c.addClass("animate"),e?c.css("transform","translate3d("+a+"%,0,0) scale3d(1,1,1)"):f?c.css("transform","translate("+a+"%,0)"):b?c.animate({left:2*a+"%"},600):c.css({left:2*a+"%"}),this},moveSlide:function(a){var b,c,d=this,e=this.$slides;return c=a.index>=this.slideCount?0:a.index<0?this.slideCount-1:a.index,b=a.index>this.currentIndex&&!a.reverse?"left":"right",e.filter(":not(:eq("+this.currentIndex+"))").hide(),e.eq(this.currentIndex).css("float",b),e.eq(c).show().css("float","left"==b?"right":"left"),this.setOffset(a.start,!1),"undefined"!=typeof a.end&&(setTimeout(function(){d.setOffset(a.end,!0),d.$viewport.trigger("change",c)},20),this.currentIndex=c,"function"==typeof a.callback&&a.callback(c)),c},"goto":function(a,b,c){return b!==!1&&this.pause(),a!==this.currentIndex?(a>this.currentIndex?this.moveSlide({index:a,start:0,end:-50,callback:c}):this.moveSlide({index:a,start:-50,end:0,callback:c}),this):void 0},next:function(a,b){return this.goto(this.currentIndex+1,a,b),this.$viewport.find(".indicators, .actions").css("display","block"),this},previous:function(){return this.goto(this.currentIndex-1),this.$viewport.find(".indicators, .actions").css("display","block"),this},play:function(a,b){var c=this,d=this.options.interval;return c.timerId=setTimeout(function(){c.next(!1),c.timerId=setTimeout(function a(){c.next(!1,function(){c.timerId=setTimeout(a,d)})},d)},b||this.options.onPlayDelay),this.$viewport.trigger("playing"),"function"==typeof a&&a(),this},pause:function(a){return clearTimeout(this.timerId),this.$viewport.trigger("paused"),"function"==typeof a&&a(),this},touchstart:function(a){var b=a.originalEvent.touches[0];this.pause(),this.swipe.start={x:b.pageX,y:b.pageY}},touchmove:function(a){var b,c=this.swipe,d=a.originalEvent.touches[0],e=d.pageX-c.start.x,f=d.pageY-c.start.y,g=Math.abs(e)>Math.abs(f),h=0>e?this.currentIndex+1:this.currentIndex-1;c.start&&g!==!1&&(a.preventDefault(),b=100*(e/this.$slideContainer.outerWidth(!0)),e>0&&(b-=50),this.swipe.positionAsPercentage=b,this.moveSlide({index:h,start:b}))},touchend:function(a){if(this.swipe.start){var b=this.swipe,c=b.positionAsPercentage,d=a.originalEvent.changedTouches[0],e=d.pageX-b.start.x,f=null,g=75;if(Math.abs(e)>g&&(f=0>e?"left":"right"),"left"===f)this.moveSlide({index:this.currentIndex+1,start:c,end:-50});else if("right"===f)this.moveSlide({index:this.currentIndex-1,start:c,end:0});else if(0!==c){var h,i=e>0?c+50:c,j=this.currentIndex,k=0;0>i?this.currentIndex=j+1>=this.slideCount?0:j+1:(this.currentIndex-=1,k=-50,i-=50),h=0===this.currentIndex&&j===this.slideCount-1,this.moveSlide({index:j,start:i,end:k,reverse:h})}this.touchReset()}},touchReset:function(){this.swipe={start:!1,positionAsPercentage:0}}},d.prototype={bindEvents:function(){var a=this,b=function(){return!1},c=function(){return a.stop(),d.off("click",b),!1},d=this.wrapper;d.on("click",b).find(".close").one(g,c),this.player.on("ended webkitendfullscreen",c)},play:function(){var a=this,b=this.carousel.$viewport.find(".actions, .indicators");this.originalHtml=this.videocontrolcontainer.html(),this.carousel.pause(),this.showCanvas(function(){b.hide(),a.carousel.unbindTouchEvents(),a.videocontrolcontainer.add(a.player).show(),sky.html5player.play(a.wrapper)})},stop:function(){var a=this,c=this.carousel.$viewport.find(".actions, .indicators");sky.html5player.close(this.wrapper),this.hideCanvas(function(){a.carousel.bindTouchEvents(),a.videocontrolcontainer.hide().remove(),c.show(),b("<div></div>").addClass("videocontrolcontainer").html(a.originalHtml).appendTo(a.wrapper)})},showCanvas:function(a){var b,c=this.carousel.$viewport,d=c.find(".video-overlay"),e=c.find(".video-wrapper"),f=c.find(".video-wrapper .play"),g=c.find(".video-wrapper .close"),h=500;this.originalHeight=c.height(),e.addClass("playing-video"),d.fadeIn(function(){f.fadeOut(),b=Math.round(9*(c.width()/16)),c.animate({height:b},h,function(){a(),d.fadeOut(h,function(){g.addClass("active")})})})},hideCanvas:function(a){var c=this.carousel.$viewport,d=c.find(".video-overlay"),e=c.find(".video-wrapper"),f=c.find(".video-wrapper .play"),g=c.find(".video-wrapper .close"),h=500,i=this.originalHeight;d.fadeIn(h,function(){g.removeClass("active"),b(".skycom-carousel").animate({height:i},h,function(){b(".skycom-carousel").css({height:"auto"}),a(),f.fadeIn(),d.fadeOut(),e.removeClass("playing-video")})})}},b.fn.skycom_carousel=function(a){var e=b.extend(!0,{carousel:{actions:[{id:"previous",label:"Previous"},{id:"next",label:"Next"},{id:"play",label:"Play Carousel"},{id:"pause",label:"Pause Carousel"}],autoplay:!0,onPlayDelay:500,interval:6e3},video:{player:{token:"8D5B12D4-E1E6-48E8-AF24-F7B13050EE85",autoplay:!1},placeHolderImage:"//static.video.sky.com/posterframes/skychasky.jpg",autoplay:!globalskycom.browserSupport.isMobile()}},a),f={actions:function(a,c){var d,e,f,g,h="",i=c.actions,j=c.onclick;if(c.count<=1)return this;for(f in i)g="",d=i[f].id,e=i[f].label,("next"==d||"previous"==d)&&(g=" hidden-touch "),h+='<a href="#" class="skycom-internal '+g+d+'" >',h+='<span class="icon-carousel-'+d+'"></span>'+e,("next"==d||"previous"==d)&&(h+='<span class="icon-carousel-'+d+'-over over"></span>'),h+="</a>";return a.prepend('<div class="actions">'+h+"</div>").find("> .actions > *").each(function(a){b(this).attr("data-action",i[a].id).on("click",function(b){j(i[a].id),b.preventDefault()})}),this},indicators:function(a,c){var d,e,f=c.count,g=c.onclick,h='<div class="indicators"><div class="container">',i=' class="active"';if(1>=f)return this;for(e=f;e--;)h+="<span"+i+' data-track data-tracking-label="indicator"></span>',i="";return d=b(h+"</div></div>").on("click","span",function(a){g(b(a.currentTarget).index())}),a.append(d),this},video:function(a){return a.append('<div class="video-overlay"></div>'),this}};return this.each(function(){var a=b(this),g=new c(a,e.carousel);f.indicators(a,{count:g.slideCount,onclick:function(a){g.goto(a)}}).actions(a,{count:g.slideCount,actions:e.carousel.actions,onclick:function(a){g[a]()}}).video(a),a.on("click",".video-wrapper .play",function(){var a=new d(b(this).closest(".video-wrapper"),g,e.video);return a.play(),!1}).on("change",function(b,c){c=c||0,a.find(".indicators .container > *").removeClass("active").eq(c).addClass("active"),g.$slides.removeClass("active").find("a").attr("tabindex",-1),g.$slides.eq(c).addClass("active").find("a").removeAttr("tabindex")}).on("playing",function(){a.removeClass("paused").addClass("playing")}).on("paused",function(){a.removeClass("playing").addClass("paused")}).on("pause",function(){g.pause()}).on("play",function(){g.play()}).on("keyup",function(a){switch(a.keyCode){case 9:g.pause();break;case 37:g.previous();break;case 39:g.next()}}).find(".toggle-terms").on("click",function(){g.$viewport.toggleClass("showing-tandcs")}),g[e.carousel.autoplay===!0?"play":"pause"](!1,e.carousel.interval),a.trigger("change")})}}(window,jQuery),"undefined"==typeof skytoolkit&&(skytoolkit={}),skytoolkit.tabs=function(a){function b(){f.rememberState?a.register(c(),d):e.tabs.on("click",function(a){a.preventDefault(),d($(this).find("a").attr("href"))})}function c(){var a=[];return e.tabs.each(function(){a.push($(this).attr("aria-controls"))}),a}function d(a){e.tabTargets.add(e.tabs).removeClass("selected"),$(a+"-tab").add($(a)).addClass("selected")}var e={tabContainer:$("section[data-function=tabs]"),tabs:$("section[data-function=tabs] li[role=tab]"),tabTargets:$("section[data-function=tabs] div[role=tabpanel]")},f={rememberState:"true"===e.tabContainer.attr("data-remember-state")};return b(),{getHashList:c,changeTab:d}},"function"==typeof window.define&&window.define.amd?window.define("modules/tabs",["utils/hash-manager"],function(a){return skytoolkit.tabs=skytoolkit.tabs(a),skytoolkit.tabs}):skytoolkit.tabs=skytoolkit.tabs(skytoolkit.hash-manager);
/*
//@ sourceMappingURL=toolkit.js.map
*/