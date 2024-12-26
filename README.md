简体中文 | [English](README_en.md)

## hexo-safego

[NPM 发布地址](https://www.npmjs.com/package/hexo-safego) | [详细说明文档](https://blog.liushen.fun/posts/1dfd1f41/)

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

在 Hexo 的配置文件 `_config.yml` 中添加以下配置：

```yaml
# hexo-safego安全跳转插件
# see https://blog.liushen.fun/posts/1dfd1f41/
hexo_safego:
  # 基本功能设置
  general:
    enable: true                # 启用插件
    enable_base64_encode: true  # 使用 Base64 编码
    enable_target_blank: true   # 从新窗口打开跳转页面

  # 安全设置
  security:
    url_param_name: 'u'         # URL 参数名
    html_file_name: 'go.html'   # 重定向页面的文件名
    ignore_attrs:               # 忽略处理的 HTML 结构
      - 'data-fancybox'

  # 容器与页面设置
  scope:
    apply_containers:           # 应用的容器选择器
      - '#article-container'
    apply_pages:                # 应用的页面路径
      - "/posts/"
      - "/devices/"
    exclude_pages:              # 排除的页面路径

  # 域名白名单
  whitelist:
    domain_whitelist:           # 允许的白名单域名，通过字符串匹配实现
      - "qyliu.top"
      - "liushen.fun"

  # 页面外观设置
  appearance:
    avatar: /info/avatar.ico    # 跳转页面头像路径
    title: "清羽飞扬"            # 跳转页面标题
    subtitle: "安全中心"         # 跳转页面副标题
    darkmode: false             # 是否启用深色模式
    countdowntime: 4            # 跳转页面倒计时秒数，如果设置为负数则为不自动跳转

  # 调试设置
  debug:
    enable: false               # 启用调试模式
```

### 必要参数修改

- **`domain_whitelist`**: 该参数为您的站点根域名。此配置使用字符串匹配，如果外链中包含您填写的字符串，则会跳过该外链不进行处理。可以设置多个域名。
- **`apply_containers`**: 该参数为您希望处理的容器选择器。如果需要类名选择器，可以使用 `.类名` 进行筛选。如果希望匹配整个网站，请填写 `body` 或者置空 or 删除该配置项。由于我使用的是 Butterfly 主题，因此填写了 Butterfly 主题中文章部分的选择器 `#article-container` , 请按需设置。
- **`apply_pages`**: 该参数指定插件生效的页面路径。如果您只希望在文章页面中使用插件，可以像示例配置中一样设置路径为 `'/post/'`。如果希望插件在整个网站生效，可以设置为 `'/'` 或者置空 or 删除该项配置。
- **`avatar、title、subtitle`**: 请设置为您的个人信息，以提高头像显示速度。默认头像为 `jsdelivr` 图片，国内访问可能会影响加载速度。支持使用本地相对路径图片或网络图片链接。
- **注意**: 以上配置项中部分可能空值判断不准确，仅作为防止出现异常的处理，如果使用请尽量不要留空。如果您不需要某个配置项并希望使用默认值，请直接删除对应配置项或者设置为对应默认值。

### 参数说明

- **`general.enable`**:  
  - **类型**：`Boolean`
  - **默认值**：`false`
  - **描述**：是否启用 `hexo-safego` 插件。  
  - **说明**：设置为 `true` 启用插件，`false` 则禁用。

- **`general.enable_base64_encode`**:  
  - **类型**：`Boolean`
  - **默认值**：`true`
  - **描述**：是否对跳转链接进行 Base64 编码。  
  - **说明**：设置为 `true` 时，插件会对外链进行 Base64 编码，避免直接暴露 URL 信息。若不需要此功能，可设置为 `false`。

- **`general.enable_target_blank`**:  
  - **类型**：`Boolean`
  - **默认值**：`true`
  - **描述**：是否在跳转链接中添加 `target="_blank"` 属性，建议添加，可以在新页面打开。  
  - **说明**：设置为 `true` 时，外链将在新窗口打开。若希望在同一窗口打开外链，设置为 `false`。

- **`security.url_param_name`**:  
  - **类型**：`String`
  - **默认值**：`u`
  - **描述**：跳转页面的 URL 参数名称。  
  - **说明**：定义跳转页面的 URL 参数名称。例如，若设置为 `u`，则跳转 URL 将为 `go.html?u=http://example.com`。

- **`security.html_file_name`**:  
  - **类型**：`String`
  - **默认值**：`go.html`
  - **描述**：生成的跳转页面文件名。  
  - **说明**：定义生成的跳转页面文件名。您可以修改为其他名称以适应您的需求。

- **`security.ignore_attrs`**:  
  - **类型**：`Array`
  - **默认值**：`['data-fancybox']`
  - **描述**：需要忽略的链接属性列表。如果链接包含这些属性，将不会被处理。  
  - **说明**：当链接元素包含指定的属性时，将跳过该链接的处理。可以添加其他属性以忽略特定链接。

- **`scope.apply_containers`**:  
  - **类型**：`Array`
  - **默认值**：`['body']`
  - **描述**：指定要处理的容器 ID 列表。如果为空，则匹配整个 `body`。  
  - **说明**：设置要处理的容器，例如文章部分、侧边栏等。如果想处理整个页面，可以使用 `body` 或留空。

- **`scope.apply_pages`**:  
  - **类型**：`Array`
  - **默认值**：`['/']`
  - **描述**：生效页面路径列表，只有在这些页面上才会对链接进行处理。  
  - **说明**：您可以指定哪些页面启用插件。若要在整个网站上生效，设置为 `'/'`，或将该项留空。

- **`scope.exclude_pages`**:  
  - **类型**：`Array`
  - **默认值**：`[]`
  - **描述**：排除的页面路径列表，插件将不会在这些页面上生效。  
  - **说明**：如果有不想启用插件的页面，可以将其路径添加到该列表中。

- **`whitelist.domain_whitelist`**:  
  - **类型**：`Array`
  - **默认值**：`['example.com']`
  - **描述**：域名白名单列表，包含白名单中的域名的链接将被忽略。  
  - **说明**：该配置项允许您设置站点的白名单域名，防止插件对这些外链进行跳转处理。支持多个域名。

- **`appearance.avatar`**:  
  - **类型**：`String`
  - **默认值**：`https://fastly.jsdelivr.net/gh/willow-god/hexo-safego@latest/lib/avatar.png`
  - **描述**：跳转页面的头像图片链接，支持相对路径本地图片和绝对路径网络图片。  
  - **说明**：可以设置为您自己的头像图片路径，支持使用本地或网络图片链接。

- **`appearance.title`**:  
  - **类型**：`String`
  - **默认值**：`网站名称`
  - **描述**：跳转页面的标题。  
  - **说明**：设置跳转页面的标题，通常可以填写网站的名称或标语。

- **`appearance.subtitle`**:  
  - **类型**：`String`
  - **默认值**：`网站副标题`
  - **描述**：跳转页面的副标题。  
  - **说明**：设置跳转页面的副标题，通常用于简短描述网站的内容。

- **`appearance.darkmode`**:  
  - **类型**：`Boolean`
  - **默认值**：`false`
  - **描述**：是否启用夜间模式。  
  - **说明**：设置为 `true` 时，跳转页面将启用暗色模式，适合夜间使用。

- **`appearance.countdowntime`**:  
  - **类型**：`Integer`
  - **默认值**：`4`
  - **描述**：跳转页面倒计时秒数，如果设置为负数则为不自动跳转。  
  - **说明**：该配置项设置了跳转页面的倒计时。设置为负数时，将禁用自动跳转。

- **`debug.enable`**:  
  - **类型**：`Boolean`
  - **默认值**：`false`
  - **描述**：是否启用调试模式，开启后会输出详细的调试信息。  
  - **说明**：当您在调试插件时，启用此项可以输出详细的日志信息，帮助解决问题。

---

### 问题反馈

如果有任何问题，请提 issue 或者联系作者邮箱 01@liushen.fun，或者在网站中进行更加快捷的提问：[https://blog.liushen.fun](https://blog.liushen.fun)
