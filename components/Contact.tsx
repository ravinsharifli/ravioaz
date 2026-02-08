
import React from 'react';
import { Phone, Instagram, Mail, MessageCircle, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.36-2.81-.09-.8.19-1.53.64-2.06 1.29-.61.7-.93 1.58-.9 2.5.01.89.35 1.78.94 2.44.61.71 1.46 1.16 2.4 1.28.98.11 1.98-.14 2.73-.78.61-.51.98-1.24 1.05-2.03.01-4.52.01-9.04.01-13.56z" />
  </svg>
);

const Contact: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-16 space-y-4">
        <span className="bg-orange-50 text-[#FF8C00] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Əlaqə & Dəstək</span>
        <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tighter">Sizinlə <span className="text-[#FF8C00]">Həmişə</span> Buradayıq</h1>
        <p className="text-gray-400 font-bold max-w-xl mx-auto">Suallarınız, təklifləriniz və ya sifariş barədə məlumat üçün bizə müraciət edin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Links */}
        <div className="space-y-6">
          <a href="tel:+994519831483" className="flex items-center gap-6 p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all group">
            <div className="bg-orange-50 p-5 rounded-2xl group-hover:bg-[#FF8C00] transition-colors">
              <Phone className="h-8 w-8 text-[#FF8C00] group-hover:text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Bizə Zəng Edin</p>
              <h3 className="text-2xl font-black text-[#1A1A1A]">+994 51 983 14 83</h3>
            </div>
          </a>

          <a href="https://instagram.com/rawio_shop" target="_blank" rel="noreferrer" className="flex items-center gap-6 p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all group">
            <div className="bg-orange-50 p-5 rounded-2xl group-hover:bg-[#FF8C00] transition-colors">
              <Instagram className="h-8 w-8 text-[#FF8C00] group-hover:text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Instagram</p>
              <h3 className="text-2xl font-black text-[#1A1A1A]">@rawio_shop</h3>
            </div>
          </a>

          <a href="https://tiktok.com/@rawio_shop" target="_blank" rel="noreferrer" className="flex items-center gap-6 p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all group">
            <div className="bg-orange-50 p-5 rounded-2xl group-hover:bg-[#FF8C00] transition-colors">
              <TikTokIcon className="h-8 w-8 text-[#FF8C00] group-hover:text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">TikTok</p>
              <h3 className="text-2xl font-black text-[#1A1A1A]">@rawio_shop</h3>
            </div>
          </a>
        </div>

        {/* Commitment & Message */}
        <div className="bg-[#1A1A1A] rounded-[3rem] p-12 text-white flex flex-col justify-center space-y-8 relative overflow-hidden shadow-2xl">
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="h-12 w-12 bg-[#FF8C00] rounded-2xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tight">Səmimi Geri Dönüş Vədi</h2>
              </div>
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                Ravio komandası olaraq bütün müraciətləri özümüz cavablandırırıq. Hər bir mesaj bizim üçün önəmlidir. 
              </p>
              
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-bold">Mütləq bütün müraciətlərə geri dönüş ediləcək.</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <CheckCircle2 className="h-5 w-5 text-gray-600" />
                  <span className="font-bold">WhatsApp üzərindən 24/7 dəstək.</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <CheckCircle2 className="h-5 w-5 text-gray-600" />
                  <span className="font-bold">Sifarişlərin operativ təsdiqlənməsi.</span>
                </div>
              </div>

              <button 
                onClick={() => window.open('https://wa.me/994519831483', '_blank')}
                className="mt-8 bg-[#FF8C00] text-white px-10 py-5 rounded-full font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
              >
                <MessageCircle className="h-6 w-6" />
                <span>İndi Mesaj Yaz</span>
              </button>
           </div>

           {/* Decor */}
           <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-[#FF8C00]/10 rounded-full blur-3xl pointer-events-none" />
           <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Mail className="h-40 w-40" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
