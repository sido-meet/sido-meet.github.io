---
title: 如何使用 GitHub + Hexo 快速搭建个人网站
date: 2025-11-01 10:00:00
tags: [Hexo, GitHub, 个人网站]
categories: 技术教程
---

## 一、前言
Hexo 是一款基于 Node.js 的静态博客框架，能快速将 Markdown 文章渲染为静态 HTML 页面；GitHub 则可提供免费的页面托管服务。两者结合能零成本搭建高性能个人网站，本文将带你完成从环境搭建到网站上线的全流程。

## 二、前置准备
1. 安装 Node.js（建议 v16+）和 Git（版本无特殊要求）
2. 注册 GitHub 账号
3. 配置 GitHub SSH 密钥（避免每次部署输入账号密码）

## 三、步骤 1：安装并初始化 Hexo 项目
1. 全局安装 Hexo CLI：
```bash
npm install -g hexo-cli
```
2. 初始化 Hexo 项目（替换为你的项目路径）：
```bash
hexo init sido-meet.github.io
cd sido-meet.github.io
npm install
```
3. 本地预览初始项目：
```bash
hexo s
```
访问 `http://localhost:4000` 即可查看默认页面。

## 四、步骤 2：配置 Hexo 基础参数
修改项目根目录的 <mcfile name="_config.yml" path="/home/sido/projects/sido-meet.github.io/_config.yml"></mcfile> 文件：
- 设置网站标题、描述、作者等信息
- 配置语言（如 `language: zh-CN`）
- 你的项目已配置部署类型为 Git（对应文件第 104 行的 `type: git`），后续仅需补充仓库地址即可。

## 三、步骤 3：创建 GitHub 托管仓库
1. 登录 GitHub，创建名为 `[你的GitHub用户名].github.io` 的公开仓库
2. 复制仓库的 SSH 地址（如 `git@github.com:yourname/yourname.github.io.git`）

## 四、步骤 4：配置 Hexo 自动部署到 GitHub
在 <mcfile name="_config.yml" path="/home/sido/projects/sido-meet.github.io/_config.yml"></mcfile> 中补充部署配置：
```yaml
deploy:
  type: git
  repo: git@github.com:yourname/yourname.github.io.git # 替换为你的仓库地址
  branch: main
```
安装部署插件：
```bash
npm install hexo-deployer-git --save
```

## 五、步骤 5：写文章并部署上线
1. 创建新文章（自动生成 Markdown 文件到 source/_posts 目录）：
```bash
hexo new "我的第一篇文章"
```
2. 生成静态文件并部署：
```bash
hexo clean && hexo g && hexo d
```
3. 访问 `https://[你的GitHub用户名].github.io` 即可查看上线后的网站。

## 六、常见问题排查
1. 部署失败：检查 SSH 密钥配置是否正确、仓库地址是否有误
2. 页面不更新：执行 `hexo clean` 清除缓存后重新生成部署
3. 样式异常：检查主题配置文件或静态资源路径

## 七、总结
通过 GitHub + Hexo 的组合，你可以快速拥有一个可自定义样式、支持 Markdown 写作的个人网站。后续可尝试更换主题、添加评论系统等扩展功能。