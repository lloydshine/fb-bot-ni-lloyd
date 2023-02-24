const fs = require("fs");
const login = require("fca-unofficial");

const joined = require("./src/joined.js");
const left = require("./src/left.js");
const remind = require("./src/remind.js");
const reminders = require("./src/reminders.js");
const imagine = require("./src/imagine.js");
const ai = require("./src/ai.js");
const nick = require("./src/nick.js");

const gcblock = [];
const gc = ["5201136466661918", "3895005423936924", "100008672340619", "5896664363701089", "5030346047032431"];
const vips = ["100085524705916", "100008672340619", "100009403889511"];

login({ appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) }, async (err, api) => {
  if (err) return console.error(err);

  api.setOptions({ listenEvents: true, forceLogin: true });
  console.log("ON");
  api.sendMessage("I am on!", "100008672340619");

  const listenEmitter = api.listen(async (err, event) => {
    if (!gc.includes(event.threadID) && !gcblock.includes(event.threadID)) {
      return;
    }
    if (err) return console.error(err);

    switch (event.type) {
      case "event":
        const data = await api.getThreadInfo(event.threadID);
        if (event.logMessageType === "log:subscribe") {
          joined(event, data, api);
        } else if (event.logMessageType === "log:unsubscribe") {
          left(event, api);
        }
        break;

      case "message":
        if (event.body.startsWith("!")) {
          const command = event.body.split(/(?<=^\S+)\s/);
          const data = await api.getUserInfo(event.senderID);
          if (vips.includes(event.senderID)) {
            switch (command[0].toLowerCase()) {
              case "!reminders":
                reminders(event, command, api);
                break;
              case "!remind":
                remind(event, command, api);
                break;
              default:
                break;
            }
          }
          switch (command[0].toLowerCase()) {
            case "!imagine":
              imagine(event, command, api);
              break;
            case "!ai":
              ai(event, command, api);
              break;
            case "!nick":
              nick(event,data,command, api);
              break;
            default:
              break;
          }
        }
        break;

      default:
        break;
    }
  });
});
