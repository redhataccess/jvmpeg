var Marty = require('marty');

class Application extends Marty.Application {
    constructor(options) {
        super(options);
        this.register(require('./flux/stores'));
        this.register(require('./flux/actions'));
        this.register(require('./flux/queries'));
        this.register(require('./flux/sources'));
        this.router = require('./router');
    }
}

module.exports = Application;