const MySQL= require("./MysqlConnection");
let uuid = require('uuid');
function processResult(result) {
    if(result.hasOwnProperty('data') && !result.error ){
        return JSON.parse(result.data);
    }
    return false;
}
function processCheckResult(result) {
    if(result.hasOwnProperty('data') && !result.error ){
        data = JSON.parse(result.data);
        if( Object.keys(data).length ==0) {
            return  false;
        }
        return data;
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
function updateToken(username,token, callback) {
    MySQL.update("update users set token=? where username=?", [token,username
    ],(result)=>{
        if(result){
            callback(result);
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

function checkLoginWithGoogle(username, callback) {
    let query = "select * from users where username=?";
    MySQL.query(query, [username], (result) => {
        result = processCheckResult(result);
        if (result) {
            callback(result)
        } else callback(false)
    });
}
function createUserWithGoogle(username,name,token,role,photo,status,callback){
    let query = "insert into users(username,name,token,role,photo,status,created_at) values (?,?,?,1,?,1, now())";
    MySQL.query(query, [username,name,token,photo], (result) => {
        if (result) {
            callback(true)
        } else {
            callback(false)
        }
    });
}
function getUserByToken(token, callback){
    let query = "select * from users where token = ? ";
    MySQL.query(query, [token], (result)=>{
        result = processResult(result)
        if(result){
            callback(result);
        }else
            callback(false);
    })
}
function getUserByUsername(username, callback){
    let query = "select * from users where username = ? ";
    MySQL.query(query, [username], (result)=>{
        result = processResult(result)
        if(result){
            callback(result);
        }else
            callback(false);
    })
}

function getConversations(userId, callback){
    let query = "select cv.user_id,users.name,users.photo,cv.id as cv_id,cv.last_message as last_message, cv.updated_at as updated_at_message " +
        "from users," +
        "(select id,partner_user_id as user_id,last_message,updated_at from conversations where user_id =?" +
        " union" + " select id, user_id as user_id,last_message,updated_at from conversations where partner_user_id=?) as cv" +
        " where cv.user_id=users.id  order by updated_at_message DESC";
    MySQL.query(query, [userId,userId], (result)=>{
        result = processResult(result)
        if(result){
            callback(result);
        }else
            callback(false);
    })
}
function getMessages(conversationId,page, callback) {
    let offset = (page-1)*20
    let query = "select message from messages where cv_id = ? order by created_at DESC LIMIT 20 OFFSET ? ";
    MySQL.query(query, [conversationId, offset], (result)=>{

        result = processResult(result)
        Object.keys(result).map(function(key, index) {
            result[key] = JSON.parse(result[key].message);
        });

        if(result){
            callback(result);
        }else
            callback(false);
    })
}
function addFriend(user_id, friend_id, callback){
    MySQL.query("select * from friends where (user_id=? and friend_id=?) or ((user_id=? and friend_id=?)) ",[user_id, friend_id,friend_id,user_id ], (result)=>{
        result = processResult(result)
       if(result.length > 0) {
           console.log(result)
           console.log('has friend')
           callback(true);
           return ;
       }
           MySQL.query("insert into friends(user_id, friend_id, created_at) values (?,?, now())",[user_id, friend_id], (result)=>{
               if (!result) {
                   callback(false);
                   console.log('fail inster')
                   return ;
               }
                   MySQL.query("insert into conversations(user_id,partner_user_id,created_at,updated_at) value(?,?, now(), now())", [user_id,friend_id], (result) => {
                       result ? callback(true) : callback(false)

                   })

           })
    });
}
function addMessage(cvId, message, callback) {
    let jsonMessage = JSON.stringify(message)
    let query = "insert into messages(cv_id, message, created_at) values (?,?, now())";
    MySQL.query(query, [cvId, jsonMessage], (result)=>{
        if(result){
            let updateLastMessage = "update conversations set last_message = ?, updated_at =now() where id = ?";
            let  newMessage = {
                text: message.text,
                createdAt: message.createdAt
            }
            MySQL.query(updateLastMessage, [JSON.stringify(newMessage),cvId], (result) =>{
                if(result) {
                    callback(true);

                } else {
                    callback(false)
                }
            })
        }else
            callback(false);
    })
}
module.exports = {
    'login': login,
    'generateToken': generateToken,
    'updateToken': updateToken,
    'getUserByToken': getUserByToken,
    'getUserByUsername': getUserByUsername,
    'addFriend': addFriend,
    'getConversations': getConversations,
    'getMessages' : getMessages,
    'addMessage' : addMessage,
    'checkLoginWithGoogle': checkLoginWithGoogle,
    'createUserWithGoogle': createUserWithGoogle,
};
