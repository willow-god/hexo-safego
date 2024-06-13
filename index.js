const cheerio = require('cheerio');

const config = hexo.config.hexo_safego = Object.assign({
    enable: false,
    enable_base64_encode: true,
    url_param_name: 'u',
    html_file_name: 'go.html',
    target_blank: true,
    domain: '',
    safety_chain: false,
    link_rel: 'external nofollow noopener noreferrer',
    ignore_attrs: [],
    container_ids: ['article-container'], // 容器ID列表，如果为空则匹配body
    domain_whitelist: [], // 域名白名单列表
    apply_pages: ['/posts/'], // 生效页面路径列表
    debug: false, // 调试参数，默认为false
    avatar: "https://pic.imgdb.cn/item/6633cb0b0ea9cb1403cc54a4.webp",
    title: "清羽飞扬",
    subtitle: "安全中心",
    darkmode: {
        enable: true,
        start: 18,
        end: 6
    }
}, hexo.config.hexo_safego);

const default_ignore_attrs = ['data-fancybox', 'ignore-external-link'];
// 合并去重
const ignore_attrs = Array.from(new Set(default_ignore_attrs.concat(config.ignore_attrs)));
const root = hexo.config.root || '/';

if (config.enable) {
    hexo.extend.filter.register('after_render:html', function (htmlContent, data) {
        const $ = cheerio.load(htmlContent);

        if (config.debug) {
            console.log("Processing links within specified containers:", config.container_ids);
        }

        const currentPath = '/' + data.path;

        if (config.debug) {
            console.log("Current page path:", currentPath);
        }

        const isPathInApplyPages = config.apply_pages.some(page => {
            const normalizedPage = '/' + page.replace(/^\//, ''); // 确保 page 以斜杠开头
            if (normalizedPage === '/') {
                return true; // 如果设置为 '/'，则对所有页面生效
            }
            if (config.debug) {
                console.log("Normalized apply page path:", normalizedPage);
                console.log("Path match result:", currentPath.startsWith(normalizedPage));
            }
            return currentPath.startsWith(normalizedPage);
        });

        if (!isPathInApplyPages) {
            if (config.debug) {
                console.log("Current page path is not in the apply_pages list, skipping link processing.");
            }
            return htmlContent;
        }

        const containers = config.container_ids.length ? config.container_ids : ['body'];

        containers.forEach(id => {
            const selector = id === 'body' ? 'body a' : `#${id} a`;
            $(selector).each(function() {
                const $this = $(this);
                const href = $this.attr('href');

                if (!href) return;

                const hasAttr = ignore_attrs.some(attr => $this.attr(attr) !== undefined);
                if (hasAttr) {
                    if (config.debug) {
                        console.log("Link ignored due to attribute match:", href);
                    }
                    return;
                }

                const isLinkInWhitelist = config.domain_whitelist.some(whitelistDomain => href.includes(whitelistDomain));
                if (isLinkInWhitelist) {
                    if (config.debug) {
                        console.log("Link in whitelist, ignoring link:", href);
                    }
                    return;
                }

                if (href.match('^((http|https|thunder|qqdl|ed2k|Flashget|qbrowser|ftp|rtsp|mms)://)')) {
                    const strs = href.split('/');
                    if (strs.length >= 3) {
                        const host = strs[2];
                        if (host !== config.domain || window.location.host) {
                            if (config.debug) {
                                console.log("External link detected:", href);
                            }
                            const encodedHref = config.enable_base64_encode ? Buffer.from(href).toString('base64') : href;
                            const newHref = `${root}${config.html_file_name}?${config.url_param_name}=${encodedHref}`;
                            $this.attr('href', newHref).attr('rel', config.link_rel);
                            if (config.target_blank) {
                                $this.attr('target', '_blank');
                            }
                        }
                    }
                }
            });
        });

        return $.html();
    });
    hexo.extend.generator.register('external_link', require('./lib/generator'));
}
