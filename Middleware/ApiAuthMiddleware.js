const MySQL= require("../Services/MysqlConnection");
var authMiddleware = function (request,res, next) {

    if(typeof request.header("Authorization") === 'undefined' ){
        return  res.json(Response.json(401,"Unauthorized"))
    }

    MySQL.query("select * from users where token = ?",[request.header("Authorization")], function (result) {
        if(MySQL.processResult(result)){
            next();
        }else {
            return  res.json(Response.json(401,"Unauthorized"))
        }
    })

};
module.exports = authMiddleware;
