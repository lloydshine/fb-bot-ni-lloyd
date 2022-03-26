const fs = require("fs");
const http = require('https'); // or 'https' for https:// URLs
const login = require("fca-unofficial"); //FACEBOOK API UNOFFICIAL
const axios = require("axios");
// GLOBAL MESSAGE STORAGE
let msgs = {};
let gc = ['3895005423936924'];
let vips = ['100007909449910','100011343529559']; //TO MAKE YOUR SELF EXEMPTION FROM UNSENDING ENTER YOUR FACEBOOK IDS HERE
// let vips = ['100007909449910','100011343529559','YOUR FACEBOOK IDS HERE'];
/*==================================== LEECH tiktok FUNC ====================================*/


/*==================================== LOG IN STATE ====================================*/

login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true });
    var listenEmitter = api.listen((err, event) => {
        if (err) return console.error(err);
        switch (event.type) {
            case "message_reply":
            // JUST UNCOMMENT THIS IF YOU WANT TO ACTIVATE AUTO REACT IF SOMEONE REPLY
                /* if (vips.includes(event.senderID)) {
                     api.setMessageReaction("😘", event.messageID, (err) => {
                     }, true);
                }
                 else {
                     api.setMessageReaction("😆", event.messageID, (err) => {
                     }, true);
                 } */
                let msgid = event.messageID
                let input = event.body;
                msgs[msgid] = input;
                break
            case "message":
             // JUST UNCOMMENT THIS IF YOU WANT TO ACTIVATE AUTO REACT IF SOMEONE MESSAGE
                /* if (vips.includes(event.senderID)) {
                     api.setMessageReaction("😘", event.messageID, (err) => {
                     }, true);
                 }
                 else {
                     api.setMessageReaction("😆", event.messageID, (err) => {
                     }, true);
                 } */
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
                                                body: data[event.senderID]['name'] + " unsent this photo: \n",
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
                                                body: data[event.senderID]['name'] + " unsent this video: \n",
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
                                                body: data[event.senderID]['name'] + " unsent this GIF: \n",
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
                                                body: data[event.senderID]['name'] + " unsent this Sticker: \n",
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
                                                body: data[event.senderID]['name'] + " unsent this audio: \n",
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
                            if (err) return console.error("Error: files are"+err+ "\nAnti Unsent By JhayBot");
                            
                            else {
                                api.sendMessage(data[event.senderID]['name'] + " unsent this: \n" + msgs[event.messageID] + "\n\nAnti Unsent By JhayBot", event.threadID);
                            }
                        });
                    }
                    break;
                }
        }
    });
});
// CODE BY: DM N3wbie!
// GUIDE BY JHAYNOTJ
// PLEASE EXPLORE!!!!