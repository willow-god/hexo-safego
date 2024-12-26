const cheerio = require('cheerio');

const config = hexo.config.hexo_safego = Object.assign({
    general: {
        enable: false,
        enable_base64_encode: true,
        enable_target_blank: true
    },
    security: {
        url_param_name: 'u',
        html_file_name: 'go.html',
        ignore_attrs: ['data-fancybox']
    },
    scope: {
        apply_containers: [],  // 容器列表，如果为空则匹配整个body
        apply_pages: [],       // 生效页面路径列表，如果为空则默认生效页面为/，也就是所有页面
        exclude_pages: []      // 排除页面路径列表，如果为空则无排除页面
    },
    whitelist: {
        domain_whitelist: []  // 域名白名单列表
    },
    appearance: {
        avatar: "https://cdn.jsdelivr.net/npm/hexo-safego/lib/avatar.png",
        title: "请填写网站名称",
        subtitle: "请填写网站副标题",
        darkmode: false,       // 设置为true为暗色模式
        countdowntime: -1      // 倒计时秒数
    },
    debug: {
        enable: false          // 调试参数，默认为false
    }
}, hexo.config.hexo_safego);

const default_ignore_attrs = ['data-fancybox'];
// 合并去重，防止为空值
const ignore_attrs = Array.from(new Set(default_ignore_attrs.concat(config.security.ignore_attrs)));
const root = hexo.config.root || '/';

if (config.general.enable) {
    hexo.extend.filter.register('after_render:html', function (htmlContent, data) {
        const $ = cheerio.load(htmlContent);

        if (config.debug.enable) {
            console.log("[hexo-safego]调试模式,一格表示一个页面================================================");
            console.log("[hexo-safego]", "白名单域名列表:", config.whitelist.domain_whitelist);
            console.log("[hexo-safego]", "正在处理指定容器内的链接:", config.scope.apply_containers);
        }

        const currentPath = '/' + data.path;

        if (config.debug.enable) {
            console.log("[hexo-safego]", "当前页面路径:", currentPath);
        }

        const excludePages = Array.isArray(config.scope.exclude_pages) && config.scope.exclude_pages.length > 0 ? config.scope.exclude_pages : [];
        const isPathInExcludePages = excludePages.some(page => {
            const normalizedPage = '/' + page.replace(/^\//, '');
            if (config.debug.enable) {
                console.log("[hexo-safego]", "规范化的排除页面路径:", normalizedPage);
                console.log("[hexo-safego]", "路径匹配结果:", currentPath.startsWith(normalizedPage));
            }
            return currentPath.startsWith(normalizedPage);
        });

        if (isPathInExcludePages) {
            if (config.debug.enable) {
                console.log("[hexo-safego]", "当前页面路径在 exclude_pages 列表中，跳过链接处理。");
            }
            return htmlContent;
        }

        const applyPages = Array.isArray(config.scope.apply_pages) && config.scope.apply_pages.length > 0 ? config.scope.apply_pages : ["/"];
        const isPathInApplyPages = applyPages.some(page => {
            const normalizedPage = '/' + page.replace(/^\//, ''); // 确保 page 以斜杠开头
            if (normalizedPage === '/') {
                return true; // 如果设置为 '/'，则对所有页面生效
            }
            if (config.debug.enable) {
                console.log("[hexo-safego]", "规范化的应用页面路径:", normalizedPage);
                console.log("[hexo-safego]", "路径匹配结果:", currentPath.startsWith(normalizedPage));
            }
            return currentPath.startsWith(normalizedPage);
        });

        if (!isPathInApplyPages) {
            if (config.debug.enable) {
                console.log("[hexo-safego]", "当前页面路径不在 apply_pages 列表中，跳过链接处理。");
            }
            return htmlContent;
        }

        const containers = Array.isArray(config.scope.apply_containers) && config.scope.apply_containers.length > 0 ? config.scope.apply_containers : ['body'];
        containers.forEach(id => {
            const selector = id === 'body' ? 'body a' : `${id} a`;
            $(selector).each(function() {
                const $this = $(this);
                const href = $this.attr('href');

                if (!href) {
                    return;
                }

                const hasAttr = ignore_attrs.some(attr => $this.attr(attr) !== undefined);
                if (hasAttr) {
                    if (config.debug.enable) {
                        console.log("[hexo-safego]", "链接因属性匹配被忽略:", href);
                    }
                    return;
                }

                const domain_whitelist = Array.isArray(config.whitelist.domain_whitelist) && config.whitelist.domain_whitelist.length > 0 ? config.whitelist.domain_whitelist : [];
                const isLinkInWhitelist = href.startsWith('/') || href.startsWith('#') || !href.match(/^http(s)?:\/\//) || domain_whitelist.some(domain => new URL(href).hostname.endsWith(domain));
                if (isLinkInWhitelist) {
                    if (config.debug.enable) {
                        console.log("[hexo-safego]", "链接在白名单中，忽略链接:", href);
                    }
                    return;
                }

                if (href.match('^((http|https|thunder|qqdl|ed2k|Flashget|qbrowser|ftp|rtsp|mms)://)')) {
                    const strs = href.split('/');
                    if (strs.length >= 3) {
                        const host = strs[2];
                        if (config.debug.enable) {
                            console.log("[hexo-safego]", "检测到外部链接并进行替换:", href);
                        }
                        const encodedHref = config.general.enable_base64_encode ? Buffer.from(href).toString('base64') : href;
                        const newHref = `${root}${config.security.html_file_name}?${config.security.url_param_name}=${encodedHref}`;
                        $this.attr('href', newHref).attr('rel', 'external nofollow noopener noreferrer');
                        if (config.general.enable_target_blank) {
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
