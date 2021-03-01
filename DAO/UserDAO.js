var MySQL= require("./MysqlConnection");

async function login(username, password) {
 await   MySQL.query("select * from users where username='"+username+"' and password= '"+password+"'")
}
module.exports = {
    'login': login,
};
