const cheerio = require('cheerio');

const config = hexo.config.hexo_safego = Object.assign({
    enable: false,
    enable_base64_encode: true,
    enable_target_blank: true,
    url_param_name: 'u',
    html_file_name: 'go.html',
    ignore_attrs: ['data-fancybox'],
    apply_containers: ['#article-container'], // 容器列表，如果为空则匹配整个body
    apply_pages: ['/posts/'], // 生效页面路径列表
    domain_whitelist: ["example.com"], // 域名白名单列表
    darkmode: false, // 设置为true为暗色模式
    avatar: "https://fastly.jsdelivr.net/gh/willow-god/hexo-safego@latest/lib/avatar.png",
    title: "网站名称",
    subtitle: "网站副标题",
    debug: false // 调试参数，默认为false
}, hexo.config.hexo_safego);

const default_ignore_attrs = ['data-fancybox'];
// 合并去重
const ignore_attrs = Array.from(new Set(default_ignore_attrs.concat(config.ignore_attrs)));
const root = hexo.config.root || '/';

if (config.enable) {
    hexo.extend.filter.register('after_render:html', function (htmlContent, data) {
        const $ = cheerio.load(htmlContent);

        if (config.debug) {
            console.log("[hexo-safego]调试模式===================================================");
            console.log("[hexo-safego]", "正在处理指定容器内的链接:", config.apply_containers);
        }

        const currentPath = '/' + data.path;

        if (config.debug) {
            console.log("[hexo-safego]", "当前页面路径:", currentPath);
        }

        const applyPages = Array.isArray(config.apply_pages) && config.apply_pages.length > 0 ? config.apply_pages : ["/"];
        const isPathInApplyPages = applyPages.some(page => {
            const normalizedPage = '/' + page.replace(/^\//, ''); // 确保 page 以斜杠开头
            if (normalizedPage === '/') {
                return true; // 如果设置为 '/'，则对所有页面生效
            }
            if (config.debug) {
                console.log("[hexo-safego]", "规范化的应用页面路径:", normalizedPage);
                console.log("[hexo-safego]", "路径匹配结果:", currentPath.startsWith(normalizedPage));
            }
            return currentPath.startsWith(normalizedPage);
        });

        if (!isPathInApplyPages) {
            if (config.debug) {
                console.log("[hexo-safego]", "当前页面路径不在 apply_pages 列表中，跳过链接处理。");
            }
            return htmlContent;
        }

        const containers = Array.isArray(config.apply_containers) && config.apply_containers.length ? config.apply_containers : ['body'];
        containers.forEach(id => {
            const selector = id === 'body' ? 'body a' : `${id} a`;
            $(selector).each(function() {
                const $this = $(this);
                const href = $this.attr('href');

                if (!href) return;

                const hasAttr = ignore_attrs.some(attr => $this.attr(attr) !== undefined);
                if (hasAttr) {
                    if (config.debug) {
                        console.log("[hexo-safego]", "链接因属性匹配被忽略:", href);
                    }
                    return;
                }

                const isLinkInWhitelist = config.domain_whitelist.some(whitelistDomain => href.includes(whitelistDomain));
                if (isLinkInWhitelist) {
                    if (config.debug) {
                        console.log("[hexo-safego]", "链接在白名单中，忽略链接:", href);
                    }
                    return;
                }

                if (href.match('^((http|https|thunder|qqdl|ed2k|Flashget|qbrowser|ftp|rtsp|mms)://)')) {
                    const strs = href.split('/');
                    if (strs.length >= 3) {
                        const host = strs[2];
                        if (config.debug) {
                            console.log("[hexo-safego]", "检测到外部链接并进行替换:", href);
                        }
                        const encodedHref = config.enable_base64_encode ? Buffer.from(href).toString('base64') : href;
                        const newHref = `${root}${config.html_file_name}?${config.url_param_name}=${encodedHref}`;
                        $this.attr('href', newHref).attr('rel', 'external nofollow noopener noreferrer');
                        if (config.enable_target_blank) {
                            $this.attr('target', '_blank');
                        }
                    }
                }
            });
        });

        return $.html();
    });
    hexo.extend.generator.register('external_link', require('./lib/generator'));
}
