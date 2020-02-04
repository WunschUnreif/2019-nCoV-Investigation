
module.exports = class KeyManager {
    constructor() {
        this.alivekeys = [];
    }

    append(key) {
        this.flush();
        this.alivekeys.push(
            {
                content: key,
                timestamp: parseInt((new Date()).getTime()) / 1000,
                timeStr: (new Date()).toString()
            }
        );
        console.log("活跃密钥：");
        console.log(this.alivekeys.map((x) => {return x.content + '@' + x.timeStr;}));
    }

    flush() {
        var newkeys = []
        var now = parseInt((new Date()).getTime()) / 1000;
        for(var idx in this.alivekeys) {
            if(now - this.alivekeys[idx].timestamp < 10 * 60) {
                newkeys.push(this.alivekeys[idx]);
            }
        }
        this.alivekeys = newkeys;
    }

    check(key) {
        this.flush();
        for(var idx in this.alivekeys) {
            if(key === this.alivekeys[idx].content) {
                return true;
            }
        }
        return false;
    }
};
