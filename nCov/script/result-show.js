
var resultTableRows = []

function resultGetTempKey() {
    var query = location.search;
    if(query.indexOf('?tmpkey=') === 0) {
        return query.substring('?tmpkey='.length, query.length);
    }
    return '';
}

function resultQuery() {
    var expectDate = $("input[name = 'result-date']").val();
    var tempkey = resultGetTempKey();

    var resultNumberDiv = $('#resultNumberDiv');
    var resultTableDiv = $('#resultTableDiv');

    resultClearTable();

    $.ajax({
        url: '/api/query',
        type: 'get',
        data: {
            tempkey: tempkey,
            date: expectDate
        },
        success: (result) => {
            if(result.status !== 'success') {
                alert(result.message);

                resultNumberDiv.hide();
                resultTableDiv.hide();

                if(result.status === 'keyexpired') {
                    location.replace('/result-verify.html');
                }
            } else {
                var data = result.data;
                var number = 0;

                for(var idx in data) {
                    var record = data[idx];
                    resultAddRow(record);
                    if(record.health !== '') {
                        number += 1;
                    }
                }

                $("#resultNumber").html('' + number);

                resultNumberDiv.show();
                resultTableDiv.show();
            }
        },
        error: (err) => {
            alert('错误');
            console.log(err);

            resultNumberDiv.hide();
            resultTable.hide();
        }
    })
}

function resultAddRow(record) {
    var table = document.getElementById('resultTable');

    var row = document.createElement('tr');
    
    for(var item in record) {
        var unit = document.createElement('td');
        var desc = resultGetDesc(item, record[item]);

        console.log(desc);

        var text = document.createTextNode(desc[0]);
        var colors = resultColorize(desc[1]);

        if(colors[0]) {
            // bg-color 
            unit.style.backgroundColor = colors[0];
        }

        if(colors[1]) {
            // fg-color 
            unit.style.color = colors[1];
        }

        unit.appendChild(text);
        row.appendChild(unit);
    }

    table.appendChild(row);
    resultTableRows.push(row);
}

function resultClearTable() {
    var table = document.getElementById('resultTable');

    for(var idx in resultTableRows) {
        table.removeChild(resultTableRows[idx]);
    }

    resultTableRows = [];
}

function resultGetDescHealth(health) {
    switch (health) {
        case '0': return ['健康',                0];
        case "1": return ['有发热症状',           2];
        case "2": return ['无发热，但有感冒症状',   1];   
        case "3": return ['患有其他传染病',        1];
        case "4": return ['患有其他非传染病',      1];
        case "5": return ['新型肺炎疑似病例',      3];
        case "6": return ['新型肺炎确诊病例',      4];
        default:  return [health,               0];
    }
}

function resultGetDescContact(contact) {
    switch (contact) {
        case '0': return ['否',      0];
        case "1": return ['是',      1];
        default:  return [contact,   0];
    }
}

function resultGetDescReturned(returned) {
    switch (returned) {
        case '0': return ['不在上海',         0];
        case "1": return ['在上海，不在学校',  1];
        case "2": return ['已返校',          2];
        default:  return [returned,         0];
    }
}

function resultGetDescQuarantine(quarantine) {
    switch (quarantine) {
        case '0': return ['否',         0];
        case "1": return ['是',         1];
        default:  return [quarantine,   0];
    }
}

function resultGetDesc(item, val) {
    val = '' + val;
    switch (item) {
        case 'health' : return resultGetDescHealth(val);
        case 'contact' : return resultGetDescContact(val);
        case 'returned' : return resultGetDescReturned(val);
        case 'quarantine' : return resultGetDescQuarantine(val);
        default:        return [val, 0];
    }
}

// return => [bg, fg]
function resultColorize(grade) {
    switch (grade) {
        case 0:  return [null, null];
        case 1:  return ['#FFEA00', null];
        case 2:  return ['#FFC400', null];
        case 3:  return ['#FF9100', null];
        case 4:  return ['#FF3D00', '#FFFFFF'];
        default: return [null, null];
    }
}
