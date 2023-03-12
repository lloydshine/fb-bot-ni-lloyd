const fs = require("fs");

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  for (let i = 0; i < 3; i++) {
    code += numbers[Math.floor(Math.random() * numbers.length)];
  }

  const data = { code: code };

  fs.writeFile("codes.json", JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Code saved to codes.json");
  });
}

function getCode() {
  const data = fs.readFileSync("codes.json");
  const codeObj = JSON.parse(data);
  return codeObj.code;
}

module.exports = {
    generateCode,
    getCode,
};
