const fs = require("fs");

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

function join(event,api) {
    const threadlist = openThreadList();
    threadlist.threads.push(event.threadID)
    saveThreadList(threadlist);
    api.sendMessage("Sup", event.threadID);
}

function leave(event,api) {
    const threadlist = openThreadList();
    const index = threadlist.threads.indexOf(event.threadID);
    console.log(index);
    threadlist.threads.splice(index,1);
    saveThreadList(threadlist);
    api.sendMessage("Bye", event.threadID);
}

module.exports = {
    isWhitelisted,
    join,
    leave,
};