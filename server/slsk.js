const os = require("os");
const path = require("path");
const slsk = require("slsk-client");

const timeout = process.env.TIMEOUT || 90;

class Slsk {
  constructor(username, pw) {
    if (!username || !pw) {
      console.log(
        `Set username and password first. See the README for further information.`
      );
      return;
    } else {
      slsk.connect(
        {
          user: username,
          pass: pw,
        },
        (err, client) => {
          if (err) console.log(`err connecting to soulseek:\n${err}`);
          else this.client = client;
        }
      );
    }
  }

  async download(artist, title, fileTypePreference) {
    let searchQuery = `${artist} ${title}`;
    return new Promise((resolve, reject) => {
      this.client.search(
        {
          req: searchQuery,
          timeout: 3000,
        },
        (err, results) => {
          if (err) {
            reject(`err in search`);
            return;
          }

          let okResult = getOkFile(results, fileTypePreference, title);
          if (!okResult) {
            reject(`no result found`);
            return;
          }

          this.client.download(
            {
              file: okResult,
              path: path.join(
                os.homedir(),
                `/tmp/slsk/${artist} - ${title}${okResult.fileType}`
              ),
            },
            (err, data) => {
              if (err) reject(`err in download`);
              else resolve(`success`);
            }
          );

          // Sometimes we'll get stuck on a download even though it appears to
          // have slots, so time out after 2 minutes.
          setTimeout(() => reject(`download timed out`), 1000 * timeout);
        }
      );
    });
  }
}

// getOkFile sifts through a list of files to find the best match that
// is of the preferred file type and has open slots for download.
function getOkFile(results, fileTypePreference, songTitle) {
  let okResult = null;
  let re = /(?:\.([^.]+))?$/; // Matches file type suffixes.

  let bestSpeed = 0;
  let preferredTypeFound = false;

  results.forEach((result) => {
    let fileType = re.exec(result.file)[0];

    if (result.slots) {
      if (preferredTypeFound) {
        if (
          fileType === fileTypePreference &&
          remixCheck(result.file, songTitle) &&
          result.speed > bestSpeed
        ) {
          bestSpeed = result.speed;
          okResult = result;
        }
      } else {
        if (
          isAudio(fileType) &&
          remixCheck(result.file, songTitle) &&
          result.speed > bestSpeed
        ) {
          bestSpeed = result.speed;
          okResult = result;
        }
        if (fileType === fileTypePreference) {
          preferredTypeFound = true;
        }
      }
    }
  });

  if (okResult) okResult.fileType = re.exec(okResult.file)[0];

  return okResult;
}

function isAudio(fileType) {
  return (
    fileType === ".mp3" ||
    fileType === ".flac" ||
    fileType === ".m4a" ||
    fileType === ".aiff"
  );
}

function remixCheck(file, songTitle) {
  let pass = true;
  if (file.toLowerCase().includes("remix")) {
    if (!songTitle.toLowerCase().includes("remix")) pass = false;
  } else {
    if (songTitle.toLowerCase().includes("remix")) pass = false;
  }
  return pass;
}

module.exports = Slsk;
