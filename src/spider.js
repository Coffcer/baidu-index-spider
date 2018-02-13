const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const jimp = require('jimp');

const BAIDU_INDEX_URL = 'http://index.baidu.com';
const BAIDU_INDEX_DETAIL_URL = 'http://index.baidu.com/?tpl=trend&word=';

class Spider {
  constructor (options, puppeteerOptions) {
    this.options = options;
    this.puppeteerOptions = puppeteerOptions;
  }

  async initBrowser () {
    if (!this.browser) {
      this.browser = await puppeteer.launch(this.puppeteerOptions);
    }
    return this.browser;
  }

  async initPage () {
    const page = await this.browser.newPage();
    page.setViewport({
      width: 1280,
      height: 500
    });
    return page;
  }

  createImgDir (word) {
    const imgDir = path.resolve(this.options.imgDir, './' + word);
    if (!fs.existsSync(imgDir)) {
      fs.mkdir(imgDir)
    }
    return imgDir;
  }

  async run (word) {
    console.log('🚀 Spider启动：[' + word + ']');

    const browser = await this.initBrowser();
    const page = await this.initPage();
    const imgDir = this.createImgDir(word);

    await page.goto(BAIDU_INDEX_URL);

    // 模拟登陆
    console.log('😁 开始登录...');
    await page.click('#userbar li:nth-child(4)');
    await page.waitForSelector('#TANGRAM_12__userName');
    await page.type('#TANGRAM_12__userName', this.options.username);
    await page.type('#TANGRAM_12__password', this.options.password);
    await page.click('#TANGRAM_12__submit');
    await page.waitForNavigation();
    console.log('✅ 登录成功');
    
    // 跳到指数页面
    await page.type('#schword', word);
    await page.click('#searchWords');

    // 等待ajax请求结束,图表绘制
    await page.waitForSelector('#trend > svg > image');

    // 获取chart最前、最后的坐标
    const position = await page.evaluate(() => {
      const $image = document.querySelector('#trend > svg > image');
      const $area = document.querySelector('#trend-wrap .grpArea');

      const areaRect = $area.getBoundingClientRect();
      const imageRect = $image.getBoundingClientRect();

      // 滚动到图表可视化区域
      window.scrollBy(0, areaRect.top);

      return {
        startX: imageRect.x,
        endX: imageRect.x + imageRect.width - 1,
        y: 200
      }
    });

    console.log('📝 开始抓取数据...');

    for (let i = 0, count = 30, lastTitle; i < count; i++) {
      // 每次移动15像素，看tooltip上的日期是否与上一次相同，相同则继续移动15像素，否则抓取图片
      // 对起点做特殊处理
      let x = i === count - 1 ? (position.startX + 4) : (position.endX - i * 15);

      // 移动鼠标，触发tooltip
      await page.mouse.move(x, position.y);
      await page.waitForSelector('#trendPopTab .view-value .imgval');
      await page.waitFor(150);

      // 获取tooltip信息
      const valueInfo = await page.evaluate(() => {
        const $tooltip = document.querySelector('#viewbox');
        const $title = $tooltip.querySelector('.view-bd:first-child .view-table-wrap');
        const $value = $tooltip.querySelector('#trendPopTab .view-value');
        const valueRect = $value.getBoundingClientRect();

        return {
          title: $title.textContent.split(' ')[0],
          x: valueRect.x - 5,
          y: valueRect.y,
          width: valueRect.width + 10,
          height: valueRect.height
        }
      });

      // 本次无效，继续移动
      if (valueInfo.title === lastTitle) {
        count++;
        continue;
      }

      lastTitle = valueInfo.title;
      
      const imgPath = path.resolve(imgDir, valueInfo.title + '.png');
      await page.screenshot({ path: imgPath });

      // 对图片进行裁剪，只保留数字部分
      const img = await jimp.read(imgPath);
      await img.crop(valueInfo.x, valueInfo.y, valueInfo.width, valueInfo.height);
      // 放大图片，提高识别准确率
      await img.scale(5);
      await img.write(imgPath);

      console.log('✅ 抓取成功，生成图片：' + imgPath);
    }
  }
}

module.exports = Spider;