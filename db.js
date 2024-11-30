const mysql = require("mysql");
const sql = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'backend'
})

sql.connect((err)=>{
    if(!err){
        console.log("datbase connected successfully");
    }else{
        console.log("datbase error");
    }
});

module.exports = sql;
