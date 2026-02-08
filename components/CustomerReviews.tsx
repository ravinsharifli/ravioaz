
import React from 'react';
import { Star, MessageSquare, Quote, Sparkles, Heart } from 'lucide-react';

const reviews = [
  {
    name: "Leyla M.",
    rating: 5,
    text: "Məhsulun keyfiyyəti gözlədiyimdən daha yaxşıdır. Paketləmə çox zərif və premium idi. Təşəkkürlər Ravio!",
    date: "12 Mart 2024"
  },
  {
    name: "Anar Q.",
    rating: 5,
    text: "Heyvanlara dəstək olmağınız ən böyük motivasiyam idi. Aksesuar isə mükəmməl hazırlanıb, lazer yazı çox dəqiqdir.",
    date: "05 Aprel 2024"
  },
  {
    name: "Səbinə R.",
    rating: 5,
    text: "Sürətli çatdırılma və çox nəzakətli xidmət. Hər kəsə tövsiyə edirəm. Hədiyyəlik bağlama xüsusilə xoşuma gəldi.",
    date: "20 May 2024"
  },
  {
    name: "Elvin T.",
    rating: 4,
    text: "Məhsul əladır, sadəcə kuryer bir az gecikdi. Amma ümumilikdə xidmətdən çox razıyam, keyfiyyət yerindədir.",
    date: "02 İyun 2024"
  },
  {
    name: "Nigar S.",
    rating: 3,
    text: "Dizaynı bəyəndim, lakin rəngi fotodakından bir az fərqli gəldi. Yenə də pis deyil, gündəlik istifadə üçün uyğundur.",
    date: "15 İyun 2024"
  }
];

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          className={`h-4 w-4 ${s <= rating ? 'fill-[#FF8C00] text-[#FF8C00]' : 'text-gray-200'}`} 
        />
      ))}
    </div>
  );
};

const CustomerReviews: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-16 space-y-4">
        <span className="bg-orange-50 text-[#FF8C00] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 w-fit mx-auto">
          <Sparkles className="h-3 w-3" /> Müştəri Səsi
        </span>
        <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tighter">
          Sizin <span className="text-[#FF8C00]">Geri Dönüşləriniz</span>
        </h1>
        <p className="text-gray-400 font-bold max-w-xl mx-auto italic">
          "Bizim üçün ən böyük motivasiya sizin məmnun təbəssümünüzdür."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review, idx) => (
          <div 
            key={idx} 
            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-50 transition-all duration-500 relative group flex flex-col justify-between h-full"
          >
            <div className="absolute -top-4 -left-4 bg-[#FF8C00] p-4 rounded-3xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
               <Quote className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <RatingStars rating={review.rating} />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{review.date}</span>
              </div>
              
              <p className="text-[#1A1A1A] font-bold text-lg leading-relaxed italic">
                "{review.text}"
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-[#FF8C00]">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-[#1A1A1A]">{review.name}</h4>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Təsdiqlənmiş Müştəri</span>
                </div>
              </div>
              {review.rating >= 5 && (
                 <div className="bg-orange-50 p-2 rounded-xl">
                    <Heart className="h-4 w-4 text-[#FF8C00] fill-current" />
                 </div>
              )}
            </div>
          </div>
        ))}

        {/* Call to action card */}
        <div className="bg-[#1A1A1A] p-8 rounded-[3rem] flex flex-col justify-center items-center text-center space-y-6 shadow-2xl relative overflow-hidden group">
           <div className="relative z-10 space-y-4">
              <div className="bg-white/10 p-5 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
                 <MessageSquare className="h-8 w-8 text-[#FF8C00]" />
              </div>
              <h3 className="text-white text-2xl font-black tracking-tight">Öz rəyinizi paylaşın</h3>
              <p className="text-gray-400 text-sm font-medium">Sizin təcrübəniz bizim inkişafımız üçün vacibdir.</p>
              <button 
                onClick={() => window.open('https://instagram.com/rawio_shop', '_blank')}
                className="bg-[#FF8C00] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 transition-all outline-none"
              >
                Rəyini Yaz
              </button>
           </div>
           
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
              <Sparkles className="h-40 w-40 text-white" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
