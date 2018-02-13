# BAIDU-INDEX-SPIDER

百度指数爬虫，node版本

## Usage

**依赖Tesseract，必须先安装Tesseract。**

https://github.com/tesseract-ocr/tesseract/wiki#installation


**在node里引用：**

```
npm install baidu-index-spider
```

``` javascript
const BDIndexSpider = require('baidu-index-spider');

const keyword = '要爬取的关键词';
const username = '百度帐号';
const password = '';

const result = BDIndexSpider.run(keyword, { sername, password}).then((result) => {
    console.log(result);
});
```

