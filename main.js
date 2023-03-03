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

const gcblock = [];
const gc = [
  "5201136466661918",
  "3895005423936924",
  "100008672340619",
  "5896664363701089",
  "5030346047032431",
];
const vips = ["100085524705916", "100008672340619", "100009403889511","100001439903602"];

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

        case "message_reply":
          if (event.body.startsWith("!")) {
            const command = event.body.split(/(?<=^\S+)\s/);
            switch (command[0].toLowerCase()) {
              case "!pin":
                pin(command[1].split(/(?<=^\S+)\s/), event, api);
                break;
            }
          }
          break;

        case "message":
          if (event.body.startsWith("!")) {
            const command = event.body.split(/(?<=^\S+)\s/);
            const data = await api.getUserInfo(event.senderID);
            switch (command[0].toLowerCase()) {
              case "!reminders":
                if (!vips.includes(event.senderID)) {
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
                remind(event, command, api);
                break;
              case "!imagine":
                imagine(event, command, api);
                break;
              case "!ai":
                ai(event, command, api);
                break;
              case "!nick":
                nick(event, data, command, api);
                break;
              case "!sched":
                if (event.threadID != "3895005423936924") {
                  api.sendMessage("?", event.threadID, event.messageID);
                } else {
                  sched(event, command[1], api);
                }
                break;
              case "!pin":
                pin(command[1].split(/(?<=^\S+)\s/), event, api);
                break;
              default:
                api.sendMessage(
                  "Taka raman kag yawit uy",
                  event.threadID,
                  event.messageID
                );
                break;
            }
          }
          break;

        default:
          break;
      }
    });
  }
);
