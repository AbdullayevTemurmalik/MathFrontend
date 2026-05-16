import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Trash2, ArrowLeft, Shield, Phone, Calendar, Search, AlertTriangle, LogOut } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      // Backenddan ma'lumot 'data' yoki 'innerData' ichida kelishini tekshiramiz
      const userList = data.data || data.innerData || [];
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      console.error('Foydalanuvchilarni yuklashda xatolik:', err);
      // Faqat real xatolik bo'lsa xabar chiqaramiz
      if (err.response?.status !== 403) {
        toast.error('Foydalanuvchilarni yuklab bo\'lmadi');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('Foydalanuvchi o\'chirildi');
      setUsers(users.filter(u => u._id !== id));
      setShowConfirm(null);
    } catch (err) {
      toast.error('O\'chirishda xatolik');
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.username?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-6 md:p-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <Link to="/admin" className="bg-[#1e293b] p-3 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2 group w-full sm:w-auto">
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">ORQAGA</span>
            </Link>
            <div className="w-full">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
                <User className="text-blue-500 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" /> 
                <span className="break-all sm:break-normal">Foydalanuvchilar</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">Jami talabalar: {users.length}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text"
                placeholder="Qidirish..."
                className="w-full bg-[#1e293b] border border-slate-700 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-6 py-3.5 sm:py-4 rounded-2xl border border-red-500/20 font-bold transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Chiqish
            </button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.div 
                  key={user._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#1e293b] p-6 rounded-[2rem] border border-slate-700 hover:border-blue-500/50 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    {user.role === 'admin' && (
                      <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-500/20">
                        <Shield className="w-3 h-3" /> ADMIN
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2 truncate">{user.first_name} {user.last_name}</h3>
                  
                  <div className="space-y-3 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      {user.phone || user.username}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      Ro'yxatdan o'tdi: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-end">
                    <button 
                      onClick={() => setShowConfirm(user)}
                      className="text-slate-500 hover:text-red-500 transition-all flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Foydalanuvchini o'chirish
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-500">Hech kim topilmadi</div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-md w-full bg-[#1e293b] p-8 rounded-[2rem] border border-slate-700 text-center">
              <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-500 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Rostan ham o'chirmoqchimisiz?</h3>
              <p className="text-slate-400 mb-8">
                <b>{showConfirm.first_name} {showConfirm.last_name}</b> tizimdan butunlay o'chiriladi.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setShowConfirm(null)} className="flex-1 bg-slate-800 py-4 rounded-xl font-bold">Yo'q</button>
                <button onClick={() => deleteUser(showConfirm._id)} className="flex-1 bg-red-600 py-4 rounded-xl font-bold">Ha, o'chirilsin</button>
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
                  Yo'q, qolish
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

export default UsersList;
