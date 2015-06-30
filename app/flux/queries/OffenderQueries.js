var Marty = require('marty');
var Constants = require('../constants/OffenderConstants');

class OffenderQueries extends Marty.Queries {
    getOffender(_id) {
        let self = this;
        return this.app.offenderAPI.getOffender(_id)
            .then(res => {
                self.app.offenderStore.addOffender(res);
                self.dispatch(Constants.RECEIVE_OFFENDER, res);
            })
    }
}
module.exports = OffenderQueries;