function nick(event,data,command,api) {
    let nick = command[1];
    try {
      api.changeNickname(
        nick,
        event.threadID,
        event.senderID,
        (err) => {
          if (err) return console.error(err);
        }
      );
    } catch (err) {
      console.log(err);
    }
    api.sendMessage(
      data[event.senderID]["name"] +
        " your nickname is changed to " +
        nick,
      event.threadID
    );
}

module.exports = nick;