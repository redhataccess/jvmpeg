var React = require('react');
var Marty = require('marty');
var Application = require('./application');
var ApplicationContainer = Marty.ApplicationContainer;

window.React = React; // For React Developer Tools
window.Marty = Marty; // For Marty Developer Tools

Marty.HttpStateSource.removeHook('parseJSON');

if (process.env.NODE_ENV !== 'test') {
    var app = new Application();

    app.rehydrate();

    if (Marty.isBrowser) {
        // Browser specific code
    }

    app.router.run(function (Handler, state) {
        React.render((
            <ApplicationContainer app={app}>
                <Handler {...state.params} />
            </ApplicationContainer>
        ), document.getElementById('content'));
    });
}