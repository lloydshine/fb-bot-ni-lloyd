var fs = require("fs");
const https = require("https");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);

function ai(event,command,api) {
  api.setMessageReaction(
    "🆙",
    event.messageID,
    (err) => {
      if (err) return console.error(err);
    },
    true
  );
  api.getUserInfo(event.senderID, (err, data) => {
    const completion = openai.createCompletion({
      model: "text-davinci-003",
      prompt: command[1],
      max_tokens: 1000,
    });
    completion
      .then((r) => {
        api.sendMessage(
          data[event.senderID]["name"] + " " + r.data.choices[0].text,
          event.threadID,
          event.messageID
        );
      })
      .catch((error) => {
        api.sendMessage("No", event.threadID, event.messageID);
      });
    return;
  });
}

module.exports = ai;
