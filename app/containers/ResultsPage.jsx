import React from "react";
import Marty from "marty";
import AppBlock from "../components/AppBlock.jsx";
import ProcessPage from "../components/ProcessPage.jsx";
import Spacer from "../components/Spacer.jsx";
import { Panel, Table, Alert, Input } from "react-bootstrap";
var omit = require('lodash/object/omit');
var keys = require('lodash/object/keys');

// importing styles is the local modular way, I prefer require.
//import styles from "./ResultsPage.css";
if (Marty.isBrowser) {
    require("./ResultsPage.css");
}

class ResultsPage extends React.Component {
    constructor(props, context) {
        super(props, context);
    }
    static getProps() {
        return {};
    }
    renderOffenders(offenders) {

        // The keys are unix timestamps, but in string format, sort by the int value and map those
        let offenderPanels = keys(offenders).sort((a, b) => +a - +b).map((timestamp) => {
            return <ProcessPage timestamp={timestamp} offender={offenders[timestamp + ""]}></ProcessPage>;
        });

        return <div>
            {offenderPanels}
        </div>;
    }
    render() {
        let cpuThreshold = this.props.offender.cpuThreshold;

        // Remove the _id and created from the mongo result
        let offenders = omit(this.props.offender, '_id', 'created', 'cpuThreshold');

        if (offenders == null || Object.keys(offenders).length == 0) {
            return <Alert bsStyle="warning">No offending processes found within the threshold specified.</Alert>;
        }
        return <div>
            <h3>{`Found ${Object.keys(offenders).length} occurrence(s) of processes using over ${cpuThreshold}% CPU usage.`}</h3>
            <Spacer />
            <div>
                {this.renderOffenders(offenders)}
            </div>
        </div>;
    }
}

module.exports = Marty.createContainer(ResultsPage, {
    listenTo: ['offenderStore'],
    fetch: {
        offender() {
            return this.app.offenderStore.getOffender(this.props.params.uuid)
        }
    },
    pending() {
        return <div className='loading'>Loading...</div>;
    },
    failed(errors) {
        return <div className='error'>Failed to load data. {errors}</div>;
    }
});
