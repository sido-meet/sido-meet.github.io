document.addEventListener('DOMContentLoaded', function() {
  const sortBtn = document.querySelector('.sort-btn');
  if (!sortBtn) return; // 如果没有排序按钮，直接返回

  // 获取帖子容器，支持不同的类名（posts-grid 和 posts-list）
  const postsContainer = document.querySelector('.posts-grid') || document.querySelector('.posts-list');
  if (!postsContainer) return; // 如果没有帖子容器，直接返回

  const posts = Array.from(postsContainer.children);
  let currentOrder = 'desc'; // 默认按降序排序（最新的在前）

  // 为每个帖子添加 data-date 属性（如果还没有的话）
  posts.forEach(post => {
    if (!post.dataset.date) {
      const dateElement = post.querySelector('.post-date');
      if (dateElement) {
        const dateText = dateElement.textContent;
        const date = new Date(dateText);
        post.dataset.date = date.getTime() / 1000; // 转换为 Unix 时间戳
      }
    }
  });

  function sortPosts(order) {
    posts.sort(function(a, b) {
      const dateA = parseInt(a.dataset.date);
      const dateB = parseInt(b.dataset.date);
      
      if (order === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
    
    posts.forEach(post => postsContainer.appendChild(post));
    
    currentOrder = order;
    sortBtn.dataset.sort = order;
    
    // 更新按钮外观
    const upIcon = sortBtn.querySelector('.sort-icon-up');
    const downIcon = sortBtn.querySelector('.sort-icon-down');
    
    if (order === 'asc') {
      upIcon.classList.add('active');
      downIcon.classList.remove('active');
    } else {
      upIcon.classList.remove('active');
      downIcon.classList.add('active');
    }
  }
  
  // 初始化排序
  sortPosts(currentOrder);
  
  // 添加点击事件监听器
  sortBtn.addEventListener('click', function() {
    const newOrder = currentOrder === 'desc' ? 'asc' : 'desc';
    sortPosts(newOrder);
  });
});