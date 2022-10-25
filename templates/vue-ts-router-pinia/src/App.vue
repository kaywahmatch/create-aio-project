<script setup lang="ts">
  // This starter template is using Vue 3 <script setup> SFCs
  // Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
  import { RouterLink, RouterView } from 'vue-router';
  import Logo from '/@/components/Logo.vue';
</script>

<template>
  <div class="text-center mb-10">
    <Logo />

    <nav>
      <RouterLink to="/">Home</RouterLink> |
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </div>

  <RouterView />
</template>

<style scoped>
  a {
    font-weight: 500;
    color: #213547;
    text-decoration: inherit;
  }
  a:hover {
    color: #535bf2;
  }
  a:hover {
    color: #747bff;
  }
</style>
