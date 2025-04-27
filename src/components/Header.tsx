import { useState } from 'react';
import { BookOpen, Calendar, MessageSquare, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentView: 'input' | 'schedule' | 'chat';
  onViewChange: (view: 'input' | 'schedule' | 'chat') => void;
  onReset: () => void;
  hasData: boolean;
}

export function Header({ currentView, onViewChange, onReset, hasData }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const NavItem = ({ 
    view, 
    icon: Icon, 
    label 
  }: { 
    view: 'input' | 'schedule' | 'chat'; 
    icon: typeof BookOpen; 
    label: string 
  }) => (
    <button
      onClick={() => {
        onViewChange(view);
        setMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200
        ${currentView === view 
          ? 'bg-blue-100 text-blue-700' 
          : 'hover:bg-gray-100'
        }
        ${!hasData && view !== 'input' ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      disabled={!hasData && view !== 'input'}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={28} />
            <h1 className="text-xl font-bold text-gray-800">StudyAI プランナー</h1>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden rounded-lg p-2 hover:bg-gray-100"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavItem view="input" icon={BookOpen} label="学習情報入力" />
            <NavItem view="schedule" icon={Calendar} label="スケジュール" />
            <NavItem view="chat" icon={MessageSquare} label="AIチャット" />
            {hasData && (
              <button 
                onClick={onReset}
                className="ml-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                リセット
              </button>
            )}
          </nav>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden mt-4 flex flex-col gap-2">
            <NavItem view="input" icon={BookOpen} label="学習情報入力" />
            <NavItem view="schedule" icon={Calendar} label="スケジュール" />
            <NavItem view="chat" icon={MessageSquare} label="AIチャット" />
            {hasData && (
              <button 
                onClick={() => {
                  onReset();
                  setMenuOpen(false);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                リセット
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}