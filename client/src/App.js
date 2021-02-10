import React, { Component } from "react";
import "./App.css";
import PlaylistDropdown from "./components/playlist-dropdown";
import FileTypeDropdown from "./components/filetype-dropdown";

import SpotifyWebApi from "spotify-web-api-js";
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
      fileTypePreference: "mp3",
      selectedPlaylistID: "",
    };
  }

  componentDidMount() {
    spotifyApi.getMe().then((userData) => (this.userData = userData));
    this.getUserPlaylists();
  }

  getHashParams() {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  getUserPlaylists() {
    spotifyApi.getUserPlaylists().then(
      (response) => {
        let playlistData = [];

        response.items.forEach((item) => {
          playlistData.push({ id: item.id, name: item.name });
        });

        this.setState({
          userPlaylists: playlistData,
        });
        if (this.state.userPlaylists.length > 0) {
          this.setState({
            selectedPlaylistID: this.state.userPlaylists[0].id,
          });
        }
      },
      (err) => {
        // Not yet authenticated
      }
    );
  }

  downloadPlaylist() {
    if (this.state.selectedPlaylistID === "") {
      alert("No playlist selected.");
      return;
    }

    spotifyApi.getPlaylist(this.state.selectedPlaylistID).then((response) => {
      let trackData = [];

      this.buildTrackData(response.tracks, trackData);

      // Results are paginated, with 100 tracks per page. We'll need to read
      // through them until reaching a null page.
      let nextPage = response.tracks.next;
      this.readPages(nextPage, trackData).then(() => {
        let tracks = [];

        trackData.forEach((track) => {
          tracks.push({
            uri: track.uri,
            artist: this.processForSearch(track.artist),
            title: this.processForSearch(track.title),
          });
        });

        let reqOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tracks: tracks,
            fileTypePreference: `.${this.state.fileTypePreference}`,
          }),
        };
        fetch("http://localhost:8888/download", reqOptions)
          .then((response) => response.json())
          .then((data) => alert(data))
          .catch(() =>
            alert("No response from server. Make sure it is running.")
          );
      });
    });
  }

  sortDownloads() {
    if (
      window.confirm(
        "WARNING - This will remove successful downloads from the selected playlist and add them to a new playlist. Are you sure you want to continue?"
      )
    ) {
      fetch("http://localhost:8888/tracker")
        .then((response) => response.json())
        .then((uris) => {
          spotifyApi
            .removeTracksFromPlaylist(this.state.selectedPlaylistID, uris)
            .then(() => {
              spotifyApi
                .createPlaylist(this.userData.id, {
                  name: "Bad Downloads",
                  description: "Failed Downloads from Spotifyseek",
                  public: false,
                })
                .then((newPlaylist) => {
                  spotifyApi.addTracksToPlaylist(newPlaylist.id, uris);
                });
            });
        })
        .catch(() => alert("Err in get failed downloads."));
    }
  }

  buildTrackData(page, trackData) {
    page.items.forEach((item) => {
      trackData.push({
        uri: item.track.uri,
        artist: item.track.artists[0].name,
        title: item.track.name,
      });
    });
  }

  async readPages(page, trackData) {
    return new Promise((resolve, reject) => {
      if (page) {
        return spotifyApi
          .getGeneric(page) // Use getGeneric since .next gives a URL.
          .then((response) => {
            this.buildTrackData(response, trackData);
            resolve(this.readPages(response.next, trackData));
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve("done");
      }
    });
  }

  processForSearch(str) {
    return str
      .replaceAll("- ", "")
      .replaceAll("/", " ")
      .replaceAll("-", " ")
      .replaceAll(".", " ")
      .replaceAll("'", "")
      .replaceAll("...", "")
      .replaceAll("!", "")
      .replace("Original Mix", "");
  }

  setPlaylistID = (event) => {
    this.setState({
      selectedPlaylistID: event.target.value,
    });
  };

  setFileTypePreference = (event) => {
    this.setState({
      fileTypePreference: event.target.value,
    });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {!this.state.loggedIn && (
            <a href="http://localhost:8888/">Login with spotify</a>
          )}
          {this.state.loggedIn && (
            <div>
              <p>Select a playlist to download:</p>
              <PlaylistDropdown
                dropdownChange={this.setPlaylistID}
                playlistData={this.state.userPlaylists}
              />

              <p>Select your preferred audio file type:</p>
              <FileTypeDropdown dropdownChange={this.setFileTypePreference} />
            </div>
          )}
          {this.state.loggedIn && (
            <button
              style={{ marginTop: "20px" }}
              onClick={() => this.downloadPlaylist()}
            >
              Download Playlist
            </button>
          )}
          {this.state.loggedIn && (
            <button
              style={{ marginTop: "20px" }}
              onClick={() => this.sortDownloads()}
            >
              Sort Downloads
            </button>
          )}
        </header>
      </div>
    );
  }
}

export default App;
