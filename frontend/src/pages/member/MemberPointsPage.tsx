import React, { useEffect, useState } from 'react';
import { FiAward } from 'react-icons/fi';
import MemberLayout from './MemberLayout';
import { memberApi } from '../../api/members';

const MemberPointsPage: React.FC = () => {
  const memberUser = JSON.parse(localStorage.getItem('member_user') || 'null');
  const [memberData, setMemberData] = useState<any>(memberUser);

  useEffect(() => {
    const loadMember = async () => {
      if (!memberUser?.id) return;
      try {
        const response = await memberApi.getById(memberUser.id);
        const data = response.data?.data || response.data || null;
        if (data) {
          setMemberData(data);
          localStorage.setItem('member_user', JSON.stringify({ ...memberUser, ...data }));
        }
      } catch (error) {
        console.error('Failed to load member points data', error);
      }
    };
    loadMember();
  }, [memberUser?.id]);

  const points = Number(memberData?.loyalty_points || 0);
  const nextTierPoints = points >= 500 ? 500 : points >= 200 ? 500 : 200;
  const progress = nextTierPoints > 0 ? Math.min(100, Math.round((points / nextTierPoints) * 100)) : 0;

  return (
    <MemberLayout>
      <h1 className="brand-title text-gradient mb-2">Points Earned</h1>
      <p className="text-secondary mb-4">Track your loyalty rewards progress.</p>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="glass-panel rounded-4 p-4 h-100">
            <h5 className="d-flex align-items-center gap-2 mb-3"><FiAward /> Loyalty Summary</h5>
            <div className="display-5 fw-bold text-gold">{points}</div>
            <p className="small text-secondary mb-2">Current tier: <strong>{memberData?.loyalty_tier || 'Bronze'}</strong></p>
            <div className="progress bg-dark mt-3" style={{ height: '8px' }}>
              <div className="progress-bar bg-warning" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="small text-secondary mt-2 mb-0">
              {points >= 500 ? 'You are at the top tier.' : `${Math.max(0, nextTierPoints - points)} points to next tier.`}
            </p>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-panel rounded-4 p-4 h-100">
            <h5 className="mb-3">How To Earn More</h5>
            <ul className="small text-secondary mb-0">
              <li>Book and complete services regularly.</li>
              <li>Invite friends with your referral code.</li>
              <li>Watch offers page for bonus point campaigns.</li>
            </ul>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default MemberPointsPage;
