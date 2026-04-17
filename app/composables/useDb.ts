import { ref } from 'vue';
import Database from '@tauri-apps/plugin-sql';
import { initDB } from '../utils/db';

// Singleton-Pattern
const dbInstance = ref<Database | null>(null);
const isDbReady = ref(false);

export const useDb = () => {
  const getDb = async () => {
    if (!dbInstance.value) {
      // 1. Init-Script - Creation DB & Seeding
      dbInstance.value = await initDB(); 
      isDbReady.value = true;
    }
    return dbInstance.value;
  };

  return {
    db: dbInstance,
    isReady: isDbReady,
    getDb,
  };
};