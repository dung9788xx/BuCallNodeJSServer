const express = require('express');
const router = express.Router();
var UserDAO = require('../Services/UserService');

router.use('/users', function (request,res, next) {
    next();
});
router.post('/users/login', function (req, res, next) {
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
