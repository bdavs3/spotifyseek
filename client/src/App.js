import React from "react";
import "./App.css";
import PlaylistDropdown from "./components/playlist-dropdown";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Choose a Spotify playlist you'd like to download.</p>
        <PlaylistDropdown />
        <button>Download (TO-DO)</button>
      </header>
    </div>
  );
}

export default App;
