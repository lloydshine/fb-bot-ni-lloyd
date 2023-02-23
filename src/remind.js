var moment = require("moment-timezone");
moment().tz("Asia/Manila").format();
const fs = require("fs");

function remind(event, command, api) {
  api.setMessageReaction(
    "🆙",
    event.messageID,
    (err) => {
      if (err) return console.error(err);
    },
    true
  );
  let rem = command[1].split(" | ");
  if (rem.length !== 3) {
    // The input must have exactly 3 elements separated by " | "
    api.sendMessage(
      "Invalid input format. Usage: !remind event | date | time",
      event.threadID,
      event.messageID
    );
    return;
  }
  let r = {
    event: rem[0].trim(), // Remove any leading or trailing whitespace
    date: rem[1].trim(), // Remove any leading or trailing whitespace
    time: rem[2].trim(), // Remove any leading or trailing whitespace
  };
  if (r.event === "") {
    api.sendMessage(
      "Event name cannot be empty.",
      event.threadID,
      event.messageID
    );
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) {
    api.sendMessage(
      "Invalid date format. Date must be in the format YYYY-MM-DD.",
      event.threadID,
      event.messageID
    );
    return;
  }
  if (!/^\d{1,2}:\d{2} (AM|PM)$/.test(r.time)) {
    api.sendMessage(
      "Invalid time format. Time must be in the format HH:MM AM/PM.",
      event.threadID,
      event.messageID
    );
    return;
  }
  console.log(r);
  const phTimezone = "Asia/Manila";
  const now = moment().tz(phTimezone);
  const reminderDateTime = moment.tz(
    `${r.date} ${r.time}`,
    "YYYY-MM-DD h:mm A",
    phTimezone
  );

  // Calculate the duration until the reminder
  const duration = moment.duration(reminderDateTime.diff(now));
  const minutesUntilReminder = duration.asMinutes().toFixed(0);
  const reminderTime = reminderDateTime.format("h:mm A");

  let reminders = JSON.parse(fs.readFileSync("reminders.json"));
 
  reminders[event.threadID].push(r)
  // Write the reminders object to the file
  fs.writeFile("reminders.json", JSON.stringify(reminders), function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Reminders saved to file.");
    }
  });

  // Write the updated reminders object back to the file

  console.log("Reminder added.");
  api.sendMessage(
    `${r.event} at ${reminderTime} (${minutesUntilReminder} minutes from now)`,
    event.threadID,
    event.messageID
  );
  // Schedule the reminder
  setTimeout(() => {
    reminders[event.threadID].splice(reminders[event.threadID].indexOf(r),1)
    fs.writeFile("reminders.json", JSON.stringify(reminders), function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Reminders saved to file.");
      }
    });
    api.sendMessage(`REMINDER: ${r.event}`, event.threadID);
  }, duration.asMilliseconds());
}

module.exports = remind;
