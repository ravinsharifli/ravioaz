
import React from 'react';
import { Heart, Gift, Zap } from 'lucide-react';
import { COLORS } from '../constants';

const PromoBanners: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 100% Top Banner: Black Friday */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white p-12 group cursor-pointer transition-transform hover:scale-[1.005]">
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="bg-[#FF8C00] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
            Məhdud Zaman
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter">
            BLACK <span className="text-[#FF8C00]">FRIDAY</span>
          </h2>
          <p className="text-2xl sm:text-3xl font-bold">Bütün məhsullarda <span className="underline decoration-[#FF8C00] decoration-4 underline-offset-8">50% ENDİRİM</span></p>
          <button className="mt-4 bg-white text-black px-10 py-4 rounded-full font-black hover:bg-[#FF8C00] hover:text-white transition-all flex items-center space-x-2 group">
            <span>İndi kəşf et</span>
            <Zap className="h-5 w-5 fill-current" />
          </button>
        </div>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Row containing smaller banners */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* 60% Section: Animal Support */}
        <div className="md:w-[60%] relative overflow-hidden rounded-[2.5rem] bg-[#1A1A1A] text-white p-6 group cursor-pointer transition-transform hover:scale-[1.01] h-[160px]">
          <div className="relative z-20 flex flex-col h-full justify-center space-y-2">
            <div className="flex items-center space-x-2">
              <div className="bg-[#FF8C00] p-1.5 rounded-lg">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] font-semibold tracking-wider text-orange-200 uppercase">Heyvanlara Dəstək</span>
            </div>
            <h2 className="text-xl font-black leading-tight max-w-[200px]">
              Hər alış-verişlə <span className="text-[#FF8C00]">bir cana</span> ümid ol
            </h2>
            <p className="text-gray-400 text-[10px] max-w-[180px] font-medium leading-tight">
              Gəlirimizin 5%-i sahibsiz heyvanlara yönləndirilir.
            </p>
          </div>
          
          <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden pointer-events-none transition-transform group-hover:scale-105 duration-700">
             <div className="relative w-full h-full">
                <img 
                  src="https://placehold.co/600x400/1a1a1a/ff8c00?text=Animal+Support" 
                  alt="Cute Animals" 
                  className="w-full h-full object-cover transition-all duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent"></div>
             </div>
          </div>
        </div>

        {/* 40% Section: 10% Discount */}
        <div className="md:w-[40%] relative overflow-hidden rounded-[2.5rem] bg-orange-50 border border-orange-100 p-6 group cursor-pointer transition-transform hover:scale-[1.01] h-[160px]">
          <div className="relative z-10 flex flex-col h-full justify-center space-y-2">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Gift className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] font-bold text-orange-600 uppercase">Özəl Təklif</span>
            </div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">
              İlk və İkinci Sifarişdə <br/> <span className="text-[#FF8C00]">10%</span> Endirim
            </h2>
            <p className="text-[10px] font-bold text-gray-400 mt-1 italic italic">Sizin üçün ən yaxşısını seçirik</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanners;
