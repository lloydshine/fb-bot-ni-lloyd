const fs = require("fs");
const login = require("fca-unofficial");
const moment = require("moment-timezone");
const joined = require("./src/joined.js");
const left = require("./src/left.js");
const remind = require("./src/remind.js");
const reminders = require("./src/reminders.js");
const imagine = require("./src/imagine.js");
const ai = require("./src/ai.js");
const nick = require("./src/nick.js");
const sched = require("./src/sched.js");
const pin = require("./src/pin.js");
const thread = require("./src/thread.js");
const scheduleReminders = require("./src/reminderScheduler.js");
const aiCode = require("./src/aiCode.js");

const vips = ["100008672340619"];

const messages = {}; // Dictionary object to store messages for each user

login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
  async (err, api) => {
    if (err) return console.error(err);

    api.setOptions({ listenEvents: true, forceLogin: true });
    console.log("ON");
    api.sendMessage("I am on!", "100008672340619");

    // Call the function passing the `api` object as argument
    scheduleReminders(api);

    const event_types = [
      "event",
      "log:subscribe",
      "log:unsubscribe",
      "message_reply",
      "message",
    ];

    const listenEmitter = api.listen(async (err, event) => {
      if (err) return console.error(err);
      if (!event_types.includes(event.type)) {
        return;
      }
      switch (event.type) {
        case "event":
          if (!event_types.includes(event.logMessageType)) {
            return;
          }
          switch (event.logMessageType) {
            case "log:subscribe":
              const data = await api.getThreadInfo(event.threadID);
              joined(event, data, api);
              break;
            case "log:unsubscribe":
              left(event, api);
              break;
          }
          break;

        case "message_reply":
        case "message":
          if (!event.body.startsWith("!")) {
            return;
          }
          const command = event.body.split(/(?<=^\S+)\s/);
          if (!thread.isWhitelisted(event.threadID)) {
            if (command[0] == "!join") {
              const code = aiCode.getCode();
              if(command[1] != code) {
                api.sendMessage("Wrong Code. Please message the admin.", event.threadID, event.messageID);
                    return;
              }
              aiCode.generateCode();
              thread.join(event, api);
            }
            return;
          }
          
          switch (command[0].toLowerCase()) {
            case "!code":
              if (!vips.includes(event.senderID)) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              api.sendMessage(aiCode.getCode(), event.threadID, event.messageID);
              break;
            case "!reminders":
              if (!vips.includes(event.senderID)) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              reminders(event, command, api);
              break;
            case "!remind":
              if (!vips.includes(event.senderID)) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              remind(event, command, api);
              break;
            case "!imagine":
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              imagine(event, command, api);
              break;
            case "!ai":
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              const userID = event.senderID;
              const data = await api.getUserInfo(userID);
              const userMessages = messages[userID] || [
                {
                  role: "assistant",
                  content: `Hello ${
                    data[event.senderID]["name"]
                  }, I am LoBOT AI created by Peter Dako Oten`,
                },
              ]; // Get the messages for the current user or an empty array if no messages exist
              userMessages.push({ role: "user", content: `${command[1]}` }); // Add the new command to the user's messages
              const respo = await ai(event, userMessages, api);
              userMessages.push(respo);
              messages[userID] = userMessages; // Update the messages for the current user
              console.log(messages[userID]);
              clearTimeout(messages[userID]?.timer);
              messages[userID].timer = setTimeout(() => {
                console.log("Cleared!");
                delete messages[userID];
              }, 1 * 60 * 1000);
              break;
            case "!nick":
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              nick(event, command, api);
              break;
            case "!sched":
              if (event.threadID != "3895005423936924") {
                api.sendMessage("?", event.threadID, event.messageID);
              } else {
                sched(event, command[1], api);
              }
              break;
            case "!pin":
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              pin(command[1].split(/(?<=^\S+)\s/), event, api);
              break;
            case "!leave":
              if (!vips.includes(event.senderID)) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              thread.leave(event, api);
              break;
            default:
              api.sendMessage(
                "Taka raman kag yawit uy",
                event.threadID,
                event.messageID
              );
              break;
          }
          break;
        default:
          break;
      }
    });
  }
);
