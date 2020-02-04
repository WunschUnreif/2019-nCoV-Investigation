var mysql = require('mysql');
var express = require('express');

var database = mysql.createConnection({
    host : 'localhost',
    user : '****',
    password : '********',
    database : 'ncov_inves_f1703302',
});

database.connect();

var app = express();

// 学号姓名核验请求
app.get('/invescheck', (req, res) => {
    if(req.query.stu_id && req.query.stu_name) {
        var stu_id = decodeURI(req.query.stu_id);
        var stu_name = decodeURI(req.query.stu_name);

        console.log("请求验证学号" + stu_id + "，姓名：" + stu_name);
        checkStudentExist(stu_id, stu_name)
        .then(
            (exist) => {
                res.type('json').send({
                    exist : exist ? 'Y' : 'N'
                });
                console.log("验证结果：" + exist);
            },
            (_) => {
                res.type('html').status(500).send('Database error.');
            }
        )
    } else {
        res.type('html').status('400').send('Cannot resolve request.');
        console.log("收到非法请求");
    }
});

// 调查表提交请求
app.get('/invessubmit', (req, res) => {
    if(!req.query.stu_id || !req.query.stu_name || !req.query.health || !req.query.contact || !req.query.returned || !req.query.quarantine) {
        res.type('html').status('400').send('Cannot resolve request.');
        console.log("收到非法请求");
    } else {
        var stuID = decodeURI(req.query.stu_id);
        var stuName = decodeURI(req.query.stu_name);
        var health = decodeURI(req.query.health);
        var contact = decodeURI(req.query.contact);
        var returned = decodeURI(req.query.returned);
        var quarantine = decodeURI(req.query.quarantine);
        
        console.log("收到提交请求：" + stuID + ' ' + stuName + ' ' + health + ' ' + contact + ' ' + returned + ' ' + quarantine);
        updateRecord(stuID, stuName, health, contact, returned, quarantine, res);
    }
});

app.listen(33021);

// 更新统计记录
async function updateRecord(stuID, stuName, health, contact, returned, quarantine, response) {
    var today = new Date();
    var dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    try {
        // 再次检查学号姓名是否存在
        var studentExist = await checkStudentExist(stuID, stuName);
        if(!studentExist) {
            console.log("学号或姓名不存在");
            response.type('json').send({
                message : "学号或姓名不存在",
                result : 'failed'
            });
        } else {
            // 检查学号今日记录是否存在
            var recordExist = await checkRecordExist(stuID, today);

            var querySQL;
            var params;

            if(recordExist) {
                // 更新记录
                querySQL = "update invesRecords \
                            set inves_health = ?, inves_contact = ?, inves_return = ?, inves_quarantine = ? \
                            where stu_id = ? and inves_date = ?";
                params = [health, contact, returned, quarantine, stuID, dateString];
            } else {
                // 插入记录
                querySQL = "insert into invesRecords (stu_id, inves_health, inves_contact, inves_return, inves_quarantine, inves_date) \
                            VALUES(?, ?, ?, ?, ?, ?)";
                params = [stuID, health, contact, returned, quarantine, dateString];
            }

            var queryString = mysql.format(querySQL, params);
            // console.log(queryString);

            // 执行SQL命令
            database.query(queryString, (err, result) => {
                if(err) {
                    console.log("[SQL ERROR]: " + err.message);
                    response.type('json').send({
                        message : "数据库错误",
                        result : 'failed'
                    });
                } else {
                    console.log("记录更新成功");
                    response.type('json').send({
                        message : "提交成功",
                        result : 'success'
                    });
                }
            });
        }
    } catch (err) {
        console.log("出现错误：" + err);
    }
}

// 检查学号姓名是否存在
function checkStudentExist(stuID, stuName) {
    return new Promise((resolve, reject) => {
        var sqlQuery = "select stu_name from students where stu_id = ?";
        // console.log(mysql.format(sqlQuery, stuID));
        database.query(mysql.format(sqlQuery, stuID), (err, result) => {
            if(err) {
                console.log("SQL ERROR] " + err.message);
                reject(err);
            } else {
                if(result.length === 0 || result[0].stu_name !== stuName) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    });
}

// 检查某日期某学号记录是否存在
function checkRecordExist(stuID, date) {
    return new Promise((resolve, reject) => {
        var sqlQuery = "select * from invesRecords where stu_id = ? and inves_date = ?";
        var dateString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

        // console.log(mysql.format(sqlQuery, [stuID, dateString]));

        database.query(mysql.format(sqlQuery, [stuID, dateString]), (err, result) => {
            if(err) {
                console.log("SQL ERROR] " + err.message);
                reject(err);
            } else {
                if(result.length === 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    })
}

// updateRecord('517030910197', '郑扬珞', '0', '0', '0', '0', null);

// async function test() {
//     try {
//         var exist = await checkStudentExist('517030910197', '郑扬珞');
//         console.log(exist);
//     } catch(err) {
//         console.log("失败");
//     }
// }

// test();

// checkRecordExist('517030910197', new Date())
// .then(
//     (exist) => {console.log(exist);},
//     (err) => {}
// );

// checkStudentExist('517030910197; drop table students', 'z')
// .then(
//     (exist) => {console.log(exist);},
//     (err) =>{}
// );

// database.query("select * from students", (err, result) => {
//     console.log(result);
// })
