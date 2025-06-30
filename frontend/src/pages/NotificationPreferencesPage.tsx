import React from 'react';
import { Link } from 'react-router-dom';
import NotificationPreferencesForm from '../components/features/notifications/NotificationPreferencesForm';
import { PaperCard } from '@/components/ui/shadcn/card';
import { Bell } from 'lucide-react';

const NotificationPreferencesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <PaperCard className="p-6 mb-6">
        <div className="mb-6">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/dashboard" className="text-gray-700 hover:text-primary inline-flex items-center">
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link to="/settings" className="text-gray-700 hover:text-primary">
                    Settings
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Notifications</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex items-center mt-4">
            <Bell className="mr-2 h-7 w-7" />
            <h1 className="text-2xl font-semibold">
              Notification Preferences
            </h1>
          </div>
        </div>
      </PaperCard>
      
      <NotificationPreferencesForm />
    </div>
  );
};

export default NotificationPreferencesPage; 