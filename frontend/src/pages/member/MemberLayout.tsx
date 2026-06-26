import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGift, FiLogOut, FiTag, FiUser, FiAward, FiClock } from 'react-icons/fi';
import { authApi } from '../../api/auth';

interface MemberLayoutProps {
  children: React.ReactNode;
}

const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
  const location = useLocation();
  const memberUser = JSON.parse(localStorage.getItem('member_user') || 'null');

  const links = [
    { label: 'Offers', icon: <FiGift />, path: '/member/offers' },
    { label: 'Services', icon: <FiTag />, path: '/member/services' },
    { label: 'Points Earned', icon: <FiAward />, path: '/member/points' },
    { label: 'Service History', icon: <FiClock />, path: '/member/history' },
  ];

  const handleLogout = () => {
    authApi.memberLogout();
  };

  return (
    <div className="bg-black text-white min-vh-100 d-flex">
      <aside className="border-end border-white border-opacity-10 p-3 p-md-4" style={{ width: '260px', minHeight: '100vh' }}>
        <div className="mb-4">
          <h4 className="brand-title text-gradient m-0">KAREH MEMBER</h4>
          <p className="small text-secondary mb-0">Member Portal</p>
        </div>

        <div className="glass-panel rounded-4 p-3 mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <FiUser className="text-gold" />
            <strong className="small">{memberUser?.name || 'Member'}</strong>
          </div>
          <div className="small text-secondary">{memberUser?.email || ''}</div>
          <div className="small text-secondary mt-1">Tier: {memberUser?.loyalty_tier || 'Bronze'}</div>
        </div>

        <nav className="d-flex flex-column gap-2">
          {links.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-decoration-none px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${location.pathname === item.path ? 'bg-purple text-white' : 'text-light opacity-75'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button className="btn btn-outline-light mt-4 w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </aside>

      <main className="flex-grow-1 p-3 p-md-4">
        {children}
      </main>
    </div>
  );
};

export default MemberLayout;
