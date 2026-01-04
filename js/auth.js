// API 请求基础配置
const API_BASE_URL = '/api';  // 使用相对路径，通过 Nginx 代理访问后端

// Token 管理
const TOKEN_KEY = 'auth_token';

// 获取 token
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// 设置 token
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// 移除 token
function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// 检查是否已登录
function isLoggedIn() {
  return !!getToken();
}

// 显示消息
function showMessage(message, type = 'info') {
  const messageElement = document.getElementById('message');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
  }
}

// 登录功能
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
      body: new URLSearchParams({
        username,
        password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '登录失败');
    }
    
    const data = await response.json();
    setToken(data.access_token);
    return true;
  } catch (error) {
    showMessage(error.message, 'error');
    return false;
  }
}

// 注册功能
async function register(username, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        email,
        password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '注册失败');
    }
    
    return true;
  } catch (error) {
    showMessage(error.message, 'error');
    return false;
  }
}

// 获取当前用户信息
async function getCurrentUser() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}

// 登出功能
function logout() {
  removeToken();
  window.location.href = '/login';
}

// 密码显示/隐藏功能
function initPasswordToggle() {
  let passwordTimeout;
  const passwordToggle = document.getElementById('password-toggle');
  const passwordInput = document.getElementById('password');
  
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // 改变图标
      this.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️';
      
      // 如果是显示密码，3秒后自动隐藏
      if (type === 'text') {
        // 清除之前的超时
        if (passwordTimeout) {
          clearTimeout(passwordTimeout);
        }
        
        // 设置新的超时，3秒后自动隐藏
        passwordTimeout = setTimeout(() => {
          passwordInput.setAttribute('type', 'password');
          passwordToggle.innerHTML = '👁️';
        }, 3000);
      }
    });
  }
}

// 页面加载完成后初始化事件监听器
document.addEventListener('DOMContentLoaded', function() {
  // 初始化密码显示/隐藏功能
  initPasswordToggle();
  
  // 登录表单处理
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      const success = await login(username, password);
      if (success) {
        showMessage('登录成功', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    });
  }
  
  // 注册表单处理
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const success = await register(username, email, password);
      if (success) {
        showMessage('注册成功，请登录', 'success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    });
  }
  
  // 检查登录状态并更新导航栏
  const loginButton = document.querySelector('.login-button a');
  if (loginButton) {
    if (isLoggedIn()) {
      loginButton.textContent = '登出';
      loginButton.href = '#';
      loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    }
  }
});