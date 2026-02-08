
import React from 'react';
import { Heart, GraduationCap, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { COLORS } from '../constants';

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Visual F-Pattern Layout */}
      <div className="relative">
        {/* Top Bar of F: Main Header */}
        <div className="mb-16">
          <span className="inline-flex items-center gap-2 bg-orange-100 text-[#FF8C00] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
             <Sparkles className="h-3 w-3" /> Bizim Hekayəmiz
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter leading-none max-w-3xl">
            Ravio: Üç Tələbənin <br/> <span className="text-[#FF8C00]">Xəyaldan Gerçəyə</span> Addımı.
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Vertical Stem of F: Story Content */}
          <div className="lg:w-[60%] space-y-12">
            <div className="space-y-6">
              <p className="text-xl md:text-2xl font-bold text-gray-600 leading-relaxed italic border-l-8 border-[#FF8C00] pl-8">
                Ravio, sadəcə bir e-ticarət saytı deyil; bu, üç tələbə dostun universitet illərinin çətinliklərini zəhmət və yaradıcılıqla dəf etmə hekayəsidir.
              </p>
              
              <div className="prose prose-lg text-gray-500 font-medium leading-relaxed max-w-none">
                <p>
                  Biz bu yola çıxarkən əsas məqsədimiz həm təhsil xərclərimizi qarşılamaq, həm də qəlbimizdə həmişə var olan bir arzunu - küçə heyvanlarına dəstək olmağı reallaşdırmaq idi. 
                  Minimalist dizayn və premium keyfiyyəti birləşdirərək yaratdığımız hər bir məhsulun arxasında gənclik enerjisi, zərif zövq və böyük bir sosial məsuliyyət dayanır.
                </p>
                <p>
                  Sizin hər bir sifarişiniz bizim üçün sadəcə alış-veriş deyil. Bu, həm bizim təhsilimizə, həm də gəlirimizin 5%-i ilə təmin etdiyimiz sahibsiz heyvanların qidasına və qayğısına uzanan bir ümid körpüsüdür.
                </p>
              </div>
            </div>

            {/* Middle Bar of F: Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#1A1A1A] p-10 rounded-[2.5rem] text-white space-y-4 shadow-2xl hover:-translate-y-2 transition-transform">
                <div className="bg-[#FF8C00] p-3 rounded-2xl w-fit">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Təhsilə Dəstək</h3>
                <p className="text-gray-400 text-sm font-medium">Hər bir uğurumuz gələcək mütəxəssislərin yetişməsinə və təhsil davamlılığına xidmət edir.</p>
              </div>

              <div className="bg-orange-50 border border-orange-100 p-10 rounded-[2.5rem] space-y-4 shadow-xl hover:-translate-y-2 transition-transform">
                <div className="bg-[#FF8C00] p-3 rounded-2xl w-fit">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">Sahibsiz Canlar</h3>
                <p className="text-gray-600 text-sm font-medium">Gəlirimizin 5%-i kimsəsiz heyvanların müalicəsi və qidalanması üçün xüsusi fondlara köçürülür.</p>
              </div>
            </div>
          </div>

          {/* Right/Accidental Focus Area of F */}
          <div className="lg:w-[40%] flex flex-col gap-8">
            <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover" 
                alt="Student Team working" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-10">
                <div className="space-y-2">
                  <h4 className="text-white text-2xl font-black tracking-tight">Biz Birlikdə Güclüyük</h4>
                  <p className="text-orange-200 text-sm font-bold">Ravio Komandası</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] flex items-center gap-6">
               <div className="bg-white p-4 rounded-3xl shadow-sm">
                  <ShieldCheck className="h-8 w-8 text-green-500" />
               </div>
               <div>
                  <h4 className="font-black text-[#1A1A1A] tracking-tight text-lg">Keyfiyyət Təminatı</h4>
                  <p className="text-gray-400 text-xs font-bold leading-relaxed">Hər bir məhsul bizdən sizə çatana qədər 3 mərhələli yoxlamadan keçir.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
