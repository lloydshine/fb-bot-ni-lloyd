var fs = require("fs"),
  request = require("request");
const http = require("https"); // or 'https' for https:// URLs
const login = require("fca-unofficial"); //FACEBOOK API UNOFFICIAL
require('dotenv').config();
//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

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);

// GLOBAL MESSAGE STORAGE
let msgs = {};
let tchrs = [];
let gcblock = [];
let main = ["5896664363701089", "3895005423936924"];
let gc = [
  "5201136466661918",
  "3895005423936924",
  "100008672340619",
  "5896664363701089",
  '8276130495793097',
];
let vips = ["100085524705916", "100008672340619", "100009403889511"]; //TO MAKE YOUR SELF EXEMPTION FROM UNSENDING ENTER YOUR FACEBOOK IDS HERE
// 100008672340619

login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
  (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true });
    console.log("ON");
    api.sendMessage("I am on!", "100008672340619");
    var listenEmitter = api.listen((err, event) => {
      if (!gc.includes(event.threadID) && !gcblock.includes(event.threadID)) {
        return;
      }
      if (err) return console.error(err);
      switch (event.type) {
        case "event":
          if (gcblock.includes(event.threadID)) {
            break;
          }
          api.getThreadInfo(event.threadID, (err, data) => {
            //console.log(event.logMessageData);
            switch (event.logMessageType) {
              case "log:subscribe":
                let added = event.logMessageData["addedParticipants"];
                console.log(added);
                for (let x = 0; x < added.length; x++) {
                  api.getUserInfo(added[x]["userFbId"], (err, user) => {
                    let joined =
                      event.logMessageData["addedParticipants"][x]["fullName"];
                    let gcp = data.participantIDs;
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
                  });
                }
                break;
              case "log:unsubscribe":
                api.getUserInfo(
                  event.logMessageData["leftParticipantFbId"],
                  (err, data) => {
                    let left =
                      data[event.logMessageData["leftParticipantFbId"]]["name"];
                    api.sendMessage(">Bye " + left + "!", event.threadID);
                  }
                );
            }
          });
          break;
        case "message":
          if (event.body.startsWith("!")) {
            let command = event.body.split(/(?<=^\S+)\s/);
            api.getUserInfo(event.senderID, (err, data) => {
              switch (command[0].toLowerCase()) {
                case "!imagine":
                    api.setMessageReaction(
                      "🆙",
                      event.messageID,
                      (err) => {
                        if (err) return console.error(err);
                      },
                      true
                    );
                  const response = openai.createImage({
                    prompt: command[1],
                    n: 1,
                    size: "256x256",
                  });
                  response
                  .then((r) => {
                    console.log(r.data.data);
                    image_url = r.data.data[0].url;
                    var file = fs.createWriteStream("photo.jpg");
                    var gifRequest = http.get(image_url, function (gifResponse) {
                      gifResponse.pipe(file);
                      file.on("finish", function () {
                        var message = {
                          body:
                          command[1],
                          attachment: fs.createReadStream(
                            __dirname + "/photo.jpg"
                          ),
                        };
                        api.sendMessage(message, event.threadID);
                      });
                    });
                    //api.sendMessage(data[event.senderID]['name'] + " " + r.data.choices[0].text, event.threadID, event.messageID);
                  })
                  .catch((error) => {
                    api.sendMessage("Abnormal na request bv!", event.threadID);
                  });
                  
                  break;
                case "!ai":
                    api.setMessageReaction(
                      "🆙",
                      event.messageID,
                      (err) => {
                        if (err) return console.error(err);
                      },
                      true
                    );
                  api.getUserInfo(event.senderID, (err, data) => {
                    const completion = openai.createCompletion({
                      model: "text-davinci-003",
                      prompt: command[1],
                      max_tokens: 1000,
                    });
                    completion.then((r) => {
                      api.sendMessage(
                        data[event.senderID]["name"] +
                          " " +
                          r.data.choices[0].text,
                        event.threadID,
                        event.messageID
                      );
                    });

                    return;
                  });
                  break;
                case "!nick":
                  let nick = command[1];
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
                  break;
                case "!ban":
                  api.getThreadInfo(event.threadID, (err, thread) => {
                    //console.log(thread);
                    if (!thread.isGroup) {
                      api.setMessageReaction(
                        "❓",
                        event.messageID,
                        (err) => {
                          api.sendMessage(
                            "Only for GC command!",
                            event.threadID
                          );
                        },
                        true
                      );
                      return;
                    }
                    if (!vips.includes(event.senderID)) {
                      api.setMessageReaction(
                        "❎",
                        event.messageID,
                        (err) => {
                          api.sendMessage(
                            "No perms lol",
                            event.threadID,
                            event.messageID
                          );
                        },
                        true
                      );
                      return;
                    }
                    let person = command[1];
                    api.setMessageReaction(
                      "✅",
                      event.messageID,
                      (err) => {
                        api.sendMessage(
                          " >Pahawa diri " + person,
                          event.threadID,
                          event.messageID
                        );
                      },
                      true
                    );
                  });
                  break;
              }
            });
          }
      }
    });
  }
);
