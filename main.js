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

const gcblock = [];
const gc = [
  "5201136466661918",
  "3895005423936924",
  "100008672340619",
  "5896664363701089",
  "5030346047032431",
];
const vips = ["100085524705916", "100008672340619", "100009403889511"];

login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
  async (err, api) => {
    if (err) return console.error(err);

    api.setOptions({ listenEvents: true, forceLogin: true });
    console.log("ON");
    api.sendMessage("I am on!", "100008672340619");

    const remindersData = fs.readFileSync("reminders.json", "utf8");
    const rems = JSON.parse(remindersData);
    Object.keys(rems).forEach((key) => {
      console.log(key);
      const reminderArr = rems[key];
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
          const index = reminderArr.findIndex(
            (r) => r.event === reminder.event
          );
          if (index !== -1) {
            reminderArr.splice(index, 1);
            // Write the updated reminders object back to the file
            fs.writeFileSync("reminders.json", JSON.stringify(rems));
            api.sendMessage(`REMINDER: ${reminder.event}`, key);
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
                nick(event, data, command, api);
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
  }
);
