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

function pickText(value, fallback) {
    return (typeof value === 'string' && value.length > 0) ? value : fallback;
}

module.exports = function (locals) {
    const config = this.config;
    const safegoConfig = config.hexo_safego || {};
    const security = safegoConfig.security || {};
    const general = safegoConfig.general || {};
    const appearance = safegoConfig.appearance || {};

    const countdownText = pickText(
        appearance.countdown_text,
        '⚡将在{seconds}秒后跳转，请自行确认链接安全性'
    );
    // 将 {seconds} 替换为带 id 的倒计时节点，便于 JS 更新数字
    const countdownTextHtml = countdownText.replace(
        /\{seconds\}/g,
        '<span class="countdown-number" id="countdown"></span>'
    );

    const countdown = typeof appearance.countdowntime === 'number' && !Number.isNaN(appearance.countdowntime)
        ? appearance.countdowntime
        : 5;

    // 获取配置中的各项参数
    const html = template.render({
        url_param_name: pickText(security.url_param_name, 'u'),
        enable_base64_encode: typeof general.enable_base64_encode === 'boolean' ? general.enable_base64_encode : true,
        avatar: pickText(appearance.avatar, 'https://cdn.jsdelivr.net/npm/hexo-safego/lib/avatar.png'),
        title: pickText(appearance.title, '请填写网站名称'),
        subtitle: pickText(appearance.subtitle, '请填写网站副标题'),
        countdown: countdown,
        darkmode: (appearance.darkmode === true || appearance.darkmode === false || appearance.darkmode === 'auto')
            ? appearance.darkmode
            : false,
        custom_css: typeof appearance.custom_css === 'string' ? appearance.custom_css : '',
        leave_text: pickText(appearance.leave_text, '您即将离开本站，跳转到：'),
        countdown_text_html: countdownTextHtml,
        manual_confirm_text: pickText(appearance.manual_confirm_text, '💡请自行确认链接安全后再继续跳转')
    });

    return {
        path: pickText(security.html_file_name, 'go.html'),
        data: html
    };
};
