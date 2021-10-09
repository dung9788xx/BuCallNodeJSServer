
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
        return callback({data: JSON.stringify(result)});
    });
}
// function query1(query,params,callback) {
//     return new Promise((resole, reject) => {
//         con.query(query, params,(err, result)=> {
//             err ? resole(null) : resole(result);
//         });
//     });
// }
function update(query,params,callback) {
    con.query(query, params,(err, result)=> {
        if (err) return  callback(false);
        return result.changedRows>0 || result.affectedRows>0 ? callback(true) : callback(false);
    });

}
function processResult(result) {
    if(Object.keys(result).length>0 && !result.error && JSON.parse(result.data).length>0){
        return result.data;
    }
    return false;
}
module.exports = {
    'query': query,
    'update':update,
    'processResult': processResult
};
