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
   let validate = Validate.validate(req.body,[{username: Validate.STRING}, {secret: Validate.STRING}]);
    if(!validate.isValid){
        return  res.json(Response.json(403,validate.error));
    }
    console.log(process.env.SECRET_KEY);
    if(req.body.secret !== process.env.SECRET_KEY) return   res.json(Response.json(403, 'wrong_login_info'));
    // UserDAO.login(req.body.username,req.body.token,function (result) {
    //     if(result){
    //         var user_data =result;
    //         UserDAO.generateToken(req.body.username, function (token) {
    //             if(token){
    //                 return  res.json(Response.json(200, {loginToken:token, data:user_data}));
    //             }else{
    //                 return   res.json(Response.json(500, 'Server error'));
    //             }
    //         })
    //     }else{
    //        return   res.json(Response.json(403, 'wrong_login_info'));
    //     }
    // });
  UserDAO.checkLoginWithGoogle(req.body.username,function (result) {
      if(result){
        if(result[0].status === 1) {
            UserDAO.updateToken(req.body.username,req.body.token, function (result) {
              if(result) {
                UserDAO.getUserByUsername(req.body.username, function (result) {
                  if(result) {
                    return  res.json(Response.json(200, {loginToken: req.body.token, data: result[0]}));
                  } else {
                    return   res.json(Response.json(403, 'wrong_login_info'));
                  }
                }) ;
              } else {
                return   res.json(Response.json(403, 'wrong_login_info'));
              }
            })
        } else {
          return   res.json(Response.json(403, 'Your has been blocked'));
        }
      }else{
         UserDAO.createUserWithGoogle(req.body.username,req.body.name,req.body.token,1, req.body.photo,1, function (result) {
            if(result) {
                UserDAO.getUserByUsername(req.body.username, function (result) {
                    if(result) {
                      return  res.json(Response.json(200, {loginToken: req.body.token, data: result[0]}));
                    } else {
                      return   res.json(Response.json(403, 'wrong_login_info'));
                    }
                }) ;

            } else {
              return   res.json(Response.json(403, 'wrong_login_info'));
            }
         });

      }
  });


});
router.get('/', (req, res) => {
    res.send('Hello World!')
})
module.exports = router
