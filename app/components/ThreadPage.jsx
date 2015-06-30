import React from "react";
import Marty from "marty";
import AppBlock from "./AppBlock.jsx";
import Spacer from "./Spacer.jsx";
import { Panel, Table, Button } from "react-bootstrap";

// So far no actual css is applied to these components
//if (Marty.isBrowser) {
//    require("./ResultsPage.css");
//}

class ThreadPage extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            displayLength: this.props.threadStackDisplayLength || 10,
            showAll: false
        };
    }
    static getProps() {
        return {};
    }
    showAll() {
        this.setState({showAll: true})
    }
    renderShowMore(threadStackLength) {
        if (this.state.showAll || threadStackLength < this.state.displayLength) return null;
        return <Button onClick={this.showAll.bind(this)}>{`Show ${threadStackLength - this.state.displayLength} More`}</Button>
    }
    renderThread(thread) {
        // Prepend any "at\ .*" with a tab
        let formattedThread = [];
        thread.forEach((t, i) => {
            if (this.state.showAll || i < this.state.displayLength) {
                // Always push the first line unformatted
                if (i == 0) formattedThread.push(t);
                // Push any at lines indented
                else if (/^at /.test(t)) {
                    formattedThread.push(`    ${t}`);
                } else {
                    formattedThread.push(`${t}`);
                }
            }
        });
        return <div>
            <pre className="thread">{formattedThread.join('\n')}</pre>
            <Spacer />
            {this.renderShowMore(thread.length)}
        </div>
    }
    render() {
        if (!this.props.thread) return null;
        return this.renderThread(this.props.thread);
    }
}

module.exports = ThreadPage;