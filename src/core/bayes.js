
function bayesMaker(){
    // we have a global classifier for every use
            //.sort({'date': -1}).limit(20).exec(function(err, posts) {});
    News.find({ category: "politic", passage: { $ne: null } }, { passage : 1}).limit(10).exec(function (err, politicsCate) {            
        if (err) { return next(err); }
        
        News.find({ category: "sport", passage: { $ne: null } }, { _id : 0, passage : 1 }).limit(10).exec(function (err, sportCate) {            
            if (err) { return next(err); }

            // teach it politic phrases
            for (var i = 0; i < 10; i++) {
                // console.log(i + " p " + politicsCate[i]._id);
                // classifier.learn(politicsCate[i].passage, 'politic');
                // console.log(i + " s " + sportCate[i].passage);
                // classifier.learn(sportCate[i].passage, 'sport');// teach it sport phrases
            }
            
        });
    });
    console.log("bayes maker ended..!")
}

function bayesDecisionMaker(inputText){
    
    console.log("decision maker ejra shod");
    // now ask it to categorize a document it has never seen before
    var a = classifier.categorize('برد مساوی آفساید گل بازیکن قهرمانی همگانی ورزشی فوتسال فوتبال مصاف بازیکن لیگ تیم رکورد فنی فدراسیون ');
    var cat = classifier.categorize(inputText);

    console.log('this doc: >>'+ cat + '<<');

    // serialize the classifier's state as a JSON string.
    //var stateJson = classifier.toJson();
    //console.log(stateJson);
    console.log("***************finish***************");
    // load the classifier back from its JSON representation.
    //var revivedClassifier = bayes.fromJson(stateJson);
    //console.log(revivedClassifier);

    return cat;
}