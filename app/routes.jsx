var React = require('react');
var Router = require('react-router');
var { Route, DefaultRoute, NotFoundRoute, Redirect } = Router;

var HomePage = require('../app/containers/HomePage.jsx');
var ResultsPage = require('./containers/ResultsPage.jsx');
var NotFoundPage = require('./components/NotFoundPage.jsx');

module.exports = (
    <Route name="home" path="/labs/jvmpeg" handler={HomePage}>
        <Route name="results" path="results/:uuid" handler={ResultsPage} />
        <Redirect from="" to="home" />
        <Redirect from="/" to="home" />
        <Route path="*" component={NotFoundPage} />
    </Route>
);
