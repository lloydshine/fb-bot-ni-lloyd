require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);
const messages = {};

function ai(event, command, api) {
  // Add the new command to the user's messages
  const stopTyping = api.sendTypingIndicator(event.threadID, async (err) => {
    const data = await api.getUserInfo(event.senderID);
    const userID = event.senderID;
    const userMessages = messages[userID] || [
      {
        role: "assistant",
        content: `Hello ${
          data[event.senderID]["name"]
        }, I am ChatGPT an expert AI, created by Lloyd.`,
      },
    ];
    userMessages.push({ role: "user", content: `${command}` });
    if (err) return console.log(err);
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
    stopTyping();
    messages[userID] = userMessages;
    clearTimeout(messages[userID]?.timer);
    messages[userID].timer = setTimeout(() => {
      console.log("Cleared!");
      delete messages[userID];
    }, 2 * 60 * 1000);
  });
}

module.exports = ai;
