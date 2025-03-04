
import React from 'react';
import { Menu } from 'lucide-react';
import { DialogTrigger } from "@/components/ui/dialog";

const MenuButton: React.FC = () => {
  return (
    <DialogTrigger asChild>
      <button 
        className="p-2 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
    </DialogTrigger>
  );
};

export default MenuButton;
