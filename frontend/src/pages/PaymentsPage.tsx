import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector } from '../store/store';
import { paymentApi, notificationApi } from '../api/rentalApi';
import type { Payment, PaymentMethod } from '../types';

export default function PaymentsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isCustomer = user?.role === 'ROLE_CUSTOMER';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [payNote, setPayNote] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await paymentApi.getAll();
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleOpenPay = (payment: Payment) => {
    setSelectedPayment(payment);
    setPayMethod('BANK_TRANSFER');
    setPayNote('');
    setShowPayModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || !selectedPayment.id) return;
    try {
      await paymentApi.pay(selectedPayment.id, payMethod, payNote);
      Swal.fire({
        title: 'Thành công',
        text: isCustomer ? 'Thanh toán hóa đơn trực tuyến thành công!' : 'Đã ghi nhận giao dịch thanh toán thành công!',
        icon: 'success',
        confirmButtonColor: '#0f172a'
      });
      setShowPayModal(false);
      setSelectedPayment(null);
      fetchAll();
    } catch (err) {
      Swal.fire({
        title: 'Thất bại',
        text: 'Lỗi ghi nhận thanh toán: ' + err,
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
    }
  };

  const handleRemind = async (payment: Payment) => {
    Swal.fire({
      title: 'Gửi nhắc nhở thanh toán?',
      text: `Gửi thông báo nhắc nhở thanh toán khoản tiền ${formatCurrency(payment.amount)} cho khách thuê ${payment.contract.booking.customer.fullName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Gửi nhắc nhở',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await notificationApi.create({
            user: payment.contract.booking.customer,
            title: 'Nhắc nhở thanh toán công nợ',
            content: `Kính gửi quý khách, vui lòng hoàn tất thanh toán khoản tiền ${formatCurrency(payment.amount)} cho hợp đồng ${payment.contract.contractCode} (Gian hàng ${payment.contract.booking.booth.code}).`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          
          Swal.fire({
            title: 'Thành công',
            text: 'Đã gửi thông báo nhắc nhở thanh toán đến khách hàng!',
            icon: 'success',
            confirmButtonColor: '#0f172a'
          });
        } catch (err) {
          Swal.fire({
            title: 'Lỗi',
            text: 'Không thể gửi thông báo nhắc nhở: ' + err,
            icon: 'error',
            confirmButtonColor: '#0f172a'
          });
        }
      }
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  if (loading) {
    return (
      <div className="payments-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div className="skeleton skeleton-title" style={{ width: '280px', height: '24px' }} />
            <div className="skeleton skeleton-text" style={{ width: '380px', height: '14px' }} />
          </div>
        </div>
        <div className="metrics-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="metric-card skeleton-card" style={{ height: '90px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '8px' }}>
              <div className="skeleton skeleton-text" style={{ width: '65%', height: '12px' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%', height: '20px' }} />
            </div>
          ))}
        </div>
        <div className="section-card">
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Hợp đồng</th>
                  <th>Khách thuê</th>
                  <th>Số tiền</th>
                  <th>Ngày dự kiến thu</th>
                  <th>Ngày thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text" style={{ width: '50px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '130px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '70px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '150px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '80px', height: '14px' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Statistics
  const collectedAmount = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'UNPAID')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="payments-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-slate-900)', letterSpacing: '-0.5px' }}>
            {isCustomer ? 'Thanh toán & Hóa đơn' : 'Tài chính & Quản lý công nợ'}
          </h2>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '14.5px', marginTop: '4px', fontWeight: 500 }}>
            {isCustomer ? 'Danh sách hóa đơn tiền thuê, tiền cọc và lịch sử các khoản thanh toán của bạn.' : 'Đối soát lịch thu tiền cọc, tiền thuê theo kỳ, thu các khoản phí dịch vụ và phát sinh.'}
          </p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ borderLeft: '4px solid #EC4899' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Tổng tiền thuê dự kiến' : 'Tổng phải thu đã ghi nhận'}</h3>
            <div className="value">{formatCurrency(collectedAmount + pendingAmount)}</div>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Tổng tiền đã thanh toán' : 'Tổng thu thực tế (Đã thanh toán)'}</h3>
            <div className="value" style={{ color: 'var(--color-success)' }}>{formatCurrency(collectedAmount)}</div>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div className="metric-details">
            <h3>{isCustomer ? 'Số tiền chưa thanh toán' : 'Công nợ còn tồn (Chưa thanh toán)'}</h3>
            <div className="value" style={{ color: 'var(--color-danger)' }}>{formatCurrency(pendingAmount)}</div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="section-card">
        <h2>{isCustomer ? 'Lịch thanh toán của tôi' : 'Lịch thanh toán và công nợ chi tiết'}</h2>
        <div className="table-responsive" style={{ marginTop: '24px' }}>
          <table className="app-table">
            <thead>
              <tr>
                <th>Hợp đồng</th>
                <th>Khách thuê</th>
                <th>Gian hàng</th>
                <th>Số tiền</th>
                <th>Hạn thanh toán / Ngày đóng</th>
                <th>Phương thức</th>
                <th>Nội dung / Ghi chú</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.contract.contractCode}</strong></td>
                  <td>{p.contract.booking.customer.fullName}</td>
                  <td>{p.contract.booking.booth.code}</td>
                  <td><strong>{formatCurrency(p.amount)}</strong></td>
                  <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</td>
                  <td>
                    {p.paymentMethod ? (
                      p.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                      p.paymentMethod === 'CASH' ? 'Tiền mặt' : p.paymentMethod
                    ) : '—'}
                  </td>
                  <td>{p.note || '—'}</td>
                  <td>
                    <span className={`badge ${
                      p.status === 'PAID' ? 'success' :
                      p.status === 'PARTIAL' ? 'warning' : 'danger'
                    }`}>
                      {
                        p.status === 'PAID' ? (isCustomer ? 'Đã trả' : 'Đã thu') :
                        p.status === 'PARTIAL' ? 'Thu một phần' : (isCustomer ? 'Chưa trả' : 'Chưa thu')
                      }
                    </span>
                  </td>
                  <td>
                    {p.status !== 'PAID' && (
                      isCustomer ? (
                        <button className="btn primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenPay(p)}>
                          Thanh toán ngay
                        </button>
                      ) : (
                        <button className="btn warning" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleRemind(p)}>
                          Nhắc nhở
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8' }}>
                    {isCustomer ? 'Bạn chưa phát sinh hóa đơn cần thanh toán nào.' : 'Chưa phát sinh phiếu thu nào. Kích hoạt hợp đồng để tạo phiếu thu.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPayModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ghi nhận phiếu thu</h3>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div style={{ background: 'var(--color-primary-light)', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--color-slate-200)' }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-slate-600)', marginBottom: '6px' }}>
                    Khách thuê: <strong>{selectedPayment.contract.booking.customer.fullName}</strong>
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--color-slate-600)', marginBottom: '6px' }}>
                    Hợp đồng: <strong>{selectedPayment.contract.contractCode}</strong> (Gian {selectedPayment.contract.booking.booth.code})
                  </p>
                  <p style={{ fontSize: '16.5px', color: 'var(--color-slate-900)', fontWeight: '800' }}>
                    Số tiền cần thu: <span style={{ color: 'var(--color-success)' }}>{formatCurrency(selectedPayment.amount)}</span>
                  </p>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Phương thức thanh toán</label>
                  <select
                    required
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="BANK_TRANSFER">Chuyển khoản Ngân hàng</option>
                    <option value="CASH">Tiền mặt</option>
                    <option value="MOMO">Ví MoMo</option>
                    <option value="VNPAY">Cổng VNPAY</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Ghi chú đối soát</label>
                  <textarea
                    rows={3}
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="Mã tham chiếu ngân hàng, số hóa đơn, chứng từ đi kèm..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn secondary" onClick={() => setShowPayModal(false)}>Hủy</button>
                <button type="submit" className="btn primary">Xác nhận đã thu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
