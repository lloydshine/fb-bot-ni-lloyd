var fs = require("fs"),
  request = require("request");
const http = require("https"); // or 'https' for https:// URLs
const login = require("fca-unofficial"); //FACEBOOK API UNOFFICIAL
require("dotenv").config();
var moment = require("moment-timezone");
moment().tz("Asia/Manila").format();

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.openAI,
});
const openai = new OpenAIApi(configuration);

// GLOBAL MESSAGE STORAGE
let reminders = [];
let msgs = {};
let tchrs = [];
let gcblock = [];
let main = ["5896664363701089", "3895005423936924"];
let gc = [
  "5201136466661918",
  "3895005423936924",
  "100008672340619",
  "5896664363701089",
  "5030346047032431",
];
let vips = ["100085524705916", "100008672340619", "100009403889511"]; //TO MAKE YOUR SELF EXEMPTION FROM UNSENDING ENTER YOUR FACEBOOK IDS HERE
// 100008672340619

login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
  (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true, forceLogin: true });
    console.log("ON");
    api.sendMessage("I am on!", "100008672340619");
    var listenEmitter = api.listen((err, event) => {
      if (!gc.includes(event.threadID) && !gcblock.includes(event.threadID)) {
        return;
      }
      if (err) return console.error(err);
      switch (event.type) {
        case "event":
          if (gcblock.includes(event.threadID)) {
            break;
          }
          api.getThreadInfo(event.threadID, (err, data) => {
            //console.log(event.logMessageData);
            switch (event.logMessageType) {
              case "log:subscribe":
                let added = event.logMessageData["addedParticipants"];
                console.log(added);
                for (let x = 0; x < added.length; x++) {
                  api.getUserInfo(added[x]["userFbId"], (err, user) => {
                    let joined =
                      event.logMessageData["addedParticipants"][x]["fullName"];
                    let gcp = data.participantIDs;
                    var msg = {
                      body:
                        ">Welcome " +
                        joined +
                        "\n>Member No." +
                        gcp.length +
                        " of " +
                        data.threadName +
                        "!",
                    };
                    api.sendMessage(msg, event.threadID);
                  });
                }
                break;
              case "log:unsubscribe":
                api.getUserInfo(
                  event.logMessageData["leftParticipantFbId"],
                  (err, data) => {
                    let left =
                      data[event.logMessageData["leftParticipantFbId"]]["name"];
                    api.sendMessage(">Bye " + left + "!", event.threadID);
                  }
                );
            }
          });
          break;
        case "message":
          if (event.body.startsWith("!")) {
            let command = event.body.split(/(?<=^\S+)\s/);
            api.getUserInfo(event.senderID, (err, data) => {
              switch (command[0].toLowerCase()) {
                case "!remind":
                  if (!vips.includes(event.senderID)) {
                    api.setMessageReaction(
                      "❎",
                      event.messageID,
                      (err) => {
                        api.sendMessage(
                          "No perms lol",
                          event.threadID,
                          event.messageID
                        );
                      },
                      true
                    );
                    return;
                  }
                  let rem = command[1].split(" | ");
                  let r = {
                    event: rem[0],
                    date: rem[1],
                    time: rem[2],
                  };
                  console.log(r);
                  const phTimezone = "Asia/Manila";
                  const now = moment().tz(phTimezone);
                  const reminderDateTime = moment.tz(
                    `${r.date} ${r.time}`,
                    "YYYY-MM-DD h:mm A",
                    phTimezone
                  );

                  // Calculate the duration until the reminder
                  const duration = moment.duration(reminderDateTime.diff(now));
                  const minutesUntilReminder = duration
                      .asMinutes()
                      .toFixed(0);
                  const reminderTime = reminderDateTime.format("h:mm A");
                  api.sendMessage( `${r.event} at ${reminderTime} (${minutesUntilReminder} minutes from now)`, event.threadID, event.messageID);
                  // Schedule the reminder
                  setTimeout(() => {
                    api.sendMessage( `@${data[event.senderID]["name"]} ${r.event}`, event.threadID, event.messageID);
                  }, duration.asMilliseconds());
                  break;
                case "!imagine":
                  api.setMessageReaction(
                    "🆙",
                    event.messageID,
                    (err) => {
                      if (err) return console.error(err);
                    },
                    true
                  );
                  const response = openai.createImage({
                    prompt: command[1],
                    n: 3,
                    size: "1024x1024",
                  });
                  response
                    .then((r) => {
                      const urls = [
                        r.data.data[0].url,
                        r.data.data[1].url,
                        r.data.data[2].url,
                      ];
                      let streams = [];
                      // Map the URLs to an array of promises that will be resolved when the files are downloaded
                      const promises = urls.map((url, index) => {
                        return new Promise((resolve, reject) => {
                          http
                            .get(url, (res) => {
                              const fileStream = fs.createWriteStream(
                                `photo${index + 1}.jpg`
                              );
                              res.pipe(fileStream);
                              fileStream.on("finish", () => {
                                console.log(`Downloaded photo${index + 1}.jpg`);
                                streams.push(
                                  fs.createReadStream(
                                    __dirname + `/photo${index + 1}.jpg`
                                  )
                                );
                                resolve();
                              });
                            })
                            .on("error", (err) => {
                              console.error(
                                `Error downloading ${url}: ${err.message}`
                              );
                              reject();
                            });
                        });
                      });

                      // Wait for all promises to resolve before executing the next block of code
                      Promise.all(promises)
                        .then(() => {
                          console.log("All photos have been downloaded");
                          var message = {
                            body: command[1],
                            attachment: streams,
                          };
                          api.sendMessage(message, event.threadID);
                        })
                        .catch(() => {
                          console.error(
                            "There was an error downloading one or more photos"
                          );
                        });
                    })
                    .catch((error) => {
                      api.sendMessage("No", event.threadID, event.messageID);
                    });

                  break;
                case "!ai":
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
                          data[event.senderID]["name"] +
                            " " +
                            r.data.choices[0].text,
                          event.threadID,
                          event.messageID
                        );
                      })
                      .catch((error) => {
                        api.sendMessage("No", event.threadID, event.messageID);
                      });
                    return;
                  });
                  break;
                case "!nick":
                  let nick = command[1];
                  try {
                    api.changeNickname(
                      nick,
                      event.threadID,
                      event.senderID,
                      (err) => {
                        if (err) return console.error(err);
                      }
                    );
                  } catch (err) {
                    console.log(err);
                  }
                  api.sendMessage(
                    data[event.senderID]["name"] +
                      " your nickname is changed to " +
                      nick,
                    event.threadID
                  );
                  break;
                case "!ban":
                  api.getThreadInfo(event.threadID, (err, thread) => {
                    //console.log(thread);
                    if (!thread.isGroup) {
                      api.setMessageReaction(
                        "❓",
                        event.messageID,
                        (err) => {
                          api.sendMessage(
                            "Only for GC command!",
                            event.threadID
                          );
                        },
                        true
                      );
                      return;
                    }
                    if (!vips.includes(event.senderID)) {
                      api.setMessageReaction(
                        "❎",
                        event.messageID,
                        (err) => {
                          api.sendMessage(
                            "No perms lol",
                            event.threadID,
                            event.messageID
                          );
                        },
                        true
                      );
                      return;
                    }
                    let person = command[1];
                    api.setMessageReaction(
                      "✅",
                      event.messageID,
                      (err) => {
                        api.sendMessage(
                          " >Pahawa diri " + person,
                          event.threadID,
                          event.messageID
                        );
                      },
                      true
                    );
                  });
                  break;
              }
            });
          }
      }
    });
  }
);
