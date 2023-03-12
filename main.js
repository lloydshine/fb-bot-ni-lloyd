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

const vips = ["100008672340619"];

const messages = {}; // Dictionary object to store messages for each user

login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
  async (err, api) => {
    if (err) return console.error(err);

    api.setOptions({ listenEvents: true, forceLogin: true });
    console.log("ON");
    api.sendMessage("I am on!", "100008672340619");

    let remindersData = fs.readFileSync("reminders.json", "utf8");
    const rems = JSON.parse(remindersData);
    Object.keys(rems).forEach((key) => {
      console.log(key);
      let reminderArr = rems[key];
      reminderArr.forEach((reminder) => {
        console.log(reminder);
        const formattedDateTime = moment(reminder.dateTime)
          .tz("Asia/Manila")
          .format("YYYY-MM-DD h:mm A");
        const phTimezone = "Asia/Manila";
        const now = moment().tz(phTimezone);
        const reminderDateTime = moment.tz(
          formattedDateTime,
          "YYYY-MM-DD h:mm A",
          phTimezone
        );

        // Calculate the duration until the reminder
        const duration = moment.duration(reminderDateTime.diff(now));
        console.log(duration.asMilliseconds());
        const minutesBeforeReminder = 5; // Change this to set the number of minutes before the reminder time to send the initial notification

        const initialDuration =
          duration.asMilliseconds() - minutesBeforeReminder * 60 * 1000;
        setTimeout(() => {
          api.sendMessage(
            `Your reminder for "${reminder.event}" is in ${minutesBeforeReminder} minutes.`,
            key
          );
        }, initialDuration);
        setTimeout(() => {
          remindersData = fs.readFileSync("reminders.json", "utf8");
          reminderArr = rems[key];
          const index = reminderArr.findIndex(
            (r) => r.event === reminder.event
          );
          if (index !== -1) {
            reminderArr.splice(index, 1);
            // Write the updated reminders object back to the file
            fs.writeFileSync("reminders.json", JSON.stringify(rems));
            for (let x = 0; x < 3; x++) {
              api.sendMessage(`REMINDER: ${reminder.event}`, key);
            }
          }
        }, duration.asMilliseconds());
      });
    });

    const event_types = [
      "event",
      "log:subscribe",
      "log:unsubscribe",
      "message_reply",
      "message",
    ];

    const listenEmitter = api.listen(async (err, event) => {
      if (!thread.isWhitelisted(event.threadID)) {
        if (event.body == "!join") {
          thread.join(event, api);
        }
        return;
      }
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
          switch (command[0].toLowerCase()) {
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
              const userMessages = messages[userID] || [{ role: "assistant", content: `Hello ${data[event.senderID]["name"]}, I am LoBOT AI created by Peter Dako Oten`}]; // Get the messages for the current user or an empty array if no messages exist
              userMessages.push({ role: "user", content: `${command[1]}` }); // Add the new command to the user's messages
              const respo = await ai(event, userMessages, api);
              userMessages.push(respo);
              messages[userID] = userMessages; // Update the messages for the current user
              console.log(messages[userID])
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
