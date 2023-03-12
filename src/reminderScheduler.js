const fs = require("fs");
const moment = require("moment-timezone");

function scheduleReminders(api) {
  const remindersData = fs.readFileSync("reminders.json", "utf8");
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
        const remindersData = fs.readFileSync("reminders.json", "utf8");
        const rems = JSON.parse(remindersData);
        reminderArr = rems[key];
        const index = reminderArr.findIndex((r) => r.event === reminder.event);

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
}

module.exports = scheduleReminders;
