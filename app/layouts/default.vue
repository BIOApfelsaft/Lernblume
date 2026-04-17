<template>
  <div class="flex h-screen bg-gray-100">
    <aside class="w-64 bg-white border-r shadow-sm">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-primary-600">Lernblume</h2>
      </div>
      <nav class="mt-4 px-4 space-y-2 text-primary-600">
        <NuxtLink to="/" class="block p-2 rounded hover:bg-gray-100">Dashboard</NuxtLink>
        <NuxtLink to="/students" class="block p-2 rounded hover:bg-gray-100">Schüler & Klassen</NuxtLink>
        <NuxtLink to="/grading" class="block p-2 rounded hover:bg-gray-100">Leistungen</NuxtLink>
        <NuxtLink to="/config" class="block p-2 rounded hover:bg-gray-100">Konfiguration</NuxtLink>
      </nav>
    </aside>

    <main class="flex-1 overflow-y-auto p-8">
      <slot />
    </main>
  </div>
</template>