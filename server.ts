import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const dbPath = path.resolve(process.cwd(), 'library.db');
console.log(`[Lumina] Database path: ${dbPath}`);
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'librarian', 'student')) NOT NULL DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    year TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    isbn TEXT,
    publisher TEXT,
    edition TEXT,
    language TEXT,
    shelf_number TEXT,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    description TEXT,
    cover_url TEXT,
    date_added DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME NOT NULL,
    return_date DATETIME,
    fine_amount REAL DEFAULT 0,
    status TEXT CHECK(status IN ('issued', 'returned', 'overdue')) DEFAULT 'issued',
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed Initial Admin
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Administrator",
    "admin@lumina.com",
    hashedPassword,
    "admin"
  );
  console.log("Admin seeded: admin@lumina.com / admin123");
}

// Seed Sample Data Helper
function seedSampleData() {
  const bookCount = db.prepare("SELECT COUNT(*) as count FROM books").get() as { count: number };
  const issueCount = db.prepare("SELECT COUNT(*) as count FROM issues").get() as { count: number };
  
  if (bookCount.count < 50 || issueCount.count < 10) {
    if (bookCount.count < 50) {
      console.log("Seeding sample books...");
      const categories = ["Computer Science", "AI & ML", "Cloud Computing", "Data Science", "Fiction", "History", "Engineering", "Mathematics", "Novels", "Cyber Security"];
      for (let i = 1; i <= 100; i++) {
          const cat = categories[Math.floor(Math.random() * categories.length)];
          db.prepare(`INSERT INTO books (book_id, title, author, category, isbn, publisher, edition, language, shelf_number, total_copies, available_copies, description, cover_url) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
            `B${1000 + i}`,
            `${cat} Essentials Vol ${i}`,
            `Author ${i}`,
            cat,
            `978-${Math.floor(Math.random() * 10000000000)}`,
            "Lumina Press",
            "1st Edition",
            "English",
            `S-${Math.floor(Math.random() * 20) + 1}`,
            10,
            10,
            `A comprehensive guide to ${cat}. Suitable for all levels.`,
            `https://picsum.photos/seed/${i}/200/300`
          );
      }

      console.log("Seeding sample students...");
      const depts = ["CS", "IT", "Mechanical", "Electrical", "Civil"];
      for (let i = 1; i <= 30; i++) {
          db.prepare(`INSERT INTO students (student_id, name, department, year, email, phone, address, photo_url)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
            `S${2000 + i}`,
            `Student Name ${i}`,
            depts[Math.floor(Math.random() * depts.length)],
            `${Math.floor(Math.random() * 4) + 1} Year`,
            `student${i}@example.com`,
            `+12345678${i.toString().padStart(2, '0')}`,
            `Campus Hostel Block ${Math.floor(Math.random() * 5) + 1}`,
            `https://i.pravatar.cc/150?u=${i}`
          );
          
          // Also create user accounts for students
          const hashedPassword = bcrypt.hashSync("student123", 10);
          db.prepare("INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
              `Student Name ${i}`,
              `student${i}@example.com`,
              hashedPassword,
              "student"
          );
      }
    }

    console.log("Seeding transactions (issues, returns, fines)...");
    const bookIds = db.prepare("SELECT id FROM books").all() as {id: number}[];
    const studentIds = db.prepare("SELECT id FROM students").all() as {id: number}[];

    for (let i = 0; i < 60; i++) {
        const bookId = bookIds[Math.floor(Math.random() * bookIds.length)].id;
        const studentId = studentIds[Math.floor(Math.random() * studentIds.length)].id;
        
        // Generate dates in the past
        const issueDate = new Date();
        issueDate.setDate(issueDate.getDate() - (Math.floor(Math.random() * 45) + 5));
        
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 14);

        let status = 'issued';
        let returnDate = null;
        let fine = 0;

        const rand = Math.random();
        if (rand < 0.4) { // 40% Returned
            status = 'returned';
            returnDate = new Date(dueDate);
            returnDate.setDate(returnDate.getDate() + (Math.floor(Math.random() * 10) - 5));
            if (returnDate > dueDate) {
                const diff = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
                fine = diff * 5;
            }
        } else if (rand < 0.7) { // 30% Overdue
            const now = new Date();
            if (dueDate < now) {
                status = 'issued'; 
                const diff = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
                fine = diff * 5;
            }
        }

        db.prepare(`INSERT INTO issues (book_id, student_id, issue_date, due_date, return_date, fine_amount, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
            bookId, 
            studentId, 
            issueDate.toISOString(), 
            dueDate.toISOString(), 
            returnDate ? returnDate.toISOString() : null, 
            fine, 
            status
        );

        // Update available copies
        if (status === 'issued') {
            db.prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?").run(bookId);
        }
    }
    console.log("Sample data seeded.");
  }
}

seedSampleData();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "lumina-secret-key-2024";

app.use(cors());
app.use(express.json());

// Request logging middleware for debugging deployment issues
app.use((req, res, next) => {
  const isApi = req.path.startsWith('/api');
  if (!isApi) {
    console.log(`[Lumina] ${req.method} ${req.path}`);
  }
  next();
});

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
        return res.status(403).json({ error: "Require admin or librarian role" });
    }
    next();
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    env: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

app.get("/api/dashboard/stats", authenticateToken, (req, res) => {
  const totalBooks = db.prepare("SELECT SUM(total_copies) as count FROM books").get() as any;
  const issuedBooks = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'issued' OR status = 'overdue'").get() as any;
  const returnedBooks = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'returned'").get() as any;
  const overdueCount = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'issued' AND date(due_date) < date('now')").get() as any;
  const totalStudents = db.prepare("SELECT COUNT(*) as count FROM students").get() as any;
  const totalFines = db.prepare("SELECT SUM(fine_amount) as count FROM issues").get() as any;

  res.json({
    totalBooks: totalBooks.count || 0,
    issuedBooks: issuedBooks.count || 0,
    returnedBooks: returnedBooks.count || 0,
    overdueBooks: overdueCount.count || 0,
    totalStudents: totalStudents.count || 0,
    totalFines: totalFines.count || 0,
    categoryStats: db.prepare("SELECT category, COUNT(*) as count FROM books GROUP BY category").all(),
    recentIssues: db.prepare(`
        SELECT i.*, b.title, s.name as student_name 
        FROM issues i 
        JOIN books b ON i.book_id = b.id 
        JOIN students s ON i.student_id = s.id 
        ORDER BY i.issue_date DESC LIMIT 5
    `).all()
  });
});

// Books CRUD
app.get("/api/books", authenticateToken, (req, res) => {
    const { category, search } = req.query;
    let query = "SELECT * FROM books WHERE 1=1";
    const params: any[] = [];

    if (category) {
        query += " AND category = ?";
        params.push(category);
    }
    if (search) {
        query += " AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)";
        const s = `%${search}%`;
        params.push(s, s, s);
    }

    query += " ORDER BY date_added DESC";
    const books = db.prepare(query).all(...params);
    res.json(books);
});

app.post("/api/books", authenticateToken, isAdmin, (req, res) => {
    const { book_id, title, author, category, isbn, publisher, edition, language, shelf_number, total_copies, description, cover_url } = req.body;
    try {
        const result = db.prepare(`
            INSERT INTO books (book_id, title, author, category, isbn, publisher, edition, language, shelf_number, total_copies, available_copies, description, cover_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(book_id, title, author, category, isbn, publisher, edition, language, shelf_number, total_copies, total_copies, description, cover_url);
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.put("/api/books/:id", authenticateToken, isAdmin, (req, res) => {
    const { title, author, category, isbn, publisher, edition, language, shelf_number, total_copies, description, cover_url } = req.body;
    const { id } = req.params;
    try {
        db.prepare(`
            UPDATE books SET title=?, author=?, category=?, isbn=?, publisher=?, edition=?, language=?, shelf_number=?, total_copies=?, description=?, cover_url=?
            WHERE id=?
        `).run(title, author, category, isbn, publisher, edition, language, shelf_number, total_copies, description, cover_url, id);
        res.json({ message: "Book updated" });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.get("/api/books/:id", authenticateToken, (req, res) => {
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
});

app.delete("/api/books/:id", authenticateToken, isAdmin, (req, res) => {
    db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
    res.json({ message: "Book deleted" });
});

// Students CRUD
app.get("/api/students", authenticateToken, (req, res) => {
    const { search } = req.query;
    let query = "SELECT * FROM students WHERE 1=1";
    const params: any[] = [];
    if (search) {
        query += " AND (name LIKE ? OR student_id LIKE ? OR email LIKE ?)";
        const s = `%${search}%`;
        params.push(s, s, s);
    }
    const students = db.prepare(query).all(...params);
    res.json(students);
});

app.post("/api/students", authenticateToken, isAdmin, (req, res) => {
    const { student_id, name, department, year, email, phone, address, photo_url } = req.body;
    try {
        const result = db.prepare(`
            INSERT INTO students (student_id, name, department, year, email, phone, address, photo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(student_id, name, department, year, email, phone, address, photo_url);
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// Issues & Lending
app.post("/api/issues", authenticateToken, isAdmin, (req, res) => {
    const { book_id, student_id, due_date } = req.body;
    const book: any = db.prepare("SELECT available_copies FROM books WHERE id = ?").get(book_id);
    if (!book || book.available_copies <= 0) {
        return res.status(400).json({ error: "Book not available" });
    }
    const transaction = db.transaction(() => {
        db.prepare("INSERT INTO issues (book_id, student_id, due_date) VALUES (?, ?, ?)").run(book_id, student_id, due_date);
        db.prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?").run(book_id);
    });
    try {
        transaction();
        res.status(201).json({ message: "Book issued successfully" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/return/:issue_id", authenticateToken, isAdmin, (req, res) => {
    const { issue_id } = req.params;
    const issue: any = db.prepare("SELECT * FROM issues WHERE id = ?").get(issue_id);
    if (!issue || issue.status === 'returned') {
        return res.status(400).json({ error: "Invalid issue record" });
    }
    const returnDate = new Date().toISOString();
    let fine = 0;
    const dueDate = new Date(issue.due_date);
    const now = new Date();
    if (now > dueDate) {
        const diffDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
        fine = diffDays * 5; 
    }
    const transaction = db.transaction(() => {
        db.prepare("UPDATE issues SET return_date = ?, fine_amount = ?, status = 'returned' WHERE id = ?").run(returnDate, fine, issue_id);
        db.prepare("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?").run(issue.book_id);
    });
    try {
        transaction();
        res.json({ message: "Book returned", fine });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/api/issues", authenticateToken, (req, res) => {
    const issues = db.prepare(`
        SELECT i.*, b.title, b.book_id as b_id, s.name as student_name, s.student_id as s_id 
        FROM issues i 
        JOIN books b ON i.book_id = b.id 
        JOIN students s ON i.student_id = s.id 
        ORDER BY i.issue_date DESC
    `).all();
    res.json(issues);
});

// Vite middleware setup
async function startServer() {
  const appInstance = app;
  const isProd = process.env.NODE_ENV === "production";
  console.log(`[Lumina] Server starting in ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
  console.log(`[Lumina] Working Directory: ${process.cwd()}`);
  console.log(`[Lumina] __dirname: ${__dirname}`);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    appInstance.use(vite.middlewares);
    console.log("[Lumina] Vite middleware mounted");
  } else {
    // In production, server.cjs is in dist/, index.html is sibling to it
    let distPath = __dirname;
    
    // Check if dist/index.html exists relative to process.cwd() (alternative check)
    const cwdDist = path.join(process.cwd(), 'dist');
    if (path.basename(__dirname) !== 'dist' && require('fs').existsSync(path.join(cwdDist, 'index.html'))) {
      distPath = cwdDist;
    }

    console.log(`[Lumina] Serving static files from: ${distPath}`);
    appInstance.use(express.static(distPath));
    
    appInstance.get('*', (req, res, next) => {
      // Skip API and files with extensions (likely missing assets)
      if (req.path.startsWith('/api') || req.path.includes('.')) return next();
      
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[Lumina] Error serving index.html from ${indexPath}:`, err);
          // Last ditch effort: try relative to cwd
          const secondaryPath = path.join(process.cwd(), 'dist', 'index.html');
          res.sendFile(secondaryPath, (err2) => {
            if (err2) {
               res.status(500).send("Critical error: index.html not found. Deployment mismatch.");
            }
          });
        }
      });
    });
  }

  appInstance.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[Lumina] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
