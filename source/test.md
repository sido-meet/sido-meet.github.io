---
title: Test
type: page
---

# Test Page

## Site Posts Test

Total posts: {{ site.posts.length }}

{% for post in site.posts %}
  - {{ post.title }} ({{ post.date }})
{% endfor %}

## Site Info

Site title: {{ site.title }}
Site author: {{ site.author }}
