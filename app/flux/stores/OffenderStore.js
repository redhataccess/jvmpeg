var Constants = require ("../constants/OffenderConstants");
var Marty = require('marty');

class OffenderStore extends Marty.Store {
    constructor(options) {
        super(options);
        this.state = {};
        this.handlers = {
            addOffender: Constants['RECEIVE_OFFENDER']
        };
    }
    addOffender(offender) {
        this.state[offender._id] = offender;
        this.hasChanged();
    }
    getOffender(_id) {
        return this.fetch({
            id: _id,
            locally: function () {
                return this.state[_id];
            },
            remotely: function () {
                return this.app.offenderQueries.getOffender(_id)
            }
        });
    }
}

module.exports = OffenderStore;