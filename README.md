# Spotifyseek

### Overview

Spotifyseek will allow you to download the entire contents of a Spotify playlist through Soulseek. A simple search combining the artist and title of each song (for example "Kelly Lee Owens Flow") is used to get Soulseek results. Only results with open slots (meaning they can be downloaded right away) are considered. Among these candidates, the one with the highest speed will be chosen. However, the frontend allows you to select for "preferred file type". If a result with this file type is found, it will be prioritized (additional results of the same file type will be sorted by speed in order to choose the best one).

Some songs won't be found, either because they aren't available on Soulseek or require a more advanced search to be found. The terminal will indicate the songs that aren't found in the search. It is also possible that the wrong song is downloaded in certain instances if it contains a similar-enough name and slips through the search. Hopefully this is rare, but after the download completes, it would be prudent to check through the results as you sort them into your library.

This program is never intended to get perfect results. 80-90% would be ideal, just to save the headache of typing every single song into SoulseekQT. The remainders probably needed to be bought on Bandcamp, unless you want to try a more detailed search in SoulseekQT.

### Usage

Two terminal instances are needed in order to start the frontend and backend.

Before running the server, set the necessary environment variables:

```sh
$ export USERNAME="example" # Your Soulseek username
$ export PW="123456" # Your Soulseek password
```

Then, run the server:

```sh
$ cd server
$ node index.js
Listening on 8888...
```

The first time you use, or if something isn't working, try reinstalling dependencies:

```sh
$ npm install # You'll need npm to do this.
```

Finally, start the frontend:

```sh
$ cd client
$ npm start # Launches the React app in your default browser
```

Click the link that shows up to be redirected to the Spotify OAuth flow. Once logged in, you can select a playlist to download.

**Notes**:

- Downloaded files will be located in your `~/tmp/slsk` directory.
- Make sure you aren't currently logged in to the desktop version of Soulseek, or else the server will crash when trying to connect to the service with your account.

**Known Issues**:

- **Files unpredictably being downloaded to the src directory**: Have noticed this a couple of times when testing. I believe this happens when you interrupt the download.
  - _Fix_: Delete them, for now...
