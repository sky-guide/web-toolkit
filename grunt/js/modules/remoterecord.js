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
            if (this.eventId) {
                this.getSeriesInfo();
            } else {
                this.getProgrammeInfo();
            }
        }
        else {
            element.html('required attributes data-channel-id or data-event-id / data-start-time not found');
        }

    }

    RemoteRecordButton.prototype = {
        getProgrammeInfo: function () {
            var self = this;
            $.get(this.options.epgServicesUrl + 'prog/json/lookup/' + this.channelId + '/' + this.startTime, function (resp) {
                self.eventId = resp.eid;
                self.getSeriesInfo();
            }, 'json');
        },

        getSeriesInfo: function () {
            $.get(this.options.epgServicesUrl + 'prog/json/serieslinkinfo/' + this.channelId + '/' + this.eventId, function (resp) {

            }, 'json');
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
);

if (typeof window.define === "function" && window.define.amd) {
    define('modules/remoterecord', [], function () {
        return toolkit.remoterecord;
    });
}