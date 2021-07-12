const express = require('express');
const router = express.Router();
var UserDAO = require('../Services/UserService');

router.get('/user/info',ApiAuthMiddleware, function (req, res) {
    UserDAO.getUserByToken(req.header("Authorization"), function (result) {
        if(result){
           return  res.json(Response.json(200, result))
        }else return res.json(Response.json(500,"server error"))
    })
})
router.get('/user/conversation',ApiAuthMiddleware, function (req, res) {
   UserDAO.getConversations(global.user_id, function (result) {
       if(result){
           return  res.json( Response.json(200,result))
       }else return res.json(Response.json(500,"server error"))
   })
})
router.get('/user/messages',ApiAuthMiddleware, function (req, res) {
    UserDAO.getMessages(req.query.conversation_id,req.query.page || 1, function (result) {
        if(result){
            return  res.json( Response.json(200,result))
        }else return res.json(Response.json(500,"server error"))
    })
})
router.post('/user/login',function (req, res) {
   let validate = Validate.validate(req.body,[{username: Validate.STRING}, {password: Validate.STRING}]);
    if(!validate.isValid){
        return  res.json(Response.json(403,validate.error));
    }
    UserDAO.login(req.body.username,req.body.password,function (result) {
        if(result){
            var user_data =result;
            UserDAO.generateToken(req.body.username, function (token) {
                if(token){
                    return  res.json(Response.json(200, {loginToken:token, data:user_data}));
                }else{
                    return   res.json(Response.json(500, 'Server error'));
                }
            })
        }else{
           return   res.json(Response.json(403, 'wrong_login_info'));
        }
    });

});
router.get('/', (req, res) => {
    res.send('Hello World!')
})
module.exports = router
