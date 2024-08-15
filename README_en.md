[简体中文](README.md) | English

## hexo-safego

[NPM Release Address](https://www.npmjs.com/package/hexo-safego) | [Detailed Documentation](https://blog.liushen.fun/posts/1dfd1f41/)

`hexo-safego` is an improved version of the Hexo plugin designed to handle external links to enhance the security of your blog. This plugin is a secondary development based on [`hexo-external-link`](https://github.com/hvnobug/hexo-external-link), but with a different implementation: the original plugin processes external links when opening the site through injected JS, while `hexo-safego` directly replaces external links when generating static pages and provides many user-friendly configurations.

### Key Features

- **External Link Redirection**: Replace external links with custom redirection pages to increase security.
- **Flexible Configuration**: Supports multiple container IDs, domain whitelists, and active page paths configurations.
- **Base64 Encoding**: Optional Base64 encoding feature.
- **Debug Mode**: Detailed output in debug mode for development and debugging.
- **Custom Pages**: Allows setting up titles, subtitles, avatars, dark mode, and more.

### Installation

Before using this plugin, you need to install `cheerio`. Hexo generally includes this plugin, which you can check in `node_modules`. If not present, run:

```bash
npm install cheerio --save
```

Then install the `hexo-safego` plugin:

```bash
npm install hexo-safego --save
```

### Configuration

Add or update the following configuration in your Hexo configuration file `_config.yml`:

```yaml
# hexo-safego security redirection plugin
# see https://blog.qyliu.top/posts/1dfd1f41/
hexo_safego:
  enable: true  # Enable the hexo-safego plugin
  enable_base64_encode: true  # Enable Base64 encoding of links
  enable_target_blank: true  # Add target="_blank" to redirection links
  url_param_name: 'u'  # URL parameter name for generating redirection links
  html_file_name: 'go.html'  # Redirection page file name
  ignore_attrs:  # List of link attributes to ignore
    - 'data-fancybox'
  apply_containers:  # Container ID list, if empty, applies to the entire body
    - '#article-container'
  domain_whitelist:  # Domain whitelist list; links containing whitelisted domains will be ignored
    - 'example.com'
  exclude_pages: # Exclude paths list; these pages will be excluded, can be used with apply_pages
    - '/safego_exclude_page/'
  apply_pages:  # Effective page path list; links will only be processed on these pages
    - '/posts/'
  avatar: https://fastly.jsdelivr.net/gh/willow-god/hexo-safego@latest/lib/avatar.png  # Avatar image link
  title: "Qingyu Feiyang"  # Title
  subtitle: "Security Center"  # Subtitle
  darkmode: false  # Enable dark mode
  debug: false  # Enable debug mode, detailed debug information will be output
```

### Important Modifications

- **`domain_whitelist`**: This parameter is your site's root domain. This configuration uses string matching; if the external link contains the string you provide, it will be skipped. You can set multiple domains.
- **`apply_containers`**: This parameter is the container selector you want to process. If you need class selectors, you can use `.classname` to filter. To match the entire site, you can enter `body` or leave this configuration empty or delete it. Since I use the Butterfly theme, I have set the selector for the article section of the Butterfly theme `#article-container`. Please configure it as needed.
- **`apply_pages`**: This parameter specifies the page paths where the plugin is effective. If you only want the plugin to be used on article pages, you can set the path to `'/post/'` as shown in the example configuration. If you want the plugin to be effective across the entire site, you can set it to `'/'` or leave it empty or delete this item.
- **`avatar, title, subtitle`**: Please set these to your personal information to improve avatar display speed. The default avatar is an image from `jsdelivr`, which might affect loading speed in mainland China. It supports both local relative path images and absolute path network images.
- **Note**: Some of the above configuration items may not have accurate empty value checks, and are only used to prevent exceptions. If using, try not to leave them empty. If you don't need a specific configuration item and want to use the default value, please directly delete the corresponding configuration item or set it to the default value.

With the above configuration, you can better customize the behavior and appearance of the `hexo-safego` plugin to ensure external link handling is more secure and meets your needs.

### Configuration Parameters

#### `enable`
- **Type**: `Boolean`
- **Default**: `false`
- **Description**: Whether to enable the `hexo-safego` plugin.

#### `enable_base64_encode`
- **Type**: `Boolean`
- **Default**: `true`
- **Description**: Whether to Base64 encode the redirection links.

#### `enable_target_blank`
- **Type**: `Boolean`
- **Default**: `true`
- **Description**: Whether to add `target="_blank"` to the redirection links. It is recommended to add it so the link opens in a new page.

#### `url_param_name`
- **Type**: `String`
- **Default**: `u`
- **Description**: The URL parameter name for the redirection page.

#### `html_file_name`
- **Type**: `String`
- **Default**: `go.html`
- **Description**: The file name of the generated redirection page.

#### `ignore_attrs`
- **Type**: `Array`
- **Default**: `['data-fancybox']`
- **Description**: List of link attributes to ignore. Links containing these attributes will not be processed.

#### `apply_containers`
- **Type**: `Array`
- **Default**: `['body']`
- **Description**: List of container IDs to process. If empty, it will match the entire `body`.

#### `domain_whitelist`
- **Type**: `Array`
- **Default**: `["example.com"]`
- **Description**: Domain whitelist list; links containing whitelisted domains will be ignored.

#### `apply_pages`
- **Type**: `Array`
- **Default**: `['/']`
- **Description**: List of page paths where the plugin is effective. Links will only be processed on these pages. To make the plugin effective across the entire site, set this to `['/']`.

#### `exclude_pages`
- **Type**: `Array`
- **Default**: `[]`
- **Description**: List of page paths to exclude. These pages will be excluded from processing. It is recommended to use this with `apply_pages` to more accurately limit paths. If not configured or set to empty, it will not affect.

#### `avatar`
- **Type**: `String`
- **Default**: `https://fastly.jsdelivr.net/gh/willow-god/hexo-safego@latest/lib/avatar.png`
- **Description**: Avatar image link for the redirection page. Supports both relative local path images and absolute path network images.

#### `title`
- **Type**: `String`
- **Default**: `Site Name`
- **Description**: Title for the redirection page.

#### `subtitle`
- **Type**: `String`
- **Default**: `Site Subtitle`
- **Description**: Subtitle for the redirection page.

#### `darkmode`
- **Type**: `Boolean`
- **Default**: `false`
- **Description**: Whether to enable dark mode.

#### `debug`
- **Type**: `Boolean`
- **Default**: `false`
- **Description**: Whether to enable debug mode. Detailed debug information will be output when enabled.

### Issue Reporting

If you encounter any issues, please file an issue or contact the author via email at 01@liushen.fun, or ask on the website: https://blog.liushen.fun