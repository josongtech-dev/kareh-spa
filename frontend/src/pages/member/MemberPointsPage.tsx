import React, { useEffect, useState, useCallback } from 'react';
import { FiAward, FiGift, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import MemberLayout from './MemberLayout';
import { memberApi } from '../../api/members';
import { rewardApi } from '../../api/rewards';

const MemberPointsPage: React.FC = () => {
  const memberUser = JSON.parse(localStorage.getItem('member_user') || 'null');
  const [memberData, setMemberData] = useState<any>(memberUser);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    if (!memberUser?.id) return;
    setLoading(true);
    try {
      const [memberRes, rewardsRes, historyRes] = await Promise.all([
        memberApi.getById(memberUser.id),
        rewardApi.getAll(),
        rewardApi.getMemberHistory(memberUser.id),
      ]);
      const member = memberRes.data?.data || memberRes.data || null;
      if (member) {
        setMemberData(member);
        localStorage.setItem('member_user', JSON.stringify({ ...memberUser, ...member }));
      }
      const rw = rewardsRes.data?.data || rewardsRes.data || [];
      setRewards(Array.isArray(rw) ? rw : []);
      const rh = historyRes.data?.data || historyRes.data || [];
      setRedemptions(Array.isArray(rh) ? rh : []);
    } catch (err) {
      console.error('Failed to load points data', err);
    } finally {
      setLoading(false);
    }
  }, [memberUser?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRedeem = async (rewardId: number) => {
    if (!memberUser?.id || redeeming !== null) return;
    setRedeeming(rewardId);
    setMessage(null);
    try {
      const res = await rewardApi.redeem(memberUser.id, rewardId);
      setMessage({ type: 'success', text: `Redeemed successfully! ${res.data?.points_spent || ''} points used.` });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Redemption failed.' });
    } finally {
      setRedeeming(null);
    }
  };

  const points = Number(memberData?.loyalty_points || 0);
  const nextTierPoints = points >= 500 ? 500 : points >= 200 ? 500 : 200;
  const progress = nextTierPoints > 0 ? Math.min(100, Math.round((points / nextTierPoints) * 100)) : 0;

  return (
    <MemberLayout>
      <h1 className="brand-title text-gradient mb-2">Loyalty Points</h1>
      <p className="text-secondary mb-4">Track your rewards, earn points, and redeem perks.</p>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 border-0 rounded-3 py-2 small mb-4`}>
          {message.type === 'success' ? <FiCheck /> : <FiX />}
          {message.text}
        </div>
      )}

      <div className="row g-4 mb-5">
        <div className="col-lg-4">
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

        <div className="col-lg-4">
          <div className="glass-panel rounded-4 p-4 h-100">
            <h5 className="d-flex align-items-center gap-2 mb-3"><FiGift /> How To Earn</h5>
            <ul className="small text-secondary mb-0">
              <li>Earn points automatically when your sessions are paid.</li>
              <li>10 points per KES 100 spent (configurable by spa).</li>
              <li>Redeem points for rewards below.</li>
            </ul>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="glass-panel rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 d-flex align-items-center gap-2"><FiRefreshCw /> Recent</h5>
              <button className="btn btn-sm btn-outline-purple rounded-pill" onClick={fetchData} disabled={loading}>
                <FiRefreshCw className={loading ? 'spin' : ''} />
              </button>
            </div>
            {redemptions.length === 0 ? (
              <p className="small text-secondary mb-0">No redemptions yet.</p>
            ) : (
              <div className="small" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                {redemptions.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="d-flex justify-content-between mb-2 pb-2 border-bottom border-opacity-10">
                    <span>{r.reward_name}</span>
                    <span className={`badge bg-${r.status === 'Approved' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger'} bg-opacity-10`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reward Catalog */}
      <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <FiGift className="text-purple" /> Available Rewards
      </h4>
      <div className="row g-4 mb-5">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-purple" role="status" />
          </div>
        ) : rewards.length === 0 ? (
          <div className="col-12">
            <div className="glass-panel rounded-4 p-4 text-center">
              <p className="text-secondary mb-0">No rewards available at this time.</p>
            </div>
          </div>
        ) : (
          rewards.map((reward: any) => {
            const canRedeem = points >= Number(reward.points_required);
            const outOfStock = Number(reward.stock) === 0;
            return (
              <div key={reward.id} className="col-md-6 col-lg-4">
                <div className={`glass-panel rounded-4 p-4 h-100 d-flex flex-column ${!canRedeem || outOfStock ? 'opacity-75' : ''}`}>
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{reward.name}</h5>
                      <p className="x-small text-secondary mb-0">{reward.description || ''}</p>
                    </div>
                    <span className="badge bg-purple bg-opacity-10 text-purple fs-6 fw-bold">
                      {Number(reward.points_required).toLocaleString()} pts
                    </span>
                  </div>
                  <div className="mt-auto">
                    {outOfStock ? (
                      <span className="badge bg-danger bg-opacity-10 text-danger">Out of Stock</span>
                    ) : (
                      <button
                        className={`btn w-100 rounded-pill fw-bold ${canRedeem ? 'btn-purple' : 'btn-secondary btn-secondary-disabled'}`}
                        disabled={!canRedeem || redeeming !== null}
                        onClick={() => handleRedeem(reward.id)}
                      >
                        {redeeming === reward.id ? (
                          <><span className="spinner-border spinner-border-sm me-2" /> Redeeming...</>
                        ) : canRedeem ? (
                          'Redeem'
                        ) : (
                          `${Number(reward.points_required - points).toLocaleString()} more pts needed`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .btn-outline-purple {
          border: 1px solid var(--purple);
          color: var(--purple);
          background: transparent;
        }
        .btn-outline-purple:hover {
          background: var(--purple);
          color: #fff;
        }
        .btn-secondary-disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #6c757d !important;
          border-color: #6c757d !important;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </MemberLayout>
  );
};

export default MemberPointsPage;
