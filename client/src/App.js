import React, { Component } from "react";
import "./App.css";
import PlaylistDropdown from "./components/playlist-dropdown";

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      userPlaylists: [],
      selectedPlaylistID: "",
    }
  }

  componentDidMount() {
    this.getUserPlaylists();
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  getUserPlaylists() {
    spotifyApi.getUserPlaylists()
      .then((response) => {
        let playlistData = [];

        response.items.forEach(item => {
          playlistData.push({ id: item.id, name: item.name } );
        });

        this.setState({
          userPlaylists: playlistData
        });
      }).catch((err) =>  {
        console.log(err);
      });
  }

  downloadPlaylist() {
    spotifyApi.getPlaylist(this.state.selectedPlaylistID)
      .then(response => {
        let trackData = [];

        response.tracks.items.forEach(item => {
          trackData.push(
            {
              artist: item.track.artists[0].name,
              title: item.track.name,
            }
          );
        });

        let tracks = [];

        trackData.forEach(track => {
          tracks.push({
            artist: track.artist,
            title: track.title,
          });
        });

        let reqOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tracks: tracks,
            fileTypePreference: ".mp3",
          }),
        }
        fetch("http://localhost:8888/download", reqOptions)
          .then(response => response.json())
          .then(data => alert(
            `Found playlist. ${data}\nCheck the terminal window running the server to see progress.`
          ));
        });
  }

  dropdownChange = (event) => {
    this.setState({
      selectedPlaylistID: event.target.value
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {
            !this.state.loggedIn &&
            <a href="http://localhost:8888/">Login with spotify</a>
          }
          { this.state.loggedIn &&
            <div>
              <p>Select a playlist to download:</p>
              <PlaylistDropdown dropdownChange={this.dropdownChange} playlistData={this.state.userPlaylists} />
            </div>
          }
          { this.state.loggedIn &&
            <button style={{marginTop: "20px"}} onClick={() => this.downloadPlaylist()}>
              Download Playlist
            </button>
          }
        </header>
      </div>
    );
  }
}

export default App;
