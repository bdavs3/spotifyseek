const slsk = require('slsk-client');

class Client {
    constructor (username, password) {
        this.username = username;
        this.password = password;
    }

    download(searchQuery) {
        slsk.connect({
            user: this.username,
            pass: this.password
        }, (err, client) => {
            client.search({
                req: searchQuery,
                timeout: 2000
            }, (err, res) => {
                if (err) return console.log(err);
                client.download({
                    file: res[0],
                    path: '/tmp/slsk' + '/' + searchQuery + '.mp3'
                }, (err, data) => {
                    if (err) return console.log(err);
                });
            });
        });
    }
}

module.exports = Client;