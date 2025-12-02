# Hexo 文件框架设计文档

## 1. 概述

本文档根据Hexo官方文档和最佳实践，详细设计了Hexo博客/网站的文件框架结构，旨在提供清晰的项目组织方式，便于内容管理、主题开发和部署维护。

## 2. 核心目录结构

```
├── _config.yml          # 站点配置文件
├── _config.[theme].yml  # 主题配置文件（如_config.sido-meet.yml）
├── package.json         # 项目依赖配置
├── package-lock.json    # 依赖版本锁定文件
├── scaffolds/           # 文章模板目录
│   ├── draft.md         # 草稿模板
│   ├── page.md          # 页面模板
│   └── post.md          # 文章模板
├── source/              # 资源文件夹
│   ├── _drafts/         # 草稿文件夹（可选）
│   ├── _posts/          # 文章文件夹
│   ├── _categories/     # 分类文件夹（可选，由hexo-generator-category生成）
│   ├── _tags/           # 标签文件夹（可选，由hexo-generator-tag生成）
│   ├── about/           # 关于页面
│   │   └── index.md
│   ├── archives/        # 归档页面（可选，由hexo-generator-archive生成）
│   ├── css/             # 自定义CSS文件
│   ├── js/              # 自定义JavaScript文件
│   └── images/          # 图片资源
├── themes/              # 主题文件夹
│   └── sido-meet/       # 当前使用的主题
│       ├── _config.yml  # 主题配置文件
│       ├── layout/      # 布局文件
│       ├── source/      # 主题资源文件
│       ├── languages/   # 多语言文件（可选）
│       └── scripts/     # 主题脚本（可选）
├── public/              # 生成的静态文件（自动生成，无需手动修改）
└── node_modules/        # 依赖包（自动生成，无需手动修改）
```

## 3. 主要目录与文件详解

### 3.1 根目录配置文件

#### `_config.yml`
- **作用**：站点的主要配置文件，控制整个Hexo博客的基本设置
- **主要配置项**：
  - **站点信息**：title, subtitle, description, author, language, timezone
  - **URL设置**：url, root, permalink
  - **目录设置**：source_dir, public_dir, tag_dir, archive_dir等
  - **写作设置**：new_post_name, default_layout, titlecase等
  - **主题设置**：theme（指定使用的主题）
  - **部署设置**：deploy（配置部署目标，如GitHub Pages）
  - **插件设置**：各种插件的配置项

#### `_config.[theme].yml`
- **作用**：主题特定的配置文件，覆盖主题目录下的_config.yml
- **优点**：便于主题升级时保留自定义配置

### 3.2 `scaffolds/` 目录

- **作用**：存储文章、页面和草稿的模板文件
- **使用方式**：执行`hexo new [layout] <title>`命令时，Hexo会根据对应模板创建新文件
- **文件说明**：
  - `post.md`：博客文章模板，默认包含title、date、tags等Front-matter
  - `page.md`：独立页面模板，默认包含title、date等Front-matter
  - `draft.md`：草稿模板，默认包含title等Front-matter

### 3.3 `source/` 目录

- **作用**：存放所有用户创建的内容文件和静态资源
- **文件处理规则**：
  - 以`_`开头的目录和文件不会被渲染
  - Markdown和HTML文件会被渲染为HTML
  - 其他文件会被复制到public目录

#### `source/_posts/`
- 存放所有博客文章（Markdown格式）
- 文件名通常使用`YYYY-MM-DD-title.md`格式

#### `source/_drafts/`
- 存放草稿，不会被渲染到public目录
- 可以使用`hexo publish [filename]`命令将草稿发布到_posts目录

#### 自定义页面目录
- 如`source/about/`, `source/projects/`, `source/publications/`, `source/blogs/`等
- 每个目录通常包含一个`index.md`文件作为页面入口

### 3.4 `themes/` 目录

- **作用**：存放所有主题，每个子目录是一个独立的主题
- **主题结构**（以sido-meet为例）：
  - `_config.yml`：主题配置文件
  - `layout/`：布局模板文件，使用EJS、Pug或Nunjucks语法
    - `index.ejs`：首页布局
    - `post.ejs`：文章布局
    - `page.ejs`：页面布局
    - `partial/`：部分模板（如header.ejs, footer.ejs等）
    - 自定义页面布局（如blogs.ejs）
  - `source/`：主题资源文件
    - `css/`：样式文件
    - `js/`：JavaScript文件
    - `images/`：图片资源
  - `languages/`：多语言支持文件（可选）
  - `scripts/`：主题脚本（可选）

### 3.5 自动生成目录

#### `public/`
- 由`hexo generate`命令生成的静态文件目录
- 包含所有可部署的HTML、CSS、JS和其他静态资源
- 通常添加到`.gitignore`中，不纳入版本控制

#### `node_modules/`
- 由npm安装的依赖包
- 通常添加到`.gitignore`中，不纳入版本控制

## 4. Front-matter 详解

Front-matter是Markdown文件开头的元数据块，使用YAML或JSON格式：

```yaml
---
title: 文章标题
date: 2024-01-01 12:00:00
updated: 2024-01-02 14:30:00
author: 作者名
tags: [标签1, 标签2]
categories: [分类1, 分类2]
permalink: 自定义URL路径
comments: true
layout: post
published: true
---
```

## 5. 布局模板系统

### 5.1 模板类型

Hexo支持三种默认布局：
- **post**：博客文章（默认保存到source/_posts/）
- **page**：独立页面（默认创建新目录和index.md）
- **draft**：草稿（默认保存到source/_drafts/）

### 5.2 模板继承

主题可以使用模板继承系统，通常包括：
- `layout.ejs`：主布局文件
- `partial/`：可重用的部分模板
- 特定页面的布局文件

## 6. 插件系统

Hexo通过插件扩展功能，主要类型包括：

### 6.1 官方插件
- `hexo-generator-archive`：生成归档页面
- `hexo-generator-category`：生成分类页面
- `hexo-generator-tag`：生成标签页面
- `hexo-renderer-marked`：Markdown渲染器
- `hexo-server`：本地服务器
- `hexo-deployer-git`：Git部署插件

### 6.2 自定义插件
- 可以在项目根目录创建`scripts/`目录存放自定义插件

## 7. 部署流程

### 7.1 本地开发

```bash
# 安装依赖
npm install

# 启动本地服务器
hexo server

# 生成静态文件
hexo generate
```

### 7.2 部署配置

在`_config.yml`中配置：

```yaml
deploy:
  type: git
  repo: git@github.com:username/repo.git
  branch: main
```

### 7.3 一键部署

```bash
# 清理缓存并部署
hexo clean && hexo deploy
```

## 8. 最佳实践

### 8.1 文件组织
- 文章使用`YYYY-MM-DD-title.md`命名
- 静态资源按类型存放在对应目录
- 自定义页面创建独立目录

### 8.2 配置管理
- 使用`_config.[theme].yml`管理主题配置
- 关键配置添加注释说明
- 备份重要配置文件

### 8.3 版本控制
- `.gitignore`文件排除`node_modules/`, `public/`, `.deploy*/`等
- 主题文件夹可以使用git submodule管理

## 9. 扩展与自定义

### 9.1 添加自定义页面
1. 创建目录：`source/custom-page/`
2. 添加入口文件：`source/custom-page/index.md`
3. 在主题中添加对应布局文件（可选）
4. 在主题配置中添加导航链接

### 9.2 自定义主题
- 修改主题的layout文件
- 自定义CSS样式
- 添加自定义JavaScript功能

## 10. 维护与更新

### 10.1 定期任务
- 更新依赖：`npm update`
- 备份配置和内容文件

### 10.2 常见问题排查
- 页面不更新：执行`hexo clean`清除缓存
- 插件冲突：检查插件版本兼容性
- 主题问题：确认主题配置正确

---

本文档基于Hexo官方文档和最佳实践设计，适用于个人博客、项目官网等Hexo站点的文件框架规划和管理。