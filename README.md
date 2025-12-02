# Sido Meet 个人网站

这是基于 Hexo 框架搭建的个人网站，使用 GitHub Pages 进行托管。本 README 文件记录了项目的安装和部署流程，方便在其他环境中快速搭建和运行。

## 环境要求

- Node.js (推荐 v16+)
- Git
- npm 或 yarn

## 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/sido-meet/sido-meet.github.io.git
cd sido-meet.github.io
```

2. 安装依赖
```bash
npm install
```

## 常用命令

### 本地开发
```bash
# 启动本地服务器，默认访问地址：http://localhost:4000
npm run server
# 或使用 hexo 命令
hexo s
```

### 创建新文章
```bash
# 创建新文章
hexo new "文章标题"
# 创建新页面
hexo new page "页面名称"
```

### 构建静态文件
```bash
# 清除缓存
npm run clean
# 生成静态文件
npm run build
# 或使用 hexo 命令
hexo clean && hexo generate
```

### 部署到 GitHub Pages
```bash
npm run deploy
# 或使用 hexo 命令
hexo deploy
```

## 项目结构

- `_config.yml`: 网站主配置文件
- `package.json`: 项目依赖和脚本定义
- `source/`: 存放源文件，包括 Markdown 文章和页面
  - `_posts/`: 存放博客文章
  - `index.md`: 首页内容
  - `publications.md`: 出版物页面
  - `projects.md`: 项目页面
  - `blogs.md`: 博客列表页面
- `themes/`: 存放主题
  - `sido-meet/`: 自定义主题
- `scaffolds/`: 模板文件

## 配置说明

1. 修改网站基本信息：编辑根目录下的 `_config.yml` 文件，设置网站标题、描述、作者等信息

2. 修改导航菜单：编辑 `themes/sido-meet/_config.yml` 文件中的 `menu` 配置

3. 部署配置：在根目录的 `_config.yml` 中配置 deploy 部分，设置 GitHub 仓库地址

```yaml
deploy:
  type: git
  repo: git@github.com:sido-meet/sido-meet.github.io.git
  branch: main
```

## 注意事项

1. 首次部署前请确保：
   - 已配置 GitHub SSH 密钥
   - 仓库地址正确配置在 `_config.yml` 中

2. 修改主题相关配置请编辑 `themes/sido-meet/_config.yml` 文件

3. 遇到页面不更新的问题时，可以尝试清除缓存后重新构建和部署
```bash
hexo clean && hexo generate && hexo deploy
```