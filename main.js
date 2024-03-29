const fs = require("fs");
const login = require("fca-unofficial");
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
const imageSearch = require("./src/imageSearch.js");
const antiUnsend = require("./src/antiUnsend.js");

const vips = ["100008672340619"];

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
      "message_unsend"
    ];

    const listenEmitter = api.listen(async (err, event) => {
      if (err) return console.error(err);
      if (!event_types.includes(event.type)) {
        return;
      }
      switch (event.type) {
        case "event":
          if (!thread.isWhitelisted(event.threadID)) {
            return;
            0;
          }
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
        case "message_unsend":
          antiUnsend.unsend(event, api);
          break;
        case "message_reply":
        case "message":
          antiUnsend.saveMsg(event);
          if (!event.body.startsWith("!")) {
            return;
          }
          const command = event.body.split(/(?<=^\S+)\s/);
          if (!thread.isWhitelisted(event.threadID)) {
            if (command[0] == "!join") {
              const code = aiCode.getCode();
              if (command[1] != code) {
                api.sendMessage(
                  "Wrong Code. Please message the admin.",
                  event.threadID,
                  event.messageID
                );
                return;
              }
              aiCode.generateCode();
              thread.join(event, api);
            }
            return;
          }
          api.setMessageReaction(
            "🆙",
            event.messageID,
            (err) => {
              if (err) return console.error(err);
            },
            true
          );
          switch (command[0].toLowerCase()) {
            case "!code":
              if (!vips.includes(event.senderID)) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              api.sendMessage(
                aiCode.getCode(),
                event.threadID,
                event.messageID
              );
              break;
            case "!commands":
              api.sendMessage(
                "Commands:\n!ai <prompt> - ChatBot\n!imagine <idea> - Generate AI Image\n!pin help\n!nick <nickname> - Change your messenger nickname\n!search <input> - Search Google Images",
                event.threadID,
                event.messageID
              );
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
            //case "!imagine":
            //  if (!command[1]) {
            //    api.sendMessage("?", event.threadID, event.messageID);
            //    return;
            //  }
            //  imagine(event, command, api);
            //  break;
            case "!search":
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              imageSearch(command, event, api);
              break;
            //case "!ai":
            //  if (!command[1]) {
            //    api.sendMessage("?", event.threadID, event.messageID);
            //    return;
            //  }
            //  ai(event, command[1], api);
            //  break;
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
              pin.pin(command[1].split(/(?<=^\S+)\s/), event, api);
              break;
            case "!thread":
              if (!vips.includes(event.senderID)) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              thread.thread(command[1].split(/(?<=^\S+)\s/), event, api);
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
