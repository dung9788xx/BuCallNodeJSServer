const STRING = "string";
const NUMBER = "number";
function validate(values, rules) {
    if(!typeof  values === 'object' || !typeof rules ==='object')
        return false;
    let isValidate = false;
    let error = {};
    rules.forEach(function (value,index) {
        let key=Object.keys(value)[0];
        if(typeof values[key] == value[key] ){
            isValidate=true;
        } else {
            isValidate=false;
            return;
        }
    })
    return isValidate;
}
module.exports = {
    'validate': validate,
    'STRING':STRING,
    "NUMBER":NUMBER
};

