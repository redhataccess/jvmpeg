var Marty = require('marty');

function navigateTo(route, params) {
    require('../../router').transitionTo(route, params || {});
}

class OffenderActionCreators extends Marty.ActionCreators {
    saveOffender(offender) {
        this.app.offenderAPI.saveOffender(offender).then(res => {
            navigateTo('results', {uuid: res._id});
        }).catch(err => {
            if (err.message) console.error(err.stack);
            console.error(`err: ${err.status}, Failed to save offender: ${err.statusText}`)
        })
    }
}

module.exports = OffenderActionCreators;