import React from "react";

export default class AppBlock extends React.Component {
    render() {
        return <div className="app-block">
            <h2 className="title">{this.props.title}</h2>
            <div className="content">{this.props.children}</div>
        </div>
    }
}
