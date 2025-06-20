
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { InviteeForm } from '@/components/invitees/InviteeForm';
import { InviteeList } from '@/components/invitees/InviteeList';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { InstallButton } from '@/components/ui/InstallButton';
import { 
  Church, 
  Users, 
  Group, 
  User, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  UserPlus,
  UserCheck,
  Settings,
  Trophy
} from 'lucide-react';
import { Reports } from '@/components/reports/Reports';
import { ManageTeams } from '@/components/teams/ManageTeams';
import { ManageMembers } from '@/components/members/ManageMembers';
import { ManageFellowships } from '@/components/fellowships/ManageFellowships';
import { ManageCells } from '@/components/cells/ManageCells';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { Achievements } from '@/components/achievements/Achievements';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [currentSection, setCurrentSection] = useState(() => {
    return localStorage.getItem('currentSection') || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('currentSection', currentSection);
  }, [currentSection]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  const navigation = [
    { name: 'Dashboard', icon: Church, id: 'dashboard', roles: ['admin', 'fellowship_leader', 'member'] },
    { name: 'Register Invitee', icon: UserPlus, id: 'register-invitee', roles: ['admin', 'fellowship_leader', 'member'] },
    { name: 'Manage Invitees', icon: UserCheck, id: 'manage-invitees', roles: ['admin', 'fellowship_leader', 'member'] },
    { name: 'Achievements', icon: Trophy, id: 'achievements', roles: ['admin', 'fellowship_leader', 'member'] },
    { name: 'Reports', icon: BarChart3, id: 'reports', roles: ['admin', 'fellowship_leader', 'member'] },
    { name: 'Manage Teams', icon: Group, id: 'teams', roles: ['admin', 'fellowship_leader', 'member'] },
    { name: 'Manage Members', icon: Users, id: 'members', roles: ['admin', 'fellowship_leader'] },
    { name: 'Manage Fellowships', icon: Church, id: 'fellowships', roles: ['admin'] },
    { name: 'Manage Cells', icon: Group, id: 'cells', roles: ['admin'] },
  ];

  const availableNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      localStorage.removeItem('currentSection');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate('/auth');
    }
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'register-invitee':
        return <InviteeForm />;
      case 'manage-invitees':
        return <InviteeList />;
      case 'achievements':
        return <Achievements />;
      case 'reports':
        return <Reports />;
      case 'teams':
        return <ManageTeams />;
      case 'members':
        return <ManageMembers />;
      case 'fellowships':
        return <ManageFellowships />;
      case 'cells':
        return <ManageCells />;
      case 'profile-settings':
        return <ProfileSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Church Management</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav key={sidebarOpen ? 'open' : 'closed'} className="flex-1 mt-6 px-3 overflow-y-auto">
          {availableNavigation.map((item, index) => {
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
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span
                  className={sidebarOpen ? 'animate-fade-in' : ''}
                  style={sidebarOpen ? { animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' } : {}}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex-shrink-0 p-4 border-t dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.role.replace('_', ' ')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setCurrentSection('profile-settings');
                setSidebarOpen(false);
              }}
              className="h-8 w-8 flex-shrink-0"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Add InstallButton here */}
          <div className="mb-3">
            <InstallButton />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile - animated slide down */}
        <div className={`sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 lg:hidden flex-shrink-0 transition-all duration-300 ease-in-out transform ${
          sidebarOpen 
            ? 'h-0 -translate-y-full opacity-0' 
            : 'h-16 translate-y-0 opacity-100 animate-slide-down'
        }`}>
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {availableNavigation.find(item => item.id === currentSection)?.name || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-2">
              <InstallButton />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
