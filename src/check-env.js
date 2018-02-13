/**
 * 环境依赖检查
 */

const cmd = require('child_process');

// 全局依赖
const deps = ['tesseract'];

module.exports = {
  run: () => {
    console.log('🍵 正在检测依赖...');

    return deps.every((dep) => {
      try {
        cmd.execSync(dep);
        return true;
      } catch (err) {
        console.error('❌ 缺少依赖：' + dep + '，请先安装该依赖并配置到环境变量');
      }
    });
  }
}
