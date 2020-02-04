var mysql = require('mysql');

module.exports = class Query {
    constructor() {
        this.database = mysql.createConnection({
            host : 'localhost',
            user : '****',
            password : '********',
            database : 'ncov_inves_f1703302',
        });

        this.database.connect();
    }

    getStuName(stuID) {
        return new Promise( (resolve, reject) => {
            var querySQL = "select stu_name from students where stu_id = ?";
            var params = [stuID];

            var queryString = mysql.format(querySQL, params);

            this.database.query(queryString, (err, result) => {
                if(err) {
                    console.log("[SQL ERROR]: " + err.message)
                    reject(err);
                } else {
                    if(result.length === 0) { resolve(""); }
                    else { resolve(result[0].stu_name); }
                }
            });
        });
    }

    getStuRecordItem(stuID, date, item) {
        return new Promise( (resolve, reject) => {
            if( item !== 'inves_health' &&
                item !== 'inves_contact' && 
                item !== 'inves_return' &&
                item !== 'inves_quarantine') {
                    reject(new Error("item name wrong"));
                    return;
            }

            var querySQL = "select " + item +  " from invesRecords where stu_id = ? and inves_date = ?";
            var params = [stuID, date];

            var queryString = mysql.format(querySQL, params);

            this.database.query(queryString, (err, result) => {
                if(err) {
                    console.log("[SQL ERROR]: " + err.message)
                    reject(err);
                } else {
                    if(result.length === 0) { resolve(""); }
                    else { resolve(result[0][item]); }
                }
            });
        });
    }

    getStuIDList() {
        return new Promise( (resolve, reject) => {
            this.database.query('select stu_id from students', (err, result) => {
                if(err) {
                    console.log("[SQL ERROR]: " + err.message)
                    reject(err);
                } else {
                    var listStuID = [];
                    for(var idx in result) {
                        listStuID.push(result[idx].stu_id);
                    }
                    resolve(listStuID);
                }
            });
        })
    }

    async getRecord(date, stuID) {
        try {
            let stuName = await this.getStuName(stuID);
            let health = await this.getStuRecordItem(stuID, date, 'inves_health');
            let contact = await this.getStuRecordItem(stuID, date, 'inves_contact');
            let returned = await this.getStuRecordItem(stuID, date, 'inves_return');
            let quarantine = await this.getStuRecordItem(stuID, date, 'inves_quarantine');

            return {
                stuName : stuName,
                stuID : stuID,
                health : health,
                contact : contact,
                returned : returned,
                quarantine : quarantine
            };
        } catch (error) {
            console.log(error.message);
            return null;
        }
    }

    async query(date) {
        try {
            var result = [];
            var idList = await this.getStuIDList();

            for(var idx in idList) {
                let record = await this.getRecord(date, idList[idx]);
                result.push(record);
            }

            return [null, result];
        } catch (error) {
            return [error, []];
        }
    }
};
