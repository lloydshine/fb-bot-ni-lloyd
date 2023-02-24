const fs = require("fs");
const moment = require("moment-timezone");

const reminders = async (event, command, api) => {
  const reminders = JSON.parse(fs.readFileSync("reminders.json"));
  if(!reminders[event.threadID]) {
    return;
  }

  const com = command[1].split(" ");

  switch (com[0]) {
    case "view":
      let message = "";
      reminders[event.threadID].forEach(function (rem, index) {
        const reminderDateTime = moment(rem.dateTime);
        const formattedDateTime = reminderDateTime
          .tz("Asia/Manila")
          .format("MMM DD, YYYY h:mm A z");
        message += `[${index + 1}].\nEvent:\n->${
          rem.event
        }\nDate and Time:\n->${formattedDateTime}\n--------------------------------------------\n`;
      });
      api.sendMessage(
        `Reminders (${reminders[event.threadID].length}):\n` + message,
        event.threadID
      );
      break;

    case "remove":
      reminders[event.threadID].splice(
        parseInt(command[1].split(" ")[1]) - 1,
        1
      );

      fs.writeFileSync("reminders.json", JSON.stringify(reminders));

      await api.sendMessage(
        `Removed Reminder!`,
        event.threadID,
        event.messageID
      );

    break;
  }
};

module.exports = reminders;
