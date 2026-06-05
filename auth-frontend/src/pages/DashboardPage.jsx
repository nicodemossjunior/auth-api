import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Button from '../components/Button';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getUserData();
      setUserData(data);
    } catch (err) {
      setError('Failed to fetch user data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getAdminData();
      setAdminData(data);
    } catch (err) {
      setError('Failed to fetch admin data: ' + (err.message || 'Access denied'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Dashboard</h1>
            <p className="text-white/80 text-sm">
              Welcome, {user?.firstName || 'User'}!
            </p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* User Info Card */}
          <div className="card fade-in">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              User Information
            </h3>
            
            {user && (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-white/70 text-sm">Name</span>
                  <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-white/70 text-sm">Email</span>
                  <span className="text-white font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/70 text-sm">ID</span>
                  <span className="text-white font-medium">{user.id || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions Card */}
          <div className="card fade-in" style={{animationDelay: '0.1s'}}>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7m2 0V4l-9 9h7m-7-6v7m7-10v7" />
              </svg>
              API Actions
            </h3>
            
            <div className="space-y-3">
              <Button
                onClick={fetchUserData}
                loading={loading}
                disabled={loading}
                className="btn-full"
              >
                {loading ? 'Fetching...' : 'Fetch User Data'}
              </Button>
              
              <Button
                onClick={fetchAdminData}
                loading={loading}
                disabled={loading}
                variant="outline"
                className="btn-full"
              >
                {loading ? 'Fetching...' : 'Fetch Admin Data'}
              </Button>
            </div>
          </div>
        </div>

        {/* API Response Card */}
        {(userData || adminData || error) && (
          <div className="card md:col-span-2 fade-in" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293L19.586 4.293A1 1 0 0118.879 4H14a2 2 0 00-2 2v3a2 2 0 002 2z" />
              </svg>
              API Response
            </h3>
            
            {error && (
              <div className="alert alert-error mb-4">
                <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {userData && (
              <div className="alert alert-success mb-4">
                <h4 className="font-semibold mb-2">User Data Received:</h4>
                <div className="bg-black/20 rounded p-3 mt-2">
                  <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {adminData && (
              <div className="alert alert-success">
                <h4 className="font-semibold mb-2">Admin Data Received:</h4>
                <div className="bg-black/20 rounded p-3 mt-2">
                  <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono">
                    {JSON.stringify(adminData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
