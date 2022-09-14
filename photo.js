var images = require("images");

images("welcome.jpg")
    .size(250,120)
    .draw(images("\geo.jpg"), 170, 40)  
    .save("output.jpg", {   
        quality : 50 
    });