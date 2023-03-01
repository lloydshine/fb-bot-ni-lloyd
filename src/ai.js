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
      prompt: command[1],
      temperature: 0.5,
      max_tokens: 60,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    });

    api.sendMessage(
      data[event.senderID]["name"] + " " + completion.data.choices[0].text,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    api.sendMessage("No", event.threadID, event.messageID);
  }
}

module.exports = ai;
