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
              title: item.track.artists[0].name,
              artist: item.track.name,
            }
          );
        });

        trackData.forEach(track => {
          console.log("Title: " + track.title);
          console.log("Artist: " + track.artist);
          console.log("");
        });
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
