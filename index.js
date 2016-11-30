var express = require('express'),
    app = express(),
	sentiment = require('sentiment'),
    Twitter=require('twitter'),
    server = require('http').createServer(app);
var port =Number(process.env.PORT || 3000)
server.listen(port);
var TweetSentimentscore =0;
app.set('json spaces', 0);
var jsonminify = require("jsonminify");

//replace with your consumer and access token and secret keys
var client = new Twitter({
    consumer_key:'*****************************',
    consumer_secret:'*****************************',
    access_token_key:'*****************************',
    access_token_secret:'*****************************'
});


app.use(express.static('public'));

app.set('view engine','ejs')



app.get('/',function(req, res){
    var TrendingTweets=[];
    client.get('trends/place',{id:1},function(error, data){
        for(k in data){
        var l=data[k].trends
           for(i in l){
                TrendingTweets.push(l[i].name);
            }
        }
        res.render('default',{trends:TrendingTweets});
    }); 
});

app.get('/doSrch',function(req, res){
   if(req.query.q!=null){
       if(req.query.max_id!=null){
            client.get('search/tweets', {q:req.query.q,count:100,max_id:req.query.max_id,result_type:'recent'},function(error, twees, response){
                jsonminify(twees);
				for (i = 0; i < twees.statuses.length; i++) { 
					sentiment(twees.statuses[i].text, function (err, result) {
                            TweetSentimentscore += result.score;
                        });
				}
				res.send({Tweetdata: twees, sentiment: TweetSentimentscore});
            });
       }else{
        client.get('search/tweets', {q:req.query.q,count:100,result_type:'recent'},function(error, twees, response){
             jsonminify(twees);
			 for (i = 0; i < twees.statuses.length; i++) { 
					sentiment(twees.statuses[i].text, function (err, result) {
                            TweetSentimentscore += result.score;
                        });
				}
		    res.send({Tweetdata: twees, sentiment: TweetSentimentscore});
        }); 
       }
    }
});

app.get('/doPopScrh',function(req, res){
   if(req.query.q!=null){
       if(req.query.since_id!=null){
        client.get('search/tweets', {q:req.query.q,count:100,max_id:req.query.since_id,result_type:'popular'},function(error, twees, response){
            res.send(twees);
        });
       }else{
        client.get('search/tweets', {q:req.query.q,count:100,result_type:'popular'},function(error, twees, response){
            res.send(twees);
        }); 
       }
    }
});

app.get('*',function(req, res){
    
    res.send("Page not found");
});
