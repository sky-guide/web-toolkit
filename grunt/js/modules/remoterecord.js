if (typeof toolkit === 'undefined') toolkit = {};
toolkit.remoterecord = (function (window, $) {
    'use strict';

    function RemoteRecordButton(element, options) {
        this.options = options;
        this.channelId = element.data('channelId');
        this.eventId = element.data('eventId');
        this.startTime = element.data('startTime');
        this.element = element;

        if (this.channelId && ( this.eventId || this.startTime )) {
            this.appendButton();
        }
        else {
            this.showMissingAttributeError();
        }
    }

    RemoteRecordButton.prototype = {

        showMissingAttributeError: function () {
            this.element.html('required attributes data-channel-id or data-event-id / data-start-time not found');
        },

        appendButton: function () {
            var self = this,
                buttonHtml = '<div role="button" class="remote-record">Record</div>',
                button = $(buttonHtml).on('click', function () {
                    self.triggerRecord()
                });

            this.element.empty();
            this.element.append(button);
        },

        triggerRecord: function () {
            if (this.eventId == undefined) {
                this.getEventId();
            } else {
                this.showPopoverOrRecord();
            }
        },

        getEventId: function () {
            var self = this;
            $.get(this.options.epgServicesUrl + 'prog/json/lookup/' + this.channelId + '/' + this.startTime, function (resp) {
                self.eventId = resp.eid;
                self.showPopoverOrRecord();
            }, 'json');
        },

        showPopoverOrRecord: function () {
            var self = this;
            $.get(this.options.epgServicesUrl + 'prog/json/serieslinkinfo/' + this.channelId + '/' + this.eventId, function (seriesInfo) {
                self.isSeriesLink = ( seriesInfo.rr == 'S' );
                if (self.isSeriesLink) {
                    $.get(self.options.epgServicesUrl + 'rractivation/json/serieslinkenabled', function (seriesLinkEnabled) {
                        self.showRemoteRecordPopover();
                    }, 'json');
                } else {
                    self.record(false);
                }
            }, 'json');
        },

        record: function (isSeries) {
            var self = this;
            $.get(this.options.epgServicesUrl + 'prog/json/rr/' + this.channelId + '/' + this.eventId + ( isSeries ? '?sl=true' : '' ), function (resp) {
                if (resp.status == '401') {
                    self.showLoginScreen();
                } else {
                    var rrButton = self.find('.remote-record');
                    rrButton.off('click');
                    srrButton.addClass('recorded');
                    if (self.isSeriesLink) {
                        rrButton.addClass('series');
                    }
                }
            }, 'json');
        },

        showLoginScreen: function () {
            var self = this;
            popup.init();
            popup.open({
                url: 'https://skyid.sky.com/signin/?appearance=compact&successUrl='
                    + encodeURI(window.loation.href)
                    + '&cancelUrl='
                    + encodeURI(window.loation.href),
                width: 400,
                height: 380
            });
        },

        showRemoteRecordPopover: function () {
            var self = this,
                popoverHtml = '<ul class="popover"></ul>',
                popover = $(popoverHtml),
                recordOnceHtml = '<li><a>Record Once</a></li>',
                recordOnce = $(recordOnceHtml).on('click', self.record(false)),
                recordSeriesHtml = '<li><a>Record Series</a></li>',
                recordSeries = $(recordSeriesHtml).on('click', self.record(true));
            popover.append(recordOnce);
            popover.append(recordSeries);
            this.element.append(popover);
            this.element.find('.popover').addClass('active');
        }

    };

    $.fn.skycom_remoterecord = function (params) {
        var options = $.extend(true, {
            epgServicesUrl: 'http://epgservices.sky.com/39.1.1/api/2.1/'
        }, params);

        return this.each(function () {
            var $this = $(this);
            var remoterecord = new RemoteRecordButton($this, options);
        });
    };
}
    (window, jQuery)
    )
;

if (typeof window.define === "function" && window.define.amd) {
    define('modules/remoterecord', [], function () {
        return toolkit.remoterecord;
    });
}