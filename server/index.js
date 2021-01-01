const readline = require("readline");
const fs = require("fs");
const Server = require("./server");

// slsk-client assumes the existence of /tmp directory, so need to create it if not already there.
try {
  fs.mkdirSync("/tmp");
} catch (err) {
  if (err.code !== "EEXIST") throw err;
}

let server = new Server();
server.serveExpress();