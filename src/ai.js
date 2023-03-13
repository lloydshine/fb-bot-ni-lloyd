require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);

async function ai(event, messages, api) {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    api.sendMessage(
      completion.data.choices[0].message.content,
      event.threadID,
      event.messageID
    );
    return completion.data.choices[0].message;
  } catch (error) {
    console.log(error);
    api.sendMessage("Something happened, please try again.", event.threadID, event.messageID);
    return {role: 'assistant',content: 'Something happened, please try again.'};
  }
}

module.exports = ai;
