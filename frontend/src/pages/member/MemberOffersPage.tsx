import React, { useMemo, useState } from 'react';
import { FiCopy, FiGift } from 'react-icons/fi';
import MemberLayout from './MemberLayout';
import { settingsApi } from '../../api/settings';

const MemberOffersPage: React.FC = () => {
  const memberUser = JSON.parse(localStorage.getItem('member_user') || 'null');
  const [notice, setNotice] = useState('');
  const [offers, setOffers] = useState<string[]>([]);
  const [offersEnabled, setOffersEnabled] = useState(true);
  const referralCode = useMemo(() => `KAREH-${String(memberUser?.id || 0).padStart(4, '0')}`, [memberUser?.id]);

  React.useEffect(() => {
    const loadOffers = async () => {
      try {
        const res = await settingsApi.getAll();
        const payload: any = res.data || {};
        const data = payload?.data || payload || {};
        setOffersEnabled(Boolean(data.offers_enabled ?? true));
        setOffers(Array.isArray(data.offers_list) ? data.offers_list : []);
      } catch (error) {
        console.error('Failed to load offers settings', error);
      }
    };
    loadOffers();
  }, []);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setNotice('Referral code copied.');
    } catch {
      setNotice('Unable to copy code right now.');
    }
  };

  return (
    <MemberLayout>
      <h1 className="brand-title text-gradient mb-2">Offers</h1>
      <p className="text-secondary mb-4">Exclusive promotions and member rewards.</p>
      {notice && <div className="alert alert-info border-0 rounded-4 py-2">{notice}</div>}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="glass-panel rounded-4 p-4 h-100">
            <h5 className="d-flex align-items-center gap-2 mb-3"><FiGift /> Current Promos</h5>
            {offersEnabled ? (
              <ul className="small text-secondary mb-0">
                {(offers.length > 0 ? offers : [
                  '10% off manicure every Tuesday.',
                  'Free beard touch-up after 4 completed visits.',
                  'Members get priority weekend slots.',
                  'Birthday month facial discount.',
                ]).map((offer, idx) => (
                  <li key={`${offer}-${idx}`}>{offer}</li>
                ))}
              </ul>
            ) : (
              <p className="small text-secondary mb-0">Offers are currently disabled by administration.</p>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-panel rounded-4 p-4 h-100">
            <h5 className="mb-3">Invite & Earn Points</h5>
            <p className="small text-secondary">Share your referral code with friends. Earn points for every successful sign-up.</p>
            <div className="d-flex gap-2">
              <code className="px-3 py-2 rounded-3 bg-dark text-gold">{referralCode}</code>
              <button className="btn btn-outline-light btn-sm" onClick={copyReferralCode}><FiCopy /></button>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default MemberOffersPage;
