'use strict';

const nunjucks = require('nunjucks');
const env = new nunjucks.Environment();
const pathFn = require('path');
const fs = require('fs');

env.addFilter('uriencode', str => {
    return encodeURI(str);
});

env.addFilter('noControlChars', str => {
    return str.replace(/[\x00-\x1F\x7F]/g, '');
});

// 获取 go.html 模板文件路径
const goTmplSrc = pathFn.join(__dirname, '../go.html');
const template = nunjucks.compile(fs.readFileSync(goTmplSrc, 'utf8'), env);

module.exports = function (locals) {
    const config = this.config;
    const safegoConfig = config.hexo_safego;  // 获取配置

    // 获取配置中的各项参数
    const html = template.render({
        url_param_name: safegoConfig.security.url_param_name,
        enable_base64_encode: safegoConfig.general.enable_base64_encode,
        avatar: safegoConfig.appearance.avatar,
        title: safegoConfig.appearance.title,
        subtitle: safegoConfig.appearance.subtitle,
        countdown: safegoConfig.appearance.countdowntime || 5,
        darkmode: safegoConfig.appearance.darkmode
    });

    return {
        path: safegoConfig.security.html_file_name,  // 配置文件中的重定向页面文件名
        data: html
    };
};
