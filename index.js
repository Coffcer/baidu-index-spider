const path = require('path');
const fs = require('fs');
const checkEnv = require('./src/check-env');
const recognition = require('./src/recognition');
const Spider = require('./src/spider');

// check env
const check = checkEnv.run();
if (!check) {
  return;
}

const imgDir = path.resolve(process.cwd(), './images');

module.exports = {
  async run (word, options, puppeteerOptions = { headless: true }) {
    const spider = new Spider({ 
      imgDir, 
      ...options 
    }, puppeteerOptions);

    // 抓取数据
    await spider.run(word);

    // 图像识别
    const wordDir = path.resolve(imgDir, word);
    const imgNames = fs.readdirSync(wordDir);
    const result = [];

    imgNames = imgNames.filter(item => path.extname(item) === '.png');

    for (let i = 0; i < imgNames.length; i++) {
      const imgPath = path.resolve(wordDir, imgNames[i]);
      const val = await recognition.run(imgPath);
      result.push(val);
    }

    return result;
  }
}

