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
                    //const sources = await Source.find(query).sort({ "sourceName": 1 })
                    //const sources = await Source.find(query)
                    const sources = await Source.find(query).sort({"sourceName": -1}).exec()
                    if(sources){
                        return res.json({authData, sources})
                    }    
                } catch (error) {
                    return res.status(400).json({ message: 'we dont have any sources yet'});
                }
            }
        });
    },

    getDistinctSources(req,res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if(err){
                res.sendStatus(401);
            } else {
                try {
                    const sources = await Source.distinct("sourceName");
                    if(sources){
                        console.log("sources:", sources);
                        console.log("response::");
                        // console.log(json({authData, sources}));
                        return res.json({authData, sources})
                    }    
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({ message: 'we dont have any sources yet'});
                }
            }
        });
    },
    getOneSource(req,res){
        jwt.verify(req.token, 'secret', async(err, authData) => {
            if(err){
                res.sendStatus(401);
            } else {
                console.log("req.params:",req.params);
                const { sourceName  } = req.params;
                const query = sourceName  ? { sourceName } : {} ;
                try {
                    const sources = await Source.find(query);
                    if(sources){
                        console.log("sources:", sources);
                        return res.json({authData, sources})
                    }    
                } catch (error) {
                    console.log(error);
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
                    const {sourceName, sourceNameEn, siteAddress, rssURL, tagClassName, 
                        secondTag, isLocalImg, 
                        isCategorized, category, categoryEn,
                        isSubCategorized, subCategory, subCategoryEn
                    } = req.body;
                    const existenSource = await Source.findOne({rssURL});
                    console.log("existenSource:", existenSource);
                    if(!existenSource){
                        const addSource = await Source.create({
                            sourceName,
                            sourceNameEn,
                            siteAddress,
                            rssURL,
                            tagClassName,
                            secondTag,
                            isLocalImg,
                            isCategorized,
                            category,
                            categoryEn,
                            isSubCategorized, 
                            subCategory, 
                            subCategoryEn,
                            status: 'A',
                            enable: true
                            
                        });
                        console.log("DONE! sourceAdded");
                        return res.json(addSource);
                    } else {
                        return res.status(400).json({
                            message: "source already exist!"
                        });
                    }
                } catch (error) {
                    throw Error(`Error while adding new Source: ${error}`)
                }    
            }
            
        });
    }

}