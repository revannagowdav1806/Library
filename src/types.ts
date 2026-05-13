export type Role = 'admin' | 'librarian' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Book {
  id: number;
  book_id: string;
  title: string;
  author: string;
  category: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  language?: string;
  shelf_number?: string;
  total_copies: number;
  available_copies: number;
  description?: string;
  cover_url?: string;
  date_added: string;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  department: string;
  year: string;
  email: string;
  phone?: string;
  address?: string;
  photo_url?: string;
}

export interface Issue {
  id: number;
  book_id: number;
  student_id: number;
  issue_date: string;
  due_date: string;
  return_date?: string;
  fine_amount: number;
  status: 'issued' | 'returned' | 'overdue';
  title?: string;
  student_name?: string;
}

export interface DashboardStats {
  totalBooks: number;
  issuedBooks: number;
  returnedBooks: number;
  overdueBooks: number;
  totalStudents: number;
  totalFines: number;
  categoryStats: { category: string; count: number }[];
  recentIssues: Issue[];
}
