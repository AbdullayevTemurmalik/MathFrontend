import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { User, Phone, Lock, ArrowRight, Rocket } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { sendTelegramMessage } from '../api/telegram';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length < 13) return toast.error('Telefon raqamini to\'liq kiriting');
    
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      if (data.success) {
        toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! Iltimos, tizimga kiring.');
        navigate('/login');
        await sendTelegramMessage(
          `🚀 <b>Yangi Parvoz (Ro'yxatdan o'tish)</b>\n\n` +
          `👤 Ism: ${formData.first_name} ${formData.last_name}\n` +
          `📞 Tel: ${formData.phone}\n` +
          `⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#02040a]">
      {/* Ultimate Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 animate-pulse-slow"
        style={{ backgroundImage: `url('/home/temurmalik/.gemini/antigravity/brain/7896899a-7086-45aa-a126-f647a56a4499/ultimate_math_bg_1778925294645.png')` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#02040a] via-[#02040a]/50 to-[#02040a]" />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-xl px-4 my-4"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2.5rem] blur opacity-20 transition duration-1000"></div>

          <div className="relative bg-[#0d1117]/85 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
            <Link 
              to="/login" 
              className="absolute left-6 top-6 text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> ORQAGA
            </Link>

            <div className="text-center mb-6 mt-4">
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-14 h-14 mx-auto mb-4 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)]"
              >
                <Rocket className="text-white w-7 h-7" />
              </motion.div>
              <h1 className="text-3xl font-black text-white mb-1 tracking-tighter uppercase">Yangi Hisob</h1>
              <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">Bilimlar parvozini boshlang</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="text"
                    required
                    placeholder="Ismingiz"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 transition-all text-sm"
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="text"
                    required
                    placeholder="Familiyangiz"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 transition-all text-sm"
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text"
                  required
                  defaultValue="+998"
                  placeholder="Telefon raqami"
                  maxLength={13}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 transition-all text-sm font-mono"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="password"
                  required
                  placeholder="Xavfsiz Parol"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 transition-all text-sm"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-xl font-black text-white text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>RO'YXATDAN O'TISH <ArrowRight className="w-5 h-5" /></>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-slate-500 text-[10px] mb-2 tracking-widest font-bold uppercase">Akkountingiz bormi?</p>
              <Link to="/login" className="text-white font-black text-sm hover:text-purple-400 transition-colors">
                TIZIMGA KIRISH
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.1) opacity(0.4); }
          50% { transform: scale(1.15) opacity(0.6); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 12s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Register;
