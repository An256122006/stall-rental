import { useState, useEffect } from 'react';
import { useAppSelector } from '../store/store';
import { boothApi, contractApi, paymentApi, maintenanceApi } from '../api/rentalApi';
import type { Booth, Contract, Payment, MaintenanceRequest } from '../types';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isCustomer = user?.role === 'ROLE_CUSTOMER';

  const [booths, setBooths] = useState<Booth[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boothRes, contractRes, paymentRes, maintRes] = await Promise.all([
          boothApi.getAll(),
          contractApi.getAll(),
          paymentApi.getAll(),
          maintenanceApi.getAll(),
        ]);

        setBooths(boothRes.data);
        setContracts(contractRes.data);
        setPayments(paymentRes.data);
        setMaintenance(maintRes.data);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-content-page">
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton skeleton-title" style={{ width: '240px', height: '24px' }} />
          <div className="skeleton skeleton-text" style={{ width: '400px', height: '14px' }} />
        </div>
        <div className="metrics-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="metric-card skeleton-card" style={{ height: '110px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '8px' }}>
              <div className="skeleton skeleton-text" style={{ width: '50%', height: '12px' }} />
              <div className="skeleton skeleton-text" style={{ width: '30%', height: '22px' }} />
              <div className="skeleton skeleton-text" style={{ width: '70%', height: '10px' }} />
            </div>
          ))}
        </div>
        <div className="dashboard-sections" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="section-card">
            <div className="skeleton skeleton-title" style={{ width: '180px', height: '18px', marginBottom: '20px' }} />
            <div className="skeleton skeleton-text" style={{ height: '35px', marginBottom: '12px' }} />
            <div className="skeleton skeleton-text" style={{ height: '35px', marginBottom: '12px' }} />
            <div className="skeleton skeleton-text" style={{ height: '35px' }} />
          </div>
          <div className="section-card">
            <div className="skeleton skeleton-title" style={{ width: '180px', height: '18px', marginBottom: '20px' }} />
            <div className="skeleton skeleton-text" style={{ height: '35px', marginBottom: '12px' }} />
            <div className="skeleton skeleton-text" style={{ height: '35px', marginBottom: '12px' }} />
            <div className="skeleton skeleton-text" style={{ height: '35px' }} />
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalBooths = booths.length;
  const rentedBooths = booths.filter(b => b.status === 'RENTED').length;
  const reservedBooths = booths.filter(b => b.status === 'RESERVED').length;
  const maintenanceBooths = booths.filter(b => b.status === 'MAINTENANCE').length;
  const availableBooths = booths.filter(b => b.status === 'AVAILABLE').length;

  const occupancyRate = totalBooths > 0 ? Math.round(((rentedBooths + reservedBooths) / totalBooths) * 100) : 0;

  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingDebt = payments
    .filter(p => p.status === 'UNPAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeContractsCount = contracts.filter(c => c.status === 'ACTIVE').length;
  const pendingRequestsCount = maintenance.filter(m => m.status === 'NEW' || m.status === 'PROCESSING').length;

  // For customer dashboard specific data
  const myRentedBooths = contracts
    .filter(c => c.status === 'ACTIVE')
    .map(c => c.booking.booth);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="dashboard-content-page">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-slate-900)', letterSpacing: '-0.5px' }}>
          {isCustomer ? `Xin chào, ${user?.fullName || 'Khách thuê'}` : 'Tổng quan hệ thống'}
        </h2>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '14.5px', marginTop: '4px', fontWeight: 500 }}>
          {isCustomer 
            ? 'Theo dõi hợp đồng, hóa đơn và yêu cầu hỗ trợ kỹ thuật của bạn.' 
            : 'Số liệu tổng quan hoạt động kinh doanh và hiệu suất thuê mặt bằng.'}
        </p>
      </div>

      <div className="metrics-grid">
        {/* Metric 1 */}
        <div className="metric-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Gian hàng đang thuê' : 'Tỷ lệ lấp đầy'}</h3>
            <div className="value">{isCustomer ? myRentedBooths.length : `${occupancyRate}%`}</div>
            <p style={{ fontSize: '12px', color: 'var(--color-slate-600)', marginTop: '6px', fontWeight: 500 }}>
              {isCustomer ? 'Gian hàng có hợp đồng hiệu lực' : `${rentedBooths} Đang thuê / ${totalBooths} Tổng số`}
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="metric-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Đã thanh toán' : 'Doanh thu thực tế'}</h3>
            <div className="value" style={{ fontSize: '24px' }}>{formatCurrency(totalRevenue)}</div>
            <p style={{ fontSize: '12px', color: 'var(--color-slate-600)', marginTop: '6px', fontWeight: 500 }}>
              {isCustomer ? 'Tổng các khoản đã chi trả' : 'Tổng thu từ các phiếu thanh toán'}
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="metric-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Số tiền cần đóng' : 'Công nợ chờ thu'}</h3>
            <div className="value" style={{ fontSize: '24px', color: 'var(--color-danger)' }}>{formatCurrency(pendingDebt)}</div>
            <p style={{ fontSize: '12px', color: 'var(--color-slate-600)', marginTop: '6px', fontWeight: 500 }}>
              {isCustomer ? 'Vui lòng thanh toán đúng hạn' : 'Khoản nợ chưa thanh toán'}
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="metric-card" style={{ borderLeft: '4px solid #EC4899' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Hợp đồng sở hữu' : 'Hợp đồng hiệu lực'}</h3>
            <div className="value">{isCustomer ? contracts.length : activeContractsCount}</div>
            <p style={{ fontSize: '12px', color: 'var(--color-slate-600)', marginTop: '6px', fontWeight: 500 }}>
              {isCustomer ? 'Tổng số hợp đồng đã lập' : 'Hợp đồng đang hoạt động'}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        {/* Left column */}
        <div className="section-card">
          <h2>{isCustomer ? 'Gian hàng đang thuê của tôi' : 'Danh sách gian hàng trống'}</h2>
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Mã gian hàng</th>
                  <th>Tên gian hàng</th>
                  <th>Khu vực</th>
                  <th>Diện tích</th>
                  <th>{isCustomer ? 'Giá thuê thực tế' : 'Giá thuê mặc định'}</th>
                  <th>Trạng thái</th>
                  {isCustomer && <th>Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {isCustomer ? (
                  contracts.filter(c => c.status === 'ACTIVE').map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.booking.booth.code}</strong></td>
                      <td>{c.booking.booth.name}</td>
                      <td>{c.booking.booth.area.name}</td>
                      <td>{c.booking.booth.size} m²</td>
                      <td>{formatCurrency(c.rentPrice)}/tháng</td>
                      <td><span className="badge success">Đang thuê</span></td>
                      <td>
                        {c.contractFile ? (
                          <a href={c.contractFile} target="_blank" rel="noopener noreferrer" className="text-btn" style={{ fontWeight: 600 }}>
                            Xem hợp đồng
                          </a>
                        ) : (
                          <span style={{ color: 'var(--color-slate-400)', fontStyle: 'italic', fontSize: '13px' }}>Chưa đính kèm</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  booths.filter(b => b.status === 'AVAILABLE').slice(0, 5).map(booth => (
                    <tr key={booth.id}>
                      <td><strong>{booth.code}</strong></td>
                      <td>{booth.name}</td>
                      <td>{booth.area.name}</td>
                      <td>{booth.size} m²</td>
                      <td>{formatCurrency(booth.rentPrice)}</td>
                      <td><span className="badge success">Trống</span></td>
                    </tr>
                  ))
                )}
                {((isCustomer && contracts.filter(c => c.status === 'ACTIVE').length === 0) ||
                  (!isCustomer && booths.filter(b => b.status === 'AVAILABLE').length === 0)) && (
                  <tr>
                    <td colSpan={isCustomer ? 7 : 6} style={{ textAlign: 'center', color: '#94a3b8' }}>
                      {isCustomer ? 'Bạn chưa có hợp đồng thuê gian hàng nào hiệu lực.' : 'Không có gian hàng trống nào khả dụng.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="section-card">
          <h2>{isCustomer ? 'Trợ giúp kỹ thuật & Vận hành' : 'Trạng thái vận hành'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14.5px', color: 'var(--color-slate-600)', fontWeight: 500 }}>
                {isCustomer ? 'Phiếu hỗ trợ đang xử lý' : 'Yêu cầu vận hành tồn đọng'}
              </span>
              <span className="badge warning">{pendingRequestsCount}</span>
            </div>
            {!isCustomer && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14.5px', color: 'var(--color-slate-600)', fontWeight: 500 }}>Gian hàng trống sẵn sàng</span>
                  <span className="badge success">{availableBooths}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14.5px', color: 'var(--color-slate-600)', fontWeight: 500 }}>Gian hàng đang bảo trì</span>
                  <span className="badge danger">{maintenanceBooths}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14.5px', color: 'var(--color-slate-600)', fontWeight: 500 }}>Tổng số gian hàng</span>
                  <span className="badge info">{totalBooths}</span>
                </div>
              </>
            )}
            {isCustomer && (
              <div style={{ background: 'rgba(124, 58, 237, 0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-slate-300)', fontSize: '13px', color: 'var(--color-slate-700)', lineHeight: '1.6' }}>
                💡 Nếu gian hàng của bạn gặp sự cố kỹ thuật (điện, nước, cơ sở vật chất), vui lòng chuyển qua tab <strong>Yêu cầu hỗ trợ</strong> để gửi phiếu báo sửa chữa cho Ban quản lý.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
