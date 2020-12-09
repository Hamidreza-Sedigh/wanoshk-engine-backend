const Source = require('../models/Source');
const jwt =    require('jsonwebtoken');

module.exports = {    
    getAllSources(req,res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if(err){
                res.sendStatus(401);
            } else {
                const { source } = req.params;
                const query = source ? { source } : {} ;
                try {
                    const Sources = await Source.find(query)
                    if(Sources){
                        return res.json({authData, Sources})
                    }    
                } catch (error) {
                    return res.status(400).json({ message: 'we dont have any sources yet'});
                }
            }
        });
    },

    createSource(req, res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if (err) {
                console.log("err in createSource",err);
                res.status(401);
            } else {
                try {
                    console.log("||try createSource:", req.body);
                    const {sourceName, siteAddress, rssURL, tagClassName, secondTag, isLocalImg, isCategorized, category} = req.body;
                    const existenSource = await Source.findOne({rssURL});
                    console.log("existenSource:", existenSource);
                    if(!existenSource){
                        const addSource = await Source.create({
                            sourceName,
                            siteAddress,
                            rssURL,
                            tagClassName,
                            secondTag,
                            isLocalImg,
                            isCategorized,
                            category
                        });
                        console.log("DONE! sourceAdded");
                        return res.json(addSource);
                    } else {
                        return res.status(400).json({
                            message: "source already exist!"
                        });
                    }
                } catch (error) {
                    throw Error('Error while registering new user: ${error}')
                }    
            }
            
        });
    }

}