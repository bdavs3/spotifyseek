const os = require("os");
const path = require("path");
const slsk = require('slsk-client');

class Slsk {
  constructor (username, pw) {
      this.username = username;
      this.pw = pw;
  }

  async download(artist, title, fileTypePreference) {
    let searchQuery = `${artist} ${title}`;
    return new Promise((resolve, reject) => {
      slsk.connect({
        user: this.username,
        pass: this.pw
      }, (err, client) => {
        if (err) {
          reject(`err connecting to soulseek:\n${err}`);
        }
        client.search({
          req: searchQuery,
          timeout: 2000
        }, (err, res) => {
          if (err) {
            reject(`err searching with query:\n${err}`);
          }
          let okFile = getOkFile(res, fileTypePreference);
          if (!okFile) {
            reject(`no ok files found`);
          }
          console.log("\nDownloading...");
          console.log(okFile);

          client.download({
              file: okFile,
              path: path.join(
                os.homedir(),
                `/tmp/slsk/${artist} - ${title}.mp3`
              ),
          }, (err, data) => {
              if (err) {
                reject(`err downloading file:\n${err}`);
              }
              resolve(`Downloaded "${title}" by ${artist}...`);
          });
        });
      });
    });
  }
}

// getOkFile sifts through a list of files to find the first match that
// is an mp3 file with open slots for download.
function getOkFile(list, fileTypePreference) {
  let okFile = null;
  let re = /(?:\.([^.]+))?$/; // Matches file type suffixes.

  for (let i = 0; i < list.length; i++) {
    let file = list[i];
    let fileType = re.exec(file.file)[0];

    if (file.slots) {
      okFile = file;
      // Keep looking if file does
      if (fileType === fileTypePreference) {
        break;
      }
    }
  }

  return okFile;
}

module.exports = Slsk;