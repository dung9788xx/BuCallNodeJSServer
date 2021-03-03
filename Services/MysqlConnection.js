
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
 function query(query,params,callback) {
    con.query(query, params,(err, result)=> {
        if (err) return  callback({error: err });
        return callback({data: result});
    });
}
function processResult(result) {
    if(Object.keys(result).length>0 && !result.error && result.data.length>0){
        return {data:result.data};
    }
    return false;
}
module.exports = {
    'query': query,
    'processResult': processResult
};
