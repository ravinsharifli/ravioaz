
import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Cpu, 
  Shirt, 
  Coffee, 
  Scissors, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DeliveryInfoProps {
  onHomeClick?: () => void;
}

const DeliveryInfo: React.FC<DeliveryInfoProps> = ({ onHomeClick }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Section */}
      <div className="text-center mb-20 space-y-4">
        <span className="bg-orange-100 text-[#FF8C00] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Kulis Arxasında</span>
        <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter">
          Zəhmətdən <span className="text-[#FF8C00]">Ünvana</span>
        </h1>
        <p className="text-gray-400 font-bold max-w-2xl mx-auto text-lg leading-relaxed italic">
          "Sizin üçün özəl hazırlanan hər bir məhsul, bizim üçün sadəcə bir sifariş deyil, bir sənət əsəri kimi rəftar görür."
        </p>
      </div>

      {/* Preparation Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {[
          { 
            icon: <Cpu className="h-8 w-8 text-[#FF8C00]" />, 
            title: "Lazer Texnologiyası", 
            desc: "Aksesuarlarınız üzərinə mikron səviyyəsində dəqiqliklə lazer yazı və kəsim işləri aparılır." 
          },
          { 
            icon: <Shirt className="h-8 w-8 text-[#FF8C00]" />, 
            title: "DTF Basqı Sistemi", 
            desc: "Geyim məhsullarınızın rəngləri illərlə solmasın deyə yüksək keyfiyyətli DTF çapdan istifadə olunur." 
          },
          { 
            icon: <Coffee className="h-8 w-8 text-[#FF8C00]" />, 
            title: "Sublim Basqı", 
            desc: "Fincan və keramika məhsullarınızda xüsusi istilik transferi ilə qalıcı və canlı dizaynlar yaradılır." 
          },
          { 
            icon: <Scissors className="h-8 w-8 text-[#FF8C00]" />, 
            title: "Lazer Kəsim", 
            desc: "Taxta və akril materiallar xüsusi komanda tərəfindən lazer kəsim vasitəsilə formaya salınır." 
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-50 hover:-translate-y-2 transition-all group">
            <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF8C00] transition-colors">
              <div className="group-hover:text-white transition-colors">
                {item.icon}
              </div>
            </div>
            <h3 className="text-xl font-black text-[#1A1A1A] mb-3 tracking-tight">{item.title}</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Delivery Logic Section */}
      <div className="flex flex-col lg:flex-row gap-12 items-stretch mb-24">
        {/* Standard Delivery */}
        <div className="flex-1 bg-gray-50 rounded-[3rem] p-12 relative overflow-hidden flex flex-col justify-between">
           <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                 <Clock className="h-8 w-8 text-[#FF8C00]" />
                 <h2 className="text-3xl font-black text-[#1A1A1A]">Mükəmməllik Zaman Alır</h2>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed text-lg">
                Hər bir sifariş fərdi olaraq hazırlanır və xüsusi kuryer tərəfdaşlarımıza təslim edilir. Hazırlanma və çatdırılma prosesi ümumilikdə <b>maksimum 3 iş günü</b> ərzində tamamlanır. 
              </p>
              <div className="bg-white/50 backdrop-blur p-6 rounded-2xl border border-gray-100 space-y-4">
                 <div className="flex items-center gap-4">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-bold text-gray-700">Təhlükəsiz çatdırılma üçün bütün tədbirlər görülür.</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-bold text-gray-700">Hər paketə özəl diqqət və zərif qablaşdırma.</span>
                 </div>
              </div>
           </div>
           <div className="absolute bottom-[-10%] right-[-10%] opacity-5 pointer-events-none">
              <Truck className="h-64 w-64" />
           </div>
        </div>

        {/* Fast Track / VIP Service */}
        <div className="lg:w-[40%] bg-[#1A1A1A] rounded-[3rem] p-12 text-white flex flex-col justify-between shadow-2xl shadow-gray-400 relative overflow-hidden group">
           <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                 <div className="bg-[#FF8C00] p-3 rounded-2xl">
                    <Zap className="h-6 w-6 text-white" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tight italic">Ravio Sürəti</h2>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">
                Zaman sizin üçün hər şeydən önəmlidirsə, biz sizin üçün bir addım öndəyik. 
              </p>
              <p className="text-gray-300 font-bold bg-white/5 p-6 rounded-2xl border border-white/10 italic">
                "Əlavə ödənişlə, sizin sifarişiniz üçün prosesi sürətləndirərək məhsulunuzu ən qısa zamanda qapınıza çatdırırıq."
              </p>
           </div>
           
           <button 
             onClick={onHomeClick}
             className="mt-10 bg-[#FF8C00] text-white py-5 px-10 rounded-full font-black text-lg flex items-center justify-between group-hover:scale-105 transition-all shadow-xl shadow-orange-500/20 outline-none"
           >
              <span>Təcili Sifariş Et</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
           </button>

           <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Sparkles className="h-32 w-32" />
           </div>
        </div>
      </div>

      {/* Final Commitment */}
      <div className="bg-orange-50 p-12 rounded-[4rem] text-center border border-orange-100">
         <h2 className="text-2xl font-black text-[#1A1A1A] mb-4">Sizin Anlayışınız, Bizim Motivasiyamızdır</h2>
         <p className="text-gray-500 font-bold max-w-3xl mx-auto leading-relaxed italic">
           Fabrik istehsalı deyil, fərdi zəhmət seçdiyiniz üçün təşəkkür edirik. Biz hər saniyəni sizin məmnuniyyətiniz üçün dəyərləndiririk.
         </p>
      </div>
    </div>
  );
};

export default DeliveryInfo;
