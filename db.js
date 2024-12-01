const mysql = require("mysql");
const sql = mysql.createConnection({
    host : 'bstbntxc7bgla9ys4qkp-mysql.services.clever-cloud.com',
    user : 'ulrkqtkxe97ebhvj',
    password : 'ulrkqtkxe97ebhvj',
    database : 'bstbntxc7bgla9ys4qkp'
})

sql.connect((err)=>{
    if(!err){
        console.log("datbase connected successfully");
    }else{
        console.log("datbase error");
    }
});

module.exports = sql;
