//var Slack = require('slack-client');
var http = require('http');
// use botkit
var Botkit = require('botkit');

var find = require('lodash').find;

var token = process.env.SLACK_API_TOKEN;
var targetchannel = process.env.SLACK_CHANNEL.replace(/[^a-z_]/g,"");
var orakelName = process.env.SLACK_ORAKEL_NAME.replace(/[^a-z_]/g,"");
var orakelIcon = process.env.SLACK_ORAKEL_ICON;


var autoReconnect = true;
var autoMark = true;
var channelLookup = [];
var userCache = [];
var initPayload = [];
var orakleResponseChannel = {};

// create the controller:
var controller = Botkit.slackbot({
  debug: false,
  logLevel: 2, 
  autoReconnect: autoReconnect,
  autoMark: autoMark 
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages

// lets fetch the channels via the bot.api
function fullChannelListApi(bot){
  console.log('updating the channel cache via the api');

  var fullChannelList = [];
  
  
  bot.api.groups.list({}, function (err, response) {
        if (response.hasOwnProperty('groups') && response.ok) {
            var total = response.groups.length;
            for (var i = 0; i < total; i++) {
                var channel = response.groups[i];
                fullChannelList.push({name: channel.name, id: channel.id});
            }
        }
  });

  bot.api.channels.list({}, function (err, response) {
        if (response.hasOwnProperty('channels') && response.ok) {
            var total = response.channels.length;
            for (var i = 0; i < total; i++) {
                var channel = response.channels[i];
                fullChannelList.push({name: channel.name, id: channel.id});
            }
        }
  });
  console.log('found ' + fullChannelList.length + ' channels via api');

  return fullChannelList;
};


function fullChannelListPayload(payload){
  console.log('updating the channel cache via the payload');

  var fullChannelList = [];
  
  
  if (payload.hasOwnProperty('groups') && payload.ok) {
    var total = payload.groups.length;
    for (var i = 0; i < total; i++) {
      var channel = payload.groups[i];
      fullChannelList.push({name: channel.name, id: channel.id});
    }
  }

  if (payload.hasOwnProperty('channels') && payload.ok) {
    var total = payload.channels.length;
    for (var i = 0; i < total; i++) {
      var channel = payload.channels[i];
      fullChannelList.push({name: channel.name, id: channel.id});
    }
  }
  console.log('found ' + fullChannelList.length + ' channels in payload');

  return fullChannelList;

};

function fullUserListPayload(payload){
	  console.log('updating the user cache via the payload');

	  var fullUserList = [];
	  
	  
	  if (payload.hasOwnProperty('users') && payload.ok) {
	    var total = payload.users.length;
	    for (var i = 0; i < total; i++) {
	      var user = payload.users[i];
	      fullChannelList.push({name: user.name, id: user.id});
	    }
	  }

	  console.log('found ' + fullUserList.length + ' users in payload');

	  return fullUserList;

};



controller.spawn({
  token: token
}).startRTM(function(err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
  initPayload = payload;
  channelLookup = fullChannelListPayload(payload);
  orakleResponseChannel = find(channelLookup, {'name': targetchannel});
  console.log('orakel channel id: ' + orakleResponseChannel.id);

  if (payload.hasOwnProperty('users') && payload.ok) {
	  userCache = payload.users;
  }
});

controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
    console.log('Orakel name is set to: %s', orakelName);
    console.log('Orakel channel is set to: %s', targetchannel);

});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});




// reply to a direct mention - in the orakel channel
controller.on('direct_message',function(bot,message) {

  if (message.subtype === 'bot_message') {
	  	console.log('i dont talk to bots');
	    return;
  }

  // who asks?
  var orakelUserID = 	message.user;
  // what do we know about the user?
  var orakleUserInfo = find(userCache, {'id': orakelUserID});
	
  //console.log(message);


  // feedback to user
  //  bot.reply(message,'...' );
  
  // first time
  if(channelLookup.length < 1){
    channelLookup = fullChannelListApi(bot);
  };
  
  // fetch private channel id
  if(channelLookup.length < 1){
    console.log('i tried to load the channels but i failed');

  } else {
  	
    if(orakleResponseChannel.length < 1){
      console.log('i cant find the targetchannel in the list');
      console.log(channelLookup);
    } else {
      // before we do this we should check if the id is still valid and trigger a rebuild otherwise
      // but for getting started....
      var infoString = orakleUserInfo.name + ' FRAGT ';
      
//      console.log(orakleUserInfo);
      if(orakleUserInfo.is_admin){
          console.log('admin found');
   	  // check if message starts with '@' and if its from an admin
    	  if(message.text.substr(0,2)=='<@'){
              console.log('reply found');
    		  // control found
    		  var userFor = message.text.substr(2).split(/[>]/,1)[0];
    		  var userForInfo = find(userCache, {'id': userFor});
    		  if(typeof(userForInfo) == 'undefined'){
    			  // not a valid user
    	          console.log('target user not found');

    		  } else {
                  console.log('sending a direct message to ' + userForInfo.name);
    			  // we want to sent a direct message to the user
    			  var theReply = message.text.substr(userFor.length + 3);
    			  if(theReply.length>0){
        		      var touser = {
      		    	        channel: '@' + userForInfo.name,
      		    	        text: theReply,
      		    	        username: orakelName,
      		    	        as_user: false,
      		    	      icon_url: orakelIcon
      		    	      };
      		      bot.api.chat.postMessage(touser);
    	          console.log('message to target user send');

      		      infoString = orakleUserInfo.name + ' ANTWORTET ';
    				  
    			  } else {
        	          console.log('nothing to say to target user');
				  
    			  }
    		      // keep track in the orakleChannel
    		      
    		  }
    	  } else {
              console.log('standard message');
              console.log(message);
    	  }
      }
      // keep track of the questions and answers
      var response = {
        channel: orakleResponseChannel.name,
        text: infoString + message.text,
        username: orakelName,
        as_user: false,
      icon_url: orakelIcon
      };
  
      // feedback to channel
      bot.api.chat.postMessage(response);//, function (err,res) {
       //   if(err) console.log(err);
       //   console.log(res);
     // });
    }
  }

});

// I don't want this app to crash in case someone sends an HTTP request, so lets implement a simple server
//Lets define a port we want to listen to
const PORT = process.env.PORT || 3000;

//We need a function which handles requests and send response
function handleRequest(request, response){
    var quote = "The NSA has built an infrastructure that allows it to intercept almost everything. With this capability, the vast majority of human communications are automatically ingested without targeting. If I wanted to see your emails or your wife's phone, all I have to do is use intercepts. I can get your emails, passwords, phone records, credit cards. I don't want to live in a society that does these sort of things... I do not want to live in a world where everything I do and say is recorded. That is not something I am willing to support or live under.\n\n-Edward Snowden, NSA files source: 'If they want to get you, in time they will', The Guardian, 10 June 2013.";
    response.end(quote);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log('Server listening on: http://localhost:%s', PORT);
});
