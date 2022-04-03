const fs = require("fs");
const http = require('https'); // or 'https' for https:// URLs
const login = require("fca-unofficial"); //FACEBOOK API UNOFFICIAL
const axios = require("axios");
const moment = require('moment-timezone');
const utils = require("fca-unofficial/utils");
const { evaluate } = require('mathjs')
const { userInfo } = require("os");
// GLOBAL MESSAGE STORAGE
let msgs = {};
let gc = ['3895005423936924','4870422729659575','5030346047032431','100008672340619'];
let vips = ['100016092066464','100009687019306','100008672340619']; //TO MAKE YOUR SELF EXEMPTION FROM UNSENDING ENTER YOUR FACEBOOK IDS HERE
// 100008672340619

/*==================================== LOG IN STATE ====================================*/
login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true });
    var listenEmitter = api.listen((err, event) => {
        if (gc.includes(event.threadID)) {
            if (err) return console.error(err);
            switch (event.type) {
                case "event":
                    api.getThreadInfo(event.threadID, (err, data) => {
                        let gcp = data.participantIDs;
                        if (event.logMessageType == "log:subscribe") {
                            let joined = event.logMessageData['addedParticipants'][0]['fullName'];
                            var msg = {
                                body: ">Welcome " + joined + " the " + gcp.length + "th member of " + data.threadName + "!",
                                attachment: fs.createReadStream(__dirname + '/img/welcome.gif')
                            }
                            api.sendMessage(msg, event.threadID);
                            //console.log(event.logMessageData);
                        }
                        else if (event.logMessageType == "log:unsubscribe") {
                            api.getUserInfo(event.logMessageData['leftParticipantFbId'], (err, data) => {
                                let left = data[event.logMessageData['leftParticipantFbId']]['name'];
                                api.sendMessage("Ayaw nag balik " + left + "!", event.threadID);
                                //console.log(event.logMessageData)
                            });
                        }
                    }); 
                case "message_reply":
                // JUST UNCOMMENT THIS IF YOU WANT TO ACTIVATE AUTO REACT IF SOMEONE REPLY
                    /* if (vips.includes(event.senderID)) {
                         api.setMessageReaction("❓", event.messageID, (err) => {
                         }, true);
                    }
                     else {
                         api.setMessageReaction("❓", event.messageID, (err) => {
                         }, true);
                     } */
                    let msgid = event.messageID
                    let input = event.body;
                    msgs[msgid] = input;
                    break;
                case "message":
                    if (event.body.endsWith("rebot?") || event.body.endsWith("Rebot?")) {
                        let res = ["Yes", "No", "Maybe", "100%", "Secret", "Kabalo naka","Sumala ni Dex","Ambot"];
                        let x = Math.floor((Math.random() * res.length));
                        api.getUserInfo(event.senderID, (err, data) => {
                            api.sendMessage(data[event.senderID]['name'] + ", " + res[x], event.threadID, event.messageID);
                        });
                        break;
                    }
                    if(event.body.includes("!math")) {
                        let msg = event.body.split(/(?<=^\S+)\s/);
                        if (msg[0] == "!math") {
                            let arith = msg[1];
                            try {
                                let ans = evaluate(arith).toString();
                                api.sendMessage(ans, event.threadID, event.messageID);
                            }
                            catch(err) {
                                api.sendMessage("Syntax Error!", event.threadID, event.messageID);
                            }
                        }
                    }
                    api.getUserInfo(event.senderID, (err, data) => {
                        if(event.body.includes("!nick")) {
                            let msg = event.body.split(/(?<=^\S+)\s/);
                            if (msg[0] == "!nick") {
                                let nick = msg[1];
                                try {
                                api.changeNickname(nick, event.threadID, event.senderID, (err) => {
                                    if(err) return console.error(err);
                                });
                                } catch(err) {
                                    console.log(err);
                                }
                                api.sendMessage(data[event.senderID]['name'] + " your nickname is changed into " + nick, event.threadID);
                            }
                        }
                    });
                    if(event.body === "!spin") {
                        api.getUserInfo(event.senderID, (err, data) => {
                            let x = Math.floor((Math.random() * 100) + 1);
                            api.setMessageReaction("💮", event.messageID, (err) => {
                            }, true);
                            if (x == 69) {
                                var msg = {
                                    body: data[event.senderID]['name'] + " got " + x + "!\nFUCKING NICE!",
                                    attachment: fs.createReadStream(__dirname + '/img/nice.jpg')
                                }
                                var reward = {
                                    attachment: fs.createReadStream(__dirname + '/img/perez.jpg')
                                }
                                api.setMessageReaction("😲", event.messageID, (err) => {
                                }, true);
                                api.sendMessage(msg, event.threadID);
                                api.sendMessage(reward, event.threadID);
                            }
                            else {
                            api.sendMessage(data[event.senderID]['name'] + " got " + x + "!", event.threadID);
                            }
                        });
                    }
                    if (event.body.includes("rebot") || event.body.includes("Rebot")) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if (vips.includes(event.senderID)) {
                                api.setMessageReaction("💚", event.messageID, (err) => {
                                }, true);
                                api.sendMessage("Hello Boss " + data[event.senderID]['name'] + "!", event.threadID, event.messageID);
                            }
                            else {
                            api.setMessageReaction("❓", event.messageID, (err) => {
                            }, true);
                            api.sendMessage("Unsa naman sad " + data[event.senderID]['name'] + "!", event.threadID, event.messageID);
                            }
                        });
                    }
                    if (event.body.includes('!ban')) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if (vips.includes(event.senderID)) {
                                let msg = event.body.split(/(?<=^\S+)\s/);
                                if (msg[0] == "!ban") {
                                    let person = msg[1];
                                    api.setMessageReaction("✅", event.messageID, (err) => {
                                    }, true);
                                    api.getUserID(person, (err, data) => {
                                        if (!vips.includes(data[0].userID)) {
                                            try {
                                                api.removeUserFromGroup(data[0].userID, event.threadID)
                                            } catch(err) {
                                                console.log(err);
                                                api.setMessageReaction("❎", event.messageID, (err) => {
                                                }, true);
                                            }
                                        } else {
                                            api.setMessageReaction("❎", event.messageID, (err) => {
                                            }, true);
                                            api.sendMessage("Dili nimo ma ban ang bossing vv!", event.threadID);
                                        }
                                    });
                                }
                            }
                            else {
                            api.setMessageReaction("❎", event.messageID, (err) => {
                            }, true);
                            }
                        });
                    }
                    if (event.body.includes('!unban')) {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if (vips.includes(event.senderID)) {
                                let msg = event.body.split(/(?<=^\S+)\s/);
                                if (msg[0] == "!unban") {
                                    let person = msg[1];
                                    api.setMessageReaction("✅", event.messageID, (err) => {
                                    }, true);
                                    try {
                                    api.getUserID(person, (err, data) => {
                                        try {
                                            api.addUserToGroup(data[0].userID, event.threadID)
                                        } catch(err) {
                                            console.log(err);
                                            api.setMessageReaction("❎", event.messageID, (err) => {
                                            }, true);
                                        }
                                    });
                                    } catch(err) {
                                        api.setMessageReaction("❎", event.messageID, (err) => {
                                        }, true);
                                    }
                                }
                            }
                            else {
                            api.setMessageReaction("❎", event.messageID, (err) => {
                            }, true);
                            }
                        });
                    }
                    if(event.body === '!help') {
                        api.sendMessage(">Commands:\n!link - Get online class link.\n!tsched - Get current day schedule.\n!sched - Get the IT full schedule!\n!math - Do calculations and convertions!\n!spin - To spin a random number from 1 - 100.\n!myinfo - Get your personal info!\n!nick /nickname/ - To change nickname!\n/question/ rebot? - Answers Yes or No questions!", event.threadID);
                    }
                    if(event.body === '!link') {
                        api.getUserInfo(event.senderID, (err, data) => {
                            api.sendMessage(">xbedyos.com/" + data[event.senderID]['name'].replace(/ /g, ""), event.threadID, event.messageID);
                        });
                    }
                    if(event.body === '!myinfo') {
                        api.getUserInfo(event.senderID, (err, data) => {
                            let bsize = ['A','B','C','D','E','F','PREMIUM OPPAI G CUP'];
                            let size;
                            let x = Math.floor(Math.random() * 8);
                            let genders = ["Female","Male","Biot"]
                            let gender = data[event.senderID]['gender'];
                            if (gender == 1) {
                                size = "Cupsize : " + bsize[x];
                            }
                            else if (gender == 2) {
                                size = "Dick Size: " + x + " inches";
                            }
                            else {
                                size = "Cupsize: Premium Oppai G Cup\nDick Size: 7 inches";
                            }
                            api.sendMessage(">Name: " + data[event.senderID]['name'] + "\nGender: " + genders[gender - 1] + "\n" + size + "\nLink: " + data[event.senderID]['profileUrl'], event.threadID);
                        });
                    }
                    if(event.body === '!sched') {
                        api.getUserInfo(event.senderID, (err, data) => {
                            var msg = {
                                body: "Here you go Boss " + data[event.senderID]['name'] + "!",
                                attachment: fs.createReadStream(__dirname + '/img/sched.jpg')
                            }
                            api.sendMessage(msg, event.threadID);
                        });
                    }
                    if(event.body === '!tsched') {
                        let day = moment().tz("Asia/Manila").format('dddd');
                        let todaymsg = "Today is " + day;
                        if (day === "Monday") {
                            api.sendMessage(">"+todaymsg + "\nClass Schedule: \nGEC3 - 9-10 AM - Record your attendance!\nP.E 2 - 1-3 PM\nCC103 - 3-5 PM - \nhttps://meet.google.com/wyu-sbxg-ugw", event.threadID);
                        }
                        else if (day == "Tuesday") {
                            api.sendMessage(">"+todaymsg + "\nClass Schedule: \nGEC4 - 1-2 PM - Record your attendance!\nHCI 101 - 3-5 PM - \nhttps://meet.google.com/vja-bgrr-rhs", event.threadID);
                        }
                        else if (day == "Wednesday") {
                            api.sendMessage(">"+todaymsg + "\nClass Schedule: \nGEC3 - 9-10 AM - Record your attendance!\nCC103 LAB - 4-7 PM - \nhttps://meet.google.com/wyu-sbxg-ugw", event.threadID);
                        }
                        else if (day == "Thursday") {
                            api.sendMessage(">"+todaymsg + "\nClass Schedule: \nGEC4 - 1-2 PM - Record your attendance!\nHCI 101 LAB - 4-7 PM - \nhttps://meet.google.com/vja-bgrr-rhs", event.threadID);
                        }
                        else if (day == "Friday") {
                            api.sendMessage(">"+todaymsg + "\nClass Schedule: \nCalculus II - 9 AM - 12 PM - Record your attendance!\nDS 101 - 5-8 PM", event.threadID);
                        }
                        else if (day == "Saturday") {
                            api.sendMessage(">"+todaymsg + "\nClass Schedule: \nCalculus II - 9 AM - 12 PM - Record your attendance!\nNSTP 02 - 1-4 PM - Bagsak nata!", event.threadID);
                        }
                        else if (day == "Sunday") {
                            api.sendMessage(">"+todaymsg + "\nClass Schedule: \nWalay klase, Pwede ka mag bebe time!\nHave fun!", event.threadID);
                        }
                    }
                    if (event.attachments.length != 0) {
                        if (event.attachments[0].type == "photo") {
                            msgs[event.messageID] = ['img', event.attachments[0].url]
                        }
                        else if (event.attachments[0].type == "video") {
                            msgs[event.messageID] = ['vid', event.attachments[0].url]
                        }
                        else if (event.attachments[0].type == "audio") {
                            msgs[event.messageID] = ['vm', event.attachments[0].url]
                        }
                        else if (event.attachments[0].type == "animated_image") {
                            msgs[event.messageID] = ['gif', event.attachments[0].url]
                        }
                        else if (event.attachments[0].type == "sticker") {
                            msgs[event.messageID] = ['sticker', event.attachments[0].url]
                        }
                        else if (event.attachments[0].type == "file") {
                            msgs[event.messageID] = ['file', event.attachments[0].url]
                        }

                    } else {
                        msgs[event.messageID] = event.body
                    }

                    break;
                case "message_unsend":
                    if (!vips.includes(event.senderID)) {
                        let d = msgs[event.messageID];
                        if (typeof (d) == "object") {
                            api.getUserInfo(event.senderID, (err, data) => {
                                if (err) return console.error(err);
                                else {
                                    if (d[0] == "img") {
                                        var file = fs.createWriteStream("photo.jpg");
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading photo..')
                                                var message = {
                                                    body: "[JhayBot] Anti Unsent:\n" + data[event.senderID]['name'] + " unsent this photo: \n",
                                                    attachment: fs.createReadStream(__dirname + '/photo.jpg')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                    else if (d[0] == "vid") {
                                        var file = fs.createWriteStream("video.mp4");
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading video..')
                                                var message = {
                                                    body: "[JhayBot] Anti Unsent:\n" + data[event.senderID]['name'] + " unsent this video: \n",
                                                    attachment: fs.createReadStream(__dirname + '/video.mp4')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }// GIF unsent test
                                    else if (d[0] == "gif") {
                                        var file = fs.createWriteStream("animated_image.gif");
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading gif..')
                                                var message = {
                                                    body: "[JhayBot] Anti Unsent:\n" + data[event.senderID]['name'] + " unsent this GIF: \n",
                                                    attachment: fs.createReadStream(__dirname + '/animated_image.gif')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                
                                    else if (d[0] == "sticker") {
                                        var file = fs.createWriteStream("sticker.png");
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading gif..')
                                                var message = {
                                                    body: "[JhayBot] Anti Unsent:\n" + data[event.senderID]['name'] + " unsent this Sticker: \n",
                                                    attachment: fs.createReadStream(__dirname + '/sticker.png')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }

                                    else if (d[0] == "vm") {
                                        var file = fs.createWriteStream("vm.mp3");
                                        var gifRequest = http.get(d[1], function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading audio..')
                                                var message = {
                                                    body: "[JhayBot] Anti Unsent:\n" + data[event.senderID]['name'] + " unsent this audio: \n",
                                                    attachment: fs.createReadStream(__dirname + '/vm.mp3')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                }
                            });
                        }
                        else {
                            api.getUserInfo(event.senderID, (err, data) => {
                                if (err) return console.error("Error: files are"+err+ "\nJhayBot");

                                else {
                                    api.sendMessage("[JhayBot] Anti Unsent:\n" + data[event.senderID]['name'] + " unsent this: \n" + msgs[event.messageID], event.threadID);
                                }
                            });
                        }
                        break;
                    }
            }
        }
    });
});
// CODE BY: DM N3wbie!
// GUIDE BY JHAYNOTJ
// PLEASE EXPLORE!!!!