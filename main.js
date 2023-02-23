var fs = require("fs")
const login = require("fca-unofficial"); //FACEBOOK API UNOFFICIAL
require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);

// functions
const joined = require("./src/joined.js");
const left = require("./src/left.js");
const remind = require("./src/remind.js");
const reminders = require("./src/reminders.js");
const imagine = require("./src/imagine.js");
const ai = require("./src/ai.js");
const nick = require("./src/nick.js");

// GLOBAL MESSAGE STORAGE
let gcblock = [];
let gc = [
  "5201136466661918",
  "3895005423936924",
  "100008672340619",
  "5896664363701089",
  "5030346047032431",
];
let vips = ["100085524705916", "100008672340619", "100009403889511"]; //TO MAKE YOUR SELF EXEMPTION FROM UNSENDING ENTER YOUR FACEBOOK IDS HERE
// 100008672340619

login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
  (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true, forceLogin: true });
    console.log("ON");
    api.sendMessage("I am on!", "100008672340619");
    var listenEmitter = api.listen((err, event) => {
      if (!gc.includes(event.threadID) && !gcblock.includes(event.threadID)) {
        return;
      }
      if (err) return console.error(err);
      switch (event.type) {
        case "event":
          api.getThreadInfo(event.threadID, (err, data) => {
            //console.log(event.logMessageData);
            switch (event.logMessageType) {
              case "log:subscribe":
                joined(event, data, api);
                break;
              case "log:unsubscribe":
                left(event, api);
            }
          });
          break;
        case "message":
          if (event.body.startsWith("!")) {
            let command = event.body.split(/(?<=^\S+)\s/);
            api.getUserInfo(event.senderID, (err, data) => {
              switch (command[0].toLowerCase()) {
                case "!reminders":
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
                  reminders(event,command,api);
                  break;
                case "!remind":
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
                  remind(event, command, api);
                  break;
                case "!imagine":
                  imagine(event, command, api);
                  break;
                case "!ai":
                  ai(event, command, api);
                  break;
                case "!nick":
                  nick(event,command, api);
                  break;
              }
            });
          }
      }
    });
  }
);
