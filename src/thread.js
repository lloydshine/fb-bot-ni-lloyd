const fs = require("fs");
const pin = require("./pin.js");

const openThreadList = () =>
  JSON.parse(fs.readFileSync("thread-list.json", { encoding: "utf8" }));
const saveThreadList = (threadlist) =>
  fs.writeFileSync("thread-list.json", JSON.stringify(threadlist, null, 4), {
    encoding: "utf8",
  });

function isWhitelisted(threadID) {
  const threadlist = openThreadList();
  if (threadlist.threads.includes(threadID)) {
    return true;
  } else {
    return false;
  }
}

async function join(event, api) {
  const threadlist = openThreadList();
  threadlist.threads.push(event.threadID);
  saveThreadList(threadlist);
  api.sendMessage("Sup", event.threadID);
  const t = await api.getThreadInfo(event.threadID);
  const u = await api.getUserInfo(event.senderID);
  api.sendMessage(
    `Joined at ${t.threadName}\nBy: ${u[event.senderID]["name"]}`,
    "100008672340619"
  );
}

function leave(threadID) {
  const threadlist = openThreadList();
  if (!threadlist.threads.includes(threadID)) {
    return { message: "huh?", hasError: true };
  }
  pin.removePin(threadID, "all");
  threadlist.threads.splice(threadlist.threads.indexOf(threadID), 1);
  saveThreadList(threadlist);
  return { message: "Bye", hasError: false };
}

const listThread = async (api) => {
    const threadlist = openThreadList();
    var list = "";
    const length = threadlist.threads.length;
    for (const thread of threadlist.threads) {
      const data = await api.getThreadInfo(thread);
      list += `ID: ${thread}\n${data.threadName} (${data.participantIDs.length}} members)\n-------------\n`; // include the index in the list item
    }
    return { list, length, hasError: false };
  };
  

const thread = async (matches, event, api) => {
  const action = matches[0]; // add | get | remove | list
  const name = matches[1]; // <name of thread> |
  switch (action) {
    case "list":
      let list = await listThread(api);
      api.sendMessage(
        `Threads (${list.length}):\n` + list.list,
        event.threadID
      );
      break;
    case "leave":
      const l = leave(name);
      if (l.hasError) {
        api.sendMessage(l.message, event.threadID);
        return;
      }
      api.sendMessage(l.message, name);
      api.sendMessage("Done", event.threadID);
      break;
  }
};

module.exports = {
  isWhitelisted,
  join,
  leave,
  thread,
};
