const express = require("express");
const querystring = require("querystring");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const got = require("got");
const Slsk = require("./slsk");

const CLIENT_ID = "f50a09d5921542feb41008ac70af146c";
const CLIENT_SECRET = "db75b49b56df42c4b3adc6dd36242d36";
const SLSK_USERNAME = process.env.USERNAME;
const SLSK_PW = process.env.PW;
const REDIRECT_URI = "http://localhost:8888/callback";
const SCOPE = "playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private";
const STATE_KEY = "spotify-auth-state";

class Server {
  constructor() {
    this.authCode = null; // Granted after Spotify user approves access.
    this.access_token = null; // Exchanged for auth code. Needed for API calls.
    this.userId = null; // Spotify user ID

    this.client = new Slsk(SLSK_USERNAME, SLSK_PW);
  }

  serveExpress() {
    let app = express();

    app
      .use(express.static(__dirname + '/public'))
      .use(express.json())
      .use(cors())
      .use(cookieParser());

    app.get("/login", (req, res) => {
      let state = this.generateRandomString(16);
      res.cookie(STATE_KEY, state);

      res.redirect(
        "https://accounts.spotify.com/authorize?" +
          querystring.stringify({
            response_type: "code",
            client_id: CLIENT_ID,
            scope: SCOPE,
            redirect_uri: REDIRECT_URI,
            state: state,
          })
      );
    });

    app.get("/callback", (req, res) => {
      let authCode = req.query.code || null;
      let state = req.query.state || null;
      let storedState = req.cookies ? req.cookies[STATE_KEY] : null;

      if (state === null || state !== storedState) {
        res.redirect(
          "/#" +
            querystring.stringify({
              error: "state_mismatch",
            })
        );
      } else {
        res.clearCookie(STATE_KEY);

        (async () => {
          await this.setAccessToken(authCode);

          await res.redirect(
            "http://localhost:3000/#" +
              querystring.stringify({
                access_token: this.access_token,
                refresh_token: this.refresh_token,
              })
          );
        })();
      }
    });

    app.post("/download", (req, res) => {
      req.body.tracks.forEach(async track => {
        let artist = track.artist;
        let title = track.title;

        console.log(`Downloading "${title}" by ${artist}...`);
        let result = await this.client.download(artist, title);
        console.log(result);
      });
    });

    app.listen(8888, () => {
      console.log("Listening on 8888...");
    });
  }

  generateRandomString(length) {
    let text = "";
    let possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  // Exchanges authorization code for access token, as outlined here:
  // https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow
  async setAccessToken(authCode) {
    let options = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: authCode,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
      json: true,
    };

    try {
      const response = await got.post(options.url, {
        form: options.form,
        headers: {
          Authorization:
            "Basic " +
            new Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
      });

      let body = JSON.parse(response.body);

      this.access_token = body.access_token;
      this.refresh_token = body.refresh_token;
    } catch (error) {
      console.log("Err in post:");
      console.log(error.message);
    }
  }
}

module.exports = Server;
