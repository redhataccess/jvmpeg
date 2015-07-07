var React   = require('react');
var Marty   = require("marty");
var cx      = require("classnames");

if(Marty.isBrowser) {
    require("./Dropzone.css");
}

var Dropzone = React.createClass({
    getDefaultProps: function() {
        return { supportClick: true, multiple: true };
    },

    getInitialState: function() {
        return {
            isDragActive: false,
            fileDropped: false,
            file: null
        };
    },

    propTypes: {
        onDrop: React.PropTypes.func,
        size: React.PropTypes.number,
        style: React.PropTypes.object,
        supportClick: React.PropTypes.bool,
        accept: React.PropTypes.string,
        multiple: React.PropTypes.bool
    },

    onDragLeave: function(e) {
        e.preventDefault();
        this.setState({ isDragActive: false });
    },

    onDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.setState({ isDragActive: true });
    },

    onDrop: function(e) {
        e.preventDefault();

        this.setState({ isDragActive: false });

        var files;
        if (e.dataTransfer)
            files = e.dataTransfer.files;
        else if (e.target)
            files = e.target.files;

        var maxFiles = (this.props.multiple) ? files.length : 1;
        for (var i = 0; i < maxFiles; i++)
            files[i].preview = URL.createObjectURL(files[i]);

        files = Array.prototype.slice.call(files, 0, maxFiles);
        this.setState({file: files[0]});

        if (this.props.onDrop) {
            this.props.onDrop(files, e);
        }
    },

    reset: function () {
        this.setState({file: null});
    },

    onClick: function () {
        if (this.props.supportClick === true)
            this.open();
    },

    open: function() {
        var fileInput = React.findDOMNode(this.refs.fileInput);
        fileInput.value = null;
        fileInput.click();
    },

    renderText: function() {
        if(!this.props.text) return null;
        return <span>{this.props.text}</span>
    },

    render: function() {
        let divClassesHash = {};
        let className = this.props.className || 'dropzone';
        divClassesHash[className] = true;
        divClassesHash['drag-over'] = this.state.isDragActive;
        divClassesHash['active'] = this.state.isDragActive;

        let style = this.props.style || {
            width: this.props.size || 100,
            height: this.props.size || 100,
            borderStyle: this.state.isDragActive ? 'solid' : 'dashed'
        };

        let iconClasses = cx({
            'fa': true,
            'fa-arrow-down': !this.state.file,
            'fa-check': this.state.file
        });

        let inputStyle = {display: 'none'};

        return (
            <div className={cx(divClassesHash)} style={style} onClick={this.onClick} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver} onDrop={this.onDrop}>
                <input type="file" style={inputStyle} multiple={this.props.multiple} ref='fileInput' onChange={this.onDrop} accept={this.props.accept}/>
                <i className={iconClasses}></i>
                {this.renderText()}
                {this.props.children}
            </div>
        );
    }

});

module.exports = Dropzone;
