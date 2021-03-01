
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "example",
    database: 'dungdemo'
});
con.connect(function(err) {
    if (err) throw err;
});
async function query(query) {
 await  con.query(query, (err, result)=> {
        if (err) return  false;
        return result;
    });
}
module.exports = {
    'query': query,
};
