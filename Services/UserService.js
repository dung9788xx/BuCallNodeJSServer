const MySQL= require("./MysqlConnection");
let uuid = require('uuid');
function processResult(result) {
    if(Object.keys(result).length>0 && !result.error && JSON.parse(result.data).length>0){
        return JSON.parse(result.data);
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
        result = processResult(result);
        if(result){
            callback(result);
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

function getConversations(userId, callback){
    let query = "select users.id,users.name,cv.id as cv_id " +
        "from users," +
        "(select id,partner_user_id as user_id from conversations where user_id =?" +
        " union" + " select id, user_id as user_id from conversations where partner_user_id=?) as cv" +
        " where cv.user_id=users.id ";
    MySQL.query(query, [userId,userId], (result)=>{
        result = processResult(result)
        if(result){
            callback(result);
        }else
            callback(false);
    })
}

function addFriend(user_id, friend_id, callback){
    MySQL.query("select * from friends where (user_id=? and friend_id=?) or ((user_id=? and friend_id=?)) ",[user_id, friend_id,friend_id,user_id ], (result)=>{
       if(!processResult(result)){
           MySQL.query("insert into friends(user_id, friend_id, created_at) values (?,?,?)",[user_id, friend_id, new Date().toISOString().slice(0, 19).replace('T', ' ')], (result)=>{
               console.log(result);
               if(result){
                   callback(true);
               }else {
                   callback(false);
               }
           })
       } else {
           console.log("bbbb")
           callback(true);
       }
    });
}
module.exports = {
    'login': login,
    'generateToken': generateToken,
    'getUserByToken': getUserByToken,
    'addFriend': addFriend,
    'getConversations': getConversations,
};
