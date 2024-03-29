const fs = require("fs");
const https = require("https");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);

const imagine = (event, command, api) => {
  const response = openai.createImage({
    prompt: command[1],
    n: 3,
    size: "1024x1024",
  });
  response
    .then((r) => {
      const urls = [r.data.data[0].url, r.data.data[1].url, r.data.data[2].url];
      let streams = [];
      const promises = urls.map((url, index) => {
        return new Promise((resolve, reject) => {
          https.get(url, (res) => {
            const fileStream = fs.createWriteStream(`photo${index + 1}.jpg`);
            res.pipe(fileStream);
            fileStream.on("finish", () => {
              console.log(`Downloaded photo${index + 1}.jpg`);
              streams.push(fs.createReadStream(`photo${index + 1}.jpg`));
              resolve();
            });
          })
            .on("error", (err) => {
              console.error(`Error downloading ${url}: ${err.message}`);
              reject(new Error(`Error downloading ${url}: ${err.message}`));
            });
        });
      });
      Promise.all(promises)
        .then(() => {
          console.log("All photos have been downloaded");
          const message = {
            body: command[1],
            attachment: streams,
          };
          api.sendMessage(message, event.threadID).catch((err) => {
            console.error(`Error sending message with attachment: ${err.message}`);
          });
        })
        .catch(() => {
          console.error("There was an error downloading one or more photos");
        });
    })
    .catch((error) => {
      api.sendMessage("No", event.threadID, event.messageID);
    });
};

module.exports = imagine;
