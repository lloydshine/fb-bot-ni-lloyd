const fs = require("fs");
var moment = require("moment-timezone");
moment().tz("Asia/Manila").format();

function reminders(event, command, api) {
    api.setMessageReaction(
        "🆙",
        event.messageID,
        (err) => {
          if (err) return console.error(err);
        },
        true
      );
  let reminders = JSON.parse(fs.readFileSync("reminders.json"));
  let com = command[1].split(" ");
  switch (com[0]) {
    case "view":
      let message = "";
      reminders[event.threadID].forEach(function (rem, index) {
        message += `[${index + 1}].\n    Event: ${rem.event}\n    Date: ${
          rem.date
        }\n    Time: ${rem.time}\n-------------------\n`;
      });
      api.sendMessage(
        `Reminders (${reminders[event.threadID].length}):\n` + message,
        event.threadID
      );
      break;

    case "remove":
      reminders[event.threadID].splice(
        parseInt(command[1].split(" ")[0]) - 1,
        1
      );
      fs.writeFile("reminders.json", JSON.stringify(reminders), function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Reminders removed to file.");
        }
      });
      api.sendMessage(`Removed Reminder!`, event.threadID, event.messageID);
      break;
    case "refresh":
      reminders[event.threadID].forEach(function (r, index) {
        const phTimezone = "Asia/Manila";
        const now = moment().tz(phTimezone);
        const reminderDateTime = moment.tz(
          `${r.date} ${r.time}`,
          "YYYY-MM-DD h:mm A",
          phTimezone
        );

        // Calculate the duration until the reminder
        const duration = moment.duration(reminderDateTime.diff(now));

        // Write the reminders object to the file

        // Write the updated reminders object back to the file

        console.log("Reminder refreshed.");
        // Schedule the reminder
        setTimeout(() => {
          reminders[event.threadID].splice(
            reminders[event.threadID].indexOf(r),
            1
          );
          fs.writeFile(
            "reminders.json",
            JSON.stringify(reminders),
            function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log("Reminders saved to file.");
              }
            }
          );
          api.sendMessage(`REMINDER: ${r.event}`, event.threadID);
        }, duration.asMilliseconds());
      });
  }
}

module.exports = reminders;
