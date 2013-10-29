if (typeof toolkit === 'undefined') toolkit = {};
toolkit.remoterecord = (function(window, $) {
    'use strict';

    function RemoteRecordButton(element, options) {
        this.options = options;
        this.channelId = element.data('channelId');
        this.eventId = element.data('eventId');
        this.startTime = element.data('startTime');
        this.element = element;

        if (this.channelId && (this.eventId || this.startTime)) {
            this.appendButton();
        } else {
            this.showMissingAttributeError();
        }
    }

    RemoteRecordButton.prototype = {
        showMissingAttributeError: function() {
            this.element.html('required attributes data-channel-id or data-event-id / data-start-time not found');
        },

        appendButton: function() {
            var self = this,
                buttonHtml = '<div role="button" class="remote-record">Record</div>',
                button = $(buttonHtml).on('click', function() {
                    self.triggerRecord();
                });

            this.element.empty();
            this.element.append(button);
        },

        triggerRecord: function() {
            if (this.eventId === undefined) {
                this.getEventId();
            } else {
                this.showPopoverOrRecord();
            }
        },

        getEventId: function() {
            var self = this;
            $.ajax({url: this.options.epgServicesUrl + 'prog/json/lookup/' + this.channelId + '/' + this.startTime, dataType: 'json'})
                .done(function(resp) {
                    self.eventId = resp.eid;
                    self.showPopoverOrRecord();
                });
        },

        showPopoverOrRecord: function() {
            var self = this;
            $.ajax({url: this.options.epgServicesUrl + 'prog/json/serieslinkinfo/' + this.channelId + '/' + this.eventId, dataType: 'json'})
                .done(function(seriesInfoResp) {
                    self.isSeriesLink = ( seriesInfoResp.rr == 'S' );
                    if (self.isSeriesLink) {
                        $.ajax({url: self.options.epgServicesUrl + 'rractivation/json/serieslinkenabled', dataType: 'json'})
                            .done(function() {
                                self.showRemoteRecordPopover();
                            })
                            .fail(function() {
                                self.authenticate();
                            });
                    } else {
                        self.record(false);
                    }
                });
        },

        record: function(isSeries) {
            var self = this;
            $.ajax({url: this.options.epgServicesUrl + 'prog/json/rr/' + this.channelId + '/' + this.eventId + ( isSeries ? '?sl=true' : '' ), dataType: 'json'})
                .done(function() {
                    var rrButton = self.element.find('.remote-record');
                    rrButton.off('click');
                    rrButton.addClass('recorded');
                    if (isSeries) {
                        rrButton.addClass('series');
                    }
                })
                .fail(function() {
                    self.authenticate();
                });
        },

        authenticate: function() {
            window.location.href = this.options.skyIdUrl + '?successUrl=' + encodeURIComponent(window.location.href);
        },

        showRemoteRecordPopover: function() {
            var self = this,
                popoverHtml = '<ul class="popover"></ul>',
                popover = $(popoverHtml),
                recordOnceHtml = '<li><a class="record-once">Record Once</a></li>',
                recordOnce = $(recordOnceHtml).on('click', function() {
                    self.record(false);
                }),
                recordSeriesHtml = '<li><a class="record-series">Record Series</a></li>',
                recordSeries = $(recordSeriesHtml).on('click', function() {
                    self.record(true);
                });
            popover.append(recordOnce);
            popover.append(recordSeries);
            this.element.append(popover);
            this.element.find('.popover').addClass('active');
        }

    };

    $.fn.skycom_remoterecord = function(params) {
        var options = $.extend(true, {
            epgServicesUrl: 'http://epgservices.sky.com/39.1.1/api/2.1/',
            skyIdUrl: 'https://skyid.sky.com/signin/'
        }, params);

        return this.each(function() {
            var $this = $(this);
            var remoterecord = new RemoteRecordButton($this, options);
        });
    };
}(window, jQuery));

if (typeof window.define === "function" && window.define.amd) {
    define('modules/remoterecord', [], function() {
        return toolkit.remoterecord;
    });
}