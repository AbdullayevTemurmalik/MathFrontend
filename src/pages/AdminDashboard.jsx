import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, ArrowLeft, Lock, ShieldCheck, Trash2, AlertTriangle, X, Eye, EyeOff, User, LogOut } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [isLocked, setIsLocked] = useState(() => {
    return sessionStorage.getItem('admin_unlocked') !== 'true';
  });
  const [lockData, setLockData] = useState({ user: '', pass: '' });
  const [showLockPass, setShowLockPass] = useState(false);
  
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(null); // ID of PDF to delete
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isLocked) fetchPdfs();
  }, [isLocked]);

  const fetchPdfs = async () => {
    try {
      const { data } = await api.get('/pdf/all');
      setPdfs(data.innerData);
    } catch (err) {
      toast.error('PDF-larni yuklab bo\'lmadi');
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (lockData.user === 'admin' && lockData.pass === '123456') {
      setIsLocked(false);
      sessionStorage.setItem('admin_unlocked', 'true');
      toast.success('Admin panel ochildi');
    } else {
      toast.error('Login yoki parol noto\'g\'ri');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Faylni tanlang');
    
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      await api.post('/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('PDF muvaffaqiyatli yuklandi!');
      setTitle('');
      setFile(null);
      fetchPdfs();
    } catch (err) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const deletePdf = async (id) => {
    try {
      await api.delete(`/pdf/${id}`);
      toast.success('Muvaffaqiyatli o\'chirildi');
      fetchPdfs();
      setShowConfirm(null);
    } catch (err) {
      toast.error('O\'chirishda xatolik');
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-[#1e293b] p-10 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600/20 p-4 rounded-2xl mb-4">
              <Lock className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Xavfsiz Kirish</h2>
            <p className="text-slate-400 text-sm mt-2 text-center">Admin panelga kirish uchun maxfiy login va parolni kiriting</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input 
              type="text" 
              placeholder="Admin Login" 
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setLockData({ ...lockData, user: e.target.value })}
            />
            <div className="relative">
              <input 
                type={showLockPass ? "text" : "password"} 
                placeholder="Admin Parol" 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-4 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setLockData({ ...lockData, pass: e.target.value })}
              />
              <button 
                type="button"
                onClick={() => setShowLockPass(!showLockPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showLockPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all">Tasdiqlash</button>
            <button type="button" onClick={logout} className="block w-full text-center text-slate-500 text-sm hover:text-red-400 transition-colors">Tizimdan chiqish</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-6 md:p-12 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="w-full lg:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
              <ShieldCheck className="text-blue-500 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" /> 
              <span className="break-all sm:break-normal">Admin Boshqaruvi</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2">Yangi testlar yuklash va bazani yangilash</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <Link to="/admin/users" className="bg-blue-600 hover:bg-blue-500 py-3.5 sm:py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 w-full sm:w-auto text-sm sm:text-base">
              <User className="w-5 h-5 flex-shrink-0" /> <span>Foydalanuvchilar</span>
            </Link>
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 py-3.5 sm:py-3 px-6 rounded-xl border border-red-500/20 font-bold transition-all w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <LogOut className="w-5 h-5 sm:hidden flex-shrink-0" /> Chiqish
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Yuklash qismi */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="lg:col-span-1 bg-[#1e293b] rounded-3xl p-8 border border-slate-700 shadow-xl h-fit"
          >
            <div className="flex items-center gap-4 mb-8">
              <Upload className="text-blue-500 w-6 h-6" />
              <h2 className="text-xl font-bold">PDF Yuklash</h2>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sarlavha</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Test nomi..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Fayl</label>
                <div className="relative group">
                  <input 
                    type="file"
                    required
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-4 flex items-center justify-between overflow-hidden group-hover:border-slate-500 transition-all">
                    <span className="truncate text-slate-500 text-sm">
                      {file ? file.name : 'PDF tanlang'}
                    </span>
                    <FileText className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Yuklash'}
              </button>
            </form>
          </motion.div>

          {/* Ro'yxat qismi */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold mb-6">Yuklangan Testlar ({pdfs.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {pdfs.map((pdf) => (
                <motion.div 
                  key={pdf._id}
                  layout
                  className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-slate-500 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600/10 p-3 rounded-xl">
                      <FileText className="text-blue-500 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{pdf.title}</h3>
                      <p className="text-slate-400 text-sm">{pdf.total_questions || 30} ta savol</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowConfirm(pdf)}
                    className="p-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-[#1e293b] p-8 rounded-[2rem] border border-slate-700 shadow-2xl text-center"
            >
              <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-500 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Rostan ham o'chirmoqchimisiz?</h3>
              <p className="text-slate-400 mb-8">
                <b>"{showConfirm.title}"</b> testi butunlay o'chib ketadi. Buni ortga qaytarib bo'lmaydi.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-xl font-bold transition-all text-white"
                >
                  Yo'q, qolsin
                </button>
                <button 
                  onClick={() => deletePdf(showConfirm._id)}
                  className="flex-1 bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 text-white"
                >
                  Ha, o'chirilsin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Logout Confirmation Modal */}
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
                Rostan ham admin paneldan chiqishni xohlaysizmi?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-xl font-bold transition-all text-white"
                >
                  Yo'q, qolsin
                </button>
                <button 
                  onClick={() => {
                    sessionStorage.removeItem('admin_unlocked');
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

export default AdminDashboard;
