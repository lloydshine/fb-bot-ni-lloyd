function joined(event, data, api) {
    let added = event.logMessageData["addedParticipants"];
    console.log(added);
    for (let x = 0; x < added.length; x++) {
      api.getUserInfo(added[x]["userFbId"], (err, user) => {
        let joined = event.logMessageData["addedParticipants"][x]["fullName"];
        let gcp = data.participantIDs;
        var msg = {
          body:
            ">Welcome " +
            joined +
            "\n>Member No." +
            gcp.length +
            " of " +
            data.threadName +
            "!",
        };
        api.sendMessage(msg, event.threadID);
      });
    }
  }
  
  module.exports = joined;