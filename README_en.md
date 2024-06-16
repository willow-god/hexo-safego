[简体中文](README.md) | English

## hexo-safego

[NPM Page](https://www.npmjs.com/package/hexo-safego) | [Detailed Documentation](https://blog.qyliu.top/posts/1dfd1f41/)

`hexo-safego` is an improved Hexo plugin designed to handle external links to enhance blog security. This plugin is a secondary development based on [`hexo-external-link`](https://github.com/hvnobug/hexo-external-link), but its implementation is different: the original plugin injects JS to process external links when opening the website, while `hexo-safego` replaces external links directly when generating static pages and provides many user-friendly configurations.

### Main Features

- **External Link Redirection**: Replace external links with a custom redirection page to increase security.
- **Flexible Configuration**: Supports multiple container IDs, whitelisted domains, and applicable page paths.
- **Base64 Encoding**: Optional Base64 encoding for links.
- **Debug Mode**: Outputs detailed information in debug mode, making development and debugging easier.
- **Custom Page**: Supports setting title, subtitle, avatar, dark mode, and more.

### Installation

Before using this plugin, you need to install `cheerio`. Hexo usually has this plugin, and you can check it in `node_modules`. If not, run:

```bash
npm install cheerio --save
```

Then install the `hexo-safego` plugin:

```bash
npm install hexo-safego --save
```

### Configuration

Add or update the following configuration in Hexo's `_config.yml` file:

```yaml
# hexo-safego security redirection plugin
# see https://blog.qyliu.top/posts/1dfd1f41/
hexo_safego:
  enable: true  # Enable hexo-safego plugin
  enable_base64_encode: true  # Enable Base64 encoding for links
  enable_target_blank: true  # Add target="_blank" to redirection links
  url_param_name: 'u'  # URL parameter name for generating redirection links
  html_file_name: 'go.html'  # Redirection page filename
  ignore_attrs:  # List of link attributes to ignore
    - 'data-fancybox'
  apply_containers:  # List of container IDs to apply the plugin to, matches entire body if empty
    - '#article-container'
  domain_whitelist:  # List of whitelisted domains, links containing these domains will be ignored
    - 'qyliu.top'
  apply_pages:  # List of page paths to apply the plugin to, only links on these pages will be processed
    - '/posts/'
  avatar: /info/avatar.ico  # Avatar image link
  title: "Qingyu Feiyang"  # Title
  subtitle: "Security Center"  # Subtitle
  darkmode: false  # Enable dark mode
  debug: false  # Enable debug mode, outputs detailed debug information
```

### Required Modifications

- **`domain_whitelist`**: This parameter is your site's root domain. This part uses string matching; if the external link contains the string you filled in, the external link will be skipped. You can set multiple domains.
- **`apply_containers`**: This parameter is the container selector you need. If you need a class selector, you can use `.classname` to filter. If you need to match the entire site, fill in `body` or leave it empty. Here, since I am using the Butterfly theme, I filled in the Butterfly article part selector `#article-container`.
- **`apply_pages`**: This parameter specifies the applicable pages. If you only want to use it on article pages, you can configure it as I did.
- **`avatar、title、subtitle`**: Please set these to your information to speed up avatar loading, as the default avatar is a `jsdelivr` image, which may affect loading speed in China.
- **Note**: The above configuration does not include null checks, so do not leave them empty. If you don't need a configuration and want to use the default, delete the corresponding configuration!

With the above configuration, you can better customize the behavior and appearance of the `hexo-safego` plugin to ensure safer and more compliant external link processing.

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
- **Description**: Whether to add `target="_blank"` to the redirection links.

#### `url_param_name`

- **Type**: `String`
- **Default**: `u`
- **Description**: The URL parameter name for the redirection page.

#### `html_file_name`

- **Type**: `String`
- **Default**: `go.html`
- **Description**: The filename of the generated redirection page.

#### `ignore_attrs`

- **Type**: `Array`
- **Default**: `['data-fancybox']`
- **Description**: List of link attributes to ignore. Links containing these attributes will not be processed.

#### `apply_containers`

- **Type**: `Array`
- **Default**: `['#article-container']`
- **Description**: List of container IDs to apply the plugin to. If empty, the entire `body` will be matched.

#### `domain_whitelist`

- **Type**: `Array`
- **Default**: `[]`
- **Description**: List of whitelisted domains. Links containing these domains will be ignored.

#### `apply_pages`

- **Type**: `Array`
- **Default**: `['/posts/']`
- **Description**: List of page paths to apply the plugin to. Only links on these pages will be processed. To apply the plugin to the entire site, set it to `['/']`.

#### `avatar`

- **Type**: `String`
- **Default**: `https://fastly.jsdelivr.net/gh/willow-god/hexo-safego@latest/lib/avatar.png`
- **Description**: The avatar image link for the redirection page.

#### `title`

- **Type**: `String`
- **Default**: `Site Name`
- **Description**: The title of the redirection page.

#### `subtitle`

- **Type**: `String`
- **Default**: `Site Subtitle`
- **Description**: The subtitle of the redirection page.

#### `darkmode`

- **Type**: `Boolean`
- **Default**: `false`
- **Description**: Whether to enable dark mode.

#### `debug`

- **Type**: `Boolean`
- **Default**: `false`
- **Description**: Whether to enable debug mode. Outputs detailed debug information when enabled.

### Issue Reporting

If you have any issues, please open an issue or contact the author via email at 01@liushen.fun, or ask questions on the website: https://blog.qyliu.top