<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Klassen & Schüler</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <UCard class="md:col-span-1">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Klasse wählen</h2>
            <UButton icon="i-heroicons-plus" color="primary" variant="ghost" size="xs" @click="openClassModal()" />
          </div>
        </template>
        
        <div class="space-y-4">
          <USelectMenu 
            v-model="selectedClass" 
            :options="classes" 
            option-attribute="display_name"
            placeholder="Klasse auswählen..."
            @change="loadStudents"
          >
            <template #label>
              <span v-if="selectedClass" class="flex items-center gap-2">
                <UIcon v-if="selectedClass.is_default" name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-500" />
                {{ selectedClass.display_name }}
              </span>
              <span v-else>Klasse auswählen...</span>
            </template>
            <template #option="{ option: classItem }">
              <span class="flex items-center gap-2">
                <UIcon v-if="classItem.is_default" name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-500" />
                {{ classItem.display_name }}
              </span>
            </template>
          </USelectMenu>

          <div v-if="selectedClass" class="flex gap-2 pt-2 border-t dark:border-gray-700">
            <UButton icon="i-heroicons-pencil" color="gray" variant="ghost" size="xs" @click="openClassModal(selectedClass)">
              Klasse bearbeiten
            </UButton>
            <UButton 
              v-if="!selectedClass.is_default"
              icon="i-heroicons-star" 
              color="yellow" 
              variant="ghost" 
              size="xs" 
              @click="setDefaultClass(selectedClass.id)"
            >
              Als Standard setzen
            </UButton>
            <UButton 
              v-else
              icon="i-heroicons-star-solid" 
              color="yellow" 
              variant="ghost" 
              size="xs" 
              disabled
            >
              Standardklasse
            </UButton>
          </div>

          <UAlert
            v-if="classes.length === 0"
            icon="i-heroicons-information-circle"
            color="primary"
            variant="soft"
            title="Keine Klassen"
            description="Lege über das '+' Symbol oben eine neue Klasse an."
          />
        </div>
      </UCard>

      <UCard class="md:col-span-2" v-if="selectedClass">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Schüler in {{ selectedClass.name }} ({{ students.length }})</h2>
            <UButton icon="i-heroicons-plus" color="primary" variant="soft" @click="openStudentModal()">
              Schüler hinzufügen
            </UButton>
          </div>
        </template>

        <UTable :columns="studentColumns" :rows="students" :loading="pendingStudents">
          <template #notes-data="{ row }">
            <UPopover v-if="row.notes" mode="hover">
              <UButton icon="i-heroicons-information-circle" color="blue" variant="ghost" size="sm" />
              <template #panel>
                <div class="p-3 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 max-w-xs whitespace-pre-wrap rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden">
                  {{ row.notes }}
                </div>
              </template>
            </UPopover>
          </template>

          <template #actions-data="{ row }">
            <div class="flex space-x-1 justify-end">
              <UButton icon="i-heroicons-pencil" color="gray" variant="ghost" size="sm" @click="openStudentModal(row)" />
              <UButton icon="i-heroicons-trash" color="red" variant="ghost" size="sm" @click="deleteStudent(row.id)" />
            </div>
          </template>
        </UTable>
      </UCard>

      <UCard class="md:col-span-2 flex items-center justify-center text-gray-400 dark:text-gray-600" v-else>
        <div class="text-center p-10">
          <UIcon name="i-heroicons-cursor-arrow-rays" class="w-12 h-12 mb-4 mx-auto" />
          Bitte wähle links eine Klasse aus,<br> um Schüler zu verwalten.
        </div>
      </UCard>

    </div>

    <UModal v-model="isClassModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ editingClassId ? 'Klasse bearbeiten' : 'Neue Klasse anlegen' }}</h3>
        </template>
        
        <form @submit.prevent="saveClass" class="space-y-4">
          <UInput v-model="classForm.name" label="Klassenname" placeholder="z.B. 3B" required />
          <UInput v-model="classForm.schoolyear" label="Schuljahr" placeholder="z.B. 2025/26" required />
          
          <div class="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
            <UButton color="gray" variant="ghost" @click="isClassModalOpen = false">Abbrechen</UButton>
            <UButton type="submit" color="primary">Klasse speichern</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <UModal v-model="isStudentModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ editingStudentId ? 'Schüler bearbeiten' : 'Neuen Schüler anlegen' }}</h3>
        </template>
        
        <form @submit.prevent="saveStudent" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UInput v-model="studentForm.first_name" label="Vorname" placeholder="Vorname" required />
            <UInput v-model="studentForm.last_name" label="Nachname" placeholder="Nachname" required />
          </div>
          <UInput v-model="studentForm.date_of_birth" type="date" label="Geburtsdatum" />
          <UInput v-model="studentForm.parent_phone" label="Telefon Eltern" placeholder="0664..." />
          <UTextarea v-model="studentForm.notes" label="Notizen (Allergien etc.)" placeholder="Optionale Infos..." />
          
          <div class="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
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
const totalStudentCount = ref(0);
const pendingStudents = ref(false);

// Modals & Forms State
const isClassModalOpen = ref(false);
const editingClassId = ref<number | null>(null);
const classForm = ref({ name: '', schoolyear: '' });

const isStudentModalOpen = ref(false);
const editingStudentId = ref<number | null>(null);
const studentForm = ref({ first_name: '', last_name: '', date_of_birth: '', parent_phone: '', notes: '' });

const studentColumns = [
    { key: 'first_name', label: 'Vorname' },
    { key: 'last_name', label: 'Nachname' },
  { key: 'parent_phone', label: 'Telefon' },
  { key: 'notes', label: 'Info' },
  { key: 'actions', label: '' }
];

onMounted(async () => {
  db = await getDb();
  await loadClasses();
  
  if (classes.value.length > 0) {
    const defaultClass = classes.value.find(c => c.is_default);
    if (defaultClass) {
      selectedClass.value = defaultClass;
      await loadStudents();
    }
  }
});

// --- METHODS: CLASSES ---
const loadClasses = async () => {
  const result = await db.select('SELECT * FROM class ORDER BY name ASC');
  classes.value = result.map((c: any) => ({
    ...c,
    display_name: `${c.name} (${c.schoolyear})`
  }));
};

const openClassModal = (classItem: any = null) => {
  if (classItem) {
    editingClassId.value = classItem.id;
    classForm.value = { name: classItem.name, schoolyear: classItem.schoolyear };
  } else {
    editingClassId.value = null;
    classForm.value = { name: '', schoolyear: '' };
  }
  isClassModalOpen.value = true;
};

const saveClass = async () => {
  if (!classForm.value.name || !classForm.value.schoolyear) return;
  
  try {
    let newId: number | null = null;
    
    if (editingClassId.value) {
      // Update
      await db.execute('UPDATE class SET name = $1, schoolyear = $2 WHERE id = $3', [classForm.value.name, classForm.value.schoolyear, editingClassId.value]);
      newId = editingClassId.value;
    } else {
      // Create
      const result = await db.execute('INSERT INTO class (name, schoolyear) VALUES ($1, $2)', [classForm.value.name, classForm.value.schoolyear]);
      newId = result.lastInsertId;
    }

    isClassModalOpen.value = false;
    classForm.value = { name: '', schoolyear: '' };
    await loadClasses(); 

    // Auto Load new class
    if (newId) {
      const freshlyCreatedClass = classes.value.find(c => c.id === newId);
      if (freshlyCreatedClass) {
        selectedClass.value = freshlyCreatedClass;
        await loadStudents();
      }
    }

  } catch (error) {
    console.error("Fehler beim Speichern der Klasse:", error);
  }
};

const setDefaultClass = async (classId: number) => {
  try {
    await db.execute('UPDATE class SET is_default = 0');
    await db.execute('UPDATE class SET is_default = 1 WHERE id = $1', [classId]);
    
    await loadClasses();
    if (selectedClass.value && selectedClass.value.id === classId) {
      selectedClass.value = classes.value.find(c => c.id === classId);
    }
  } catch (error) {
    console.error("Fehler beim Setzen der Standardklasse:", error);
  }
};

// --- METHODS: STUDENTS ---
const loadStudents = async () => {
  if (!selectedClass.value) {
    students.value = [];
    return;
  }
  pendingStudents.value = true;
  students.value = await db.select(`
    SELECT * FROM student 
    WHERE class_id = $1 AND active = 1 
    ORDER BY last_name COLLATE NOCASE ASC, first_name COLLATE NOCASE ASC
  `, [selectedClass.value.id]);
  pendingStudents.value = false;
};

const openStudentModal = (studentItem: any = null) => {
  if (studentItem) {
    editingStudentId.value = studentItem.id;
    studentForm.value = { 
      first_name: studentItem.first_name, 
      last_name: studentItem.last_name, 
      date_of_birth: studentItem.date_of_birth, 
      parent_phone: studentItem.parent_phone, 
      notes: studentItem.notes 
    };
  } else {
    editingStudentId.value = null;
    studentForm.value = { first_name: '', last_name: '', date_of_birth: '', parent_phone: '', notes: '' };
  }
  isStudentModalOpen.value = true;
};

const saveStudent = async () => {
  if (!selectedClass.value || !studentForm.value.first_name || !studentForm.value.last_name) return;
  
  try {
    if (editingStudentId.value) {
      // Update
      await db.execute(`
        UPDATE student SET first_name = $1, last_name = $2, date_of_birth = $3, parent_phone = $4, notes = $5 
        WHERE id = $6
      `, [
        studentForm.value.first_name,
        studentForm.value.last_name,
        studentForm.value.date_of_birth,
        studentForm.value.parent_phone,
        studentForm.value.notes,
        editingStudentId.value
      ]);
    } else {
      // Create
      await db.execute(`
        INSERT INTO student (class_id, first_name, last_name, date_of_birth, parent_phone, notes) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        selectedClass.value.id,
        studentForm.value.first_name,
        studentForm.value.last_name,
        studentForm.value.date_of_birth,
        studentForm.value.parent_phone,
        studentForm.value.notes
      ]);
    }

    isStudentModalOpen.value = false;
    studentForm.value = { first_name: '', last_name: '', date_of_birth: '', parent_phone: '', notes: '' };
    await loadStudents();

  } catch (error) {
    console.error("Fehler beim Speichern des Schülers:", error);
  }
};

const deleteStudent = async (studentId: number) => {
  if(confirm("Diesen Schüler wirklich löschen?")) {
    await db.execute('UPDATE student SET active = 0 WHERE id = $1', [studentId]);
    await loadStudents();
  }
};
</script>