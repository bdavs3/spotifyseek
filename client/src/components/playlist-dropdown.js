import React, { Component } from "react";
import axios from "axios";

class PlaylistDropdown extends Component {
  constructor() {
    super();
    this.state = {
      playlistNames: [],
    };
  }

  componentDidMount = () => {
    axios.get("/playlist-names").then((response) => {
      console.log(response.data);
    });
    // this.setState({
    // });
  };

  render() {
    return (
      <div>
        <select name="playlists" id="playlists">
          {this.state.playlistNames.forEach((name) => {
            return <option value={name}>{name}</option>;
          })}
        </select>
      </div>
    );
  }
}

export default PlaylistDropdown;
