function json(code, data) {
    if(typeof code === "undefined" || code==''){
        code = 200;
    }
    if(code == 200){
        return {code:code , data: data};
    }else {
        return {code:code , message: data};
    }

}
module.exports = {
    'json': json
}
