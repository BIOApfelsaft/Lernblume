import Database from '@tauri-apps/plugin-sql';

export async function initDB() {
  try {
    const db = await Database.load('sqlite:teacher.db');

    // ==========================================
    // 1. CREATE TABLES
    // ==========================================

    await db.execute(`
      CREATE TABLE IF NOT EXISTS class (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        schoolyear TEXT,
        is_default BOOLEAN DEFAULT 0,
        CONSTRAINT UC_Class UNIQUE (name, schoolyear)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS student (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth TEXT,
        notes TEXT,
        parent_phone TEXT,
        active BOOLEAN DEFAULT 1,
        FOREIGN KEY(class_id) REFERENCES class(id)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS subject (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS competency (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER,
        description TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY(subject_id) REFERENCES subject(id)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS scale (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS grading_type (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        abbreviation TEXT,
        weight REAL NOT NULL,
        scale_id INTEGER,
        FOREIGN KEY(scale_id) REFERENCES scale(id)
      );
    `);
            
    await db.execute(`
      CREATE TABLE IF NOT EXISTS scale_value (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scale_id INTEGER,
        description TEXT NOT NULL,
        percentage_value REAL NOT NULL,
        sort_order INTEGER NOT NULL,
        FOREIGN KEY(scale_id) REFERENCES scale(id)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER,
        grading_type_id INTEGER,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        max_points REAL,
        FOREIGN KEY(subject_id) REFERENCES subject(id),
        FOREIGN KEY(grading_type_id) REFERENCES grading_type(id)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS performance_evaluation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        performance_id INTEGER,
        student_id INTEGER,
        competency_id INTEGER,
        scale_value_id INTEGER,
        achieved_points REAL,
        is_sick BOOLEAN DEFAULT 0,
        notes TEXT,
        FOREIGN KEY(performance_id) REFERENCES performance(id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES student(id) ON DELETE CASCADE,
        FOREIGN KEY(competency_id) REFERENCES competency(id) ON DELETE SET NULL,
        FOREIGN KEY(scale_value_id) REFERENCES scale_value(id)
      );
    `);

    // ==========================================
    // 2. SEEDING (PREFILLING)
    // ==========================================

    const checkSetup = await db.select('SELECT COUNT(*) as count FROM subject');
    
    // @ts-ignore
    if (checkSetup[0].count === 0) {
      console.log("Initialisiere Datenbank-Seed...");

      // --- SUBJECT SEED ---
      const subjects = [
        { name: 'Mathematik', color: '#3b82f6' }, // blue
        { name: 'Deutsch', color: '#ef4444' }, // red
        { name: 'Sachunterricht', color: '#22c55e' }, // green
        { name: 'Musik', color: '#f472b6' }, // pink
        { name: 'Kunst und Gestalten', color: '#eab308' }, // yellow
        { name: 'Technik und Design', color: '#ca8a04' }, // dark yellow
        { name: 'Religion', color: '#9ca3af' }, // grey
        { name: 'Englisch', color: '#a855f7' }, // purple
        { name: 'Bewegung und Sport', color: '#f97316' } // orange
      ];

      for (const subject of subjects) {
        await db.execute('INSERT INTO subject (name, color) VALUES ($1, $2)', [subject.name, subject.color]);
      }

      // --- SCALE SEED ---
      await db.execute(`INSERT INTO scale (id, name) VALUES (1, 'Noten (1-5)'), (2, 'Mitarbeit SÜ'), (3, 'Selbständige SÜ'), (4, 'Hausübungen')`);
        
      // Values for Grades (1-5)
      await db.execute(`INSERT INTO scale_value (scale_id, description, percentage_value, sort_order) VALUES 
        (1, '1 (Sehr Gut)', 100, 1), (1, '2 (Gut)', 85, 2), (1, '3 (Befriedigend)', 70, 3), (1, '4 (Genügend)', 55, 4), (1, '5 (Nicht Genügend)', 0, 5)`);

      // Values for SÜ (++, +, ~, -)
      await db.execute(`INSERT INTO scale_value (scale_id, description, percentage_value, sort_order) VALUES 
        (2, '++', 100, 1), (2, '+', 75, 2), (2, '~', 50, 3), (2, '-', 0, 4)`);

      // Values for Selbständige SÜ (++ , +, +~, ~, ~-, -)
      await db.execute(`INSERT INTO scale_value (scale_id, description, percentage_value, sort_order) VALUES 
        (3, '++', 100, 1), (3, '+', 85, 2), (3, '+~', 75, 3), (3, '~', 60, 4), (3, '~-', 50, 5), (3, '-', 25, 6)`);

      // Values for HÜ
      await db.execute(`INSERT INTO scale_value (scale_id, description, percentage_value, sort_order) VALUES 
        (4, 'super gemacht', 100, 1), (4, 'gemacht', 100, 2), (4, 'gemacht aber vieles falsch', 100, 3), (4, 'teilweise gemacht', 50, 4), (4, 'fehlt', 0, 5)`);

      // --- GRADING_TYPE SEED ---
      await db.execute(`INSERT INTO grading_type (name, abbreviation, weight, scale_id) VALUES 
        ('Schularbeit/Test', 'SA', 0.30, 1),
        ('Schulübung', 'SÜ', 0.275, 2),
        ('Selbständige SÜ', 's.SÜ', 0.275, 3),
        ('Hausübung', 'HÜ', 0.15, 4)
      `);

      console.log("Datenbank-Seed erfolgreich abgeschlossen!");
    }

    return db;
  } catch (error) {
    console.error("Datenbank-Initialisierungsfehler:", error);
    throw error;
  }
}