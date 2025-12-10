---
title: Hexo命令行参数详解：除了--tags和--categories还可以使用哪些？
date: 2025-12-20
tags:
  - Hexo
  - 命令行
  - 博客技巧
categories:
  - 博客开发
---

在使用Hexo创建博客文章时，我们经常会使用`hexo new post "文章标题"`命令。除了大家熟悉的`--tags`和`--categories`参数外，Hexo还提供了许多其他实用的命令行参数，可以帮助我们更高效地管理和创建博客内容。本文将详细介绍这些参数的使用方法。

## 一、基础信息参数

### 1. --title
指定文章标题，与命令中的标题参数作用相同。

```bash
hexo new post --title="Hexo命令行参数详解"
```

### 2. --date
指定文章的创建日期，格式为YYYY-MM-DD或YYYY-MM-DD HH:MM:SS。

```bash
hexo new post "回顾2025" --date="2025-12-31"
hexo new post "新年计划" --date="2026-01-01 00:00:00"
```

### 3. --updated
指定文章的更新日期，格式与--date相同。

```bash
hexo new post "技术分享" --updated="2025-12-20 15:30:00"
```

### 4. --author
指定文章作者。

```bash
hexo new post "团队协作经验" --author="张三"
```

## 二、内容组织参数

### 1. --permalink
指定文章的永久链接，覆盖站点配置中的permalink设置。

```bash
hexo new post "自定义链接" --permalink="2025/12/custom-link"
```

### 2. --layout
指定使用的布局模板，默认为post。

```bash
# 使用page布局创建页面
hexo new page "关于我们" --layout="page"

# 使用自定义布局
hexo new post "特别文章" --layout="special"
```

## 三、内容摘要参数

### 1. --excerpt
指定文章的摘要内容。

```bash
hexo new post "Hexo入门教程" --excerpt="这是一篇详细的Hexo博客搭建教程"
```

### 2. --description
指定文章的描述信息，通常用于SEO。

```bash
hexo new post "SEO优化技巧" --description="分享博客SEO优化的实用方法"
```

## 四、高级参数

### 1. --disable-linenos
禁用代码行号显示（如果主题支持的话）。

```bash
hexo new post "代码示例" --disable-linenos
```

### 2. --comments
控制是否启用评论功能。

```bash
# 启用评论
hexo new post "讨论话题" --comments=true

# 禁用评论
hexo new post "个人笔记" --comments=false
```

### 3. --path
指定文章文件的保存路径，相对于source/_posts目录。

```bash
# 将文章保存到指定目录
hexo new post "分类文章" --path="tutorials/hexo-guide"
```

## 五、参数组合使用

Hexo支持同时使用多个参数，实现更灵活的配置：

```bash
# 同时指定标题、标签、分类、作者和摘要
hexo new post "Hexo高级技巧" \
  --tags="Hexo,博客技巧,命令行" \
  --categories="技术分享" \
  --author="李四" \
  --excerpt="分享Hexo博客开发的高级技巧"

# 创建带自定义日期和永久链接的文章
hexo new post "时间管理" \
  --date="2025-12-15" \
  --permalink="2025/12/time-management"
```

## 六、自定义参数

除了上述内置参数外，你还可以在`scaffolds/post.md`模板中定义自定义参数，然后通过命令行传递：

### 1. 修改模板文件

编辑`scaffolds/post.md`文件，添加自定义参数：

```markdown
---
title: {{ title }}
date: {{ date }}
tags: {{ tags }}
categories: {{ categories }}
author: {{ author }}
excerpt: {{ excerpt }}
# 添加自定义参数
cover: {{ cover }}
featured: {{ featured }}
---
```

### 2. 使用自定义参数

```bash
hexo new post "带封面的文章" --cover="/images/cover.jpg" --featured=true
```

## 七、注意事项

1. **参数大小写**：Hexo命令行参数不区分大小写，`--tags`和`--TAGS`效果相同
2. **空格处理**：如果参数值包含空格，需要使用引号包裹，如`--tags="思考,生活,随笔"`
3. **参数顺序**：参数顺序不影响效果，可以放在命令的任何位置
4. **简写形式**：部分参数支持简写形式，如`-t`可以替代`--tags`

## 总结

Hexo提供了丰富的命令行参数，可以帮助我们更高效地创建和管理博客内容。除了常用的`--tags`和`--categories`参数外，还有许多实用的参数可以使用：

- **基础信息**：`--title`, `--date`, `--updated`, `--author`
- **内容组织**：`--permalink`, `--layout`
- **内容摘要**：`--excerpt`, `--description`
- **高级功能**：`--disable-linenos`, `--comments`, `--path`
- **自定义参数**：支持在模板中定义和使用

合理使用这些参数，可以大大提高我们的博客创作效率。希望本文能帮助你更好地了解和使用Hexo的命令行参数！
