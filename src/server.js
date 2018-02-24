const express = require('express');
var app = require('express')();
var fs = require('fs');
var rp = require('request-promise');
var http    = require('http').Server(app);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: 'iDRMW5zvAzBE2ciWPDXiLjSZY',
    consumer_secret: 'cknmO8Ik7wUrhPaOdEEcoFwbkaCUHHCYvMZBy1zouUHzdBJnIQ',
    access_token_key: '958648550765748225-bXdk4Puvg6TxNbvkp2a4Yokk04QhnA3',
    access_token_secret: 'OAEalrRkfbRtIJGdFc1YueqaIISt6qkePzmFFCaMWcYOo',
  });



  
  
app.use(express.static('css'));
app.use(express.static('js'));
app.use('/', express.static(__dirname));

const accessToken = 'EAAEUQvxOrEMBABLSCcNuzgZAqAwMqRhNpPl8j3aHVjao9aczEymxgWpSZAOcZA7lrpC3OsQTO9FdEcCaDihgOZCILabYKeojanTUE5H8yyRcEztcvyyM20axX4v1vI9frjoKXZANmnAL0BZAjPOfZC306gWOB1M5aozZBJqTdnwCn4W7S7O3RDYx';
var abs;
  var request = require('request');
  fs.readFile(__dirname+'/index.html',function (err, data){
    console.log("This is us"+err);
    console.log("This is us"+data);
    });



var PostCounter = [2,2,1,3,1,1];





var recentPostId='';
var currentPost;
var acceptedFbPost= Array();
var FbAcceptedCount=0;

        setTimeout(function checkPost(){
            request({'url':'https://graph.facebook.com/v2.9/371419483325923/visitor_posts?access_token=' + accessToken
           }, function (error, response, body) {
               if (!error && response.statusCode == 200) {
                   //console.log(response.body);
                   var data = JSON.parse(response.body);
                    if(recentPostId != null){
                        if(data.data.length != 0 ){
                            console.log(data.data.length);
                            if(recentPostId === data.data[0].id)
                                {
                                    //console.log('latest post in database: '+recentPostId+'\n latest post returned by the api'+data.data[0].id);
                                } else {
                                    //console.log('latest post in database: '+recentPostId+'\n latest post returned by the api'+data.data[0].id);
                                    recentPostId=data.data[0].id;
                                    currentPost=data;
                                    acceptedFbPost[FbAcceptedCount]=data.data[0];
                                    FbAcceptedCount++;
                                    PostCounter[0]++;
                                    //console.log(data.data[0]);
                                    io.emit('chat message', data.data[0]);
                                    io.emit('Sent Initial Count',PostCounter);
                                }
                        }
                    }else{
                        if(data.data != undefined){
                            recentPostId=data.data[0].id;
                            PostCounter[0]++;
                            io.emit('Sent Initial Count',PostCounter);
                        }
                    }
               }
           });
           setTimeout(checkPost,60000);

        }, 60000);

var recentTWPostId='';
var currentTWPost;
var acceptedTWPost= Array();
var TWAcceptedCount=0;
        
                setTimeout(function checkTWPost(){
                    client.get('statuses/mentions_timeline', function(error, tweets, response) {
                        if (!error) {
                          //console.log(tweets);
                        if(recentTWPostId != null){
                            if(tweets.length != 0 ){
                                //console.log(tweets.length);
                                if(recentTWPostId === tweets[0].id_str)
                                    {
                                        //console.log('latest TW post in database: '+recentTWPostId+'\n latest post returned by the api'+tweets[0].id_str);
                                    } else {
                                        //console.log('latest TW post in database: '+recentTWPostId+'\n latest post returned by the api'+tweets[0].id_str);
                                        recentTWPostId=tweets[0].id_str;
                                        currentTWPost=tweets;
                                        acceptedTWPost[TWAcceptedCount]=tweets[0];
                                        TWAcceptedCount++;
                                        PostCounter[1]++;
                                        console.log(tweets[0]);
                                        io.emit('chat TW message', tweets[0]);
                                        io.emit('Sent Initial Count',PostCounter);
                                    }
                            }
                        }else{
                            if(tweets != undefined){
                                recentPostId=tweets[0].id_str;
                                PostCounter[1]++;
                                io.emit('Sent Initial Count',PostCounter);
                            }
                        }
                          
                        }
                        console.log(error);
                      });
                   setTimeout(checkTWPost,60000);
        
                }, 60000);

var numUsers = 0;
var acceptedChPost= Array();
var ChAcceptedCount=0;

io.sockets.on('connection', function(socket){
        console.log('a user connected '+socket.request.connection.remoteAddress);
        socket.on('Get Initial Count',function(){
            //console.log("Count requested");
            io.emit('Sent Initial Count',PostCounter);
            });
        socket.on('Get Latest FB Data',function(){
               //console.log("FB Data requested");
                if(FbAcceptedCount != 0){
                io.emit('Sent Latest FB Data',acceptedFbPost);
                }else{
                    console.log("No New FB data"); 
                }
            });
        socket.on('Get Latest TW Data',function(){
                console.log("TW Data requested");
                if(TWAcceptedCount != 0){
                io.emit('Sent Latest TW Data',acceptedTWPost);
                }else{
                    console.log("No New TW data"); 
                }
            });
        socket.on('Get Latest CH Data',function(){
                console.log("CH Data requested");
                if(TWAcceptedCount != 0){
                io.emit('Sent Latest CH Data',acceptedChPost);
                }else{
                    console.log("No New CH data"); 
                }
            });


        socket.on('Get detailed info',function(data){
                for (var index = 0; index < currentPost.data.length; index++) {
                    var eID = currentPost.data[index].id;
                    console.log(eID+" "+currentPost.data[index].id)
                    if (eID === data) {
                        io.emit('Send Detailed Info',currentPost.data[index].message);
                        console.log(currentPost.data[index].message);
                    }
                    
                }
        });
        socket.on('Get detailed TW info',function(data){
            for (var index = 0; index < currentTWPost.length; index++) {
                var eID = currentTWPost[index].id_str;
                console.log(eID+" "+currentTWPost[index].id_str)
                if (eID === data) {
                    io.emit('Send Detailed TW Info',currentTWPost[index].text);
                    console.log(currentTWPost[index].text);
                }
                
            }
    });

        socket.on('Post Comment',function(data){
                console.log(data.comment+' '+data.id)
                request({'url':'https://graph.facebook.com/v2.11/'+data.id+'/comments?access_token=' + accessToken
                ,method: "POST",json: true,body:{"message": ''+data.comment},
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log("Comment Added successfully.");
                        //var data = JSON.parse(response.body);
                        //console.log(response);
                    }
                    //console.log(error,response);
                });
        });
        socket.on('Post TW Comment',function(data){
                console.log(data.comment+' '+data.id)
                client.post('statuses/update', {status: data.comment,in_reply_to_status_id:data.id,auto_populate_reply_metadata:true},  function(error, tweet, response) {
                    if(!error)
                    console.log("eyy");   // Raw response object. 
                
                    console.log(error);  
                  });
                
         });

         var addedUser = false;
         
           // when the client emits 'new message', this listens and executes
           socket.on('new message', function (data) {
             // we tell the client to execute 'new message'
             socket.broadcast.emit('new message', {
               username: socket.username,
               message: data
             });
           });
         
           // when the client emits 'add user', this listens and executes
           socket.on('add user', function (username) {
             if (addedUser) return;
         
             // we store the username in the socket session for this client
             socket.username = username;
             ++numUsers;
             addedUser = true;
             socket.emit('login', {
               numUsers: numUsers
             });
             var chatdata = {'time' : Date(),id:"10"+numUsers}
             acceptedChPost[ChAcceptedCount]=chatdata;
             ChAcceptedCount++;
             //Sending the data to update the counter on total request
             PostCounter[2]++;
             io.emit('Sent Initial Count',PostCounter);
             //notifying webpage of the new user joined
             io.emit('New chat message', chatdata);
             // echo globally (all clients) that a person has connected
             socket.broadcast.emit('user joined', {
               username: socket.username,
               numUsers: numUsers
             });
           });
         
           // when the client emits 'typing', we broadcast it to others
           socket.on('typing', function () {
             socket.broadcast.emit('typing', {
               username: socket.username
             });
           });
         
           // when the client emits 'stop typing', we broadcast it to others
           socket.on('stop typing', function () {
             socket.broadcast.emit('stop typing', {
               username: socket.username
             });
           });
         
           // when the user disconnects.. perform this
           socket.on('disconnect', function () {
             if (addedUser) {
               --numUsers;
         
               // echo globally that this client has left
               socket.broadcast.emit('user left', {
                 username: socket.username,
                 numUsers: numUsers
               });
             }
           });
});

const REST_PORT = (process.env.PORT || 5000);
server.listen(process.env.PORT || 3000);
