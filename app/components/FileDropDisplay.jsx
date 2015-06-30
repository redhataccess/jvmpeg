import React from "react";
import { Panel } from "react-bootstrap";

export default class FileDropDisplay extends React.Component {
    render() {
        return <div key={this.props.file.name}>
            <Panel header={this.props.header}>
                <div>
                    <strong>name</strong>:&nbsp;{this.props.file.name},&nbsp;
                    <strong>size</strong>:&nbsp;{this.props.file.size},&nbsp;
                    <strong>last modified</strong>:&nbsp;{this.props.file.lastModifiedDate.toString()}
                </div>
            </Panel>
        </div>
    }
}
