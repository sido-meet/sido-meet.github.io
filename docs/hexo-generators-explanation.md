# Hexo 生成器行为说明

## 问题解释

您在运行 `hexo generate` 命令时发现系统生成了一些您不想要的页面：
- index.html
- tags/GitHub/index.html
- categories/技术教程/index.html
- tags/Hexo/index.html
- tags/个人网站/index.html

## 原因分析

通过检查项目配置，我发现了以下情况：

1. **配置文件设置**：在 `_config.yml` 中，您已经将以下生成器设置为禁用：
   - archive_generator
   - category_generator
   - tag_generator

2. **插件依赖**：然而，在 `package.json` 中发现项目仍然安装了这些生成器插件：
   - hexo-generator-archive
   - hexo-generator-category
   - hexo-generator-tag
   - hexo-generator-index

3. **行为解释**：Hexo 的一个特性是，**即使在配置文件中设置 `enabled: false`，如果对应的生成器插件已安装，它们仍然会运行**。这是因为配置中的 `enabled: false` 主要影响某些高级行为，而不是完全禁用插件。

## 解决方案

以下是几种彻底禁用这些生成器的方法：

### 方法 1：卸载生成器插件（推荐）

最彻底的方法是直接卸载不需要的生成器插件：

```bash
# 卸载所有不需要的生成器插件
npm uninstall hexo-generator-archive hexo-generator-category hexo-generator-tag

# 如果连首页生成器也不需要，可以一并卸载
# npm uninstall hexo-generator-index
```

### 方法 2：修改 skip_render 配置

另一种方法是保留插件但跳过渲染这些页面：

```yaml
# 在 _config.yml 中添加
skip_render:
  - 'tags/**/*.html'
  - 'categories/**/*.html'
  - 'archives/**/*.html'
```

### 方法 3：使用更严格的生成器配置

我已经在 `_config.yml` 中添加了更严格的配置，设置 `per_page: 0` 可以进一步限制生成：

```yaml
tag_generator:
  enabled: false
  per_page: 0
  order_by: -date

category_generator:
  enabled: false
  per_page: 0
  order_by: -date
```

## 建议操作

1. 运行以下命令卸载不需要的生成器插件：
   ```bash
   npm uninstall hexo-generator-archive hexo-generator-category hexo-generator-tag
   ```

2. 清理并重新生成站点：
   ```bash
   hexo clean && hexo generate
   ```

3. 验证是否不再生成不需要的页面

## 注意事项

- 如果您将来需要标签或分类功能，可以重新安装相应的插件：
  ```bash
  npm install hexo-generator-tag hexo-generator-category
  ```

- 对于首页（index.html），通常需要保留 `hexo-generator-index` 插件，除非您完全使用自定义首页。

- 确保在修改配置或卸载插件后运行 `hexo clean` 来清除旧的生成文件。