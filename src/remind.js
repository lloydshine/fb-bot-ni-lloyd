const moment = require("moment-timezone");
const fs = require("fs");

function remind(event, command, api) {
  api.setMessageReaction("🆙", event.messageID, (err) => {
    if (err) return console.error(err);
  }, true);

  const [eventName, date, time] = command[1].split(" | ").map(s => s.trim());

  if (!eventName) {
    api.sendMessage("Event name cannot be empty.", event.threadID, event.messageID);
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    api.sendMessage("Invalid date format. Date must be in the format YYYY-MM-DD.", event.threadID, event.messageID);
    return;
  }

  if (!/^\d{1,2}:\d{2} (AM|PM)$/.test(time)) {
    api.sendMessage("Invalid time format. Time must be in the format HH:MM AM/PM.", event.threadID, event.messageID);
    return;
  }

  const phTimezone = "Asia/Manila";
  const now = moment().tz(phTimezone);
  const reminderDateTime = moment.tz(`${date} ${time}`, "YYYY-MM-DD h:mm A", phTimezone);

  // Calculate the duration until the reminder
  const duration = moment.duration(reminderDateTime.diff(now));
  const minutesUntilReminder = duration.asMinutes().toFixed(0);
  const reminderTime = reminderDateTime.format("h:mm A");

  if (duration.asMilliseconds() < 0) {
    api.sendMessage(
      "You cannot set a reminder for a past date!",
      event.threadID,event.messageID
    );
    return;
  }

  let reminders = JSON.parse(fs.readFileSync("reminders.json"));

  reminders[event.threadID].push({ event: eventName, dateTime: reminderDateTime.valueOf() });

  // Write the updated reminders object back to the file
  fs.writeFileSync("reminders.json", JSON.stringify(reminders));

  console.log("Reminder added.");
  api.sendMessage(`${eventName} at ${reminderTime} (${minutesUntilReminder} minutes from now)`, event.threadID, event.messageID);

  const minutesBeforeReminder = 5; // Change this to set the number of minutes before the reminder time to send the initial notification

  const initialDuration = duration.asMilliseconds() - minutesBeforeReminder * 60 * 1000;
  setTimeout(() => {
    api.sendMessage(`Your reminder for "${eventName}" is in ${minutesBeforeReminder} minutes.`, event.threadID);
  }, initialDuration);

  // Schedule the reminder
  setTimeout(() => {
    const index = reminders[event.threadID].findIndex(r => r.dateTime === reminderDateTime.valueOf());
    if (index !== -1) {
      reminders[event.threadID].splice(index, 1);
      // Write the updated reminders object back to the file
      fs.writeFileSync("reminders.json", JSON.stringify(reminders));
      api.sendMessage(`REMINDER: ${eventName}`, event.threadID);
    }
  }, duration.asMilliseconds());
}

module.exports = remind;
