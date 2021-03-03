const express = require('express');
const router = express.Router();
var UserDAO = require('../Services/UserService');

router.get('/user/info',ApiAuthMiddleware, function (req, res) {
    res.send("this is info");
})
router.post('/user/login',function (req, res) {
    let validate = Validate.validate(req.body,[{username: Validate.STRING}, {password: Validate.STRING}]);
    if(!validate.isValid){
        return  res.json(Response.json(403,validate.error));
    }
    UserDAO.login(req.body.username,req.body.password,function (result) {
        if(result){
           return  res.json(Response.json(200, 'Login success'));
        }else{
           return   res.json(Response.json(200, 'Login success'));

        }
    });


});
router.get('/', (req, res) => {
    res.send('Hello World!')
})
module.exports = router
