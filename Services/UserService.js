const MySQL= require("./MysqlConnection");
function processResult(result) {
    if(Object.keys(result).length>0 && !result.error && result.data.length>0){
        return {data:result.data};
    }
    return false;
}
function login(username,password,callback){
    let query = "select * from users where username=? and password=?";
    MySQL.query(query, [username,password],(result)=>{
        if(processResult(result)){
            callback(true);
        }else
        callback(false)
    } )
}
module.exports = {
    'login': login,
};
