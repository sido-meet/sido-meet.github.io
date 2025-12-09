# Hexo Projects与GitHub联动实现方案

## GitHub Token安全使用指南

### Token泄露的风险

将GitHub Token直接硬编码在代码中（特别是前端代码）存在严重的安全风险：

1. **账号被盗用**：攻击者可以使用泄露的Token访问你的GitHub账号
2. **代码被篡改**：可以修改你的仓库代码、创建恶意分支
3. **数据泄露**：可以访问私有仓库中的敏感信息
4. **API滥用**：可以使用你的配额进行大量API请求，导致账号被限制

### 安全管理Token的方法

#### 1. 使用环境变量（推荐）

- 在项目根目录创建`.env`文件（添加到`.gitignore`）
- 存储Token：`GITHUB_TOKEN=your-token`
- 使用dotenv插件加载环境变量

#### 2. 使用Hexo配置文件（需保护）

- 在`_config.yml`中添加：
  ```yaml
  github:
    token: your-token
  ```
- **重要**：确保`_config.yml`不被提交到公开仓库

#### 3. 使用后端代理

- 创建一个简单的后端服务来代理GitHub API请求
- Token只存储在后端服务器中，前端不直接接触

### 生成最小权限Token

创建Token时，只授予必要的权限：

1. 对于公开仓库：只需要`public_repo`权限
2. 对于私有仓库：需要`repo`权限
3. 避免授予`admin:repo_hook`、`delete_repo`等危险权限

### 定期轮换Token

- 建议每3-6个月更换一次Token
- 及时撤销不再使用的Token
- 使用GitHub的Token过期功能

---

## 方案一：使用GitHub API + 自定义模板

### 1. 创建自定义projects模板

```html
<%- partial('partial/header') %>
  <div class="page-container">
    <h1 class="page-title"><%= page.title %></h1>
    <div class="page-content">
      <%- page.content %>
      
      <h2>GitHub Projects</h2>
      <div id="github-projects">
        <p>正在加载GitHub项目...</p>
      </div>
    </div>
  </div>
  
  <script>
    // GitHub API 配置
    const GITHUB_USERNAME = 'your-github-username'; // 替换为你的GitHub用户名
    const GITHUB_TOKEN = ''; // 可选，用于提高API请求限制
    
    // 获取GitHub项目
    async function fetchGitHubProjects() {
      const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`;
      const headers = GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {};
      
      try {
        const response = await fetch(url, { headers });
        const projects = await response.json();
        
        // 渲染项目列表
        const container = document.getElementById('github-projects');
        container.innerHTML = `
          <div class="github-projects-list">
            ${projects.map(project => `
              <div class="github-project-card">
                <h3><a href="${project.html_url}" target="_blank">${project.name}</a></h3>
                <p class="project-description">${project.description || 'No description'}</p>
                <div class="project-meta">
                  <span class="project-language">${project.language || 'Unknown'}</span>
                  <span class="project-stars">⭐ ${project.stargazers_count}</span>
                  <span class="project-forks">🍴 ${project.forks_count}</span>
                  <span class="project-updated">Updated: ${new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } catch (error) {
        console.error('Failed to fetch GitHub projects:', error);
        document.getElementById('github-projects').innerHTML = '<p>加载GitHub项目失败</p>';
      }
    }
    
    // 页面加载完成后获取项目
    document.addEventListener('DOMContentLoaded', fetchGitHubProjects);
  </script>

<%- partial('partial/footer') %>
```

### 2. 添加CSS样式

在 `themes/sido-meet/source/css/style.css` 中添加以下样式：

```css
/* GitHub Projects Styles */
.github-projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.github-project-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.github-project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.github-project-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.github-project-card h3 a {
  color: #0366d6;
  text-decoration: none;
}

.github-project-card h3 a:hover {
  text-decoration: underline;
}

.project-description {
  color: #586069;
  margin-bottom: 15px;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.85rem;
  color: #586069;
}

.project-language {
  display: flex;
  align-items: center;
}

.project-language::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f1e05a;
  margin-right: 5px;
}
```

## 方案二：使用Hexo插件

### 1. 安装hexo-github-card插件

```bash
npm install hexo-github-card --save
```

### 2. 配置插件

在 `_config.yml` 中添加以下配置：

```yaml
github_card:
  enable: true
  client_id: ''  # 可选，用于提高API请求限制
  client_secret: ''  # 可选，用于提高API请求限制
```

### 3. 在projects.md中使用

```markdown
{% githubCard user:your-github-username repo:your-repo-name %}

{% githubCard user:your-github-username %}
```

## 方案三：使用GitHub Actions自动更新

### 1. 创建GitHub Actions工作流

在 `.github/workflows/update-projects.yml` 中创建以下内容：

```yaml
name: Update GitHub Projects

on:
  schedule:
    - cron: '0 0 * * *'  # 每天更新一次
  push:
    branches: [ main ]

jobs:
  update-projects:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm install
    
    - name: Fetch GitHub projects
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      run: |
        node scripts/fetch-github-projects.js
    
    - name: Commit changes
      run: |
        git config --global user.name 'GitHub Action'
        git config --global user.email 'action@github.com'
        git add source/projects.md
        git commit -m 'Update GitHub projects'
        git push
```

### 2. 创建获取项目的脚本

在 `scripts/fetch-github-projects.js` 中创建以下内容：

```javascript
const fs = require('fs');
const fetch = require('node-fetch');

async function fetchGitHubProjects() {
  const username = 'your-github-username';
  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=20`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: token ? `token ${token}` : '',
      'User-Agent': 'Node.js'
    }
  });
  
  const projects = await response.json();
  
  // 生成Markdown内容
  let markdown = `---
title: Projects
layout: page
---

# Projects

## Current Projects

`;
  
  projects.forEach(project => {
    markdown += `### ${project.name}
`;
    markdown += `- **Description**: ${project.description || 'No description'}
`;
    markdown += `- **Technologies**: ${project.language || 'Unknown'}
`;
    markdown += `- **GitHub**: [${project.html_url}](${project.html_url})
`;
    markdown += `- **Stars**: ${project.stargazers_count}
`;
    markdown += `- **Status**: ${project.archived ? 'Archived' : 'Active'}

`;
  });
  
  // 写入文件
  fs.writeFileSync('source/projects.md', markdown);
  console.log('GitHub projects updated successfully!');
}

fetchGitHubProjects().catch(error => {
  console.error('Error fetching GitHub projects:', error);
  process.exit(1);
});
```

### 3. 安装依赖

```bash
npm install node-fetch --save-dev
```

## 推荐方案

对于Hexo静态博客，推荐使用**方案一（GitHub API + 自定义模板）**，因为：
1. 无需额外安装插件
2. 实时从GitHub获取最新项目信息
3. 可以完全自定义显示样式
4. 实现简单，无需复杂配置

如果需要更高的性能和更好的控制，可以考虑**方案三（GitHub Actions自动更新）**，它会将项目信息预先生成到Markdown文件中，避免在页面加载时请求API。

## 实施步骤

1. 选择适合的方案（推荐方案一）
2. 按照方案中的步骤进行配置和修改
3. 运行 `hexo clean && hexo generate` 生成新的页面
4. 运行 `hexo server` 本地预览效果
5. 确认无误后，运行 `hexo deploy` 部署到GitHub Pages

## 注意事项

1. GitHub API有请求限制，建议使用个人访问令牌（Personal Access Token）提高限制
2. 如果使用方案三，需要确保GitHub Actions有写入权限
3. 可以根据自己的需求调整显示的项目数量和信息