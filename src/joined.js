function joined(event, data, api) {
  let added = event.logMessageData["addedParticipants"];
  console.log(added);
  
  const getUserInfoPromises = added.map((participant) => {
    return new Promise((resolve, reject) => {
      api.getUserInfo(participant.userFbId, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            name: user[participant.userFbId].name,
            id: participant.userFbId,
          });
        }
      });
    });
  });
  
  Promise.all(getUserInfoPromises)
    .then((users) => {
      users.forEach((user, index) => {
        let joined = user.name;
        let gcp = data.participantIDs;
        var msg = {
          body:
            ">Welcome " +
            joined +
            "\n>Member No." +
            (gcp.length + index) +
            " of " +
            data.threadName +
            "!",
        };
        api.sendMessage(msg, event.threadID);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = joined;
