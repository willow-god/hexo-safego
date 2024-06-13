# hexo-safego

[Hexo-Safego on NPM](https://www.npmjs.com/package/hexo-safego)

`hexo-safego` is an enhanced Hexo plugin designed to handle external links to improve the security of your blog. This plugin is a re-development based on [`hexo-external-link`](https://github.com/hvnobug/hexo-external-link), but it implements a different approach: while the original plugin injects JS to process external links when the site is opened, `hexo-safego` directly replaces external links when generating static pages and provides numerous user-friendly configurations.

**Note: This plugin is in its early release stage and might not be fully stable. The configurations are subject to frequent updates. If it doesn't work for you, consider using alternative products like [Security Redirect Page](https://blog.qyliu.top/posts/9efc1657/). For future updates, you can star the repository to stay tuned!**

## Key Features

- **External Link Redirection**: Replace external links with custom redirection pages to enhance security.
- **Flexible Configuration**: Support multiple container IDs, whitelisted domains, and specified page paths.
- **Base64 Encoding**: Optional Base64 encoding feature.
- **Debug Mode**: Outputs detailed information for easier development and debugging.
- **Customizable Page**: The plugin's customizable page is straightforward, allowing full customization to meet your requirements, currently with preliminary support for dark mode.
- **Personalization**: Supports setting title, subtitle, avatar, and dark mode time. However, due to ongoing testing, use with caution and update carefully.

## Installation

Before using the plugin, ensure `cheerio` is installed. Hexo typically includes this plugin; you can check in `node_modules`. If not, run:

```bash
npm install cheerio --save
```

Then install `hexo-safego` plugin:

```bash
npm install hexo-safego --save
```

## Configuration

Add or update the following configuration in your Hexo `_config.yml` file (currently complex due to ongoing testing; unnecessary content will be removed in future updates):

```yaml
hexo_safego:
  enable: true  # Enable hexo-safego plugin
  enable_base64_encode: true  # Enable Base64 encoding for links
  url_param_name: 'u'  # URL parameter name for generating redirect links
  html_file_name: 'go.html'  # Redirect page file name
  target_blank: true  # Add target="_blank" to redirect links
  link_rel: 'external nofollow noopener noreferrer'  # Rel attribute for redirect links
  ignore_attrs:  # List of link attributes to ignore
    - 'data-fancybox'
    - 'ignore-external-link'
  container_ids:  # List of container IDs, if empty, match the whole body
    - 'article-container'
  domain_whitelist:  # List of whitelisted domains, links containing these domains will be ignored
  apply_pages:  # List of page paths where the plugin will take effect
    - '/posts/'
  debug: false  # Enable debug mode to output detailed information
  avatar: "https://pic.imgdb.cn/item/6633cb0b0ea9cb1403cc54a4.webp"  # Avatar image URL
  title: "QingYu FeiYang"  # Title
  subtitle: "Security Center"  # Subtitle
  darkmode:  # Dark mode configuration
    enable: true
    start: 18  # Dark mode start time
    end: 6  # Dark mode end time
```

## Key Implementation

The following is the key implementation of the `hexo-safego` plugin, mainly using `cheerio` to parse and process HTML content:

```javascript
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
    container_ids: ['article-container'],  // List of container IDs, if empty, match the whole body
    domain_whitelist: [],  // List of whitelisted domains
    apply_pages: ['/posts/'],  // List of page paths where the plugin will take effect
    debug: false,  // Debug mode, default is false
    avatar: "https://pic.imgdb.cn/item/6633cb0b0ea9cb1403cc54a4.webp",
    title: "QingYu FeiYang",
    subtitle: "Security Center",
    darkmode: {
        enable: true,
        start: 18,
        end: 6
    }
}, hexo.config.hexo_safego);

const default_ignore_attrs = ['data-fancybox', 'ignore-external-link'];
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
            if (page === '/') {
                return true;  // If set to '/', the plugin will apply to all pages
            }
            return currentPath.startsWith(page);
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
                        if (host !== config.domain) {
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
```

## Redirect Page Generation

The plugin will automatically generate a `go.html` file as a redirect page based on the configuration. The following is the code for generating the redirect page:

```javascript
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
```