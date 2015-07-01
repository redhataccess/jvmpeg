import React from "react";
import Marty from "marty";
import { RouteHandler, Link } from "react-router";
import Dropzone from "react-dropzone";
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
            topOutput: null,
            threadDumpsFile: null,
            threadDumpsOutput: null,
            errors: [],
            cpuThresholdInputValue: 40,
            workerWorking: false
        };
    }
    onTopDrop(files) {
        let reader = new FileReader(),
            self = this;
        reader.onload = function (e) {
            self.setState({
                topFile: files[0],
                topOutput: reader.result
            });
        };
        reader.readAsText(files[0], "utf-8");
    }
    onThreadDumpsDrop(files) {
        let reader = new FileReader();
        reader.onload = function (e) {
            this.setState({
                threadDumpsFile: files[0],
                threadDumpsOutput: reader.result
            });
        }.bind(this);
        reader.readAsText(files[0], "utf-8");
    }
    //renderFileDrops() {
    //    let topDropPanel = this.state.topFile ? <FileDropDisplay header="High CPU file" file={this.state.topFile}></FileDropDisplay> : null;
    //    let threadDumpsDropPanel = this.state.threadDumpsFile ? <FileDropDisplay header="Thread Dumps file" file={this.state.threadDumpsFile}></FileDropDisplay> : null;
    //    return <div>
    //        {topDropPanel}
    //        {threadDumpsDropPanel}
    //    </div>;
    //}
    analyzeValid() {
        return (this.state.topFile != null && this.state.threadDumpsFile != null);
    }
    renderAnalyzeButton() {
        if(this.analyzeValid()) {
            return <Button onClick={this.analyze.bind(this)}>Analyze</Button>
        }
        return <Button disabled onClick={this.analyze.bind(this)}>Analyze</Button>
    }
    reset() {
        this.setState({
            topFile: null,
            threadDumpsFile: null,
            errors: []
        });
        let router = this.context.router;
        router.transitionTo("home");
    }
    renderClearButton() {
        if(this.analyzeValid()) {
            return <Button onClick={this.reset.bind(this)}>Reset</Button>
        }
        return <Button disabled onClick={this.reset.bind(this)}>Reset</Button>
    }
    renderDropzoneTopText() {
        if(this.state.topFile == null) {
            return <div>Drop the top high-cpu.out here</div>
        }
        let iconClasses = {
            'fa': true,
            'fa-check': true,
            'green': true
        };
        return <div>
            <i className={cx(iconClasses)}></i>&nbsp;
            {this.state.topFile.name}
        </div>
    }
    renderDropzoneThreadText() {
        if(this.state.threadDumpsFile == null) {
            return <div>Drop the high-cpu-tdump.out here</div>
        }
        let iconClasses = {
            'fa': true,
            'fa-check': true,
            'green': true
        };
        return <div>
            <i className={cx(iconClasses)}></i>&nbsp;
            {this.state.threadDumpsFile.name}
        </div>
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
        return (
            <Grid className={cx(containerCx)}>
                <Row>
                    <Col md={12}>
                        <h1>JVMPeg</h1>
                        <p>This tool will help you analyze JVM threads that are pegging the CPU above a specified threshold</p>
                    </Col>
                </Row>
                <Row>
                    <Col md={8}>
                        <AppBlock title="Usage">
                            <ul>
                                <li>Download the appropriate high_cpu_*.tar.gz script from <a target="_blank" href="https://access.redhat.com/solutions/46596">How do I identify high CPU utilization by Java threads on Linux/Solaris</a></li>
                                <li>Run the script per instructions on the solution</li>
                                <li>Drag and drop the resulting high-cpu.out and high-cpu-tdump.out to the right</li>
                                <li>Click Analyze!</li>
                            </ul>
                        </AppBlock>
                    </Col>
                    <Col md={4}>
                        <AppBlock title="Dropzone">
                            <Dropzone className="dropzone" onDrop={this.onTopDrop.bind(this)} style={{color: 'black'}}>
                                {this.renderDropzoneTopText()}
                            </Dropzone>
                            <Spacer />
                            <Dropzone className="dropzone" onDrop={this.onThreadDumpsDrop.bind(this)} style={{color: 'black'}}>
                                {this.renderDropzoneThreadText()}
                            </Dropzone>
                            <Spacer />
                            {this.renderAnalyzeButton()}&nbsp;
                            {this.renderClearButton()}&nbsp;
                            {this.renderWorkerSpinner()}
                            <Spacer />
                            <Input
                                ref="cpuThresholdInput"
                                type='text'
                                value={this.state.cpuThresholdInputValue}
                                onChange={this.handleCpuThresholdChange.bind(this)}
                                addonBefore='CPU Threshold'
                                addonAfter='%' />
                        </AppBlock>
                    </Col>
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
