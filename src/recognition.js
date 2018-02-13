const path = require('path');
const Tesseract = require('node-tesseract');

module.exports = {
  /**
   * 识别图片中的文字
   * @param {string} imgPath 图片路径
   */
  run: async (imgPath) => {
    return new Promise((resolve, reject) => {
      console.log('📷 开始识别图片...');

      Tesseract.process(imgPath, { psm: 7 }, function (err, val) {
        if (err || val == null) {
          console.error('❌ 识别失败：' + imgPath);
          reject(err);
          return;
        }

        const date = path.basename(imgPath, path.extname(imgPath));
        // 针对常见错误做手动修复
        // 更复杂的场景靠训练模型来提高准确率
        val = val
          .replace(/(\,|\.|\s+)/g, '')
          .replace(/\?/g, '7')
          .replace(/\'3/g, 9)
          .replace(/\‘/g, '');

        console.log('✅ 识别成功  ' + date + '：' + val);
        resolve({
          title: date,
          value: val
        });
      });
    });
  }
}