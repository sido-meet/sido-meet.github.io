// 在Hexo构建时获取GitHub项目数据
// 禁用dotenv提示信息
require('dotenv').config({ quiet: true });

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

let projectsFetched = false;

hexo.extend.filter.register('before_generate', async function() {
  // 防止重复获取项目数据
  if (projectsFetched) return;
  
  const GITHUB_USERNAME = 'sido-meet';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`;
  const headers = GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {};

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const projects = await response.json();
    if (!Array.isArray(projects)) {
      throw new Error('GitHub API returned invalid data format');
    }

    // 保存项目数据到临时文件
    const dataPath = path.join(hexo.source_dir, '_data', 'github_projects.json');
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(projects, null, 2));
    console.log(`Successfully fetched ${projects.length} GitHub projects`);
    projectsFetched = true;
  } catch (error) {
    console.error('Error fetching GitHub projects:', error.message);
    // 如果获取失败，创建一个空的项目数据文件
    const dataPath = path.join(hexo.source_dir, '_data', 'github_projects.json');
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
  }
});
