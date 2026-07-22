import React, { useState, useEffect } from 'react';
import { Book, BookLoan, UserProfile } from '../types';
import { dbService } from '../services/dbService';
import { Modal } from './Modal';
import { 
  BookOpen, Search, Filter, Plus, Clock, CheckCircle2, 
  AlertCircle, Bookmark, ArrowUpRight, RotateCcw, Building2,
  Sparkles, Check, Library, Tag, MapPin
} from 'lucide-react';

interface LibraryViewProps {
  user: UserProfile;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ user }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<BookLoan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-loans' | 'all-loans'>('catalog');

  // Borrow Modal
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [dueDate, setDueDate] = useState<string>('');
  const [borrowing, setBorrowing] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState('');

  // Add Book Modal (Admin/Teacher)
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newCategory, setNewCategory] = useState('Physics');
  const [newQuantity, setNewQuantity] = useState(5);
  const [newLocation, setNewLocation] = useState('Shelf A-1');
  const [addingBook, setAddingBook] = useState(false);

  useEffect(() => {
    // Default due date: 14 days from today
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    setDueDate(defaultDue.toISOString().split('T')[0]);

    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bData, lData] = await Promise.all([
        dbService.getBooks(),
        user.role === 'student' ? dbService.getLoans(user.uid) : dbService.getLoans()
      ]);
      setBooks(bData);
      setLoans(lData);
    } catch (err) {
      console.error("Failed to load library data:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.author.toLowerCase().includes(search.toLowerCase()) ||
                          b.isbn.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const studentActiveLoans = loans.filter(l => l.studentId === user.uid && l.status !== 'returned');
  const myLoanHistory = loans.filter(l => l.studentId === user.uid);

  const handleOpenBorrowModal = (book: Book) => {
    setSelectedBookForBorrow(book);
    setBorrowSuccess('');
  };

  const handleConfirmBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForBorrow) return;

    setBorrowing(true);
    try {
      await dbService.borrowBook(
        selectedBookForBorrow.id,
        user.uid,
        user.name,
        user.rollNo || 'S-100',
        user.classId || 'Class 10',
        dueDate
      );
      setBorrowSuccess(`Successfully borrowed "${selectedBookForBorrow.title}"! Return by ${dueDate}.`);
      await fetchData();
      setTimeout(() => {
        setSelectedBookForBorrow(null);
        setBorrowSuccess('');
      }, 1800);
    } catch (err: any) {
      alert(err.message || "Failed to borrow book");
    } finally {
      setBorrowing(false);
    }
  };

  const handleReturnBook = async (loanId: string) => {
    try {
      await dbService.returnBook(loanId);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to return book");
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor) return;

    setAddingBook(true);
    try {
      await dbService.addBook({
        title: newTitle,
        author: newAuthor,
        isbn: newIsbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        category: newCategory,
        quantity: newQuantity,
        available: newQuantity,
        location: newLocation
      });
      setIsAddBookModalOpen(false);
      setNewTitle('');
      setNewAuthor('');
      setNewIsbn('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to add book");
    } finally {
      setAddingBook(false);
    }
  };

  // Helper for status badge
  const getLoanStatusBadge = (loan: BookLoan) => {
    if (loan.status === 'returned') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" /> Returned
        </span>
      );
    }
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = loan.dueDate < today;
    if (isOverdue || loan.status === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" /> Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        <Clock className="w-3.5 h-3.5" /> Borrowed
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-medium backdrop-blur-md">
              <Library className="w-3.5 h-3.5" />
              <span>Campus Digital Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Library & Resource Hub
            </h1>
            <p className="text-sm text-blue-100 max-w-xl leading-relaxed">
              Explore available textbooks, reference guides, and literature. Borrow items directly and track return dates in real time.
            </p>
          </div>

          {/* User Quick Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 min-w-[120px]">
              <span className="text-[11px] text-blue-200 uppercase font-semibold block tracking-wider">
                Total Catalog
              </span>
              <span className="text-2xl font-bold font-display">{books.length} Books</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 min-w-[120px]">
              <span className="text-[11px] text-blue-200 uppercase font-semibold block tracking-wider">
                {user.role === 'student' ? 'My Active Loans' : 'Total Issued Loans'}
              </span>
              <span className="text-2xl font-bold font-display">
                {user.role === 'student' ? studentActiveLoans.length : loans.filter(l => l.status === 'borrowed').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Book Catalog</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20 text-current font-bold">
              {books.length}
            </span>
          </button>

          {user.role === 'student' && (
            <button
              onClick={() => setActiveTab('my-loans')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === 'my-loans'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>My Borrowed Items</span>
              {studentActiveLoans.length > 0 && (
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                  {studentActiveLoans.length}
                </span>
              )}
            </button>
          )}

          {(user.role === 'admin' || user.role === 'teacher') && (
            <button
              onClick={() => setActiveTab('all-loans')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === 'all-loans'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>All Student Loans</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                {loans.length}
              </span>
            </button>
          )}
        </div>

        {(user.role === 'admin' || user.role === 'teacher') && (
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        )}
      </div>

      {/* CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by book title, author, or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Book Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No books found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Try adjusting your search query or selected category filter to discover titles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const isAvailable = book.available > 0;
                const userAlreadyBorrowed = studentActiveLoans.some(l => l.bookId === book.id);

                return (
                  <div
                    key={book.id}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Top Header: Category & Location */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50">
                          <Tag className="w-3 h-3" /> {book.category}
                        </span>
                        {book.location && (
                          <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {book.location}
                          </span>
                        )}
                      </div>

                      {/* Title & Author */}
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          by <span className="text-slate-700 dark:text-slate-300">{book.author}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stock & Action Bar */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Availability</div>
                        <div className={`text-xs font-bold mt-0.5 ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {isAvailable ? `${book.available} / ${book.quantity} copies` : 'Out of Stock'}
                        </div>
                      </div>

                      {user.role === 'student' ? (
                        userAlreadyBorrowed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                            <Check className="w-3.5 h-3.5" /> Issued
                          </span>
                        ) : (
                          <button
                            disabled={!isAvailable}
                            onClick={() => handleOpenBorrowModal(book)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isAvailable
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <span>Borrow</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">ISBN: {book.isbn.substring(0, 10)}...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MY LOANS VIEW (STUDENT) */}
      {activeTab === 'my-loans' && user.role === 'student' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-600" />
              <span>Your Currently Borrowed Books</span>
            </h2>

            {myLoanHistory.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  You haven't borrowed any books from the library yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Book Title</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Borrow Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {myLoanHistory.map((loan) => (
                      <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {loan.bookTitle}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {loan.bookAuthor}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs font-mono">
                          {loan.borrowDate}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 dark:text-slate-200 text-xs font-mono font-semibold">
                          {loan.dueDate}
                        </td>
                        <td className="py-3.5 px-4">
                          {getLoanStatusBadge(loan)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {loan.status !== 'returned' && (
                            <button
                              onClick={() => handleReturnBook(loan.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Return Book
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ALL LOANS VIEW (ADMIN / TEACHER) */}
      {activeTab === 'all-loans' && (user.role === 'admin' || user.role === 'teacher') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>All Student Book Loans & Status</span>
            </h2>
          </div>

          {loans.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No loans recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Borrow Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {loan.studentName}
                        <span className="block text-[10px] text-slate-400 font-normal">Roll: {loan.studentRollNo}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                        {loan.classId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        {loan.bookTitle}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        {loan.borrowDate}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {loan.dueDate}
                      </td>
                      <td className="py-3.5 px-4">
                        {getLoanStatusBadge(loan)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {loan.status !== 'returned' && (
                          <button
                            onClick={() => handleReturnBook(loan.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Mark Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONFIRM BORROW MODAL */}
      <Modal
        isOpen={!!selectedBookForBorrow}
        onClose={() => setSelectedBookForBorrow(null)}
        title="Confirm Book Borrowing"
      >
        {selectedBookForBorrow && (
          <form onSubmit={handleConfirmBorrow} className="space-y-4">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{selectedBookForBorrow.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">Author: {selectedBookForBorrow.author}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Category: {selectedBookForBorrow.category} | Location: {selectedBookForBorrow.location}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expected Return Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {borrowSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{borrowSuccess}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBookForBorrow(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={borrowing || !!borrowSuccess}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {borrowing ? 'Borrowing...' : 'Confirm Loan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ADD BOOK MODAL (ADMIN / TEACHER) */}
      <Modal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        title="Add New Book to Library Catalog"
      >
        <form onSubmit={handleAddBook} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Book Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Higher Secondary Physics"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Author Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. K. N. Sharma"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category / Subject
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Literature">Literature</option>
                <option value="Biology">Biology</option>
                <option value="Social Studies">Social Studies</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ISBN Number
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={newIsbn}
                onChange={(e) => setNewIsbn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Copies
              </label>
              <input
                type="number"
                min="1"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Shelf Location
              </label>
              <input
                type="text"
                placeholder="e.g. Shelf A-3"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddBookModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingBook}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {addingBook ? 'Adding...' : 'Add Book to Catalog'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
