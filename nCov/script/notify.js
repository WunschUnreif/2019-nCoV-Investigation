"use strict;"

function readTextFile(file, callback) {  
    var rawFile = new XMLHttpRequest();  
    rawFile.overrideMimeType("application/json");  
    rawFile.open("GET", file, true);  
    rawFile.onreadystatechange = function() {  
        if (rawFile.readyState === 4 && rawFile.status == "200") {  
            callback(rawFile.responseText);  
        }
    }
    rawFile.send(null);  
}  

function addNotify() {
    var notifyDiv = document.getElementById("notify");

    readTextFile("/notify/notify.json?id=2020-01-30:2", function(text) {
        var data = JSON.parse(text);
        
        for(var id in data) {
            var notify = data[id];
            
            var name = notify["name"];
            var date = notify["date"];
            var contents = notify["contents"];

            // 添加水平分割线
            var elHorizontalLine = document.createElement("hr");
            notifyDiv.appendChild(elHorizontalLine);

            // 通知标题
            var elTitle = document.createElement("h3");
            elTitle.appendChild(document.createTextNode(name));
            
            // 日期标签
            var elDate = document.createElement("span");
            elDate.className = "label round";
            elDate.style.marginLeft = "1em";
            elDate.style.fontSize = "medium";
            elDate.appendChild(document.createTextNode(date));

            elTitle.appendChild(elDate);
            notifyDiv.appendChild(elTitle);

            // 通知内容
            for(var contentID in contents) {
                var content = contents[contentID];
                var elContent = document.createElement("p");
                elContent.appendChild(document.createTextNode(content));
                notifyDiv.appendChild(elContent);
            }
        }
    });
}
