const MySQL= require("./MysqlConnection");
let uuid = require('uuid');
function processResult(result) {
    if(Object.keys(result).length>0 && !result.error && JSON.parse(result.data).length>0){
        return result.data;
    }
    return false;
}
function generateToken(username, callback) {
    let token = uuid.v1()+''+uuid.v4();
    MySQL.update('update users set token=? where username=?', [token,username
    ],(result)=>{
        if(result){

            callback(token);
        }else
            callback(false)
    } );
}
function login(username,password,callback){
    let query = "select * from users where username=? and password=?";
    MySQL.query(query, [username,password],(result)=>{
        if(processResult(result)){
            callback(true);
        }else
        callback(false)
    } );
}
function getUserByToken(token, callback){
    let query = "select id,username from users where token = ? ";
    MySQL.query(query, [token], (result)=>{
        result = processResult(result)
        if(result){
            callback(result);
        }else
            callback(false);
    })
}
module.exports = {
    'login': login,
    'generateToken': generateToken,
    'getUserByToken': getUserByToken
};
