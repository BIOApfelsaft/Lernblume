<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">Klassen & Schüler</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <UCard class="md:col-span-1">
        <template #header>
          <h2 class="text-lg font-semibold">Klasse wählen</h2>
        </template>
        
        <div class="space-y-4">
          <USelectMenu 
            v-model="selectedClass" 
            :options="classes" 
            option-attribute="display_name"
            placeholder="Klasse auswählen..."
            @change="loadStudents"
          />

          <UDivider label="ODER" class="my-4" />

          <form @submit.prevent="saveClass" class="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 class="text-sm font-medium text-gray-700">Neue Klasse anlegen</h3>
            <UInput v-model="newClass.name" placeholder="z.B. 3B" required />
            <UInput v-model="newClass.schoolyear" placeholder="z.B. 2025/26" required />
            <UButton type="submit" color="primary" block>Klasse speichern</UButton>
          </form>
        </div>
      </UCard>

      <UCard class="md:col-span-2" v-if="selectedClass">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Schüler in {{ selectedClass.name }}</h2>
            <UButton icon="i-heroicons-plus" color="primary" variant="soft" @click="isStudentModalOpen = true">
              Schüler hinzufügen
            </UButton>
          </div>
        </template>

        <UTable :columns="studentColumns" :rows="students">
          <template #notes-data="{ row }">
            <UPopover v-if="row.notes" mode="hover">
            <UButton icon="i-heroicons-information-circle" color="blue" variant="ghost" size="sm" />
              <template #panel>
                <div class="p-3 text-sm text-gray-100 max-w-xs whitespace-pre-wrap">
                {{ row.notes }}
                </div>
              </template>
            </UPopover>
          </template>

          <template #actions-data="{ row }">
            <UButton icon="i-heroicons-trash" color="red" variant="ghost" size="sm" @click="deleteStudent(row.id)" />
          </template>
        </UTable>
      </UCard>

      <UCard class="md:col-span-2 flex items-center justify-center text-gray-400" v-else>
        Bitte wähle links eine Klasse aus, um Schüler zu verwalten.
      </UCard>

    </div>

    <UModal v-model="isStudentModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Neuen Schüler anlegen</h3>
        </template>
        
        <form @submit.prevent="saveStudent" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UInput v-model="newStudent.first_name" label="Vorname" placeholder="Vorname" required />
            <UInput v-model="newStudent.last_name" label="Nachname" placeholder="Nachname" required />
          </div>
          <UInput v-model="newStudent.date_of_birth" type="date" label="Geburtsdatum" />
          <UInput v-model="newStudent.parent_phone" label="Telefon Eltern" placeholder="Telefonnr. Eltern" />
          <UTextarea v-model="newStudent.notes" label="Notizen (Allergien etc.)" placeholder="Optionale Infos..." />
          
          <div class="flex justify-end space-x-2 pt-4">
            <UButton color="gray" variant="ghost" @click="isStudentModalOpen = false">Abbrechen</UButton>
            <UButton type="submit" color="primary">Schüler speichern</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const { getDb } = useDb();
let db: any;

const classes = ref<any[]>([]);
const selectedClass = ref<any | null>(null);
const students = ref<any[]>([]);

const newClass = ref({ name: '', schoolyear: '' });
const isStudentModalOpen = ref(false);
const newStudent = ref({ first_name: '', last_name: '', date_of_birth: '', parent_phone: '', notes: '' });

const studentColumns = [
  { key: 'first_name', label: 'Vorname' },
  { key: 'last_name', label: 'Nachname' },
  { key: 'parent_phone', label: 'Telefon' },
  { key: 'notes', label: 'Info '},
  { key: 'actions', label: '' },
];

onMounted(async () => {
  db = await getDb();
  await loadClasses();
});

const loadClasses = async () => {
  const result = await db.select('SELECT * FROM class ORDER BY name ASC, schoolyear DESC');
  classes.value = result.map((c: any) => ({
    ...c,
    display_name: `${c.name} (${c.schoolyear})`
  }));
};

const saveClass = async () => {
  if (!newClass.value.name) return;
  await db.execute('INSERT INTO class (name, schoolyear) VALUES ($1, $2)', [newClass.value.name, newClass.value.schoolyear]);
  newClass.value = { name: '', schoolyear: '' };
  await loadClasses();
};

const loadStudents = async () => {
  if (!selectedClass.value) return;
  students.value = await db.select('SELECT * FROM student WHERE class_id = $1 AND active = 1 ORDER BY first_name ASC', [selectedClass.value.id]);
};

const saveStudent = async () => {
  if (!selectedClass.value) return;
  
  await db.execute(`
    INSERT INTO student (class_id, first_name, last_name, date_of_birth, parent_phone, notes) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    selectedClass.value.id,
    newStudent.value.first_name,
    newStudent.value.last_name,
    newStudent.value.date_of_birth,
    newStudent.value.parent_phone,
    newStudent.value.notes
  ]);

  isStudentModalOpen.value = false;
  newStudent.value = { first_name: '', last_name: '', date_of_birth: '', parent_phone: '', notes: '' };
  await loadStudents();
};

const deleteStudent = async (studentId: number) => {
  if(confirm("Diesen Schüler wirklich löschen?")) {
    await db.execute('UPDATE student SET active = 0 WHERE id = $1', [studentId]);
    await loadStudents();
  }
};
</script>