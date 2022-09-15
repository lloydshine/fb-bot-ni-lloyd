var fs = require('fs'),
    request = require('request');
const http = require('https'); // or 'https' for https:// URLs
var images = require("images");
const login = require("fca-unofficial"); //FACEBOOK API UNOFFICIAL
const moment = require('moment-timezone');
const { evaluate } = require('mathjs')
// GLOBAL MESSAGE STORAGE
let msgs = {};
let tchrs = [];
let gcblock = [];
let gc = ['5030346047032431','3895005423936924','100008672340619'];
let vips = ['100085524705916','100008672340619']; //TO MAKE YOUR SELF EXEMPTION FROM UNSENDING ENTER YOUR FACEBOOK IDS HERE
// 100008672340619

var download = function(uri,filename,callback){
    request.head(uri, function(err, res, body){
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
    
};

login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true });
    api.sendMessage("I am on!", gc[2]);
    var listenEmitter = api.listen((err, event) => {
    if (!gc.includes(event.threadID) && !gcblock.includes(event.threadID)) { return }
    if (err) return console.error(err);
    switch (event.type) {
        case "event":
            if (gcblock.includes(event.threadID)) {
                break;
            }
            api.getThreadInfo(event.threadID, (err, data) => {
                //console.log(event.logMessageData);
                switch(event.logMessageType) {
                    case "log:subscribe":
                        let added = event.logMessageData['addedParticipants'];
                        console.log(added);
                        for(let x = 0; x < added.length; x++) {
                            api.getUserInfo(added[x]['userFbId'], (err, user) => {
                                let uri = user[added[x]['userFbId']]['thumbSrc'];
                                download(uri,"photo.jpg", function(){
                                    let joined = event.logMessageData['addedParticipants'][x]['fullName'];
                                    let gcp = data.participantIDs;
                                    images("welcome.jpg")
                                        .size(250,100) 
                                        .draw(images("photo.jpg"), 180, 40) 
                                        .save("photo.jpg", { 
                                            quality : 50 
                                        });
                                    var msg = {
                                        attachment: fs.createReadStream(__dirname + '/photo.jpg'),
                                        body: ">Welcome " + joined + "\n>Member No." + gcp.length + " of " + data.threadName + "!"
                                    }
                                    api.sendMessage(msg, event.threadID);
                                });
                            });
                        }
                        break;
                    case "log:unsubscribe":
                        api.getUserInfo(event.logMessageData['leftParticipantFbId'], (err, data) => {
                            let left = data[event.logMessageData['leftParticipantFbId']]['name'];
                            api.sendMessage(">Bye " + left + "!", event.threadID);
                        });
                    }
                });
            break;
        case "message":
            if (gcblock.includes(event.threadID)) {
                //console.log(event.senderID)
                let petertagjes = '3895005423936924';
                if (tchrs.includes(event.senderID)) {
                    api.getUserInfo(event.senderID, (err, data) => {
                        api.getThreadInfo(event.threadID, (err, info) => {
                            api.sendMessage(">BOT MESSAGE FORWARD\n" + data[event.senderID]['name'] + " sent this\nfrom "+info.threadName+":\n>" + event.body, petertagjes);
                        });   
                    });
                }
                break;
            }
            if (event.body.toLowerCase().includes("rebot")){
                api.getUserInfo(event.senderID, (err, data) => {
                    if (event.body.toLowerCase().endsWith("rebot?")) {
                        let res = ["Yes", "No", "Maybe", "100%", "Secret", "Kabalo naka","Sumala ni Dex","Ambot"];
                        let x = Math.floor((Math.random() * res.length));
                        api.sendMessage(data[event.senderID]['name'] + ", " + res[x], event.threadID, event.messageID);
                        return;
                    }
                    let msg = "";
                    let reaction = "";
                    if (vips.includes(event.senderID)) { reaction = "💚"; msg = "Hello Boss " + data[event.senderID]['name'] + "!";
                    } else { reaction = "💚"; msg = "Unsa naman sad " + data[event.senderID]['name'] + "!";}
                    api.setMessageReaction(reaction, event.messageID, (err) => {
                        api.sendMessage(msg, event.threadID, event.messageID);
                    }, true);
                });
                break;
            }
            if(event.body.startsWith("!")) {
                let command = event.body.split(/(?<=^\S+)\s/);
                api.getUserInfo(event.senderID, (err, data) => {
                switch(command[0].toLowerCase()) {
                    case "!math":
                        let arith = command[1];
                        try {
                            let ans = evaluate(arith).toString();
                            api.sendMessage(ans, event.threadID, event.messageID);
                        }
                        catch(err) {
                            //console.log(err)
                            api.sendMessage("Syntax Error!", event.threadID, event.messageID);
                        }
                        break;
                    case "!nick":
                        let nick = command[1];
                        try {
                        api.changeNickname(nick, event.threadID, event.senderID, (err) => {
                            if(err) return console.error(err);
                        });
                        } catch(err) {
                            console.log(err);
                        }
                        api.sendMessage(data[event.senderID]['name'] + " your nickname is changed to " + nick, event.threadID);
                        break;
                    case "!ban":
                        api.getThreadInfo(event.threadID, (err, thread) => {
                            //console.log(thread);
                            if (!thread.isGroup) {
                                api.setMessageReaction("❓", event.messageID, (err) => {
                                    api.sendMessage("Only for GC command!", event.threadID);
                                }, true);
                                return;
                            }
                            if(!vips.includes(event.senderID)) {
                                api.setMessageReaction("❎", event.messageID, (err) => {
                                    api.sendMessage("No perms lol", event.threadID, event.messageID);
                                }, true);
                                return;
                            }
                            let person = command[1];
                            api.setMessageReaction("✅", event.messageID, (err) => {
                                api.sendMessage("Pahawa diri " + person, event.threadID, event.messageID);
                            }, true);
                        });
                        break;
                    case "!tsched":
                        let day = moment().tz("Asia/Manila").format('dddd');
                        let time = moment().tz("Asia/Manila").format('LLL');
                        let todaymsg = "Today is " + day + "\n" + time;
                        let msg = todaymsg + " ";
                        switch(day) {
                            case "Monday": msg += "\n>IT Class Schedule: \nGEC6 9 - 10:30 AM Attendance!\nMS101 1-4 PM Attendance!\nCC105 - 5-7 PM"; break;
                            case "Tuesday": msg += "\n>IT Class Schedule: \nGEC5 - 10:30 AM -12 PM - Attendance!\nPE3 1-3 PM\nSDF101 6-8 PM"; break;
                            case "Wednesday": msg += "\n>IT Class Schedule: \nGEC6 9 - 10:30 AM Attendance!\nSDF101 5:30-8:30 PM"; break;
                            case "Thursday": msg += "\n>IT Class Schedule: \nGEC5 - 10:30 AM -12 PM Attendance!\nCC104 5:30 - 7:30 PM"; break;
                            case "Friday": msg += "\n>IT Class Schedule: \nIPT 3-5 PM\nIM101 6:30-8:30 PM"; break;
                            case "Saturday": msg += "\n>IT Class Schedule: \nCC105 9AM - 12PM\nIPT101 1:30 - 4:30 PM"; break;
                            case "Sunday": msg +="\n>IT Class Schedule: \nCC104 9AM - 12PM\nIM101 4:30 - 7:30 PM"; break;
                        }
                        api.sendMessage(msg, event.threadID);
                        break;
                    case "!sched":
                        let uri = data[event.senderID]['thumbSrc'];
                        download(uri,"photo.jpg", function(){
                            images("sched.jpg")
                                .size(579,472) 
                                .draw(images("photo.jpg"), 280, 200) 
                                .save("photo.jpg", { 
                                    quality : 50 
                                });
                            let format = {
                                body: "Here you go Boss " + data[event.senderID]['name'] + "!",
                                attachment: fs.createReadStream(__dirname + '/photo.jpg')
                            }
                            api.sendMessage(format, event.threadID);
                        });
                        break;
                    case "!match":
                        api.getThreadInfo(event.threadID, (err, thread) => {
                            if (!thread.isGroup) {
                                api.setMessageReaction("❓", event.messageID, (err) => {
                                    api.sendMessage("Only for GC command!", event.threadID);
                                }, true);
                                return;
                            }
                            let uri1 = data[event.senderID]['thumbSrc'];
                            download(uri1,"photo1.jpg", function(){
                                let random_id = thread.participantIDs[Math.floor(Math.random() * thread.participantIDs.length)];
                                api.getUserInfo(random_id, (err,inf) => {
                                    let uri2 = inf[random_id]['thumbSrc'];
                                    let partner = inf[random_id]['name'];
                                    download(uri2,"photo2.jpg", function(){
                                        images("love.jpg")
                                            .size(250,100) 
                                            .draw(images("photo1.jpg"), 40, 40) 
                                            .draw(images("photo2.jpg"), 180, 40) 
                                            .save("photo.jpg", { 
                                                quality : 50 
                                            });
                                        let format = {
                                            body: data[event.senderID]['name']+" <3 " + partner,
                                            attachment: fs.createReadStream(__dirname + '/photo.jpg')
                                        }
                                        api.sendMessage(format, event.threadID);
                                    });
                                });
                            });
                        });
                        
                    }
                });
            }
        }
    });
});