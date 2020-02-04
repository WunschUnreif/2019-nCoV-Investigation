var mysql = require('mysql');
var fs = require('fs');

function getNameList() {
    var data = fs.readFileSync('students.json');
    var jsonData = JSON.parse(data.toString());
    return jsonData;
}

function checkStuIDExists(database, stuID, callback) {
    var queryStr = "select * from students where stu_id=" + stuID;
    var queryParam = [stuID];

    var existance = false;

    database.query(queryStr, function(err, result) {
        if(err) {
            console.log("[ERROR in `checkStuIDExists`]: " + err.message);
            callback(err, false);
        }

        if(result.length !== 0) {
            existance = true;
        }
        callback(null, existance);
    });
}

function updateInfo(database, stuID, stuName) {
    checkStuIDExists(database, stuID, function(err, existance) {
        if(err) {
            return;
        }

        console.log("ID:" + stuID + " Exist: " + existance);

        var quertSQL;
        var params;

        if(existance == true) {
            // 学生信息存在，需要更新
            quertSQL = "update students set stu_name = ? where stu_id = " + stuID;
            params = [stuName];
        } else {
            // 学生信息不存在，需要插入
            quertSQL = "insert into students (stu_id, stu_name) values(?, ?)";
            params = [stuID, stuName];
        }

        database.query(quertSQL, params, function(err, _) {
            if(err) {
                console.log("[ERROR in `updateInfo`]: " + err.message);
            }
        });
    });
}

var database = mysql.createConnection(
    {
        host : 'localhost',
        user : '****',
        password : '*******',
        database : 'ncov_inves_f1703302',
        useConnectionPooling: true
    }
);

// 连接MySQL服务器
database.connect(function(e) {
    if(e) {
        console.log(e.code + " " + e.message);
    }
    console.log("连接成功");
});

// 获取学生名单
var studentsData = getNameList();
var studentsNum = studentsData.length;
console.log("人数：" + studentsNum);

// 处理每个学生信息
for(var idx in studentsData) {
    var student = studentsData[idx];

    var stu_id = student["stu_id"];
    var stu_name = student["stu_name"];

    updateInfo(database, stu_id, stu_name);
}

// 显示学生数据表
database.query('select * from students', function(err, result) {
    if(err) {
        console.log(e.code + " " + e.message);
        return;
    }
    console.log(result);
});

// // 结束连接
// database.end(function(e) {
//     if(e) {
//         console.log(e.code + " " + e.message);
//     }
// });
