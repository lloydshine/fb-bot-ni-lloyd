let msgs = {};

function saveMsg(event) {
  if (event.attachments.length != 0) {
    msgs[event.messageID] = [];
    for (let x = 0; x < event.attachments.length; x++) {
      msgs[event.messageID].push([
        event.attachments[x].type,
        event.attachments[x].url,
      ]);
    }
  } else {
    msgs[event.messageID] = event.body;
  }
}

async function unsend(event, api) {
  if (msgs[event.messageID] == undefined) return;
  const data = await api.getUserInfo(event.senderID);
  const message = msgs[event.messageID];
  if (typeof message == "string") {
    var msg = {
      body:
        "🤖[BOT] Anti Unsent🤖\n"`👤 User: @${
          data[event.senderID]["firstName"]
        }:\n` + `📩 Message: ${message}`,
      mentions: [
        {
          id: event.senderID,
          tag: `@${data[event.senderID]["firstName"]}`,
        },
      ],
    };
    api.sendMessage(msg, event.threadID);
  }
}

module.exports = { saveMsg, unsend };
