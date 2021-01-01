const os = require("os");
const path = require("path");
const fs = require("fs");
const Server = require("./server");

// slsk-client assumes the existence of /tmp/slsk directory, so need to create it if not already there.
try {
  fs.mkdirSync(path.join(os.homedir(), "tmp/slsk"), { recursive: true });
} catch (err) {
  if (err.code !== "EEXIST") throw err;
}

let server = new Server();
server.serveExpress();