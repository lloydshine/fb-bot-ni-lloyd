const fs = require("fs");
const http = require('https'); // or 'https' for https:// URLs
const login = require("fca-unofficial");
const axios = require("axios");
// GLOBAL MESSAGE STORAGE
let msgs = {};
let vips = ['100007909449910','100011343529559'];
/*==================================== LEECH tiktok FUNC ====================================*/

async function leechTT(link) {
    out = await axios.get("https://www.tiktokdownloader.org/check.php?v=" + link).then((response) => { return response.data.download_url }).catch((error) => { return "err" })
    return out
}
/*==================================== LEECH tiktok FUNC ====================================*/

/*==================================== LEECH MP3 FUNC ====================================*/
async function conv(v, t, e) {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-Key': 'de0cfuirtgf67a'
    }
    results = await axios.post("https://backend.svcenter.xyz/api/convert-by-45fc4be8916916ba3b8d61dd6e0d6994", "v_id=" + v + "&ftype=mp3&fquality=128&token=" + t + "&timeExpire=" + e + "&client=yt5s.com", { headers: headers }).then((response) => { return response.data.d_url }).catch((error) => { return error.message });
    return results
}
async function fetch(query) {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    results = await axios.post("https://yt5s.com/api/ajaxSearch", "q=" + query + "&vt=mp3", { headers: headers }).then((response) => { return response.data }).catch((error) => { return error.message });
    return results
}

async function leechmp3(query) {
    var songs = fetch(query);
    let resp = await songs.then((response) => {
        let slist = response;
        if (slist == "err") {
            return "err"
        }
        else if (slist.t < 1300) {
            let d_url = conv(slist.vid, slist.token, slist.timeExpires).then((response) => {
                return [response, slist.title]
            });
            return d_url
        }
        else if (slist.p == "search") {
            return 'err'
        }
        else if (slist.mess.startsWith("The video you want to download is posted on TikTok.")) {
            return 'tiktok'
        }
        else {
            return 'pakyo'
        }
    });
    return resp
}

/*==================================== LEECH MP3 FUNC ====================================*/

login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true });
    var listenEmitter = api.listen((err, event) => {
        if (err) return console.error(err);
        switch (event.type) {
            case "message_reply":
                // if (vips.includes(event.senderID)) {
                //     api.setMessageReaction("😘", event.messageID, (err) => {
                //     }, true);
                // }
                // else {
                //     api.setMessageReaction("😆", event.messageID, (err) => {
                //     }, true);
                // }
                let msgid = event.messageID
                let input = event.body;
                msgs[msgid] = input;
                break
            case "message":
                // if (vips.includes(event.senderID)) {
                //     api.setMessageReaction("😘", event.messageID, (err) => {
                //     }, true);
                // }
                // else {
                //     api.setMessageReaction("😆", event.messageID, (err) => {
                //     }, true);
                // }
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
                 if (event.body != null) {
                     let input = event.body;
                     if (input.startsWith("!dlMusic")) {
                         let data = input.split(" ");
                         if (data.length < 2) {
                             api.sendMessage("⚠️Invalid Use Of Command!\n💡Usage: !dlMusic yt_url", event.threadID);
                         } else {
                             api.sendMessage("🔃Trying to Download...", event.threadID, event.messageID);
                             try {
                                 let s = leechmp3(data[1]);
                                 s.then((response) => {
                                     if (response == "pakyo") {
                                         api.setMessageReaction("❌", event.messageID, (err) => {
                                         }, true);
                                         api.sendMessage("20mins Max Duration Only!", event.threadID, event.messageID);
                                    }
                                     else if (response == "err") {
                                         api.sendMessage("❌Invalid Input", event.threadID, event.messageID);
                                         api.setMessageReaction("😭", event.messageID, (err) => {

                                         }, true);
                                     }
                                     else if (response == "tiktok") {
                                         api.sendMessage("❌Youtube Only, Bawal Tiktok!", event.threadID, event.messageID);
                                         api.setMessageReaction("😡", event.messageID, (err) => {

                                         }, true);
                                     }

                                     else if (response[0] != undefined) {
                                         var file = fs.createWriteStream("song.mp3");
                                         var targetUrl = response[0];
                                         var gifRequest = http.get(targetUrl, function (gifResponse) {
                                             gifResponse.pipe(file);
                                             file.on('finish', function () {
                                                 console.log('finished downloading..')
                                                 api.sendMessage('✅Download Complete! Uploading...', event.threadID)
                                                 var message = {
                                                     body: "🎶Song Title: " + response[1] + "\n👨🏻‍💻Coded with 🖤 by: Salvador\nJhay Bot🤖",
                                                     attachment: fs.createReadStream(__dirname + '/song.mp3')
                                                 }
                                                 api.sendMessage(message, event.threadID);
                                             });
                                         });
                                     }
                                 });
                             } catch (err) {
                                 api.sendMessage("⚠️Error: " + err.message, event.threadID);
                             }
                         }
                     }
                     
                     else if (input.toLowerCase()=="pogi"){
                        api.sendMessage("Pag Pogi ako na agad yon hahahaha \n\nJhay Bot Auto Reply", event.threadID);
                     }
                     else if (input.toLowerCase().includes("pogi")){
                        api.sendMessage("Pag Pogi ako na agad yon hahahaha \n\nJhay Bot Auto Reply", event.threadID);
                     }
                     else if (input.toLowerCase().includes("gwapo")){
                        api.sendMessage("Pag Gwapo ako na agad yon hahahaha \n\nJhay Bot Auto Reply", event.threadID);
                     }
                     else if (input.startsWith("!command")){
                        api.sendMessage("JhayBot Commands\n\n- !dlMusic ytLink - To Download music from youtube\n- !TTVid TiktokLink- To Download Video from Tiktok", event.threadID);
                     }
                     else if (input.startsWith("!TTVid")) {
                         let data = input.split(" ");
                         if (data.length < 2) {
                             api.sendMessage("⚠️Invalid Use Of Command!\n💡Usage: !TTVid vid_url", event.threadID);
                         } else {
                             api.sendMessage("🔃Trying to Download...", event.threadID, event.messageID);
                             try {
                                 let s = leechTT(data[1]);
                                 s.then((response) => {
                                     if (response == "err") {
                                         api.sendMessage("❌Invalid Input", event.threadID, event.messageID);
                                         api.setMessageReaction("😭", event.messageID, (err) => {

                                         }, true);
                                     }
                                     else {
                                         var file = fs.createWriteStream("tiktok.mp4");
                                         var targetUrl = response;
                                         var gifRequest = http.get(targetUrl, function (gifResponse) {
                                             gifResponse.pipe(file);
                                             file.on('finish', function () {
                                                 console.log('finished downloading..')
                                                 api.sendMessage('✅Download Complete! Uploading...', event.threadID)
                                                 var message = {
                                                     body: "👨🏻‍💻Coded with 🖤 by: Salvador\nJhay Bot🤖",
                                                     attachment: fs.createReadStream(__dirname + '/tiktok.mp4')
                                                 }
                                                 api.sendMessage(message, event.threadID);
                                             });
                                         });
                                     }

                                 });
                             } catch (err) {
                                 api.sendMessage("⚠️Error: " + err.message, event.threadID);
                             }
                         }
                     }
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
// PLEASE EXPLORE!!!!