# Spotifyseek

### Overview

Spotifyseek will allow you to download the entire contents of a Spotify playlist through Soulseek. A simple search combining the artist and title of each song (for example "Kelly Lee Owens Flow") is used to get Soulseek results. Only results with open slots (meaning they can be downloaded right away) are considered. Among these candidates, the one with the highest speed will be chosen, unless there is at least one file of the preferred file type. In this case, all non-preferred types are eliminated and top speed among only the preferred types is chosen.

Some songs won't be found (which will be indicated in the terminal), either because they aren't available on Soulseek or because they require a more advanced search to be found, though searches are lightly processed to improve results (e.g. replacing "Songname - Extended Mix" with "Songname Extended Mix"). Query processing will be optimized over time. This tool is never intended to get perfect results. 80-90% would be ideal, just to save the headache of typing every single song into SoulseekQT. The remainders probably need to be purchased on Bandcamp, unless you want to try a more detailed search in SoulseekQT.

### Usage

On first use, install dependencies:

```sh
$ npm install # You'll need npm to do this.
```

If you want to easily navigate through new songs, clear the contents of your `~/tmp/slsk` directory between each playlist download. On the first use, the server will create this directory for you.

Two terminal instances are needed in order to start the frontend and the server.

Before running the server, set the necessary environment variables in the first terminal instance:

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

Finally, start the frontend in a the second terminal instance:

```sh
$ cd client
$ npm start # Launches the React app in your default browser
```

Click the link that shows up to be redirected to the Spotify OAuth flow. Once logged in, you can select a playlist to download.

### Notes

- Downloaded files will be located in your `~/tmp/slsk` directory.
- Avoid using SoulseekQT while running this tool. It should merely kick you out of SoulseekQT when starting a playlist download, but best not to introduce concurrent connections if possible.

### Known Issues

- **Files unpredictably being downloaded to the server directory**: Have noticed this a couple of times when testing. I believe this happens when you interrupt the download.
  - _Fix_: Delete them, for now. It might actually be a problem with [slsk-client](https://github.com/f-hj/slsk-client), but I'll look into it later since it doesn't really interfere with the intended use of this tool.
