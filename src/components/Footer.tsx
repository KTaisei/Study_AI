import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white py-6 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} StudyAI プランナー. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <a 
              href="#" 
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              プライバシーポリシー
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              利用規約
            </a>
            <a 
              href="#"
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}