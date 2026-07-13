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
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
          {isCustomer ? `Xin chào, ${user?.fullName || 'Khách thuê'}` : 'Tổng quan quản lý'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          {isCustomer 
            ? 'Theo dõi hợp đồng, hóa đơn và yêu cầu hỗ trợ kỹ thuật của bạn.' 
            : 'Số liệu tổng quan hoạt động kinh doanh, thuê mặt bằng.'}
        </p>
      </div>

      <div className="metrics-grid">
        {/* Metric 1 */}
        <div className="metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Gian hàng đang thuê' : 'Tỷ lệ lấp đầy'}</h3>
            <div className="value">{isCustomer ? myRentedBooths.length : `${occupancyRate}%`}</div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {isCustomer ? 'Gian hàng có hợp đồng hiệu lực' : `${rentedBooths} Đang thuê / ${totalBooths} Tổng số`}
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="metric-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Đã thanh toán' : 'Doanh thu thực tế'}</h3>
            <div className="value" style={{ fontSize: '22px' }}>{formatCurrency(totalRevenue)}</div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {isCustomer ? 'Tổng các khoản đã chi trả' : 'Tổng thu từ các phiếu thanh toán'}
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Số tiền cần đóng' : 'Công nợ chờ thu'}</h3>
            <div className="value" style={{ fontSize: '22px', color: '#ef4444' }}>{formatCurrency(pendingDebt)}</div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {isCustomer ? 'Vui lòng thanh toán đúng hạn' : 'Khoản nợ chưa thanh toán'}
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="metric-card" style={{ borderLeft: '4px solid #d946ef' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Hợp đồng sở hữu' : 'Hợp đồng hiệu lực'}</h3>
            <div className="value">{isCustomer ? contracts.length : activeContractsCount}</div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
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
                    <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                {isCustomer ? 'Phiếu hỗ trợ đang xử lý' : 'Yêu cầu vận hành tồn đọng'}
              </span>
              <span className="badge warning" style={{ fontSize: '13px' }}>{pendingRequestsCount}</span>
            </div>
            {!isCustomer && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Gian hàng trống sẵn sàng</span>
                  <span className="badge success" style={{ fontSize: '13px' }}>{availableBooths}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Gian hàng đang bảo trì</span>
                  <span className="badge danger" style={{ fontSize: '13px' }}>{maintenanceBooths}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Tổng số gian hàng</span>
                  <span className="badge info" style={{ fontSize: '13px' }}>{totalBooths}</span>
                </div>
              </>
            )}
            {isCustomer && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                💡 Nếu gian hàng của bạn gặp sự cố kỹ thuật (điện, nước, cơ sở vật chất), vui lòng chuyển qua tab <strong>Yêu cầu hỗ trợ</strong> để gửi phiếu báo sửa chữa cho Ban quản lý.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
