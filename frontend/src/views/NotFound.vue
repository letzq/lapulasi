<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found-page">
    <div class="content">
      <div class="error-code">404</div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div class="actions">
        <button class="btn btn-primary" @click="router.push('/')">Go to Home</button>
        <button class="btn btn-secondary" @click="router.back()">Go Back</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: var(--bg-secondary); }
.content { text-align: center; padding: 40px; }
.error-code { font-size: 120px; font-weight: 700; color: var(--border-color); line-height: 1; margin-bottom: 16px; }
h1 { font-size: 28px; font-weight: 600; margin-bottom: 12px; }
p { font-size: 16px; color: var(--text-secondary); margin-bottom: 32px; }
.actions { display: flex; gap: 12px; justify-content: center; }
</style>
