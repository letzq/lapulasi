<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await authStore.login('zhangsan@enterprise.com', 'password')
  }
})
</script>

<template>
  <router-view />
</template>

<style>
#app {
  width: 100%;
  height: 100vh;
}
</style>
