const os = require("os");
const path = require("path");
const slsk = require('slsk-client');

class Slsk {
    constructor (username, pw) {
        this.username = username;
        this.pw = pw;
    }

    download(artist, title) {
      let searchQuery = artist + " " + title;
      return new Promise((resolve, reject) => {
        slsk.connect({
          user: this.username,
          pass: this.pw
        }, (err, client) => {
            client.search({
                req: searchQuery,
                timeout: 2000
            }, (err, res) => {
                if (err) return console.log(err);
                client.download({
                    file: res[0],
                    path: path.join(
                      os.homedir(),
                      `/tmp/slsk/${artist} - ${title}.mp3`
                    ),
                }, (err, data) => {
                    if (err) reject(err);
                    else resolve("done");
                });
            });
        });
      });
    }
}

module.exports = Slsk;