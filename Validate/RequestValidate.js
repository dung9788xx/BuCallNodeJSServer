const STRING = "string";
const NUMBER = "number";
function validate(values, rules) {
    if(!typeof  values === 'object' || !typeof rules ==='object')
        return false;
    let isValidate = false;
    let error = {};
    rules.every(function (value,index) {
        let key=Object.keys(value)[0];
        if(typeof values[key] == value[key] ){
            isValidate=true;
            return true;
        } else {
            isValidate=false;
            if(typeof values[key] === 'undefined') {
                error = 'Field '+key+' is required';
            }else{
                error = 'Field '+key+ 'must be type of '+ value[key];
            }
            return false;
        }
    })
    if(isValidate){
        return {isValid: true};
    }
    return {isValid: false, error: error };
}
module.exports = {
    'validate': validate,
    'STRING':STRING,
    "NUMBER":NUMBER
};

