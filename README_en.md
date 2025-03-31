[简体中文](README.md) | English

## hexo-safego

[NPM Release Address](https://www.npmjs.com/package/hexo-safego) | [Detailed Documentation](https://blog.liushen.fun/posts/1dfd1f41/)

`hexo-safego` is an improved Hexo plugin for handling external links to enhance the security of blogs. This plugin is developed based on [`hexo-external-link`](https://github.com/hvnobug/hexo-external-link), but it implements in a different way: the original plugin injects JS to process external links when opening the site, whereas `hexo-safego` directly replaces external links during the generation of static pages and provides many humanized configurations.

### Main Features

- **External Link Redirect**: Replace external links with custom redirect pages to increase security.
- **Flexible Configuration**: Supports configuration of multiple container IDs, whitelist domains, and effective page paths.
- **Base64 Encoding**: Optional Base64 encoding feature.
- **Debug Mode**: Outputs detailed information in debug mode, which is convenient for development and debugging.
- **Custom Page**: Supports setting title, subtitle, avatar, dark mode, etc.

### Installation

Before using this plugin, you need to install `cheerio` first. Hexo usually comes with this package; you can check in `node_modules`. If not installed, run:

```bash
npm install cheerio --save
```

Then install the `hexo-safego` plugin:

```bash
npm install hexo-safego --save
```

### Configuration

Add the following configuration in Hexo's `_config.yml` file:

```yaml
# hexo-safego safety redirection plugin
# see https://blog.liushen.fun/posts/1dfd1f41/
hexo_safego:
  # Basic Function Settings
  general:
    enable: true                # Enable plugin
    enable_base64_encode: true  # Use Base64 encoding
    enable_target_blank: true   # Open the redirection page from a new window

  # Security Settings
  security:
    url_param_name: 'u'         # URL parameter name
    html_file_name: 'go.html'   # Redirection page filename
    ignore_attrs:               # Ignored HTML structures
      - 'data-fancybox'

  # Container and Page Settings
  scope:
    apply_containers:           # Applied container selectors
      - '#article-container'
    apply_pages:                # Applied page paths
      - "/posts/"
      - "/devices/"
    exclude_pages:              # Excluded page paths

  # Domain Whitelist
  whitelist:
    domain_whitelist:           # Allowed whitelist domains, implemented by string matching
      - "qyliu.top"
      - "liushen.fun"

  # Page Appearance Settings
  appearance:
    avatar: /info/avatar.ico          # Path to the redirection page avatar
    title: "Clear Feather Flying"     # Redirection page title
    subtitle: "Safety Center"         # Redirection page subtitle
    darkmode: auto                    # Whether to enable dark mode
    countdowntime: 4                  # Countdown seconds for redirection page, if set to negative number then no automatic redirection

  # Debug Settings
  debug:
    enable: false               # Enable debug mode
```

### Necessary Parameter Modifications

- **`domain_whitelist`**: This parameter should be your site's root domain. This configuration uses string matching, if the external link contains the string you fill in, it will skip processing this external link. Multiple domains can be set.
- **`apply_containers`**: This parameter is for the container selector you wish to process. If you need class selectors, you can use `.classname` for filtering. To match the entire site, fill in `body` or leave this configuration empty or delete it. Since I use the Butterfly theme, I filled in the article section selector of the Butterfly theme `#article-container`, please set according to your needs.
- **`apply_pages`**: This parameter specifies the plugin-effective page paths. If you only want to use the plugin on post pages, you can set the path as `'/post/'` like the example configuration. If you want the plugin to take effect throughout the site, you can set it to `'/'` or leave this item empty or delete the configuration.
- **`avatar, title, subtitle`**: Please set these to your personal information to improve avatar display speed. The default avatar is an image from `jsdelivr`, which may affect loading speed within China. It supports local relative path images or web image links.
- **Note**: Some of the above configuration items may have inaccurate null value judgments and are only used as exception handling to prevent anomalies. If you do not need a configuration item and wish to use the default value, please directly delete the corresponding configuration item or set it to the corresponding default value.

### Parameter Description

- **`general.enable`**:  
  - **Type**: `Boolean`
  - **Default Value**: `false`
  - **Description**: Whether to enable the `hexo-safego` plugin.  
  - **Explanation**: Set to `true` to enable the plugin, `false` to disable.

- **`general.enable_base64_encode`**:  
  - **Type**: `Boolean`
  - **Default Value**: `true`
  - **Description**: Whether to encode the redirection link with Base64.  
  - **Explanation**: When set to `true`, the plugin will encode external links with Base64 to avoid direct exposure of URL information. If you do not need this function, set it to `false`.

- **`general.enable_target_blank`**:  
  - **Type**: `Boolean`
  - **Default Value**: `true`
  - **Description**: Whether to add the `target="_blank"` attribute in the redirection link, it's recommended to add it so that it opens in a new tab.  
  - **Explanation**: When set to `true`, external links will open in a new window. If you want external links to open in the same window, set it to `false`.

- **`security.url_param_name`**:  
  - **Type**: `String`
  - **Default Value**: `u`
  - **Description**: The URL parameter name for the redirection page.  
  - **Explanation**: Define the URL parameter name for the redirection page. For instance, if set to `u`, the redirection URL will be `go.html?u=http://example.com`.

- **`security.html_file_name`**:  
  - **Type**: `String`
  - **Default Value**: `go.html`
  - **Description**: The filename of the generated redirection page.  
  - **Explanation**: Define the filename of the generated redirection page. You can modify it to other names to suit your needs.

- **`security.ignore_attrs`**:  
  - **Type**: `Array`
  - **Default Value**: `['data-fancybox']`
  - **Description**: List of link attributes to ignore. If the link contains these attributes, it will not be processed.  
  - **Explanation**: When a link element contains specified attributes, it will skip processing for that link. You can add other attributes to ignore specific links.

- **`scope.apply_containers`**:  
  - **Type**: `Array`
  - **Default Value**: `['body']`
  - **Description**: List of container IDs to be processed. If empty, it matches the entire `body`.  
  - **Explanation**: Set the containers to be processed, such as article sections, sidebars, etc. If you want to process the whole page, you can use `body` or leave it empty.

- **`scope.apply_pages`**:  
  - **Type**: `Array`
  - **Default Value**: `['/']`
  - **Description**: List of effective page paths where links will be processed.  
  - **Explanation**: You can specify which pages the plugin should be enabled on. If you want it to take effect across the entire site, set it to `'/'` or leave this item empty.

- **`scope.exclude_pages`**:  
  - **Type**: `Array`
  - **Default Value**: `[]`
  - **Description**: List of excluded page paths where the plugin will not take effect.  
  - **Explanation**: If there are pages you don't want to enable the plugin on, you can add their paths to this list.

- **`whitelist.domain_whitelist`**:  
  - **Type**: `Array`
  - **Default Value**: `['example.com']`
  - **Description**: List of domain whitelists, links containing domains in the whitelist will be ignored.  
  - **Explanation**: This configuration allows you to set up your site's whitelist domains to prevent the plugin from processing redirects for these external links. Multiple domains are supported.

- **`appearance.avatar`**:  
  - **Type**: `String`
  - **Default Value**: `https://fastly.jsdelivr.net/gh/willow-god/hexo-safego@latest/lib/avatar.png`
  - **Description**: The image link for the avatar on the redirection page, supporting both relative path local images and absolute path web images.  
  - **Explanation**: You can set it to your own avatar image path, supporting both local and web image links.

- **`appearance.title`**:  
  - **Type**: `String`
  - **Default Value**: `Website Name`
  - **Description**: The title of the redirection page.  
  - **Explanation**: Set the title of the redirection page, usually filling in the website's name or slogan.

- **`appearance.subtitle`**:  
  - **Type**: `String`
  - **Default Value**: `Website Subtitle`
  - **Description**: The subtitle of the redirection page.  
  - **Explanation**: Set the subtitle of the redirection page, usually used for a brief description of the website's content.

- **`appearance.darkmode`**:  
  - **Type**: `Boolean`/`auto`
  - **Default Value**: `false`
  - **Description**: Whether to enable night mode.  
  - **Explanation**: Set to `true` to enable dark mode for the redirection page, suitable for nighttime use,Set to auto` to switch dark mode and light mode according to system theme setting.

- **`appearance.countdowntime`**:  
  - **Type**: `Integer`
  - **Default Value**: `4`
  - **Description**: Countdown seconds for the redirection page, if set to a negative number then no automatic redirection.  
  - **Explanation**: This sets the countdown for the redirection page. Setting it to a negative number disables automatic redirection.

- **`debug.enable`**:  
  - **Type**: `Boolean`
  - **Default Value**: `false`
  - **Description**: Whether to enable debug mode, which outputs detailed debug information when enabled.  
  - **Explanation**: When debugging the plugin, enabling this option can output detailed log information to help solve problems.

---

### Issue Feedback

If you encounter any issues, please submit an issue or contact the author at email 01@liushen.fun, or ask questions more quickly on the website: [https://blog.liushen.fun](https://blog.liushen.fun)