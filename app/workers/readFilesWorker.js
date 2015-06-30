import { findOffenders, parseTop, parseThreadDumps } from "javahighcpu"
var uuid        = require('uuid');
var assign      = require('lodash/object/assign');
//import uuid from "uuid";

onmessage = function (ev) {
    let thread,
        reader = new FileReaderSync(),
        topOutput = reader.readAsText(ev.data.topFile),
        threadDumpsOutput = reader.readAsText(ev.data.threadDumpsFile);

    let cpuThreshold, parsedThreadDumps, parsedTop, errors = [];

    cpuThreshold = ev.data.cpuThreshold || 80;

    parsedTop = {};

    try {
        parsedTop = parseTop(topOutput, {
            cpuThreshold: cpuThreshold
        });
    } catch (error) {
        errors.push("Could not parse high cpu top output, please use a file with valid input");
    }

    parsedThreadDumps = {};

    try {
        parsedThreadDumps = parseThreadDumps(threadDumpsOutput);
    } catch (error) {
        errors.push("Could not parse thread dumps, please use a file with valid input");
    }

    // Short circuit if there are any errors here, no reason to even attempt to correlate the data
    if (errors.length > 0) {
        self.postMessage({errors: errors});
        return;
    }

    // Do not enable in production, FF doesn't like console.* in workers
    //console.log(`Read ${Object.keys(parsedTop).length} top outputs and ${Object.keys(parsedThreadDumps).length} thread dumps.`);

    try {
        let offenders = findOffenders(parsedTop, parsedThreadDumps);
        assign(offenders, {_id: uuid.v1()});
        self.postMessage({output: offenders});
    } catch (error) {
        errors.push("Could not parse correlate top output with thread dumps, please see usage");
        self.postMessage({errors: errors});
    }

};
