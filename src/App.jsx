import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UsersList from './pages/UsersList';
import Quiz from './pages/Quiz';
import api from './api';
import { FileText, Play, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const { user, logout } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" />;
  }
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(() => {
    return localStorage.getItem('active_pdf_id') || null;
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (selectedPdf) {
      localStorage.setItem('active_pdf_id', selectedPdf);
    } else {
      localStorage.removeItem('active_pdf_id');
    }
  }, [selectedPdf]);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const { data } = await api.get('/pdf/all');
        setPdfs(data.innerData);
      } catch (err) {
        console.error('PDF-larni yuklab bo\'lmadi');
      }
    };
    fetchPdfs();
  }, []);

  if (selectedPdf) return <Quiz pdfId={selectedPdf} />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 sm:mb-16 gap-6">
          <div className="w-full sm:w-auto">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent break-all sm:break-normal">
              Salom, {user?.first_name}!
            </h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">Bugun qaysi testni topshirmoqchisiz?</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            {user?.role === 'admin' && (
              <Link to="/admin" className="bg-slate-800 px-6 py-3.5 sm:py-3 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" /> <span className="font-bold">Admin Panel</span>
              </Link>
            )}
            <button onClick={() => setShowLogoutConfirm(true)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-6 py-3.5 sm:py-3 rounded-xl border border-red-500/20 font-bold transition-all w-full sm:w-auto flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5 sm:hidden flex-shrink-0" /> Chiqish
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <div key={pdf._id} className="bg-[#1e293b] rounded-3xl p-8 border border-slate-700 group hover:border-blue-500 transition-all">
              <FileText className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">{pdf.title}</h3>
              <p className="text-slate-400 text-sm mb-8">{pdf.total_questions || 30} ta savol • 90 daqiqa</p>
              <button 
                onClick={() => setSelectedPdf(pdf._id)}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all"
              >
                Boshlash <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Confirmation Modal for Users */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-[#1e293b] p-8 rounded-[2rem] border border-slate-700 shadow-2xl text-center"
            >
              <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut className="text-red-500 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Chiqishni tasdiqlaysizmi?</h3>
              <p className="text-slate-400 mb-8">
                Rostan ham tizimdan chiqishni xohlaysizmi?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-xl font-bold transition-all text-white"
                >
                  Yo'q, qolish
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 text-white"
                >
                  Ha, chiqish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Yuklanish tugashini kutamiz
  
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><UsersList /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
