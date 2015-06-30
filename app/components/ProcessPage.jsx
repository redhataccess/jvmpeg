import React from "react";
import Marty from "marty";
import AppBlock from "./AppBlock.jsx";
import Thread from "./ThreadPage.jsx";
import Spacer from "./Spacer.jsx";
import { Table } from "react-bootstrap";

if (Marty.isBrowser) {
    require("./ProcessPage.css");
}

class ProcessPage extends React.Component {
    static getProps() {
        return {};
    }
    renderProcessInfo(process) {
        return <Table responsive>
            <thead >
            <tr>
                <th>PID</th>
                <th>Hex</th>
                <th>CPU</th>
                <th>Mem</th>
                <th>Proc line</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>{process.pid}</td>
                <td>{process.hexpid}</td>
                <td className="process-cpu">{process.cpu}%</td>
                <td>{process.mem}%</td>
                <td>{process.proc_line}</td>
            </tr>
            </tbody>
            <Spacer />
        </Table>
    }
    renderProcess(offender) {
        let pids = Object.keys(offender),
            self = this;
        return pids.map((pid) => {
            return <div>
                {self.renderProcessInfo(offender[pid].process)}
                <Spacer />
                <Thread {...self.props} thread={offender[pid].thread}></Thread>
            </div>
        });
    }
    renderTimestampPanel(timestamp, offender) {
        return <AppBlock title={`Offending process @ ${(new Date(+timestamp)).toString()}`}>
            <div>
                {this.renderProcess(offender)}
            </div>
        </AppBlock>
    }
    render() {
        return this.renderTimestampPanel(this.props.timestamp, this.props.offender);
    }
}

module.exports = ProcessPage;
