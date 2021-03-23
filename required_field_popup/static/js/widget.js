odoo.define('required_field_popup.BasicController', function(require) {
    "use strict";
    var BasicController = require('web.BasicController');
    var Notification = require('web.Notification');
    var Widget = require('web.Widget');
    var rpc = require('web.rpc');
    var core = require('web.core');
    var qweb = core.qweb;
    var _t = core._t;

    BasicController.include({
    /**
     * Helper function to display a warning that some fields have an invalid
     * value. This is used when a save operation cannot be completed.
     *
     * @private
     * @param {string[]} invalidFields - list of field names
     */
        _notifyInvalidFields: function (invalidFields) {
            var record = this.model.get(this.handle, {raw: true});
            var fields = record.fields;
            var warnings = invalidFields.map(function (fieldName) {
                var fieldStr = fields[fieldName].string;
                return _.str.sprintf('<li>%s</li>', _.escape(fieldStr));
            });
            warnings.unshift('<ul>');
            warnings.push('</ul>');
            if (this.connectionNotificationID) {
                this.call('notification', 'close', this.connectionNotificationID);
            }
            this.connectionNotificationID = this.call('notification', 'notify', {
                type: 'warning',
                title: _t("The following fields are invalid:"),
                message: warnings.join(''),
                sticky: true
            });
        },
     });
    Notification.include({
        template: 'NewNotification',
        events: {
        'click > .o_close': '_onClose',
        'click .new_close': '_onClose',
        'click .o_buttons button': '_onClickButton'
        },
        start: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                self.$el.animate({opacity: 1.0}, self._animationDelay, "swing", function () {
                    if(!self.sticky) {
                        setTimeout(function () {
                            self.close();
                        }, self._autoCloseDelay);
                    }
                    if(self.className == ' o_error') {
                        self.dispose();
                    }
                });
            });
        },
        dispose: function(){
            var self = this;
            if (!self.isDestroyed()){
                var state = self.__parentedParent.__parentedParent._current_state;
                setTimeout(function () {
                    if(!self.isDestroyed() && self.__parentedParent.__parentedParent._current_state != state)
                        self.close();
                    else
                        self.dispose();
                }, 500);
            }
        },
    });
});
