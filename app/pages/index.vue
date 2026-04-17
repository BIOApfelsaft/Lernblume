<template>
  <div class="space-y-8">
    <header>
      <h1 class="text-3xl font-bold text-gray-900">Servus in der Lernblume! 🌸</h1>
      <p class="text-gray-500 mt-2">Was möchtest du heute erledigen?</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard @click="navigateTo('/students')" class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-blue-100 rounded-full">
            <UIcon name="i-heroicons-users" class="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 class="font-bold">Schüler & Klassen</h3>
            <p class="text-sm text-gray-500">Verwalte deine Kids und Gruppen.</p>
          </div>
        </div>
      </UCard>

      <UCard @click="navigateTo('/grading')" class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-green-100 rounded-full">
            <UIcon name="i-heroicons-academic-cap" class="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 class="font-bold">Leistungsbeurteilung</h3>
            <p class="text-sm text-gray-500">Noten, HÜs und Kompetenzen eintragen.</p>
          </div>
        </div>
      </UCard>

      <UCard class="opacity-50 cursor-not-allowed">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-purple-100 rounded-full">
            <UIcon name="i-heroicons-document-arrow-down" class="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h3 class="font-bold">Berichte & PDF</h3>
            <p class="text-sm text-gray-500">Noch in Arbeit...</p>
          </div>
        </div>
      </UCard>
    </div>
    
    <UAlert
      icon="i-heroicons-information-circle"
      color="primary"
      variant="soft"
      title="Tipp"
      description="Alle Daten werden lokal auf deinem Rechner gespeichert. Vergiss nicht, regelmäßig ein Backup der teacher.db Datei zu machen!"
    />
  </div>
</template>

<script setup lang="ts">
// Keine spezielle Logik nötig, Nuxt navigiert automatisch
</script>