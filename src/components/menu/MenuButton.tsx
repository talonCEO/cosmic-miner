import React from 'react';
import { Menu, ShoppingCart } from 'lucide-react';
import { DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MenuButtonProps {
  variant?: 'default' | 'premium';
  onClick?: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ variant = 'default', onClick }) => {
  return (
    <DialogTrigger asChild onClick={onClick}>
      <button 
        className={cn(
          "mt-1 p-2 rounded-md shadow-md transition-colors", // Added mt-1 here
          variant === 'default' 
            ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
            : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-[0_0_15px_rgba(251,191,36,0.3)]"
        )}
        aria-label={variant === 'default' ? "Open menu" : "Open premium store"}
      >
        {variant === 'default' ? (
          <Menu size={20} />
        ) : (
          <ShoppingCart size={20} />
        )}
      </button>
    </DialogTrigger>
  );
};

export default MenuButton;
