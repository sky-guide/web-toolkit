if (typeof toolkit === 'undefined') toolkit = {};
toolkit.remoterecord = (function(window, $) {
    'use strict';

    var errorMessages = {
        0: "Unable to make remote record request",
        1: "Programme not found",
        2: "Programme has already started",
        3: "You are not logged in",
        4: "You are not a Sky subscriber",
        5: "You do not have Sky+",
        6: "You are not signed up for remote record",
        7: "This programme is not available in your region",
        8: "Internal error",
        9: "Unable to determine Sky+ box due to multiple viewing cards",
        10: "Unable to record pay-per-view broadcast"
    };

    function RemoteRecordButton(element, options) {
        this.options = options;
        this.channelId = element.data('channelId');
        this.eventId = element.data('eventId');
        this.startTime = element.data('startTime');
        this.element = element;

        if (this.channelId && (this.eventId || this.startTime)) {
            this.appendButton();
        } else {
            this.showError('required attributes data-channel-id or data-event-id / data-start-time not found');
        }
    }

    function fetchDataJsonp(url) {
        var dfd = $.Deferred();

        $.ajax({ url: url + "?jsonp=jqueryCallback&callback=?",
            dataType: 'jsonp',
            async: false,
            jsonpCallback: 'jqueryCallback',
            contentType: "application/json" })
            .done(onDone)
            .fail(onFail);

        function onDone(response) {
            if(response.status === 200) {
                dfd.resolve(response.body)
            } else {
                dfd.reject({status: response.status})
            }
        }

        function onFail(response) {
            dfd.reject({status: response.status})
        }

        return dfd.promise();
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

            var url = self.options.epgServicesUrl + 'prog/json/lookup/' + self.channelId + '/' + self.startTime;
            fetchDataJsonp(url)
                .done(function(data) {
                    self.eventId = data.eid;
                    self.showPopoverOrRecord();
                })
                .fail(self.handleErrors);
        },

        showPopoverOrRecord: function() {
            var self = this;

            var url = self.options.epgServicesUrl + 'prog/json/serieslinkinfo/' + self.channelId + '/' + self.eventId;
            fetchDataJsonp(url)
                .done(self.handleSeriesInfo)
                .fail(self.handleErrors);
        },

        handleSeriesInfo: function(data) {
            var self = this;

            self.isSeriesLink = ( data.rr == 'S' );
            if (self.isSeriesLink) {
                var url = self.options.epgServicesUrl + 'rractivation/json/serieslinkenabled';
                fetchDataJsonp(url)
                    .done(self.showRemoteRecordPopover)
                    .fail(self.handleErrors);
            } else {
                self.record(false);
            }
        },

        record: function(isSeries) {
            var self = this;

            var url = self.options.epgServicesUrl + 'prog/json/rr/' + self.channelId + '/' + self.eventId + ( isSeries ? '?sl=true' : '' );
            fetchDataJsonp(url)
                .done(function(data) {
                    if(data.rr == 0) {
                        var rrButton = self.element.find('.remote-record');
                        rrButton.off('click');
                        rrButton.addClass('recorded');
                        if (isSeries) {
                            rrButton.addClass('series');
                        }
                    } else {
                        self.handleRecordRequestErrors(data.rr)
                    }
                })
                .fail(self.handleErrors);
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
        },

        handleRecordRequestErrors: function(errorCode) {
            var errorMessage = errorMessages[errorCode] || errorMessages[0];
            self.showError(errorMessage);
        },

        handleErrors: function(error) {
            var self = this;

            if(error.status == 401) {
                self.authenticate()
            } else {
                self.showError(errorMessages[0]);
            }
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