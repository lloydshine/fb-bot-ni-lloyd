const google = require("googlethis");
const cloudscraper = require("cloudscraper");
const fs = require("fs")

const imageSearch = async (matches, event, api) => {
  let query = matches[1];  
  try {
    let result = await google.image(query, {safe: false});
    // Process the search results...
  } catch (error) {
    // Handle the error by sending a message
    api.sendMessage(`⚠️ Your image search did not return any result.`, event.threadID, event.messageID);
    return;
  }

  let streams = [];
  let counter = 0;
    
  for(let image of result) {
    // Only show 6 images
    if(counter >= 6)
      break;
      
    
    // Ignore urls that does not ends with .jpg or .png
    let url = image.url;
    if(!url.endsWith(".jpg") && !url.endsWith(".png"))
      continue;
    
    let path = `./temps/search-image-${counter}.jpg`;
    let hasError = false;
    await cloudscraper.get({uri: url, encoding: null})
      .then((buffer) => fs.writeFileSync(path, buffer))
      .catch((error) => {
        console.log(error);
        hasError = true;
      });
      
    if(hasError)
      continue;
    
    streams.push(fs.createReadStream(path).on("end", async () => {
      if(fs.existsSync(path)) {
        fs.unlink(path, (err) => {
          if(err) return console.log(err);
            
        });
      }
    }));
    
    counter += 1;
  }
  api.sendMessage("⏳ Sending search result...", event.threadID, event.messageID)
  let msg = {
    body: `--------------------\nImage Search Result\n\nFound: ${result.length} image${result.length > 1 ? 's' : ''}\nOnly showing: 6 images\n\n--------------------`,
    attachment: streams
  };
  
  api.sendMessage(msg, event.threadID, event.messageID);
};

module.exports = imageSearch;