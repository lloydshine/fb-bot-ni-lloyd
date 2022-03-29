
const fs = require("fs"); // File system
const request = require("request"); // For HTTP requests

exports.sendFilesFromUrl = (urls, threadId, message = "") => {
    if (typeof (urls) == "string") { // If only one is passed
        urls = [urls];
    }

    const downloaded = [];
    download(urls, () => {
        if (downloaded.length == urls.length) {
            // All downloads complete

            // If download errored, null value in list
            const valid = downloaded.filter(download => download);
            // Sort according to original order
            const ordered = valid.sort((a, b) => urls.indexOf(a.url) - urls.indexOf(b.url));

            const attachments = ordered.map(download => fs.createReadStream(download.path));
            this.sendMessage({
                "body": message,
                "attachment": attachments
            }, threadId, () => {
                downloaded.forEach(download => fs.unlink(download.path, () => { }));
            });
        }
    });

    function download(urls, cb) {
        urls.forEach(url => {
            const shortName = encodeURIComponent(url).slice(0, config.MAXPATH);
            const path = `${__dirname}/../media/${shortName}.jpg`;
            request(url).pipe(fs.createWriteStream(path)).on('close', err => {
                downloaded.push(err ? null : { "url": url, "path": path });
                cb();
            });
        });
    }
};