
function invesCheckExistance(stuName, stuID, callback) {
    $.ajax({
        url: '/api/invescheck',
        type: 'get',
        data : {
            stu_name : encodeURI(stuName),
            stu_id : encodeURI(stuID)
        },
        success : function(data) {
            if(data.exist == 'Y') {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        error : function(err) {
            callback(err, null);
        }
    });
}

function doSubmit() {
    var stuName = $('input[name = "invs-name"]').val();
    var stuID = $('input[name = "invs-id"]').val();
    var health = $('select[name = "invs-health"]').val();
    var contact = $('select[name = "invs-contact"]').val();
    var returned = $('select[name = "invs-return"]').val();
    var quarantine = $('select[name = "invs-quarantine"]').val();

    $.ajax({
        url : "/api/invessubmit",
        type : 'get',
        data : {
            stu_id : stuID,
            stu_name : stuName,
            health : health,
            contact: contact,
            returned : returned,
            quarantine : quarantine
        },
        success : function(data) {
            alert(data.message);
            if(data.result === 'success') {
                location.replace('/index.html');
            }
        },
        error : function(err) {
            alert("错误");
            console.log(err);
        }
    })
}

function invesSubmit() {
    var stuName = $('input[name = "invs-name"]').val();
    var stuID = $('input[name = "invs-id"]').val();

    invesCheckExistance(stuName, stuID, (err, exist) => {
        if(err) {
            alert("错误");
            console.log(err);
        } else {
            if(exist) {
                doSubmit();
            } else {
                alert("学号或姓名错误或尚未登记");
            }
        }
        document.cookie = 'stu_name=' + encodeURI(stuName) + ';';
        document.cookie = 'stu_id='   + encodeURI(stuID)   + ';';
    });
}

function getCookie(name) {
    var cookies = document.cookie.split(';');
    for(var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if(cookie.indexOf(name) == 0) {
            return decodeURI(cookie.substring(name.length + 1, cookie.length));
        }
    }
    return "";
}
