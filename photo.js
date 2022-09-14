var Jimp = require('jimp');

async function overlay(thread_name, fb_name) {
    // Reading image
    const image = await Jimp.read("welcome.jpg");
    const overl = await Jimp.read("geo.jpg");
    // Defining the text font
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(font, 75, 50, thread_name);
    image.composite(overl, 180,100);
    image.print(font, 75, 150, fb_name);
    // Writing image after processing
    await image.writeAsync("photo.jpg");
}

overlay("PETER TAG JES","Geoffry Semblante")