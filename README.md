简体中文 | [English](README_en.md)

## hexo-safego

[NPM 发布地址](https://www.npmjs.com/package/hexo-safego) | [详细说明文档](https://blog.qyliu.top/posts/1dfd1f41/)

`hexo-safego` 是一个改进版的 Hexo 插件，用于处理外部链接以增强博客的安全性。该插件基于 [`hexo-external-link`](https://github.com/hvnobug/hexo-external-link) 二次开发，但其实现方式不同：原版插件通过注入 JS ，在打开网站时才处理外部链接，而 `hexo-safego` 则在生成静态页面时直接替换外部链接，并且提供了很多人性化的配置。

### 主要特性

- **外部链接跳转**：将外部链接替换为自定义的跳转页面，增加安全性。
- **灵活配置**：支持多个容器 ID、白名单域名和生效页面路径的配置。
- **Base64 编码**：可选的 Base64 编码功能。
- **调试模式**：调试模式输出详细信息，便于开发和调试。
- **自定义页面**：支持设置标题、副标题、头像、暗黑模式等。

### 安装

在使用该插件之前，需要先安装 `cheerio`，Hexo 一般有这个插件，可以在 `node_modules` 查看，如果没有，执行：

```bash
npm install cheerio --save
```

然后安装 `hexo-safego` 插件：

```bash
npm install hexo-safego --save
```

### 配置

在 Hexo 的配置文件 `_config.yml` 中添加或更新以下配置：

```yaml
# hexo-safego安全跳转插件
# see https://blog.qyliu.top/posts/1dfd1f41/
hexo_safego:
  enable: true  # 是否启用 hexo-safego 插件
  enable_base64_encode: true  # 是否启用 Base64 编码链接
  enable_target_blank: true  # 是否在跳转链接中添加 target="_blank"
  url_param_name: 'u'  # URL 参数名，用于生成跳转链接
  html_file_name: 'go.html'  # 跳转页面文件名
  ignore_attrs:  # 需要忽略的链接属性列表
    - 'data-fancybox'
  apply_containers:  # 容器 ID 列表，如果为空则匹配整个 body
    - '#article-container'
  domain_whitelist:  # 域名白名单列表，包含白名单中的域名的链接将被忽略
    - 'qyliu.top'
  exclude_pages:
    - 'fcircle/index.html'
  apply_pages:  # 生效页面路径列表，只有在这些页面上才会对链接进行处理
    - '/posts/'
  avatar: /info/avatar.ico  # 头像图片链接
  title: "清羽飞扬"  # 标题
  subtitle: "安全中心"  # 副标题
  darkmode: false  # 是否启用夜间模式
  debug: false  # 是否启用调试模式，开启后会输出详细的调试信息
```

### 必要修改说明

- **`domain_whitelist`**: 该参数为您的站点根域名。此配置使用字符串匹配，如果外链中包含您填写的字符串，则会跳过该外链不进行处理。可以设置多个域名。
- **`apply_containers`**: 该参数为您希望处理的容器选择器。如果需要类名选择器，可以使用 `.类名` 进行筛选。如果希望匹配整个网站，请填写 `body` 或者删除该配置项。由于我使用的是 Butterfly 主题，因此填写了 Butterfly 主题中文章部分的选择器 `#article-container`。
- **`apply_pages`**: 该参数指定插件生效的页面路径。如果您只希望在文章页面中使用插件，可以像示例配置中一样设置路径。如果希望插件在整个网站生效，可以设置为 `'/'`。
- **`avatar、title、subtitle`**: 请设置为您的个人信息，以提高头像显示速度。默认头像为 `jsdelivr` 图片，国内访问可能会影响加载速度，建议使用本地图片链接。
- **注意**: 以上配置项中未设置空值判断，请不要留空。如果您不需要某个配置项并希望使用默认值，请直接删除对应配置项！

通过以上配置，您可以更好地自定义 `hexo-safego` 插件的行为和外观，确保外部链接处理更加安全和符合您的需求。

### 配置参数说明

#### `enable`
- **类型**：`Boolean`
- **默认值**：`false`
- **描述**：是否启用 `hexo-safego` 插件。

#### `enable_base64_encode`
- **类型**：`Boolean`
- **默认值**：`true`
- **描述**：是否对跳转链接进行 Base64 编码。

#### `enable_target_blank`
- **类型**：`Boolean`
- **默认值**：`true`
- **描述**：是否在跳转链接中添加 `target="_blank"` 属性。

#### `url_param_name`
- **类型**：`String`
- **默认值**：`u`
- **描述**：跳转页面的 URL 参数名称。

#### `html_file_name`
- **类型**：`String`
- **默认值**：`go.html`
- **描述**：生成的跳转页面文件名。

#### `ignore_attrs`
- **类型**：`Array`
- **默认值**：`['data-fancybox']`
- **描述**：需要忽略的链接属性列表。如果链接包含这些属性，将不会被处理。

#### `apply_containers`
- **类型**：`Array`
- **默认值**：`['#article-container']`
- **描述**：指定要处理的容器 ID 列表。如果为空，则匹配整个 `body`。

#### `domain_whitelist`
- **类型**：`Array`
- **默认值**：`[]`
- **描述**：域名白名单列表，包含白名单中的域名的链接将被忽略。

#### `apply_pages`
- **类型**：`Array`
- **默认值**：`['/posts/']`
- **描述**：生效页面路径列表，只有在这些页面上才会对链接进行处理。如果希望插件对整个网站生效，可以设置为 `['/']`。

#### `avatar`
- **类型**：`String`
- **默认值**：`https://fastly.jsdelivr.net/gh/willow-god/hexo-safego@latest/lib/avatar.png`
- **描述**：跳转页面的头像图片链接。

#### `title`
- **类型**：`String`
- **默认值**：`网站名称`
- **描述**：跳转页面的标题。

#### `subtitle`
- **类型**：`String`
- **默认值**：`网站副标题`
- **描述**：跳转页面的副标题。

#### `darkmode`
- **类型**：`Boolean`
- **默认值**：`false`
- **描述**：是否启用夜间模式。

#### `debug`
- **类型**：`Boolean`
- **默认值**：`false`
- **描述**：是否启用调试模式，开启后会输出详细的调试信息。

### 问题反馈

如果有任何问题，请提 issue 或者联系作者邮箱 01@liushen.fun，或者在网站中进行提问：https://blog.qyliu.top
