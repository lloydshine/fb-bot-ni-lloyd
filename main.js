const fs = require("fs");
const http = require('https'); // or 'https' for https:// URLs
const login = require("fca-unofficial"); //FACEBOOK API UNOFFICIAL
const moment = require('moment-timezone');
const { evaluate } = require('mathjs')
// GLOBAL MESSAGE STORAGE
let msgs = {};
let tchrs = [];
let gcblock = [];
let gc = ['3895005423936924','100008672340619'];
let vips = ['100085524705916','100008672340619']; //TO MAKE YOUR SELF EXEMPTION FROM UNSENDING ENTER YOUR FACEBOOK IDS HERE
// 100008672340619
login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true });
    api.sendMessage("I am on!", gc[1]);
    var listenEmitter = api.listen((err, event) => {
    if (!gc.includes(event.threadID) && !gcblock.includes(event.threadID)) { return }
    if (err) return console.error(err);
    switch (event.type) {
        case "event":
            if (gcblock.includes(event.threadID)) {
                break;
            }
            api.getThreadInfo(event.threadID, (err, data) => {
            let gcp = data.participantIDs;
            switch(event.logMessageType) {
                case "log:subscribe":
                    let joined = event.logMessageData['addedParticipants'][0]['fullName'];
                    var msg = {
                        body: ">Welcome " + joined + "\n>Member No." + gcp.length + " of " + data.threadName + "!",
                    }
                    api.sendMessage(msg, event.threadID);
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
            console.log("Entered message case");
            if(event.body.startsWith("!")) {
                console.log("Catched");
                let command = event.body.split(/(?<=^\S+)\s/);
                api.getUserInfo(event.senderID, (err, data) => {
                    switch(command[0]) {
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
                                console.log(thread);
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
                                api.getUserID(person, (err, inf) => {
                                    
                                });
                            });
                    }
                });
            }
    }
    });
});