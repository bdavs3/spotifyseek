const readline = require("readline");
const fs = require("fs");
//const Client = require('./client');
const Server = require("./server");

//let client;

let server = new Server();
server.authorize();

// slsk-client assumes the existence of /tmp directory, so need to create it if not already there.
// try {
//   fs.mkdirSync("/tmp");
// } catch (err) {
//   if (err.code !== "EEXIST") throw err;
// }

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// rl.question("Username: ", function (username) {
//   rl.question("Password: ", function (password) {
//     rl.question("What would you like to download? ", function (searchQuery) {
//       client = new Client(username, password);
//       client.download(searchQuery);
//       rl.close();
//     });
//   });
// });
