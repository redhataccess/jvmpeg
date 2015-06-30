import Marty from 'marty';
import Promise from 'bluebird';

export default class OffenderAPI extends Marty.HttpStateSource {
    constructor(options) {
        super(options);
        this.baseUrl = 'http://foo.redhat.com';
    }
    getOffender(_id) {
        return this.get(`/api/offender/${_id}`).then(res => {
            if (res.ok) {
                return res.json();
            }
            throw new Error('Failed to get offender', res);
        });
    }
    saveOffender(offender) {
        let options = {
            type: "POST",
            url: `/api/offender`,
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(offender)
        };
        return Promise.resolve($.ajax(options));
    }
}