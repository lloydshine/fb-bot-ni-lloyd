require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);

async function ai(event, command, api) {
  api.setMessageReaction(
    "🆙",
    event.messageID,
    (err) => {
      if (err) return console.error(err);
    },
    true
  );

  try {
    const data = await api.getUserInfo(event.senderID);
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `My name is ${data[event.senderID]["name"]}, respond properly to this: ` +command[1],
      max_tokens: 1000,
    });

    api.sendMessage(
      completion.data.choices[0].text,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    api.sendMessage("No", event.threadID, event.messageID);
  }
}

module.exports = ai;
