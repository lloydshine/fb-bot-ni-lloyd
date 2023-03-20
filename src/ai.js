require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);

// Object to store messages for each threadID
const messagesByThreadID = {};

async function ai(event, command, api) {
  // Add the new command to the user's messages
  const stopTyping = api.sendTypingIndicator(event.threadID, async (err) => {
    const data = await api.getUserInfo(event.senderID);
    const userID = event.senderID;
    // Create a new messages object for this threadID if it doesn't already exist
    if (!messagesByThreadID[event.threadID]) {
      messagesByThreadID[event.threadID] = {};
    }
    // Get the user's messages for this threadID
    const userMessages =
      messagesByThreadID[event.threadID][userID] ||
      [              
        {          
          role: "assistant",          
          content: `Hello ${data[event.senderID]["name"]}, I am ChatGPT an expert AI, created by Lloyd.`,
        },
      ];
    // Add the user's new command to their messages
    userMessages.push({ role: "user", content: `${command}` });
    if (err) return console.log(err);
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: userMessages,
      });
      // Add the AI's response to the user's messages
      userMessages.push(completion.data.choices[0].message);
      // Send the AI's response to the thread
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

      // Add an error message to the user's messages
      userMessages.push({
        role: "assistant",
        content: "Something happened, please try again.",
      });
    }

    // Stop typing indicator
    stopTyping();

    // Save the user's messages for this threadID
    messagesByThreadID[event.threadID][userID] = userMessages;

    // Set a timer to clear the user's messages after 2 minutes of inactivity
    clearTimeout(messagesByThreadID[event.threadID][userID]?.timer);
    messagesByThreadID[event.threadID][userID].timer = setTimeout(() => {
      console.log("Cleared!");
      delete messagesByThreadID[event.threadID][userID];
    }, 2 * 60 * 1000);
  });
}

module.exports = ai;
