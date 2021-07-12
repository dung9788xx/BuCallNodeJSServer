const MySQL= require("../Services/MysqlConnection");
const authMiddleware = function (request,res, next) {

    if(typeof request.header("Authorization") === 'undefined' || request.header("Authorization").toString().trim() ===''){
        return  res.json(Response.json(401,"Unauthorizedaaa"))
    }

    MySQL.query("select * from users where token = ?",[request.header("Authorization")], function (result) {
        console.log(result)
        console.log(request.header("Authorization"))
        if(MySQL.processResult(result)){
            global.user_id = JSON.parse(MySQL.processResult(result))[0].id;
            next();
        }else {
            return  res.json(Response.json(401,"Unauthorizedbbbb"))
        }
    })

};
module.exports = authMiddleware;
