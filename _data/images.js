const fs = require("fs");
const path = require("path");

module.exports = () => {
  const imgDir = path.join(__dirname, "../assets/images");
  return fs.readdirSync(imgDir).filter(file =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );
};
