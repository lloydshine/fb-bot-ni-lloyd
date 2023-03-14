require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);
const messages = {};

async function ai(event, command, api) {
  const data = await api.getUserInfo(event.senderID);
  const userID = event.senderID;
  const userMessages = messages[userID] || [
    {
      role: "assistant",
      content: `Hello ${
        data[event.senderID]["name"]
      }, I am RE.BOT AI, created by Nathaniel.`,
    },
  ];
  userMessages.push({ role: "user", content: `${command}` }); // Add the new command to the user's messages
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: userMessages,
    });
    userMessages.push(completion.data.choices[0].message);
    api.sendMessage(
      completion.data.choices[0].message.content,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    api.sendMessage(
      "Something happened, please try again.",
      event.threadID,
      event.messageID
    );
    userMessages.push({
      role: "assistant",
      content: "Something happened, please try again.",
    });
  }
  messages[userID] = userMessages;
  clearTimeout(messages[userID]?.timer);
  messages[userID].timer = setTimeout(() => {
    console.log("Cleared!");
    delete messages[userID];
  }, 1 * 60 * 1000);
}

module.exports = ai;
