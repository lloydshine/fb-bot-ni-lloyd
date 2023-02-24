function nick(event, data, command, api) {
  const nick = command[1];
  api.changeNickname(nick, event.threadID, event.senderID, (err) => {
    if (err) {
      console.error(err);
      api.sendMessage("Failed to change nickname.", event.threadID);
    } else {
      api.sendMessage(
        `${data[event.senderID]["name"]} your nickname is changed to ${nick}`,
        event.threadID
      );
    }
  });
}

module.exports = nick;
