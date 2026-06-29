import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiUsers, FiCalendar, 
  FiSettings, FiLogOut, FiMoon, FiSun, 
  FiMenu, FiX, FiChevronRight, FiSearch, FiUser, 
  FiLayers, FiBox, FiUserCheck, FiPlay, FiDollarSign, FiBarChart2, FiBell, FiMessageSquare, FiGift, FiPackage,
  FiTrendingDown, FiActivity
} from 'react-icons/fi';
import { authApi } from '../../api/auth';
import { sessionsApi } from '../../api/sessions';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { canAccessExpenses, canManageOffers, canSeeAnalytics, canSeeCommissions, canManageServices, getCurrentAdminRole, getCurrentAdminUser, isAttendant } from '../../adminAccess';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Create a theme context to share dark mode state with children
export const AdminThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 992 : true
  );
  
  // Initialize theme from localStorage or default to light mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector('.bg-purple');
      if (activeLink) {
        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [location.pathname]);
  const adminRole = getCurrentAdminRole();
  const adminUser = getCurrentAdminUser();

  // Toggle Theme and Persist
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('admin-dark');
      document.body.classList.remove('admin-light');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.body.classList.add('admin-light');
      document.body.classList.remove('admin-dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      setIsSidebarOpen((prev) => (mobile ? false : prev));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { title: 'Overview', icon: <FiHome />, path: '/admin/dashboard' },
    { title: 'Sessions', icon: <FiPlay />, path: '/admin/sessions' },
    { title: 'Appointments', icon: <FiCalendar />, path: '/admin/bookings' },
    { title: 'Staff', icon: <FiUsers />, path: '/admin/staff' },
    { title: 'Members', icon: <FiUserCheck />, path: '/admin/members', hidden: isAttendant(adminRole) },
    { title: 'Services', icon: <FiLayers />, path: '/admin/services', hidden: !canManageServices(adminRole) },
    { title: 'Add-ons', icon: <FiPackage />, path: '/admin/addons', hidden: !canManageServices(adminRole) },
    { title: 'Offers', icon: <FiGift />, path: '/admin/offers', hidden: !canManageOffers(adminRole) },
    { title: 'Rewards', icon: <FiGift />, path: '/admin/rewards' },
    { title: 'Products', icon: <FiBox />, path: '/admin/products' },
    { title: 'Feedback', icon: <FiMessageSquare />, path: '/admin/feedback' },
    { title: 'In-House', icon: <FiHome />, path: '/admin/inhouse-requests' },
    { title: 'Activity Log', icon: <FiActivity />, path: '/admin/activity-logs' },
    { title: 'Commissions', icon: <FiDollarSign />, path: '/admin/commissions', hidden: !canSeeCommissions(adminRole) },
    { title: 'Expenses', icon: <FiTrendingDown />, path: '/admin/expenses', hidden: !canAccessExpenses(adminRole) },
    { title: 'Analytics', icon: <FiBarChart2 />, path: '/admin/analytics', hidden: !canSeeAnalytics(adminRole) },
    { title: 'Settings', icon: <FiSettings />, path: '/admin/settings' },
  ].filter((item) => !item.hidden);

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    authApi.adminLogout();
  };

  const fetchFeedbackNotifications = async () => {
    try {
      const response = await sessionsApi.getFeedbackNotifications(50);
      const payload = response.data?.data || response.data || {};
      setUnreadFeedbackCount(Number(payload.unread_count || 0));
    } catch (error) {
      // Ignore silently to avoid blocking nav header behavior.
    }
  };

  useEffect(() => {
    fetchFeedbackNotifications();
    const timer = setInterval(fetchFeedbackNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AdminThemeContext.Provider value={{ isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode) }}>
      <div className={`admin-portal-wrapper d-flex min-vh-100 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
        {/* Sidebar */}
        <motion.aside 
          animate={
            isMobile
              ? { x: isSidebarOpen ? 0 : -300, width: '280px' }
              : { width: isSidebarOpen ? '280px' : '80px', x: 0 }
          }
          className={`sidebar position-fixed h-100 border-end border-opacity-10 d-flex flex-column z-index-100 ${isDarkMode ? 'bg-black border-white' : 'bg-grey-cool border-dark'}`}
          style={{ zIndex: 1000, transition: 'all 0.3s ease', left: 0, top: 0 }}
        >
          {/* Sidebar Header */}
          <div className="p-4 d-flex align-items-center justify-content-between">
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="d-flex align-items-center gap-2"
                >
                  <img src="/karehspalogo.jpeg" alt="Kareh's Spa" height="32" style={{ objectFit: 'cover', borderRadius: '50%', aspectRatio: '1 / 1' }} />
                  <span className="brand-title h4 m-0 text-gradient fs-5">ADMIN</span>
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`btn p-1 border-0 ${isDarkMode ? 'text-white' : 'text-dark'}`}
            >
              {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav ref={navRef} className="flex-grow-1 px-3 mt-4 overflow-auto custom-scrollbar">
            {menuItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => {
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`nav-item d-flex align-items-center p-3 mb-2 rounded-3 text-decoration-none transition-all ${
                  location.pathname === item.path 
                    ? (isDarkMode ? 'bg-purple text-white shadow-lg' : 'bg-purple text-white shadow') 
                    : (isDarkMode ? 'text-secondary hover-text-white' : 'text-muted hover-text-dark')
                }`}
              >
                <span className="fs-5">{item.icon}</span>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -10 }}
                      className="ms-3 fw-medium"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isSidebarOpen && location.pathname === item.path && (
                  <FiChevronRight className="ms-auto" />
                )}
              </Link>
            ))}
          </nav>

          <div
            className={`px-3 pb-3 pt-2 mt-auto border-top border-opacity-10 ${isDarkMode ? 'border-white' : 'border-dark'}`}
            style={{ position: 'sticky', bottom: 0, background: 'inherit' }}
          >
            <button
              type="button"
              onClick={handleLogout}
              className={`nav-item w-100 d-flex align-items-center p-3 mb-2 rounded-3 border-0 transition-all ${
                isDarkMode ? 'text-danger bg-danger bg-opacity-10' : 'text-danger bg-danger bg-opacity-10'
              }`}
            >
              <span className="fs-5"><FiLogOut /></span>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ms-3 fw-medium"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.aside>

        {isMobile && isSidebarOpen && (
          <div
            className="admin-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.45)',
              zIndex: 999
            }}
          />
        )}

        {/* Main Content Area */}
        <main 
          className="flex-grow-1 p-0 flex-column d-flex vh-100 overflow-hidden"
          style={{ 
            marginLeft: isMobile ? '0px' : (isSidebarOpen ? '280px' : '80px'), 
            transition: 'margin-left 0.3s ease',
            minWidth: 0 
          }}
        >
          {/* Top Header */}
          <header 
            className={`px-4 py-3 border-bottom border-opacity-10 d-flex align-items-center justify-content-between sticky-top ${isDarkMode ? 'bg-black border-white' : 'bg-grey-cool border-dark'}`}
            style={{ zIndex: 900, transition: 'all 0.3s ease', top: 0 }}
          >
            {/* Search Bar */}
            <div className="d-flex align-items-center flex-grow-1 me-2 me-md-4" style={{ maxWidth: isMobile ? '100%' : '400px' }}>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className={`btn p-2 rounded-circle border-0 d-flex align-items-center justify-content-center me-2 ${isDarkMode ? 'hover-bg-white-10 text-white' : 'hover-bg-black-10 text-dark'}`}
                  style={{ width: '40px', height: '40px', flexShrink: 0 }}
                  title="Open menu"
                >
                  <FiMenu />
                </button>
              )}
              <div className="position-relative flex-grow-1">
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="text" 
                  className={`form-control border-0 px-5 py-2 rounded-pill ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark text-opacity-75'}`}
                  placeholder="Search appointments, staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Utility Actions */}
            <div className="d-flex align-items-center gap-1 gap-md-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`btn p-2 rounded-circle border-0 d-flex align-items-center justify-content-center ${isDarkMode ? 'hover-bg-white-10 text-white' : 'hover-bg-black-10 text-dark'}`}
                style={{ width: '40px', height: '40px' }}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? <FiSun /> : <FiMoon />}
              </button>

              <Link
                to="/admin/feedback"
                className={`btn p-2 rounded-circle border-0 d-flex align-items-center justify-content-center position-relative ${isDarkMode ? 'hover-bg-white-10 text-white' : 'hover-bg-black-10 text-dark'}`}
                style={{ width: '40px', height: '40px' }}
                title="Feedback notifications"
              >
                <FiBell />
                {unreadFeedbackCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    {unreadFeedbackCount > 99 ? '99+' : unreadFeedbackCount}
                  </span>
                )}
              </Link>

              <div className={`vr mx-1 mx-md-2 opacity-10 ${isDarkMode ? 'bg-white' : 'bg-dark'}`} style={{ height: '24px' }}></div>

              <div className="d-flex align-items-center gap-3 ms-2">
                <div className="text-end d-none d-md-block">
                  <div className="fw-bold small text-capitalize" style={{ lineHeight: 1 }}>{adminUser?.name || 'Administrator'}</div>
                  <div className="text-secondary text-capitalize" style={{ fontSize: '10px' }}>{adminRole === 'owner' ? 'System Owner' : adminRole}</div>
                </div>
                <div className="dropdown">
                  <button 
                    className={`btn p-1 rounded-pill border-0 d-flex align-items-center ${isDarkMode ? 'text-white' : 'text-dark'}`}
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="bg-purple rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                      <FiUser size={20} />
                    </div>
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-opacity-10 mt-2 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                    <li><h6 className="dropdown-header text-uppercase tracking-widest" style={{ fontSize: '10px' }}>Account</h6></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item d-flex align-items-center py-2" to="/admin/profile"><FiUser className="me-2 text-secondary" /> View Profile</Link></li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item d-flex align-items-center py-2 text-danger"
                        onClick={handleLogout}
                      >
                        <FiLogOut className="me-2" /> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </header>

          <div className="container-fluid py-4 px-md-5 flex-grow-1 overflow-y-auto custom-scrollbar">
            {children}
          </div>

          {/* Admin Footer */}
          <footer className={`px-4 py-2 border-top border-opacity-10 text-center sticky-bottom ${isDarkMode ? 'bg-black text-secondary' : 'bg-grey-cool text-muted'}`}>
            <div className="small" style={{ fontSize: '0.75rem' }}>
              &copy; {new Date().getFullYear()} Kareh Spa Admin Portal. 
              <span className="ms-2">Developed by <a href="https://josongtech.com" target="_blank" rel="noopener noreferrer" className="text-purple text-decoration-none fw-bold hover-underline">JosongTech</a></span>
            </div>
          </footer>
        </main>

        <style dangerouslySetInnerHTML={{ __html: `
          .sidebar { transition: width 0.3s ease, background 0.3s ease, border 0.3s ease; }
          .nav-item:hover { background: rgba(106, 13, 173, 0.1); }
          .hover-text-white:hover { color: white !important; }
          .hover-text-dark:hover { color: black !important; }
          .hover-bg-white-10:hover { background: rgba(255, 255, 255, 0.05); }
          .hover-bg-black-10:hover { background: rgba(0, 0, 0, 0.05); }
          
          /* Light mode specific glass overrides */
          body.admin-light {
            background-color: #f0f2f5 !important;
            color: #1a1a1a !important;
          }
          body.admin-light .glass-panel {
            background: rgba(255, 255, 255, 0.8) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-color: rgba(106, 13, 173, 0.1) !important;
            color: #2d3436 !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04) !important;
          }
          body.admin-light .glass-input {
            background: #ffffff !important;
            border: 1px solid rgba(106, 13, 173, 0.15) !important;
            color: #1a1a1a !important;
          }
          body.admin-light .glass-input:focus {
            border-color: var(--purple) !important;
            box-shadow: 0 0 0 4px rgba(106, 13, 173, 0.1) !important;
          }
          body.admin-light .text-secondary { color: #57606f !important; }
          body.admin-light .text-muted { color: #a4b0be !important; }
          body.admin-light .text-gradient {
              background: linear-gradient(135deg, var(--purple) 0%, var(--magenta) 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
          }
          body.admin-light .text-gold { color: var(--deep-gold) !important; }
          body.admin-light .mesh-glow { opacity: 0.15; }
          .bg-grey-cool { background-color: #ececec !important; }
          body.admin-light .sidebar { 
            background: #ececec !important; 
            border-color: rgba(0, 0, 0, 0.08) !important;
          }
          body.admin-light header {
            background: #ececec !important;
            border-color: rgba(0, 0, 0, 0.08) !important;
          }
          body.admin-light .nav-item:not(.bg-purple) { color: #2f3542 !important; }
          body.admin-light .nav-item:hover:not(.bg-purple) { 
            background: rgba(106, 13, 173, 0.05);
            color: var(--purple) !important;
          }
          .hover-underline:hover { text-decoration: underline !important; }
          
          .vr { width: 1px; }
          .vh-100 { height: 100vh !important; }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { 
            background: rgba(106, 13, 173, 0.2); 
            border-radius: 10px; 
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--purple); }
          @media (max-width: 991.98px) {
            .sidebar {
              width: 280px !important;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
            }
          }
        `}} />
        <ConfirmModal
          isOpen={isLogoutConfirmOpen}
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleConfirmLogout}
          title="Confirm Logout"
          message="Are you sure you want to sign out?"
          confirmText="Logout"
          cancelText="Cancel"
          isDarkMode={isDarkMode}
        />
      </div>
    </AdminThemeContext.Provider>
  );
};

export default AdminLayout;
