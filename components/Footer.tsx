import React from 'react';
import { Instagram, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.36-2.81-.09-.8.19-1.53.64-2.06 1.29-.61.7-.93 1.58-.9 2.5.01.89.35 1.78.94 2.44.61.71 1.46 1.16 2.4 1.28.98.11 1.98-.14 2.73-.78.61-.51.98-1.24 1.05-2.03.01-4.52.01-9.04.01-13.56z" />
  </svg>
);

interface FooterProps {
  onReviewsClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onReviewsClick }) => {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <img 
              src="/ravio-logo.jpeg" 
              alt="Ravio.az" 
              className="h-14 w-auto object-contain"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Azərbaycanın ən minimalist və premium alış-veriş platforması. Ravio ilə həm tərzini tamamla, həm də sahibsiz heyvanlara dəstək ol.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/ravio.az" 
                target="_blank" 
                rel="noreferrer" 
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#FF8C00] transition-colors outline-none"
                title="Instagram: @ravio.az"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://tiktok.com/@ravio.az" 
                target="_blank" 
                rel="noreferrer" 
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#FF8C00] transition-colors outline-none"
                title="TikTok: @ravio.az"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold mb-6">Müştəri Rəyləri</h4>
            <button 
              onClick={onReviewsClick}
              className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition-all w-full text-left group outline-none"
            >
              <div className="bg-[#FF8C00] p-3 rounded-2xl shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-white mb-0.5">Müştəri Geri Dönüşləri</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-orange-400 transition-colors">Daha ətraflı baxın &rarr;</p>
              </div>
            </button>
            <div className="pt-2">
              <p className="text-xs text-gray-500 font-medium italic">"Sizin məmnuniyyətiniz bizim üçün ən böyük mükafatdır."</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold mb-6">Əlaqə</h4>
            <div className="flex items-center space-x-3 text-gray-400 text-sm">
              <Phone className="h-5 w-5 text-[#FF8C00]" />
              <span className="font-bold">+994 51 983 14 83</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-400 text-sm">
              <Mail className="h-5 w-5 text-[#FF8C00]" />
              <span className="font-bold">info@ravio.az</span>
            </div>
            <div className="flex items-start space-x-3 text-gray-400 text-sm">
              <MapPin className="h-5 w-5 text-[#FF8C00] mt-1" />
              <span className="font-bold">Bakı, Azərbaycan</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p className="font-medium">© 2025 Ravio.az. Bütün hüquqlar qorunur.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="font-black text-gray-400 tracking-widest">@RAVIO.AZ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;