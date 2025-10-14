---
layout: default
title: Music Player
---


{% include music-player.html %}



<style>
  .thumbnail-container {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .thumbnail-image {
    object-fit: cover;
    width: 150px; /* Ensure uniform height */
    height: 150px; /* Ensure uniform height */
  }

  .demo-item .row {
    align-items: center;
    transition: background-color 0.3s;
    cursor: pointer;
  }

  .demo-item.active {
    background-color: #DDD;
  }

  /* Techs and Changelog combined section */
  .demo-details {
    background-color: #DDD;
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .demo-item:hover {
    background-color: #DDD; /* Fading hover color */
  }

  /* Ensure the techs + changelog section is overlayed */
  .demo-item {
    position: relative;
  }

  .changelog {
    font-size: 14px;
  }
</style>
