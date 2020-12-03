const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt =      require('jsonwebtoken');


module.exports = {
    async store(req, res){

        try {
            const {email, password} = req.body
            console.log("routes OK!", email, password)
            if (!email || !password){
                return res.status(200).json({message: "Rquired field missing"});
            }

            const user = await User.findOne({email})
            if(!user){
                console.log("test: if not user");
                return res.status(200).json({message: "User not found. want to register?"});
            }

            if(user && await bcrypt.compare(password, user.password)){
                console.log("test2: ok login");
                const userResponse = {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }

                return jwt.sign({user: userResponse}, 'secret', (err, token)=>{
                    return res.json({
                        user: token,
                        user_id: userResponse._id
                    })
                } )
                // return res.json(userResponse); // commented after add jwt
            }else{
                console.log("test2: wrong pass");
                return res.status(200).json({message: "email or pass does not match"});
            }

        } catch (error) {
            throw Error(`Error while authenticating a user ${error}`);// it has error
        }
    }
}