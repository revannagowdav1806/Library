import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  ArrowRightLeft, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  LayoutDashboard,
  Menu,
  X,
  User as UserIcon,
  ChevronRight,
  Plus,
  BookMarked,
  Download,
  Info,
  Calendar,
  Layers,
  MapPin,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from './api';
import { User, DashboardStats, Book, Student, Issue } from './types';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Login Page Component
const Login = ({ onLogin }: { onLogin: (user: User, token: string) => void }) => {
  const [email, setEmail] = useState('admin@lumina.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
            <BookMarked size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-semibold text-center mb-2 text-gray-900">Lumina Library</h2>
        <p className="text-gray-500 text-center mb-8">Sign in to your account</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
             <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="admin@lumina.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400">
                Lumina Library Management System © 2024
            </p>
        </div>
      </motion.div>
    </div>
  );
};

// Sidebar Layout Component
const Layout = ({ user, onLogout, children }: { user: User, onLogout: () => void, children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Catalog', path: '/catalog' },
    { icon: ArrowRightLeft, label: 'Lending', path: '/lending' },
    { icon: Users, label: 'Members', path: '/members' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 relative",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <BookMarked size={18} />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">Lumina</span>}
        </div>

        <nav className="mt-8 px-3 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                location.pathname === item.path ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-3">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search books, members, issues..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                 <p className="text-xs text-gray-500 capitalize">{user.role}</p>
               </div>
               <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                 <UserIcon size={20} />
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8">
           {children}
        </div>
      </main>
    </div>
  );
};

// Pages
const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        api.get('/dashboard/stats').then(({ data }) => setStats(data));
    }, []);

    if (!stats) return <div className="animate-pulse flex flex-col gap-4">
        <div className="h-32 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-200 rounded-3xl" />)}
        </div>
    </div>;

    const cards = [
        { label: 'Books in Catalog', value: stats.totalBooks, sub: 'Total items in store', color: 'text-indigo-600', icon: BookOpen },
        { label: 'Issued Now', value: stats.issuedBooks, sub: 'Books out with members', color: 'text-amber-600', icon: ArrowRightLeft },
        { label: 'Overdue Items', value: stats.overdueBooks, sub: 'Action required', color: 'text-rose-600', icon: Bell },
        { label: 'Collected Fines', value: `$${stats.totalFines}`, sub: 'Lifetime revenue', color: 'text-emerald-600', icon: BarChart3 },
    ];

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">System Overview</h1>
                    <p className="text-gray-500 text-lg mt-3">Monitoring Lumina Library real-time metrics.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-gray-700">Live Server Status</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {cards.map((card, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={cn("p-4 rounded-2xl", card.color.replace('text-', 'bg-').split('-').slice(0, 2).join('-') + '-50')}>
                                <card.icon size={24} className={card.color} />
                            </div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">+4.2%</span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">{card.label}</p>
                        <p className={cn("text-5xl font-black mb-2 tracking-tighter", card.color)}>{card.value}</p>
                        <p className="text-xs text-gray-400 font-medium">{card.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Recent Transactions</h3>
                        <Link to="/lending" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                            View all <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-mono italic">
                                <tr>
                                    <th className="px-6 py-4">Book</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentIssues.map((issue) => (
                                    <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{issue.title}</td>
                                        <td className="px-6 py-4 text-gray-500">{issue.student_name}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(issue.due_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-semibold",
                                                issue.status === 'returned' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                            )}>
                                                {issue.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-lg mb-6">Library Health</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Utilization Rate</span>
                                <span className="font-bold">{(stats.issuedBooks / stats.totalBooks * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-black transition-all duration-1000" 
                                    style={{ width: `${(stats.issuedBooks / stats.totalBooks * 100)}%` }} 
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Member Growth</span>
                                <span className="font-bold text-green-600">+12.5%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[75%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Catalog = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    const fetchBooks = async () => {
        setLoading(true);
        const { data } = await api.get('/books', { params: { search, category } });
        setBooks(data);
        setLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(fetchBooks, 300);
        return () => clearTimeout(timer);
    }, [search, category]);

    const categories = ["Computer Science", "AI & ML", "Cloud Computing", "Data Science", "Fiction", "History", "Engineering", "Mathematics", "Novels", "Cyber Security"];

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Book Catalog</h1>
                    <p className="text-gray-500 mt-2">Manage and browse the entire library collection.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-black text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-800 transition-all hover:shadow-lg active:scale-95">
                        <Plus size={20} /> Add New Book
                    </button>
                    <button className="border border-gray-200 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-50 transition-all">
                        <Download size={20} /> Export
                    </button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by title, author or ISBN..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select 
                    className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black min-w-[200px] font-medium"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {loading ? [1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-[400px] bg-gray-100 rounded-[2.5rem] animate-pulse" />) : 
                 books.length === 0 ? <div className="col-span-full text-center py-20 text-gray-400">No books found matching your criteria.</div> :
                 books.map((book) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -8 }}
                        key={book.id} 
                        onClick={() => setSelectedBook(book)}
                        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col cursor-pointer group"
                    >
                        <div className="h-64 bg-gray-100 relative overflow-hidden">
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest text-gray-900 border border-white/50 shadow-xl uppercase">
                                {book.category}
                            </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-black">{book.title}</h3>
                            <p className="text-gray-500 text-sm mb-6 flex items-center gap-1.5"><UserIcon size={14} /> {book.author}</p>
                            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inventory</span>
                                    <span className={cn(
                                        "text-sm font-black",
                                        book.available_copies > 0 ? "text-black" : "text-red-500"
                                    )}>
                                        {book.available_copies} / {book.total_copies}
                                    </span>
                                </div>
                                <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Book Detail Modal */}
            <AnimatePresence>
                {selectedBook && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <button 
                                onClick={() => setSelectedBook(null)}
                                className="absolute top-8 right-8 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                                        <img src={selectedBook.cover_url} className="w-full h-full object-cover" alt={selectedBook.title} />
                                    </div>
                                    <div className="bg-gray-50 p-8 rounded-[2rem] flex items-center gap-8 border border-gray-100">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm">
                                            <QRCodeCanvas value={JSON.stringify({ id: selectedBook.book_id, isbn: selectedBook.isbn })} size={100} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><QrCode size={18} /> Asset Identity</h4>
                                            <p className="text-sm text-gray-500 leading-relaxed">Scan this code for quick issue or inventory check in the mobile app.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                                {selectedBook.category}
                                            </span>
                                            <span className="text-gray-400 font-mono text-xs">ISBN: {selectedBook.isbn}</span>
                                        </div>
                                        <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{selectedBook.title}</h2>
                                        <p className="text-xl text-gray-500 font-medium italic">by {selectedBook.author}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-6 rounded-3xl">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className={cn("text-lg font-black", selectedBook.available_copies > 0 ? "text-green-600" : "text-red-500")}>
                                                {selectedBook.available_copies > 0 ? 'INSTOCK' : 'UNAVAILABLE'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Shelf Location</p>
                                            <p className="text-lg font-black text-black flex items-center gap-2">
                                                <MapPin size={18} /> {selectedBook.shelf_number || 'Section A-1'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-gray-600 leading-relaxed">
                                        <div className="flex items-center gap-3">
                                            <Info size={18} className="text-black" />
                                            <span className="font-bold text-black uppercase text-[10px] tracking-widest">About this book</span>
                                        </div>
                                        <p>{selectedBook.description}</p>
                                    </div>

                                    <div className="pt-8 border-t border-gray-100 flex gap-4">
                                        <button className="flex-1 bg-black text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 shadow-xl">
                                            Issue Now
                                        </button>
                                        <button className="px-8 border-2 border-gray-100 py-5 rounded-[1.5rem] font-bold text-gray-700 hover:bg-gray-50 transition-all">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Lending = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [books, setBooks] = useState<Book[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [dueDate, setDueDate] = useState('');

    const fetchData = async () => {
        const [issuesRes, bRes, sRes] = await Promise.all([
            api.get('/issues'),
            api.get('/books'),
            api.get('/students')
        ]);
        setIssues(issuesRes.data);
        setBooks(bRes.data);
        setStudents(sRes.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/issues', { 
                book_id: selectedBook, 
                student_id: selectedStudent, 
                due_date: dueDate 
            });
            setShowIssueModal(false);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to issue book');
        }
    };

    const handleReturn = async (id: number) => {
        try {
            const { data } = await api.post(`/return/${id}`);
            alert(`Book returned! Fine: $${data.fine}`);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to return book');
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Lending & Circulation</h1>
                    <p className="text-gray-500 mt-2">Track book issues, returns, and overdue items.</p>
                </div>
                <button 
                    onClick={() => setShowIssueModal(true)}
                    className="bg-black text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
                >
                    <Plus size={20} /> Issue New Book
                </button>
            </header>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-mono italic">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Book</th>
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Issue Date</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Fine</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={8} className="h-16 bg-gray-50" /></tr>) :
                             issues.map((issue) => (
                                <tr key={issue.id} className="hover:bg-gray-50 transition-colors group text-sm">
                                    <td className="px-6 py-4 font-mono text-gray-400">#ISS-{2000 + issue.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{issue.title}</p>
                                        <p className="text-xs text-gray-400 uppercase tracking-tighter">ID: {issue.book_id}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-700">{issue.student_name}</p>
                                        <p className="text-xs text-gray-400">ID: {issue.student_id}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(issue.issue_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">{new Date(issue.due_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-red-500">
                                        {issue.fine_amount > 0 ? `$${issue.fine_amount.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                            issue.status === 'returned' ? "bg-green-100 text-green-700" : 
                                            issue.status === 'overdue' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {issue.status !== 'returned' && (
                                            <button 
                                                onClick={() => handleReturn(issue.id)}
                                                className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                                            >
                                                Mark Returned
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Issue Modal */}
            <AnimatePresence>
                {showIssueModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Issue Book</h2>
                                <button onClick={() => setShowIssueModal(false)}><X /></button>
                            </div>
                            <form onSubmit={handleIssue} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Book</label>
                                    <select 
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200"
                                        value={selectedBook}
                                        onChange={(e) => setSelectedBook(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose a book...</option>
                                        {books.filter(b => b.available_copies > 0).map(b => (
                                            <option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                                    <select 
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200"
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose a student...</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">Issue Transaction</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Members = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        api.get('/students').then(({ data }) => setStudents(data)).finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">Member Registry</h1>
                    <p className="text-gray-500 text-lg mt-3">Monitor library members and identity verify borrowing rights.</p>
                </div>
                <button 
                    onClick={() => setShowForm(true)}
                    className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all hover:shadow-xl active:scale-95"
                >
                    <Plus size={20} /> Register Member
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? [1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse" />) :
                 students.map((student, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5 }}
                        key={student.id} 
                        className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 -mr-16 -mt-16 rounded-full" />
                        
                        <div className="flex items-center gap-6 relative z-10">
                            <img src={student.photo_url} alt={student.name} className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl" />
                            <div>
                                <h3 className="font-black text-2xl text-gray-900 leading-none mb-2">{student.name}</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{student.department}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ID Ref</p>
                                <p className="text-sm font-mono font-black text-gray-800">{student.student_id}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Year</p>
                                <p className="text-sm font-black text-gray-800 uppercase">{student.year}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 relative z-10 pt-4 border-t border-gray-50">
                            <button className="flex-1 bg-gray-50 text-gray-700 py-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors uppercase tracking-widest">Profile</button>
                            <button className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors uppercase tracking-widest">History</button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Member Form Modal */}
            <AnimatePresence>
                {showForm && (
                     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-2xl relative"
                        >
                            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"><X/></button>
                            <h2 className="text-3xl font-black text-gray-900 mb-8">Register Candidate</h2>
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                        <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Student ID</label>
                                        <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black" placeholder="S2024-001" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Department</label>
                                        <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black">
                                            <option>Computer Science</option>
                                            <option>Physics</option>
                                            <option>Engineering</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Identity</label>
                                        <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black" placeholder="john@university.edu" />
                                    </div>
                                </div>
                                <button className="w-full bg-black text-white py-5 rounded-[1.5rem] font-bold text-lg mt-4 shadow-xl hover:bg-gray-800 transition-all active:scale-95">Register Identity</button>
                            </form>
                        </motion.div>
                     </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Reports = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        api.get('/dashboard/stats').then(({ data }) => setStats(data));
    }, []);

    if (!stats) return null;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-500 mt-2">Generate and view detailed library performance data.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-8">Borrowing Activity</h3>
                    <div className="h-64 flex items-end justify-between gap-4">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="w-full bg-black rounded-t-xl opacity-80 hover:opacity-100 transition-opacity" 
                                />
                                <span className="text-xs text-gray-400 font-mono">Day {i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-8">Category Distribution</h3>
                    <div className="space-y-6">
                        {stats.categoryStats.slice(0, 5).map((cat, i) => {
                            const total = stats.categoryStats.reduce((acc, curr) => acc + curr.count, 0);
                            const percent = Math.round((cat.count / total) * 100);
                            const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-red-500'];
                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium">{cat.category}</span>
                                        <span className="text-gray-400">{percent}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full">
                                        <div className={cn("h-full rounded-full", colors[i % colors.length])} style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-black text-white p-12 rounded-[3rem] flex items-center justify-between overflow-hidden relative">
                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mb-4">Export Performance Data</h2>
                    <p className="text-gray-400 max-w-md">Generate comprehensive PDF reports for last month's library activity including fines and new registrations.</p>
                    <button className="mt-8 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform">
                        Generate PDF Report
                    </button>
                </div>
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                    <BarChart3 size={400} strokeWidth={1} />
                </div>
            </div>
        </div>
    );
};

// Main App Component
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser && token) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to hydrate user session:", e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleLogin = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
            path="/*" 
            element={
                user ? (
                    <Layout user={user} onLogout={handleLogout}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/catalog" element={<Catalog />} />
                            <Route path="/lending" element={<Lending />} />
                            <Route path="/members" element={<Members />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">Library Settings Module under development.</div>} />
                        </Routes>
                    </Layout>
                ) : <Navigate to="/login" />
            } 
        />
      </Routes>
    </Router>
  );
}
