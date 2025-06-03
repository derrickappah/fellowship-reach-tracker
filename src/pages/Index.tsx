import React, { useState } from 'react';
import { ChurchProvider, useChurch } from '@/context/ChurchContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { InviteeForm } from '@/components/invitees/InviteeForm';
import { Button } from '@/components/ui/button';
import { 
  Church, 
  Users, 
  Group, 
  User, 
  BarChart3, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AppContent = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useChurch();

  if (!currentUser) {
    return <LoginForm onLogin={() => setCurrentSection('dashboard')} />;
  }

  const navigation = [
    { name: 'Dashboard', icon: Church, id: 'dashboard', roles: ['admin', 'fellowship_leader', 'member'] },
    { name: 'Register Invitee', icon: User, id: 'invitees', roles: ['admin', 'fellowship_leader', 'member'] },
    { name: 'Reports', icon: BarChart3, id: 'reports', roles: ['admin', 'fellowship_leader', 'member'] },
    { name: 'Manage Groups', icon: Group, id: 'groups', roles: ['admin', 'fellowship_leader'] },
    { name: 'Manage Members', icon: Users, id: 'members', roles: ['admin', 'fellowship_leader'] },
    { name: 'Manage Fellowships', icon: Church, id: 'fellowships', roles: ['admin'] },
    { name: 'Manage Cells', icon: Group, id: 'cells', roles: ['admin'] },
  ];

  const availableNavigation = navigation.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const handleLogout = () => {
    logout();
    setCurrentSection('dashboard');
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentSection} />;
      case 'invitees':
        return <InviteeForm />;
      case 'reports':
        return (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Reports Coming Soon</h2>
            <p className="text-gray-600">Detailed analytics and reports will be available here.</p>
          </div>
        );
      case 'groups':
        return (
          <div className="text-center py-12">
            <Group className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Group Management</h2>
            <p className="text-gray-600">Create and manage outreach groups here.</p>
          </div>
        );
      case 'members':
        return (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Member Management</h2>
            <p className="text-gray-600">View and manage church members here.</p>
          </div>
        );
      case 'fellowships':
        return (
          <div className="text-center py-12">
            <Church className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Fellowship Management</h2>
            <p className="text-gray-600">Create and manage fellowships here.</p>
          </div>
        );
      case 'cells':
        return (
          <div className="text-center py-12">
            <Group className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Cell Management</h2>
            <p className="text-gray-600">Create and manage cell groups here.</p>
          </div>
        );
      default:
        return <Dashboard onNavigate={setCurrentSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Church Management</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          {availableNavigation.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {currentUser.role.replace('_', ' ')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {availableNavigation.find(item => item.id === currentSection)?.name || 'Dashboard'}
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ChurchProvider>
      <AppContent />
    </ChurchProvider>
  );
};

export default Index;
