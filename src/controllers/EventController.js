const Event = require('../models/Event');
const User =  require('../models/User');
const jwt =      require('jsonwebtoken');
//const { delete } = require('../routes');



module.exports = {
    createEvent(req, res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if (err) {
                    res.status(401);
            } else {
                const {title, description, price, sport, date } = req.body;
                console.log("|||req.headers:", req.headers);
               // const { user_id } = req.headers;
                const { filename } = req.file;

                const user = await User.findById(authData.user._id)

                if(!user){
                    console.log("WRONG USER ID !!!");
                    return res.status(400).json({ message: 'User dow not exist'})
                }

                const event = await Event.create({
                    title,
                    description,
                    sport,
                    price: parseFloat(price),
                    user: authData.user._id,
                    thumbnail: filename,
                    date
                })
                console.log("event has been created!!")
                return res.json(event);
            }
            
        });

    },
    async delete(req, res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if (err) {
                res.status(401);
            } else {
                const { eventId } = req.params;
                console.log("delete routes works fine!", req.params);
                try {
                    console.log("in try");
                    await Event.findByIdAndDelete(eventId);
                    console.log("delete worked.");
                    return res.status(204).send();
                } catch (error) {
                    return res.status(400).json({ message: 'we font have any event with this ID'});
                }      
                
            }
        }); 
    }
}