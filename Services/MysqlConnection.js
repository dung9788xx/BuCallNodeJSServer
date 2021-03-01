
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
 function query(query,onSuccess) {
    con.query(query, (err, result)=> {
        if (err) return  onSuccess({error: err });
        return onSuccess({data: result});
    });
}
module.exports = {
    'query': query,
};
