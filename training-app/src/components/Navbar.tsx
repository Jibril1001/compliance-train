import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { User } from '../types';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  let user: Partial<User> = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-indigo-600">ComplianceApp</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              {i18n.language === 'en' ? 'ES' : 'EN'}
            </button>
            {user.email && (
              <>
                <span className="text-gray-700 text-sm font-medium">{user.email} ({t(user.role ?? '')})</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('logout')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
