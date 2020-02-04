var express = require('express');
var Verifier = require('./veryfier');
var KeyManager = require('./keymanager')
var Query = require('./query');

var app = express();
var verif = new Verifier();
var keys = new KeyManager();
var querier = new Query();

// 处理验证请求
app.get('/verify', function(req, res) {
    if(req.query.pwd) {
        console.log("收到验证请求，密码 = " + req.query.pwd);

        res.type('json');

        verif.verify(req.query.pwd)
        .then((username) => {
            var key = verif.getTempKey(username);
            res.send({
                status : 'OK',
                name : username,
                tempkey : key
            });
            
            keys.append(key);
            console.log("验证通过，密钥 = " + key);
        }, (err) => {
            res.send({
                status : 'REJECT',
                name : '',
                tempkey : ''
            });
            console.log("验证失败 " + err);
        });
    } else {
        res.type('html').status('400').send('Cannot resolve request.');
        console.log("收到非法请求");
    }
});

// 处理查询请求，返回JSON格式：
// { 
//      message: 查询结果信息
//      status:  success | keyexpired | fail
//      data: [查询到的记录]      
// }
app.get('/query', function (req, res) {
    if(req.query.tempkey && req.query.date) {
        var tempkey = req.query.tempkey;
        var dateString = req.query.date;

        console.log('收到查询请求，密钥 = ' + tempkey + '，日期 = ' + dateString);

        // 临时密钥错误或过期
        if(keys.check(tempkey) == false) {
            res.type('json').send({
                message : "临时密钥过期，请重新验证",
                status : 'keyexpired',
                data : []
            });

            console.log('密钥错误或过期');

            return;
        }

        // 允许查询
        dealQuery(dateString, res);

    } else {
        res.type('html').status('400').send('Cannot resolve request.');
        console.log("收到非法请求");
    }
});

app.listen(33020);

async function dealQuery(date, res) {
    try {
        let dataWithErr = await querier.query(date);

        if(dataWithErr[0]) {
            throw dataWithErr[0];
        } else {
            res.type('json').send({
                message : "",
                status : 'success',
                data : dataWithErr[1]
            });
    
            console.log('查询成功');
        }
    } catch (error) {
        res.type('json').send({
            message : "错误",
            status : 'fail',
            data : []
        });

        console.log('查询失败');
    }
}

// async function test() {
//     let record = await querier.query('2020-02-01');
//     console.log(record);
// }

// test();
