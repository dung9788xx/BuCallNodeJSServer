var MySQL= require("./MysqlConnection");
function login(username,password,callback){
    MySQL.query("select * from users where username='"+username+"' and password='"+password+"'",(result)=>{
        callback(result)
    } )
}
module.exports = {
    'login': login,
};
