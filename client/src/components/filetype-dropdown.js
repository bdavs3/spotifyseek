import React, { Component } from "react";

class FileTypeDropdown extends Component {
  change = (event) => {
    this.setState({value: event.target.value});
  };

  render() {
    return (
      <div>
        <select onChange={this.props.dropdownChange} name="fileTypes" id="fileTypes">
          <option value="mp3">mp3</option>
          <option value="flac">flac</option>
          <option value="m4a">m4a</option>
          <option value="aiff">aiff</option>
        </select>
      </div>
    );
  }
}

export default FileTypeDropdown;