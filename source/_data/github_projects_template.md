{% if projects and projects.length > 0 %}
<div class="github-projects-list">
  {% for project in projects %}
  <div class="github-project-card">
    <h3><a href="{{ project.html_url }}" target="_blank">{{ project.name }}</a></h3>
    <p class="project-description">{{ project.description || 'No description' }}</p>
    <div class="project-meta">
      <span class="project-language">{{ project.language || 'Unknown' }}</span>
      <span class="project-stars">⭐ {{ project.stargazers_count }}</span>
      <span class="project-forks">🍴 {{ project.forks_count }}</span>
      <span class="project-updated">Updated: {{ new Date(project.updated_at).toLocaleDateString() }}</span>
    </div>
  </div>
  {% endfor %}
</div>
{% else %}
<p>该GitHub用户没有公开项目或项目加载失败</p>
{% endif %}
