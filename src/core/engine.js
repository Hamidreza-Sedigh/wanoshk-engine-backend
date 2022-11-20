const Source =   require('../models/Source');
const News =     require('../models/News');
const request =  require('request');
var FeedParser = require('feedparser');
var cheerio =    require("cheerio");
const got =      require('got');
const setTime =  require('./setTime');

//db.resources.find().count() 

module.exports = {    
    //start(req,res){
    async start(){
        console.log("engine runs!");
        setTime.setFetchTime();
        console.log("runs in engine");
        // const sources = await Source.find({});
        const sources = await Source.find({});
        var rssNumbers = 1 ; // <-temp | later -> sources.length /or/ db.sources.find().count()
        rssNumbers =  sources.length ;
        console.log("rss Counts:", rssNumbers);

        // for(var i = 0; i < rssNumbers; i++) {
        //     console.log(srcResult[i]);
        //     console.log("in the main: ***************************************************")
        //     getFeeds(srcResult[i]);
        //     console.log("iteration: " + i);//just for test
        // }

        sources.map(s => {
            console.log("START OF MAP!");
            getFeeds(s);
        });

        
        function getFeeds(sourceObj){
            console.log("testiiiing....", sourceObj.rssURL);
            console.log("testiiiing....", sourceObj.category);

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
                    //console.log("fileName:", fileName);
                    // console.log("title:", item.title);
                    // console.log("description:", item.description);
                    // console.log("link:", item.link);
                    // console.log("pubDate:", item.pubDate);
                    // var singleNews = News({ //what the fuck is this
                    //     title : item.title,
                    // });

                    var duplicateNews = false;
                    const res = News.find({ "title" : item.title }, function(err, newsResult) {
                        //console.log("filename in find", fileName);
                        if (err) throw err;
                        if(newsResult != "" ){
                            console.log("duplicate:", sourceObj.sourceName ); // + newsResult);//recently added didnt test
                            duplicateNews = true; 
                        }
                        if( !duplicateNews ) { 
                            //console.log("tekrari nabood");
                            saveHtml(item.link, item.title, item.description, item.pubDate, sourceObj, fileName);
                        }
                    });
                }

                function saveHtml (link, title, description, pubDate, sourceObj, fileName) {
                    //console.log("in save HTML:", fileName);
                    //console.log("in save HTML:", title);
                    
                    (async () => {
                        const response = await got(link);
                        const $ = cheerio.load(response.body, { decodeEntities: false });
                        var text = "";
                        //$('.body').each(function () {
                        console.log('TAG:',sourceObj.tagClassName," for site : ", sourceObj.sourceName);
                        $(sourceObj.tagClassName).each(function () {
                            $('font').removeAttr('size');//for varzesh3
                            $('font').removeAttr('color');//for varzesh3
                            $('.itemTagsBlock').remove();//for varzesh3
                            $('.Tags + div + div').remove();// for irna
                            $('.Tags + div').remove();// for irna
                            $('.Tags').remove();// for irna
                            $('script').remove();//for afkarnews
                            var newsBody = $(this);
                            var imageIndex = 0
                            $("img").each(function() {
                                if( sourceObj.sourceName == 'عصر ایران' ){
                                    var old_src=newsBody.attr("src");
                                    var new_src = newsBody.find('img').eq(imageIndex).attr('data-src');
                                    //console.log(new_src);
                                    $(this).attr("src", new_src);
                                    if( $(this).attr('class') == "lazyload"   ) {imageIndex++; console.log("+++",imageIndex)}
                                }
                            });
                            text = newsBody.html();
                            //console.log("|||text:", text);
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
                                console.log("isLoc Result:", result);
                                if(res.length > 1){
                                    for(var k =0; k < res.length-1 ; k++){
                                        var result = result + sourceObj.siteAddress + res[k+1] ;
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
                            category : sourceObj.category,
                            //category : sourceObj.isCategorized == 0 ? bayesDecisionMaker(sourceObj.passage) : sourceObj.category
                            views: 0
                        });
                        outputNewsObj.save(function(err){
                            if (err) throw err;
                            console.log("News saved succssfully", sourceObj.sourceName);
                        });
                      })();

                }

            });
        }
    }

}