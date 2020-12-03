
function verifyToken(req, res, next){
    
    const bearrerToken = req.header('user');
    if(typeof bearrerToken !== 'undefined'){
        req.token = bearrerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports =  verifyToken