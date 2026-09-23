document.addEventListener('DOMContentLoaded', function() {
  const sortBtn = document.querySelector('.sort-btn');
  if (!sortBtn) return; // 如果没有排序按钮，直接返回

  // 获取帖子容器，支持不同的类名（posts-grid 和 posts-list）
  const postsContainer = document.querySelector('.posts-grid') || document.querySelector('.posts-list');
  if (!postsContainer) return; // 如果没有帖子容器，直接返回

  const posts = Array.from(postsContainer.children);
  let currentOrder = 'desc'; // 默认按降序排序（最新的在前）

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
    sortBtn.textContent = order === 'asc' ? '最早优先 ↑' : '最新优先 ↓';
  }
  
  sortPosts(currentOrder);

  sortBtn.addEventListener('click', function() {
    const newOrder = currentOrder === 'desc' ? 'asc' : 'desc';
    sortPosts(newOrder);
  });
});
