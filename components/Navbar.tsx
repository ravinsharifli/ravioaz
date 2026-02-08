
import React from 'react';
import { ShoppingCart, Phone, Users, PackageCheck } from 'lucide-react';
import { COLORS } from '../constants';

interface NavbarProps {
  cartCount: number;
  onLogoClick: () => void;
  onCartClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
  onDeliveryClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onLogoClick, 
  onCartClick, 
  onAboutClick, 
  onContactClick,
  onDeliveryClick
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <button 
            onClick={onLogoClick}
            className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity outline-none"
          >
            <span className="text-3xl font-black tracking-tighter" style={{ color: COLORS.secondary }}>
              RA<span style={{ color: COLORS.primary }}>VIO</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={onAboutClick} className="text-sm font-bold text-gray-500 hover:text-[#FF8C00] transition-colors flex items-center gap-2">
              <Users className="h-4 w-4" /> Haqqımızda
            </button>
            <button onClick={onDeliveryClick} className="text-sm font-bold text-gray-500 hover:text-[#FF8C00] transition-colors flex items-center gap-2">
              <PackageCheck className="h-4 w-4" /> Hazırlanma & Çatdırılma
            </button>
            <button onClick={onContactClick} className="text-sm font-bold text-gray-500 hover:text-[#FF8C00] transition-colors flex items-center gap-2">
              <Phone className="h-4 w-4" /> Əlaqə
            </button>
          </div>

          {/* Right Menu Icons */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button 
              onClick={onCartClick}
              aria-label="Səbət"
              className="relative p-3 rounded-2xl text-gray-500 hover:text-[#FF8C00] hover:bg-orange-50 transition-all duration-300"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 bg-black text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
