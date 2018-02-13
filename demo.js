const BDIndexSpider = require('./index');

const account = {
    username: '',
    password: ''
};

const result = BDIndexSpider.run('百度', {...account}).then((result) => {
    console.log('💻 数据：');
    console.log(result);
});