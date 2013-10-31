if (typeof toolkit === 'undefined') toolkit = {};
toolkit.remoterecord = (function(window, $) {
    'use strict';

    function RemoteRecordButton(element, options) {
        this.options = options;
        this.channelId = element.data('channelId');
        this.eventId = element.data('eventId');
        this.startTime = element.data('startTime');
        this.element = element;
        this.constants = {
            UNABLE_TO_MAKE_REMOTE_RECORD_REQUEST: "Unable to make remote record request",
            UNABLE_TO_RECORD_PAY_PER_VIEW_BROADCAST: "Unable to record pay-per-view broadcast",
            UNABLE_TO_DETERMINE_SKY_BOX_DUE_TO_MULTIPLE_VIEWING_CARDS: "Unable to determine Sky+ box due to multiple viewing cards",
            INTERNAL_ERROR: "Internal error",
            THIS_PROGRAMME_IS_NOT_AVAILABLE_IN_YOUR_REGION: "This programme is not available in your region",
            YOU_ARE_NOT_SIGNED_UP_FOR_REMOTE_RECORD: "You are not signed up for remote record",
            YOU_DO_NOT_HAVE_SKY: "You do not have Sky+",
            YOU_ARE_NOT_A_SKY_SUBSCRIBER: "You are not a Sky subscriber",
            YOU_ARE_NOT_LOGGED_IN: "You are not logged in",
            PROGRAMME_HAS_ALREADY_STARTED: "Programme has already started",
            PROGRAMME_NOT_FOUND: "Programme not found"
        };

        if (this.channelId && (this.eventId || this.startTime)) {
            this.appendButton();
        } else {
            this.showError('required attributes data-channel-id or data-event-id / data-start-time not found');
        }
    }

    RemoteRecordButton.prototype = {
        showError: function(message) {
            this.element.html(message);
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
                .done(function(data) {
                    switch (data.rr) {
                        case 0:
                            var rrButton = self.element.find('.remote-record');
                            rrButton.off('click');
                            rrButton.addClass('recorded');
                            if (isSeries) {
                                rrButton.addClass('series');
                            }
                            break;
                        case 1:
                            self.showError(self.constants.PROGRAMME_NOT_FOUND);
                            break;
                        case 2:
                            self.showError(self.constants.PROGRAMME_HAS_ALREADY_STARTED);
                            break;
                        case 3:
                            self.showError(self.constants.YOU_ARE_NOT_LOGGED_IN);
                            break;
                        case 4:
                            self.showError(self.constants.YOU_ARE_NOT_A_SKY_SUBSCRIBER);
                            break;
                        case 5:
                            self.showError(self.constants.YOU_DO_NOT_HAVE_SKY);
                            break;
                        case 6:
                            self.showError(self.constants.YOU_ARE_NOT_SIGNED_UP_FOR_REMOTE_RECORD);
                            break;
                        case 7:
                            self.showError(self.constants.THIS_PROGRAMME_IS_NOT_AVAILABLE_IN_YOUR_REGION);
                            break;
                        case 8:
                            self.showError(self.constants.INTERNAL_ERROR);
                            break;
                        case 9:
                            self.showError(self.constants.UNABLE_TO_DETERMINE_SKY_BOX_DUE_TO_MULTIPLE_VIEWING_CARDS);
                            break;
                        case 10:
                            self.showError(self.constants.UNABLE_TO_RECORD_PAY_PER_VIEW_BROADCAST);
                            break;
                        default:
                            self.showError(self.constants.UNABLE_TO_MAKE_REMOTE_RECORD_REQUEST);
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
                triggerEvents = 'keypress click',
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
}
    (window, jQuery)
    )
;

if (typeof window.define === "function" && window.define.amd) {
    define('modules/remoterecord', [], function() {
        return toolkit.remoterecord;
    });
}