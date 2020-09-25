const express = require("express");
const querystring = require("querystring");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const got = require("got");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:8888/callback";
const SCOPE = "playlist-modify-public playlist-modify-private";
const STATE_KEY = "spotify-auth-state";

class Server {
  static generateRandomString(length) {
    let text = "";
    let possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  authorize() {
    let app = express();

    app
      .use(express.static(__dirname + "/public"))
      .use(cors())
      .use(cookieParser());

    app.get("/playlist-names", (req, res) => {
      let state = Server.generateRandomString(16);
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
      let code = req.query.code || null;
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
        let authOptions = {
          url: "https://accounts.spotify.com/api/token",
          form: {
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
          },
          headers: {
            Authorization:
              "Basic " +
              new Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString(
                "base64"
              ),
          },
          json: true,
        };

        (async () => {
          try {
            const response = await got.post(authOptions.url, {
              form: authOptions.form,
              headers: {
                Authorization:
                  "Basic " +
                  new Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString(
                    "base64"
                  ),
              },
            });

            let body = JSON.parse(response.body);
            let access_token = body.access_token,
              refresh_token = body.refresh_token;

            let userReq = {
              url: "https://api.spotify.com/v1/me",
              headers: { Authorization: "Bearer " + access_token },
            };

            (async () => {
              try {
                const response = await got.get(userReq.url, {
                  headers: userReq.headers,
                });

                let userId = JSON.parse(response.body).id;

                let playlistReq = {
                  url:
                    "https://api.spotify.com/v1/users/" + userId + "/playlists",
                  headers: { Authorization: "Bearer " + access_token },
                };

                (async () => {
                  try {
                    const response = await got.get(playlistReq.url, {
                      headers: playlistReq.headers,
                    });

                    console.log(response.body);
                  } catch (error) {
                    console.log("Error in get playlist data:");
                    console.log(error.message);
                  }
                })();
              } catch (error) {
                console.log("Error in get user data:");
                console.log(error.message);
              }
            })();

            res.redirect(
              "/#" +
                querystring.stringify({
                  access_token: access_token,
                  refresh_token: refresh_token,
                })
            );
          } catch (error) {
            console.log("Err in post:");
            console.log(error.message);
          }
        })();
      }
    });

    app.listen(8888, () => {
      console.log("Listening on 8888...");
    });
  }
}

module.exports = Server;
