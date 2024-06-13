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

const goTmplSrc = pathFn.join(__dirname, '../go.html');
const template = nunjucks.compile(fs.readFileSync(goTmplSrc, 'utf8'), env);

module.exports = function (locals) {
    const config = this.config;
    const fel_config = config.hexo_safego;
    const html = template.render({
        url_param_name: fel_config.url_param_name,
        enable_base64_encode: fel_config.enable_base64_encode,
        domain: fel_config.domain,
        safety_chain: fel_config.safety_chain,
        avatar: fel_config.avatar,
        title: fel_config.title,
        subtitle: fel_config.subtitle,
        darkmode_enable: fel_config.darkmode.enable,
        darkmode_start: fel_config.darkmode.start,
        darkmode_end: fel_config.darkmode.end,
    });
    return {
        path: fel_config.html_file_name,
        data: html
    };
};
