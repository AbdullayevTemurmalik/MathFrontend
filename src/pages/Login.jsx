import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Lock, ArrowRight, Stars } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendTelegramMessage } from '../api/telegram';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanUsername = formData.username.trim();
      const isPhone = cleanUsername.startsWith('+');
      const payload = {
        phone: isPhone ? cleanUsername : '',
        username: !isPhone ? cleanUsername : '',
        password: formData.password.trim()
      };
      
      const { data } = await api.post('/auth/login', payload);
      
      if (data.success) {
        // Agar backenddan kelgan user admin bo'lmasa, lekin login 'admin' bo'lsa - majburiy admin qilish (Siz uchun)
        const userData = (formData.username === 'admin') 
          ? { ...data.data, role: 'admin' } 
          : data.data;

        login(userData, data.token);
        toast.success('Xush kelibsiz!');
      }
    } catch (err) {
      // Emergency bypass: Agar backend o'chiq bo'lsa ham admin kirishi uchun
      if (formData.username === 'admin' && formData.password === 'admin123') {
        const fallbackAdmin = { _id: 'admin', first_name: 'Admin', last_name: 'Panel', username: 'admin', role: 'admin' };
        login(fallbackAdmin, 'emergency-token');
        toast.success('Admin (Emergency Mode) sifatida kirdingiz!');
      } else {
        toast.error(err.response?.data?.message || 'Kirishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#02040a]">
      {/* Ultimate Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 animate-pulse-slow opacity-50"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop')` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#02040a] via-[#02040a]/40 to-[#02040a]" />

      {/* Floating Light Rays */}
      <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="relative group">
          {/* Glowing Border Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-[#0d1117]/80 backdrop-blur-3xl border border-white/10 p-10 md:p-12 rounded-[3rem] shadow-2xl">
            <div className="text-center mb-10">
              <motion.div 
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              >
                <Stars className="text-white w-10 h-10" />
              </motion.div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                MATH TEST
              </h1>
              <p className="text-slate-400 font-medium tracking-wide">KOSMIK BILIMLAR MAYDONI</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type="text"
                    required
                    placeholder="Login yoki Telefon"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-lg"
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Parol"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-lg"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(59,130,246,0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-5 rounded-2xl font-black text-white text-xl shadow-xl transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>PARVOZ QILISH <ArrowRight className="w-6 h-6" /></>
                )}
              </motion.button>
            </form>

            <div className="mt-10 text-center border-t border-white/5 pt-10">
              <p className="text-slate-500 text-sm mb-4 tracking-widest uppercase font-bold">Akkountingiz yo'qmi?</p>
              <Link to="/register" className="relative inline-flex items-center gap-2 text-white font-black hover:text-blue-400 transition-colors group">
                RO'YXATDAN O'TISH
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.1) opacity(0.4); }
          50% { transform: scale(1.15) opacity(0.5); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
