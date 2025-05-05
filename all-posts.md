---
title: All Posts
layout: base.njk
---

<h2>All Posts</h2>
<ul class="post-list">
  {% for post in collections.post %}
    <li>
      <a href="{{ post.url }}">{{ post.data.title }}</a>
      <div class="post-date">{{ post.date | readableDate }}</div>
    </li>
  {% endfor %}
</ul>
