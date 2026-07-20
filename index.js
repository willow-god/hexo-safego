const cheerio = require('cheerio');

const defaultConfig = {
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
        countdowntime: -1,     // 倒计时秒数
        custom_css: "",        // 自定义CSS样式表路径或网络地址
        // 跳转页主要文案（其余按钮/复制提示等为内置文案）
        leave_text: "您即将离开本站，跳转到：",
        countdown_text: "⚡将在{seconds}秒后跳转，请自行确认链接安全性",
        manual_confirm_text: "💡请自行确认链接安全后再继续跳转"
    },
    debug: {
        enable: false          // 调试参数，默认为false
    }
};

// YAML 中 `key:` 会解析为 null；视为未配置，保留默认值
function deepMerge(target, source) {
    if (source === null || source === undefined) {
        return target;
    }
    if (typeof source !== 'object' || Array.isArray(source)) {
        return source;
    }
    if (!target || typeof target !== 'object' || Array.isArray(target)) {
        return deepMerge({}, source);
    }
    const result = Object.assign({}, target);
    Object.keys(source).forEach(key => {
        const sourceValue = source[key];
        const targetValue = target[key];
        if (sourceValue === null || sourceValue === undefined) {
            return;
        }
        if (
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue) &&
            targetValue &&
            typeof targetValue === 'object' &&
            !Array.isArray(targetValue)
        ) {
            result[key] = deepMerge(targetValue, sourceValue);
        } else {
            result[key] = sourceValue;
        }
    });
    return result;
}

function toStringArray(value) {
    if (Array.isArray(value)) {
        return value.filter(item => typeof item === 'string' && item.length > 0);
    }
    if (typeof value === 'string' && value.length > 0) {
        return [value];
    }
    return [];
}

function pickString(value, fallback) {
    return (typeof value === 'string' && value.length > 0) ? value : fallback;
}

function pickNumber(value, fallback) {
    return (typeof value === 'number' && !Number.isNaN(value)) ? value : fallback;
}

function pickBoolean(value, fallback) {
    return typeof value === 'boolean' ? value : fallback;
}

function normalizeConfig(raw) {
    const merged = deepMerge(defaultConfig, raw || {});
    const general = merged.general || {};
    const security = merged.security || {};
    const scope = merged.scope || {};
    const whitelist = merged.whitelist || {};
    const appearance = merged.appearance || {};
    const debug = merged.debug || {};

    return {
        general: {
            enable: pickBoolean(general.enable, defaultConfig.general.enable),
            enable_base64_encode: pickBoolean(general.enable_base64_encode, defaultConfig.general.enable_base64_encode),
            enable_target_blank: pickBoolean(general.enable_target_blank, defaultConfig.general.enable_target_blank)
        },
        security: {
            url_param_name: pickString(security.url_param_name, defaultConfig.security.url_param_name),
            html_file_name: pickString(security.html_file_name, defaultConfig.security.html_file_name),
            ignore_attrs: toStringArray(security.ignore_attrs)
        },
        scope: {
            apply_containers: toStringArray(scope.apply_containers),
            apply_pages: toStringArray(scope.apply_pages),
            exclude_pages: toStringArray(scope.exclude_pages)
        },
        whitelist: {
            domain_whitelist: toStringArray(whitelist.domain_whitelist)
        },
        appearance: {
            avatar: pickString(appearance.avatar, defaultConfig.appearance.avatar),
            title: pickString(appearance.title, defaultConfig.appearance.title),
            subtitle: pickString(appearance.subtitle, defaultConfig.appearance.subtitle),
            darkmode: (appearance.darkmode === true || appearance.darkmode === false || appearance.darkmode === 'auto')
                ? appearance.darkmode
                : defaultConfig.appearance.darkmode,
            countdowntime: pickNumber(appearance.countdowntime, defaultConfig.appearance.countdowntime),
            custom_css: typeof appearance.custom_css === 'string' ? appearance.custom_css : defaultConfig.appearance.custom_css,
            leave_text: pickString(appearance.leave_text, defaultConfig.appearance.leave_text),
            countdown_text: pickString(appearance.countdown_text, defaultConfig.appearance.countdown_text),
            manual_confirm_text: pickString(appearance.manual_confirm_text, defaultConfig.appearance.manual_confirm_text)
        },
        debug: {
            enable: pickBoolean(debug.enable, defaultConfig.debug.enable)
        }
    };
}

const config = hexo.config.hexo_safego = normalizeConfig(hexo.config.hexo_safego);

const default_ignore_attrs = ['data-fancybox'];
// 合并去重；ignore_attrs 为空时仅使用默认值，避免 cheerio.attr 报错
const ignore_attrs = Array.from(new Set(
    default_ignore_attrs.concat(config.security.ignore_attrs)
));
const root = hexo.config.root || '/';

function encodeSafeUrlParam(str) {
    const base64 = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode('0x' + p1)
    ));

    // 将 Base64 编码结果中的 "+" 和 "/" 转换为 URL 安全字符
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function isSafegoDisabledByFrontMatter(data) {
    if (!data) {
        return false;
    }
    // after_render:html 的 locals 中 front-matter 通常在 page / post 上
    const candidates = [data, data.page, data.post];
    return candidates.some(item => item && item.safego === false);
}

if (config.general.enable) {
    hexo.extend.filter.register('after_render:html', function (htmlContent, data) {
        // front-matter 中 safego: false 时跳过本页处理
        if (isSafegoDisabledByFrontMatter(data)) {
            if (config.debug.enable) {
                console.log("[hexo-safego]", "当前页面 front-matter 设置 safego: false，跳过链接处理。");
            }
            return htmlContent;
        }

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

        const excludePages = config.scope.exclude_pages;
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

        const applyPages = config.scope.apply_pages.length > 0 ? config.scope.apply_pages : ["/"];
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

        const containers = config.scope.apply_containers.length > 0 ? config.scope.apply_containers : ['body'];
        containers.forEach(id => {
            const selector = id === 'body' ? 'body a' : `${id} a`;
            $(selector).each(function() {
                const $this = $(this);
                const href = $this.attr('href');

                if (!href) {
                    return;
                }

                const hasAttr = ignore_attrs.some(attr => {
                    if (!attr || typeof attr !== 'string') {
                        return false;
                    }
                    return $this.attr(attr) !== undefined;
                });
                if (hasAttr) {
                    if (config.debug.enable) {
                        console.log("[hexo-safego]", "链接因属性匹配被忽略:", href);
                    }
                    return;
                }

                const domain_whitelist = config.whitelist.domain_whitelist;
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
                        if (config.debug.enable) {
                            console.log("[hexo-safego]", "检测到外部链接并进行替换:", href);
                        }
                        const encodedHref = config.general.enable_base64_encode ? encodeSafeUrlParam(href) : href;
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
