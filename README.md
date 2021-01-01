# Spotifyseek

Two terminal instances are needed.

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
