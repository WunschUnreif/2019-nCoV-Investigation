
function resultVerifyPasswdHash(passwd) {
    var timestamp = parseInt((new Date()).getTime());
    var closetMinute = Math.round(timestamp / 1000 / 60);
    if(timestamp - closetMinute > 30 * 1000) {
        closetMinute += 1;
    }

    var composedPasswd = passwd + new String(closetMinute);

    return hex_md5(composedPasswd);
}

function resultVerifyCheckpwd() {
    var pwd = $("input[name = 'result-passwd']").val();
    var afterMD5 = resultVerifyPasswdHash(pwd);

    $.ajax({
        url: "/api/verify",
        type: 'get',
        data: {
            pwd: afterMD5
        },
        success: function(response) {
            if(response.status === 'OK') {
                alert("验证通过，" + response.name);
                location.replace("/result-verify.html?tmpkey=" + response.tempkey);
            } else {
                alert("验证不通过！");
            }
        },
        error: function(err) {
            alert("出现错误！");
        }
    });
}


