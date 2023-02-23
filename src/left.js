function left(event,api) {
    api.getUserInfo(
        event.logMessageData["leftParticipantFbId"],
        (err, data) => {
          let left =
            data[event.logMessageData["leftParticipantFbId"]]["name"];
          api.sendMessage(">Bye " + left + "!", event.threadID);
        }
    );
}

module.exports = left;