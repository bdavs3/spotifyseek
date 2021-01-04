const os = require("os");
const path = require("path");
const slsk = require('slsk-client');

class Slsk {
    constructor (username, pw) {
        this.username = username;
        this.pw = pw;
    }

    async download(artist, title) {
      let searchQuery = artist + " " + title;
      return new Promise((resolve, reject) => {
        slsk.connect({
          user: this.username,
          pass: this.pw
        }, (err, client) => {
            if (err) {
              console.log(err);
              reject("err connecting to soulseek");
            }
            client.search({
                req: searchQuery,
                timeout: 2000
            }, (err, res) => {
                if (err) {
                  console.log(err);
                  reject("err searching with query");
                }
                client.download({
                    file: res[0],
                    path: path.join(
                      os.homedir(),
                      `/tmp/slsk/${artist} - ${title}.mp3`
                    ),
                }, (err, data) => {
                    if (err) {
                      console.log(err);
                      reject("err downloading file");
                    }
                    else resolve("done");
                });
            });
        });
      });
    }
}

module.exports = Slsk;