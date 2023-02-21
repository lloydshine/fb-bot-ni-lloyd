const fs = require("fs");
const http = require("https"); // or 'https' for https:// URLs
const login = require("fca-unofficial"); //FACEBOOK API UNOFFICIAL
// GLOBAL MESSAGE STORAGE
let msgs = {};
let tchrs = [];
let gcblock = [];
let gc = ["3895005423936924", "100008672340619", "8276130495793097"];
let vips = ["100085524705916", "100008672340619"]; //TO MAKE YOUR SELF EXEMPTION FROM UNSENDING ENTER YOUR FACEBOOK IDS HERE
// 100008672340619
/*==================================== LOG IN STATE ====================================*/
login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
  (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true });
    var listenEmitter = api.listen((err, event) => {
      if (gc.includes(event.threadID) || gcblock.includes(event.threadID)) {
        if (err) return console.error(err);
        switch (event.type) {
          case "event":
            if (gcblock.includes(event.threadID)) {
              break;
            }
            if (
              event.logMessageType == "log:subscribe" ||
              event.logMessageType == "log:unsubscribe"
            ) {
              api.getThreadInfo(event.threadID, (err, data) => {
                let gcp = data.participantIDs;
                if (event.logMessageType == "log:subscribe") {
                  let joined =
                    event.logMessageData["addedParticipants"][0]["fullName"];
                  var msg = {
                    body:
                      ">Welcome " +
                      joined +
                      "\n>Member No." +
                      gcp.length +
                      " of " +
                      data.threadName +
                      "!",
                  };
                  api.sendMessage(msg, event.threadID);
                  //console.log(event.logMessageData);
                } else if (event.logMessageType == "log:unsubscribe") {
                  api.getUserInfo(
                    event.logMessageData["leftParticipantFbId"],
                    (err, data) => {
                      let left =
                        data[event.logMessageData["leftParticipantFbId"]][
                          "name"
                        ];
                      api.sendMessage(">Bye " + left + "!", event.threadID);
                      //console.log(event.logMessageData)
                    }
                  );
                }
              });
            }
            break;
          case "message_reply":
            if (gcblock.includes(event.threadID)) {
              break;
            }
          // JUST UNCOMMENT THIS IF YOU WANT TO ACTIVATE AUTO REACT IF SOMEONE REPLY
          /* if (vips.includes(event.senderID)) {
                         api.setMessageReaction("❓", event.messageID, (err) => {
                         }, true);
                    }
                     else {
                         api.setMessageReaction("❓", event.messageID, (err) => {
                         }, true);
                     } */
          //let msgid = event.messageID
          //let input = event.body;
          //msgs[msgid] = input;
          //break;
          case "message":
            if (event.body.includes("!nick")) {
              api.getUserInfo(event.senderID, (err, data) => {
                let msg = event.body.split(/(?<=^\S+)\s/);
                if (msg[0] == "!nick") {
                  let nick = msg[1];
                  try {
                    api.changeNickname(
                      nick,
                      event.threadID,
                      event.senderID,
                      (err) => {
                        if (err) return console.error(err);
                      }
                    );
                  } catch (err) {
                    console.log(err);
                  }
                  api.sendMessage(
                    data[event.senderID]["name"] +
                      " your nickname is changed to " +
                      nick,
                    event.threadID
                  );
                }
              });
              break;
            }
            if (event.body === "!help") {
              api.sendMessage(
                ">Commands:\n!nick - change nickname",
                event.threadID
              );
              break;
            }
            if (event.attachments.length != 0) {
              if (event.attachments[0].type == "photo") {
                msgs[event.messageID] = ["img", event.attachments[0].url];
              } else if (event.attachments[0].type == "video") {
                msgs[event.messageID] = ["vid", event.attachments[0].url];
              } else if (event.attachments[0].type == "audio") {
                msgs[event.messageID] = ["vm", event.attachments[0].url];
              } else if (event.attachments[0].type == "animated_image") {
                msgs[event.messageID] = ["gif", event.attachments[0].url];
              } else if (event.attachments[0].type == "sticker") {
                msgs[event.messageID] = ["sticker", event.attachments[0].url];
              } else if (event.attachments[0].type == "file") {
                msgs[event.messageID] = ["file", event.attachments[0].url];
              }
            } else {
              msgs[event.messageID] = event.body;

              break;
            }
            break;
          case "message_unsend":
            if (!vips.includes(event.senderID)) {
              let d = msgs[event.messageID];
              if (typeof d == "object") {
                api.getUserInfo(event.senderID, (err, data) => {
                  if (err) return console.error(err);
                  else {
                    if (d[0] == "img") {
                      var file = fs.createWriteStream("photo.jpg");
                      var gifRequest = http.get(d[1], function (gifResponse) {
                        gifResponse.pipe(file);
                        file.on("finish", function () {
                          console.log("finished downloading photo..");
                          var message = {
                            body:
                              "[BOT] Anti Unsent:\n" +
                              data[event.senderID]["name"] +
                              " unsent this photo: \n",
                            attachment: fs.createReadStream(
                              __dirname + "/photo.jpg"
                            ),
                          };
                          api.sendMessage(message, event.threadID);
                        });
                      });
                    } else if (d[0] == "vid") {
                      var file = fs.createWriteStream("video.mp4");
                      var gifRequest = http.get(d[1], function (gifResponse) {
                        gifResponse.pipe(file);
                        file.on("finish", function () {
                          console.log("finished downloading video..");
                          var message = {
                            body:
                              "[BOT] Anti Unsent:\n" +
                              data[event.senderID]["name"] +
                              " unsent this video: \n",
                            attachment: fs.createReadStream(
                              __dirname + "/video.mp4"
                            ),
                          };
                          api.sendMessage(message, event.threadID);
                        });
                      });
                    } // GIF unsent test
                    else if (d[0] == "gif") {
                      var file = fs.createWriteStream("animated_image.gif");
                      var gifRequest = http.get(d[1], function (gifResponse) {
                        gifResponse.pipe(file);
                        file.on("finish", function () {
                          console.log("finished downloading gif..");
                          var message = {
                            body:
                              "[BOT] Anti Unsent:\n" +
                              data[event.senderID]["name"] +
                              " unsent this GIF: \n",
                            attachment: fs.createReadStream(
                              __dirname + "/animated_image.gif"
                            ),
                          };
                          api.sendMessage(message, event.threadID);
                        });
                      });
                    } else if (d[0] == "sticker") {
                      var file = fs.createWriteStream("sticker.png");
                      var gifRequest = http.get(d[1], function (gifResponse) {
                        gifResponse.pipe(file);
                        file.on("finish", function () {
                          console.log("finished downloading gif..");
                          var message = {
                            body:
                              "[BOT] Anti Unsent:\n" +
                              data[event.senderID]["name"] +
                              " unsent this Sticker: \n",
                            attachment: fs.createReadStream(
                              __dirname + "/sticker.png"
                            ),
                          };
                          api.sendMessage(message, event.threadID);
                        });
                      });
                    } else if (d[0] == "vm") {
                      var file = fs.createWriteStream("vm.mp3");
                      var gifRequest = http.get(d[1], function (gifResponse) {
                        gifResponse.pipe(file);
                        file.on("finish", function () {
                          console.log("finished downloading audio..");
                          var message = {
                            body:
                              "[BOT] Anti Unsent:\n" +
                              data[event.senderID]["name"] +
                              " unsent this audio: \n",
                            attachment: fs.createReadStream(
                              __dirname + "/vm.mp3"
                            ),
                          };
                          api.sendMessage(message, event.threadID);
                        });
                      });
                    }
                  }
                });
              } else {
                api.getUserInfo(event.senderID, (err, data) => {
                  if (err)
                    return console.error(
                      "Error: files are" + err + "\nJhayBot"
                    );
                  else {
                    api.sendMessage(
                      "[BOT] Anti Unsent:\n" +
                        data[event.senderID]["name"] +
                        " unsent this: \n" +
                        msgs[event.messageID],
                      event.threadID
                    );
                  }
                });
              }
              break;
            }
            break;
        }
      }
    });
  }
);
// CODE BY: DM N3wbie!
// GUIDE BY JHAYNOTJ
// PLEASE EXPLORE!!!!
