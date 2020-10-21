import React, { Component } from "react";

class PlaylistDropdown extends Component {
  change = (event) => {
    this.setState({value: event.target.value});
  };

  render() {
    return (
      <div>
        <select onChange={this.props.dropdownChange} name="playlists" id="playlists">
          {this.props.playlistData.map(playlist => (
            <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
          ))}
        </select>
      </div>
    );
  }
}

export default PlaylistDropdown;
