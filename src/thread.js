const fs = require("fs");
const pin = require("./pin.js");

const openThreadList = () => JSON.parse(fs.readFileSync("thread-list.json", {encoding: "utf8"}));
const saveThreadList = (threadlist) => fs.writeFileSync(
  "thread-list.json",
  JSON.stringify(threadlist, null, 4),
  {encoding: "utf8"}
);


function isWhitelisted(threadID) {
    const threadlist = openThreadList();
    if (threadlist.threads.includes(threadID)) {
        return true;
    } else {
        return false;
    }
}

async function join(event,api) {
    const threadlist = openThreadList();
    threadlist.threads.push(event.threadID)
    saveThreadList(threadlist);
    api.sendMessage("Sup", event.threadID);
    const t = await api.getThreadInfo(event.threadID);
    const u = await api.getUserInfo(event.senderID);
    api.sendMessage(`Joined at ${t.threadName}\nBy: ${u[event.senderID]["name"]}`, "100008672340619");
}

function leave(event,api) {
    const threadlist = openThreadList();
    const index = threadlist.threads.indexOf(event.threadID);
    console.log(index);
    threadlist.threads.splice(index,1);
    saveThreadList(threadlist);
    pin(["remove","all"],event,api);
    api.sendMessage("Bye", event.threadID);
}

module.exports = {
    isWhitelisted,
    join,
    leave,
};