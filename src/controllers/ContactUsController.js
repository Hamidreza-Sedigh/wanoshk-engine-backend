const Source = require('../models/Source');
const jwt =    require('jsonwebtoken');

module.exports = {    
    getContacts(req,res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if(err){
                res.sendStatus(401);
            } else {
                const { qq } = req.params;
                const query = qq ? { qq } : {} ;
                try {
                    const contactUses = await Contact.find(query)
                    if(contactUses){
                        return res.json({authData, contactUses})
                    }    
                } catch (error) {
                    return res.status(400).json({ message: 'we dont have any contactUses yet'});
                }
            }
        });
    }
}