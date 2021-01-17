const Source = require('../models/Source');
const News = require('../models/news');
const request = require('request');
var FeedParser = require('feedparser');
var cheerio = require("cheerio");
const got = require('got');

//db.resources.find().count() 

module.exports = {    
    //start(req,res){
    async start(){
        console.log("runs in engine");
        // const sources = await Source.find({});
        const sources = await Source.find({});
        var rssNumbers = 1 ; // <-temp | later -> sources.length /or/ db.sources.find().count()
        var rssNumbers =  sources.length ;
        console.log("rss Counts:", rssNumbers);

        // for(var i = 0; i < rssNumbers; i++) {
        //     console.log(srcResult[i]);
        //     console.log("in the main: ***************************************************")
        //     getFeeds(srcResult[i]);
        //     console.log("iteration: " + i);//just for test
        // }

        sources.map(s => {
            getFeeds(s);
        });

        
        function getFeeds(sourceObj){
            console.log("testiiiing....");
            var req = request(sourceObj.rssURL);
            var feedparser = new FeedParser({ addmeta: false });

            req.on('error', function (error) {
                console.log("request Error:" + error);
            });
            req.on('response', function (res) {
                var stream = this;
                if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
                //console.log("feedparseBody:", feedparser);
                stream.pipe(feedparser);
            });

            feedparser.on('error', function (error) {
                console.log("feedparser Error:"+ error);
            });

            var fileName = 0;
            feedparser.on('readable', function () {
                var stream = this;
                //meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
                fileName++;
                var item = stream.read();
                if(item != null ){  // && fileName < 3){ // temp 3 fix in production
                    console.log("fileName:", fileName);
                    // console.log("title:", item.title);
                    // console.log("description:", item.description);
                    // console.log("link:", item.link);
                    // console.log("pubDate:", item.pubDate);
                    // var singleNews = News({ //what the fuck is this
                    //     title : item.title,
                    // });

                    var duplicateNews = false;
                    const res = News.find({ "title" : item.title }, function(err, newsResult) {
                        console.log("filename in find", fileName);
                        if (err) throw err;
                        if(newsResult != "" ){
                            console.log("if tekrari ejra shod:" ); // + newsResult);//recently added didnt test
                            duplicateNews = true; 
                        }
                        if( !duplicateNews ) { //  dar db nabood//!(db.news.findone({ title: " + item.title + "}))
                            console.log("tekrari nabood");
                            saveHtml(item.link, item.title, item.description, item.pubDate, sourceObj, fileName);
                        }
                    });
                }

                function saveHtml (link, title, description, pubDate, sourceObj, fileName) {
                    console.log("in save HTML:", fileName);
                    console.log("in save HTML:", title);
                    
                    (async () => {
                        const response = await got(link);
                        const $ = cheerio.load(response.body, { decodeEntities: false });
                        var text = "";
                        $('.body').each(function () {
                            $('font').removeAttr('size');//for varzesh3
                            $('font').removeAttr('color');//for varzesh3
                            $('.itemTagsBlock').remove();//for varzesh3
                            $('.Tags + div + div').remove();// for irna
                            $('.Tags + div').remove();// for irna
                            $('.Tags').remove();// for irna
                            $('script').remove();//for afkarnews
                            var newsBody = $(this);
                            text = newsBody.html();
                            console.log("|||text:", text);
                        });
                        if(sourceObj.secondTag){
                            console.log("for the " + sourceObj.sourceName + " if second ejra shod");
                            $(sourceObj.secondTag).each(function () {//baraye mavarede 2 tagi mese vaghti ax jodas
                                var img = $(this);
                                text = img.html() +  text; 
                            });
                        }
                        
                        if(sourceObj.isLocalImg){
                            if(text.includes('src="/')){
                                var res = text.split('src="');
                                var result = res[0];
                                if(res.length > 1){
                                    for(var k =0; k < res.length-1 ; k++){
                                        var result = result + siteAddress + res[k+1] ;
                                    }
                                    text = result;
                                }
                            }
                        }
                          
                        var outputNewsObj = News({
                            sourceName : sourceObj.sourceName,
                            siteAddress : sourceObj.siteAddress,
                            title : title,
                            description : description,
                            link : link,
                            passage : text,
                            date : pubDate,
                            //category : sourceObj.isCategorized == 0 ? "" : sourceObj.category,
                            // temp:
                            category : "فناوری",
                            //category : sourceObj.isCategorized == 0 ? bayesDecisionMaker(sourceObj.passage) : sourceObj.category
                            views: 0
                        });
                        outputNewsObj.save(function(err){
                            if (err) throw err;
                            console.log("News saved succssfully");
                        });
                      })();

                }

            });
        }
    }

}