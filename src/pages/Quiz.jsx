import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowRight, ArrowLeft, CheckCircle2, LogOut } from 'lucide-react';
import api from '../api';
import { sendTelegramMessage } from '../api/telegram';
import toast from 'react-hot-toast';

const Quiz = ({ pdfId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(() => {
    return Number(localStorage.getItem(`quiz_idx_${pdfId}`)) || 0;
  });
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem(`quiz_ans_${pdfId}`);
    return saved ? JSON.parse(saved) : {};
  });
  
  // Har bir savol uchun 3 daqiqa (180 sekund)
  const [questionTime, setQuestionTime] = useState(() => {
    const saved = localStorage.getItem(`quiz_q_time_${pdfId}`);
    return saved ? Number(saved) : 180;
  });
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await api.post('/test/start', { pdf_id: pdfId });
        setQuestions(data.data);
      } catch (err) {
        toast.error('Savollarni yuklab bo\'lmadi');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [pdfId]);

  // Savol o'zgarganda timerni qayta tushirish (faqat agar yangi savol bo'lsa)
  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setQuestionTime(180);
      localStorage.setItem(`quiz_q_time_${pdfId}`, 180);
    } else {
      handleFinish();
    }
  };

  // Timer mantiqi
  useEffect(() => {
    if (finished || loading) return;

    if (questionTime <= 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setQuestionTime(prev => {
        const next = prev - 1;
        localStorage.setItem(`quiz_q_time_${pdfId}`, next);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTime, finished, loading]);

  // Boshqa ma'lumotlarni saqlash
  useEffect(() => {
    localStorage.setItem(`quiz_idx_${pdfId}`, currentIdx);
    localStorage.setItem(`quiz_ans_${pdfId}`, JSON.stringify(answers));
  }, [currentIdx, answers, pdfId]);

  const handleAnswer = (option) => {
    setAnswers({ ...answers, [currentIdx]: option });
  };

  const handleFinish = async () => {
    setFinished(true);
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Natijalarni hisoblash
    let correct = 0;
    let incorrect = 0;
    
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correct++;
      } else if (answers[index]) {
        incorrect++;
      }
    });

    const skipped = questions.length - (correct + incorrect);
    const percent = Math.round((correct / questions.length) * 100);
    
    // Natijani saqlash (UI uchun)
    setResult({ correct, incorrect, skipped, percent });

    await sendTelegramMessage(
      `🏆 <b>TEST NATIJASI</b>\n\n` +
      `👤 Foydalanuvchi: ${user.first_name} ${user.last_name}\n` +
      `📞 Tel: ${user.phone || user.username}\n\n` +
      `✅ To'g'ri: ${correct}\n` +
      `❌ Noto'g'ri: ${incorrect}\n` +
      `⚪️ Belgilanmagan: ${skipped}\n` +
      `📊 Natija: <b>${percent}%</b>\n` +
      `⏰ Holat: Test yakunlandi`
    );

    // Tozalash
    localStorage.removeItem(`quiz_idx_${pdfId}`);
    localStorage.removeItem(`quiz_ans_${pdfId}`);
    localStorage.removeItem(`quiz_q_time_${pdfId}`);
    localStorage.removeItem('active_pdf_id');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    localStorage.removeItem('active_pdf_id');
    window.location.reload();
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Yuklanmoqda...</div>;

  if (finished && result) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-[#1e293b] p-10 rounded-[2.5rem] border border-slate-700 max-w-lg w-full shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-2">Test Yakunlandi!</h2>
          <p className="text-slate-400 mb-10">Natijalar Telegram botiga yuborildi</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
              <span className="text-3xl font-bold text-green-500">{result.correct}</span>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">To'g'ri</p>
            </div>
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
              <span className="text-3xl font-bold text-red-500">{result.incorrect}</span>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Noto'g'ri</p>
            </div>
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
              <span className="text-3xl font-bold text-slate-400">{result.skipped}</span>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">O'tkazilgan</p>
            </div>
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
              <span className="text-3xl font-bold text-blue-500">{result.percent}%</span>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Umumiy Ball</p>
            </div>
          </div>

          <button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95">
            Bosh sahifaga qaytish
          </button>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <button onClick={handleExit} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
          <div className="flex items-center gap-4">
            <div className={`bg-[#1e293b] px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 ${questionTime < 30 ? 'animate-pulse border-red-500' : ''}`}>
              <Timer className={`w-5 h-5 ${questionTime < 30 ? 'text-red-500' : 'text-blue-500'}`} />
              <span className={`font-mono text-xl ${questionTime < 30 ? 'text-red-500' : 'text-white'}`}>{formatTime(questionTime)}</span>
            </div>
          </div>
          <div className="text-slate-400 font-medium">
            Savol {currentIdx + 1} / {questions.length}
          </div>
        </header>

        <div className="w-full bg-[#1e293b] h-2 rounded-full mb-12 overflow-hidden">
          <motion.div 
            className="bg-blue-600 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[#1e293b] rounded-3xl p-10 border border-slate-700 shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-10 leading-relaxed">{q?.text}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q?.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleAnswer(opt.label)}
                  className={`p-6 rounded-2xl text-left border-2 transition-all flex items-center gap-4 ${
                    answers[currentIdx] === opt.label 
                      ? 'bg-blue-600/20 border-blue-600 text-white' 
                      : 'bg-[#0f172a] border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    answers[currentIdx] === opt.label ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {opt.label}
                  </span>
                  <span className="text-lg">{opt.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-between">
          <button 
            disabled={currentIdx === 0}
            onClick={() => {
              setCurrentIdx(prev => prev - 1);
              setQuestionTime(180);
              localStorage.setItem(`quiz_q_time_${pdfId}`, 180);
            }}
            className="px-8 py-4 rounded-2xl font-bold flex items-center gap-2 border border-slate-700 hover:bg-[#1e293b] disabled:opacity-0 transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> Oldingisi
          </button>
          
          <button 
            onClick={handleNextQuestion}
            className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            {currentIdx === questions.length - 1 ? 'Tugatish' : 'Keyingisi'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
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
                Rostan ham testdan chiqishni xohlaysizmi? Jarayon saqlanadi.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-xl font-bold transition-all text-white"
                >
                  Yo'q, qolsin
                </button>
                <button 
                  onClick={confirmExit}
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

export default Quiz;
