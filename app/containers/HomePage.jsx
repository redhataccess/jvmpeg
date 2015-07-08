import React from "react";
import Marty from "marty";
import { RouteHandler, Link } from "react-router";
import Dropzone from "../components/Dropzone.jsx";
import Spacer from "../components/Spacer";
import FileDropDisplay from "../components/FileDropDisplay";
import AppBlock from "../components/AppBlock";
import cx from "classnames";
var keys = require('lodash/object/keys');
var omit = require('lodash/object/omit');
import { Grid, Row, Col, Button, Input, Alert } from "react-bootstrap";

var assign = require('lodash/object/assign');

//import highCpuEx from "raw!examples/high-cpu.out";
//import threadDumpsEx from "raw!examples/high-cpu-tdumps.out";

import uuid from "uuid";

var Worker = null;//, styles = {};
// The worker! is only going to work in the browser, so only import it in the browser
if(Marty.isBrowser) {
    Worker = require('worker!workers/readFilesWorker');
    require("./HomePage.css");
}

// Import the API from https://github.com/engineersamuel/javahighcpu
import { findOffenders, parseTop, parseThreadDumps } from "javahighcpu";

class HomePage extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            topFile: null,
            threadDumpsFile: null,
            errors: [],
            cpuThresholdInputValue: 40,
            workerWorking: false
        };
    }
    topDrop(files) {
        this.setState({topFile: files[0]})
    }
    threadDrop(files) {
        this.setState({threadDumpsFile: files[0]})
    }
    checkInput() {
        return this.state.topFile != null && this.state.threadDumpsFile != null
    }
    renderAnalyzeButton() {
        if(this.checkInput()) {
            return <Button onClick={this.analyze.bind(this)}>Analyze</Button>
        }
        return <Button disabled onClick={this.analyze.bind(this)}>Analyze</Button>
    }
    reset() {
        this.setState({
            errors: [],
            topFile: null,
            threadDumpsFile: null
        });
        this.refs.topInputRef.reset();
        this.refs.threadInputRef.reset();
        let router = this.context.router;
        router.transitionTo("home");
    }
    renderClearButton() {
        if(this.checkInput()) {
            return <Button onClick={this.reset.bind(this)}>Reset</Button>
        }
        return <Button disabled onClick={this.reset.bind(this)}>Reset</Button>
    }
    componentDidMount() {
        this.readFilesWorker = new Worker;
        this.readFilesWorker.addEventListener('message', this.analyzeReceive.bind(this));
    }
    componentWillUnmount() {
        this.readFilesWorker.removeEventListener('message', this.analyzeReceive.bind(this));
    }
    analyze() {
        // Immediately start the spinner
        this.setState({workerWorking: true});

        let message = {
            topFile: this.state.topFile,
            threadDumpsFile: this.state.threadDumpsFile,
            cpuThreshold: +this.state.cpuThresholdInputValue
        };
        // This fires for Omniture web analytics
        try {
            chrometwo_require(["analytics/main"], function(analytics) {
                return analytics.trigger("LabsCompletion");
            });
        } catch (error) {
            console.error(error);
        }
        this.readFilesWorker.postMessage(message);
    }
    analyzeReceive(ev) {
        // Immediately set the worker working to false to stop the spinner
        this.setState({workerWorking: false});

        let router = this.context.router;

        // If there are errors from the worker, short circuit and set the state so they are displayed
        if (ev.data.errors && ev.data.errors.length > 0) return this.setState({errors: ev.data.errors});

        // If there was no output parsed then the files were not actually parsed due to some issue either with the file
        // or the format, short circuit and show that
        if (!ev.data.output || keys(ev.data.output).length == 0) return this.setState({errors: ['Could not parse output from files.  Please check the script output.']});

        // Remove the _id and created from the mongo result
        let offenders = omit(ev.data.output, '_id', 'created', 'cpuThreshold');

        // At this point there is output, but there are simply no offenders
        if (!offenders || keys(offenders).length == 0) {
            // Display the warning that no offending processes found
            this.setState({errors: ['No offending processes found, you may try lowering the CPU Threshold.']});
            // TODO Redirect to home so that any old output is not shown
            router.transitionTo("home");
            return;
        }

        // by this point there are no errors otherwise we would have short circuited, make sure to clear any prior
        // errors out
        this.setState({errors: []});
        this.app.offenderActionCreators.saveOffender(assign(ev.data.output, {cpuThreshold: this.state.cpuThresholdInputValue}));
    }
    renderErrors() {
        return this.state.errors.map((error) => <Alert bsStyle="warning">{error}</Alert>);
    }
    handleCpuThresholdChange() {
        this.setState({cpuThresholdInputValue: this.refs.cpuThresholdInput.getValue()});
    }
    renderWorkerSpinner() {
        if (!this.state.workerWorking) return null;
        let spinnerClasses = {
            'fa': true,
            'fa-spinner': true,
            'fa-pulse': true
        };
        return <i className={cx(spinnerClasses)}></i>
    }
    render() {
        let { loading } = this.props;
        let containerCx = {
            'home': loading
        };
        let divInstructionsStyle = {height: 350};
        return (
            <Grid className={cx(containerCx)}>
                <Row>
                    <Col md={12}>
                        <h1>JVMPeg</h1>
                        <p>This tool will help you analyze JVM threads that are pegging the CPU above a specified threshold</p>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} sm={6} md={4} mdOffset={2}>
                        <div className="app-block app-block-step" style={divInstructionsStyle}>
                            <div className="title">Download</div>
                            <div className="content">
                                <i className="fa fa-download featured"></i>
                                <p>Download the appropriate high_cpu_*.tar.gz script from <a href="#">How do I identify high CPU utilization by Java threads on Linux/Solaris</a></p>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <div className="app-block app-block-step" style={divInstructionsStyle}>
                            <div className="title">Run the Script</div>
                            <div className="content">
                                <i className="fa fa-code featured"></i>
                                <p>Run the script per instructions on the solution.</p>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row className="row-tall">
                    <Col sm={12}>
                        <h2 className="title text-center">
                            <strong>Drag and drop the resulting high-cpu.out and high-cpu-tdump.out</strong>
                        </h2>
                    </Col>
                </Row>
                <Row className="row-tall">
                    <Col xs={12} sm={6} mdOffset={1} md={5}>
                        <Dropzone className="jvmpeg-dropzone"
                                  ref="topInputRef"
                                  onDrop={this.topDrop.bind(this)}
                                  text="Drop the top high-cpu.out here"/>
                    </Col>
                    <Col xs={12} sm={6} md={5}>
                        <Dropzone className="jvmpeg-dropzone"
                                  ref="threadInputRef"
                                  onDrop={this.threadDrop.bind(this)}
                                  text="Drop the top high-cpu-tdump.output here"/>
                    </Col>
                </Row>
                <Row className="row-tall">
                    <Col sm={12}>
                        <h2 className="title text-center">
                            <strong>Select the CPU Threshold</strong>
                        </h2>
                    </Col>
                </Row>
                <Row className="row-tall">
                    <Col sm={2} md={3} lg={3} className="center-block">
                    </Col>
                    <form className="form-inline">
                        <div className="form-group">
                            <Input
                                id="cpuThresholdInput"
                                className="text-right"
                                ref="cpuThresholdInput"
                                type='text'
                                value={this.state.cpuThresholdInputValue}
                                onChange={this.handleCpuThresholdChange.bind(this)}
                                addonBefore='CPU Threshold'
                                addonAfter='%' />
                        </div>&nbsp;
                        {this.renderAnalyzeButton()}&nbsp;
                        {this.renderClearButton()}&nbsp;
                        {this.renderWorkerSpinner()}
                    </form>
                </Row>
                <Row>
                    <hr/>
                    {/*this.renderFileDrops()*/}
                    <Spacer />
                    {this.renderErrors()}
                </Row>
                <Row>
                    <Col md={12}>
                        <RouteHandler />
                    </Col>
                </Row>
            </Grid>
        );
    }
}

// It is a bit unclear exactly how React is aware of react-router consider this is not IoC wired that I can see
// and this is not wired by an import or require, but apparently it's happening somewhere.
// https://github.com/rackt/react-router/blob/master/UPGRADE_GUIDE.md
HomePage.contextTypes = {
    router: React.PropTypes.func
};

module.exports = Marty.createContainer(HomePage);
