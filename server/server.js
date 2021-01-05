const express = require("express");
const querystring = require("querystring");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const got = require("got");
const symbols = require("log-symbols");
const chalk = require("chalk");
const Slsk = require("./slsk");

const CLIENT_ID = "f50a09d5921542feb41008ac70af146c";
const CLIENT_SECRET = "db75b49b56df42c4b3adc6dd36242d36";
const SLSK_USERNAME = process.env.USERNAME;
const SLSK_PW = process.env.PW;
const REDIRECT_URI = "http://localhost:8888/callback";
const SCOPE =
  "playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private";
const STATE_KEY = "spotify-auth-state";

class Server {
  constructor() {
    this.authCode = null; // Granted after Spotify user approves access.
    this.access_token = null; // Exchanged for auth code. Needed for API calls.
    this.userId = null; // Spotify user ID

    this.slsk = new Slsk(SLSK_USERNAME, SLSK_PW);
  }

  serveExpress() {
    let app = express();

    app
      .use(express.static(__dirname + "/public"))
      .use(express.json())
      .use(cors())
      .use(cookieParser());

    app.get("/login", (req, res) => {
      let state = generateRandomString(16);
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

    app.post("/download", async (req, res) => {
      let clientMsg = `Downloading ${req.body.tracks.length} tracks...`;
      res.send(JSON.stringify(clientMsg));

      let downloadCounter = 0;
      let successCounter = 0;

      let fileTypePreference = req.body.fileTypePreference;

      for (const track of req.body.tracks) {
        let artist = track.artist;
        let title = track.title;

        writeDownloadProgress(
          ++downloadCounter,
          req.body.tracks.length,
          artist,
          title
        );

        await this.slsk
          .download(artist, title, fileTypePreference)
          .then(() => {
            successCounter++;
            labelDownloadResult();
            if (downloadCounter === req.body.tracks.length) {
              console.log(
                chalk.green(
                  `Complete! ${successCounter} of ${req.body.tracks.length}
                  downloaded successfully.`
                )
              );
            }
          })
          .catch((err) => {
            labelDownloadResult(err);
          });
      }
    });

    app.listen(8888, () => {
      console.log("Listening on 8888...");
    });
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
    } catch (err) {
      console.log(`err in setAccessToken:\n${err.message}`);
    }
  }
}

function generateRandomString(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function writeDownloadProgress(count, total, artist, title) {
  let msg =
    count > total
      ? "Complete!"
      : `Downloading ${count} of ${total}, '${title}' by ${artist}... `;

  process.stdout.write(msg);
}

function labelDownloadResult(err = "") {
  if (!err) {
    process.stdout.write(chalk.green(`${symbols.success} success\n`));
  } else {
    process.stdout.write(chalk.red(`${symbols.error} ${err}\n`));
  }
}

module.exports = Server;
