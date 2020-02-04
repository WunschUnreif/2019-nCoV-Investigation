var crypto = require('crypto');
var fs = require('fs');

function getHashedPasswd(passwd) {
    var md5 = crypto.createHash('md5');

    var timestamp = parseInt((new Date()).getTime());
    var closetMinute = Math.round(timestamp / 1000 / 60);
    if(timestamp - closetMinute > 30 * 1000) {
        closetMinute += 1;
    }

    var composedPasswdNow = passwd + new String(closetMinute);
    // console.log(composedPasswdNow);
    md5.update(composedPasswdNow);
    var hashed1 = md5.digest('hex');

    md5 = crypto.createHash('md5');
    var composedPasswdPrev = passwd + new String(closetMinute - 1);
    md5.update(composedPasswdPrev);
    var hashed2 = md5.digest('hex');

    return [hashed1, hashed2];
}

module.exports = class Verifier {
    constructor() {
        this.trustedUsers = fs.readFileSync('./trusteduser.json').toString();
        this.trustedUsers = JSON.parse(this.trustedUsers);
    }

    update() {
        this.trustedUsers = fs.readFileSync('./trusteduser.json').toString();
        this.trustedUsers = JSON.parse(this.trustedUsers);
    }

    verify(pwd) {
        this.update();

        var that = this;
        return new Promise(function (resolve, reject) {
            for(var idx in that.trustedUsers) {
                var user = that.trustedUsers[idx];
                var hashedCodes = getHashedPasswd(user['passwd']);
                if(hashedCodes[0] === pwd || hashedCodes[1] === pwd) {
                    resolve(user['name']);
                    return;
                }
            }
            reject('No match password found.');
        });
    }

    getTempKey(pwd) {
        var md5 = crypto.createHash('md5');
        var timestamp = Math.round(parseInt((new Date()).getTime()) / 1000);
        md5.update(pwd + new String(timestamp));
        return md5.digest('hex');
    }
}
