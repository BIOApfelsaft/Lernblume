<template>
  <div class="app-container">
    <template v-if="isReady">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
    
    <div v-else class="loading-screen">
      Lade Datenbank...
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const { setupDb, isReady } = useDb();

onMounted(async () => {
  await setupDb();
});
</script>