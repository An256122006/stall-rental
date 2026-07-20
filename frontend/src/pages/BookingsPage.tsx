// Target 1: Import fix
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector } from '../store/store';
import { bookingApi, customerApi, boothApi, areaApi } from '../api/rentalApi';
import type { Booking, User, Booth, Area } from '../types';

export default function BookingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isCustomer = user?.role === 'ROLE_CUSTOMER';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [modalAreaId, setModalAreaId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customerId: '',
    boothId: '',
    startDate: '',
    endDate: '',
    deposit: 0,
    totalPrice: 0,
    note: ''
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [bookingRes, customerRes, boothRes, areaRes] = await Promise.all([
        bookingApi.getAll(),
        customerApi.getAll(),
        boothApi.getAll(),
        areaApi.getAll()
      ]);
      setBookings(bookingRes.data);
      setCustomers(customerRes.data);
      setBooths(boothRes.data);
      setAreas(areaRes.data);
      if (isCustomer && customerRes.data.length > 0) {
        setNewBooking(prev => ({ ...prev, customerId: String(customerRes.data[0].id) }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!showModal) {
      setModalAreaId('');
    }
  }, [showModal]);

  // Update total price when dates/booth change
  useEffect(() => {
    const boothObj = booths.find(b => b.id === Number(newBooking.boothId));
    if (boothObj && newBooking.startDate && newBooking.endDate) {
      const start = new Date(newBooking.startDate);
      const end = new Date(newBooking.endDate);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      // Calculate simple price: size * rentPrice * (days / 30) (approximated monthly price)
      const basePrice = (boothObj.rentPrice) * (days / 30);
      setNewBooking(prev => ({
        ...prev,
        totalPrice: Math.round(basePrice),
        deposit: Math.round(basePrice * 0.1) // Default 10% deposit
      }));
    }
  }, [newBooking.boothId, newBooking.startDate, newBooking.endDate, booths]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCustomer = customers.find(c => c.id === Number(newBooking.customerId));
      const selectedBooth = booths.find(b => b.id === Number(newBooking.boothId));

      if (!selectedCustomer || !selectedBooth) {
        Swal.fire({
          title: 'Thông báo',
          text: 'Vui lòng chọn đầy đủ khách hàng và gian hàng!',
          icon: 'warning',
          confirmButtonColor: '#0f172a'
        });
        return;
      }

      await bookingApi.create({
        customer: selectedCustomer,
        booth: selectedBooth,
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        deposit: Number(newBooking.deposit),
        totalPrice: Number(newBooking.totalPrice),
        status: 'PENDING',
        note: newBooking.note
      });

      Swal.fire({
        title: 'Thành công',
        text: isCustomer ? 'Đăng ký giữ chỗ của bạn đã được gửi thành công!' : 'Đã tạo giữ chỗ mới thành công!',
        icon: 'success',
        confirmButtonColor: '#0f172a'
      });

      setShowModal(false);
      setNewBooking({
        customerId: isCustomer && customers.length > 0 ? String(customers[0].id) : '',
        boothId: '',
        startDate: '',
        endDate: '',
        deposit: 0,
        totalPrice: 0,
        note: ''
      });
      fetchAll();
    } catch (err) {
      Swal.fire({
        title: 'Thất bại',
        text: 'Lỗi gửi yêu cầu giữ chỗ: ' + err,
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
    }
  };

  const handleConfirm = async (id: number) => {
    Swal.fire({
      title: 'Xác nhận duyệt?',
      text: 'Bạn có chắc chắn muốn phê duyệt yêu cầu giữ chỗ này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Phê duyệt',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await bookingApi.updateStatus(id, 'CONFIRMED');
          Swal.fire({
            title: 'Thành công',
            text: 'Đã duyệt yêu cầu giữ chỗ.',
            icon: 'success',
            confirmButtonColor: '#0f172a'
          });
          fetchAll();
        } catch (err) {
          Swal.fire({
            title: 'Lỗi',
            text: 'Lỗi duyệt đặt chỗ: ' + err,
            icon: 'error',
            confirmButtonColor: '#0f172a'
          });
        }
      }
    });
  };

  const handleCancel = async (id: number) => {
    Swal.fire({
      title: 'Xác nhận hủy?',
      text: 'Bạn có chắc chắn muốn hủy yêu cầu giữ chỗ này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Hủy đặt chỗ',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await bookingApi.updateStatus(id, 'CANCELLED');
          Swal.fire({
            title: 'Đã hủy!',
            text: 'Yêu cầu giữ chỗ đã được hủy.',
            icon: 'success',
            confirmButtonColor: '#0f172a'
          });
          fetchAll();
        } catch (err) {
          Swal.fire({
            title: 'Lỗi',
            text: 'Lỗi hủy đặt chỗ: ' + err,
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
      <div className="bookings-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div className="skeleton skeleton-title" style={{ width: '280px', height: '24px' }} />
            <div className="skeleton skeleton-text" style={{ width: '380px', height: '14px' }} />
          </div>
        </div>
        <div className="section-card">
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Mã số</th>
                  <th>Khách thuê</th>
                  <th>Gian hàng</th>
                  <th>Ngày giữ chỗ</th>
                  <th>Thời hạn thuê</th>
                  <th>Tiền đặt cọc</th>
                  <th>Tổng giá trị</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text" style={{ width: '50px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '130px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '80px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '150px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '70px', height: '14px' }} /></td>
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

  return (
    <div className="bookings-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-slate-900)', letterSpacing: '-0.5px' }}>
            {isCustomer ? 'Đặt chỗ của tôi' : 'Giữ chỗ & Báo giá'}
          </h2>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '14.5px', marginTop: '4px', fontWeight: 500 }}>
            {isCustomer ? 'Gửi yêu cầu đăng ký giữ chỗ gian hàng trống và theo dõi báo giá tiền cọc dự toán.' : 'Ghi nhận thông tin báo giá thuê gian hàng và giữ chỗ tạm thời cho khách hàng.'}
          </p>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)}>
          {isCustomer ? '+ Đăng ký giữ chỗ mới' : '+ Tạo giữ chỗ / Báo giá'}
        </button>
      </div>

      <div className="section-card">
        <div className="table-responsive">
          <table className="app-table">
            <thead>
              <tr>
                {!isCustomer && <th>Khách thuê</th>}
                <th>Gian hàng</th>
                <th>Khu vực</th>
                <th>Ngày đặt chỗ</th>
                <th>Thời gian thuê dự kiến</th>
                <th>Tiền đặt cọc</th>
                <th>Tổng dự toán</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  {!isCustomer && <td><strong>{b.customer.fullName}</strong></td>}
                  <td>{b.booth.code} ({b.booth.name})</td>
                  <td>{b.booth.area.name}</td>
                  <td>{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : ''}</td>
                  <td>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                  <td>{b.deposit ? formatCurrency(b.deposit) : '0 ₫'}</td>
                  <td><strong>{formatCurrency(b.totalPrice)}</strong></td>
                  <td>
                    <span className={`badge ${
                      b.status === 'PENDING' ? 'warning' :
                      b.status === 'CONFIRMED' ? 'success' :
                      b.status === 'COMPLETED' ? 'info' : 'danger'
                    }`}>
                      {
                        b.status === 'PENDING' ? 'Chờ duyệt' :
                        b.status === 'CONFIRMED' ? 'Đã duyệt' :
                        b.status === 'COMPLETED' ? 'Đã ký HĐ' : 'Đã hủy'
                      }
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isCustomer && b.status === 'PENDING' && (
                        <button className="text-btn" onClick={() => b.id && handleConfirm(b.id)}>Duyệt</button>
                      )}
                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                        <button className="text-btn" style={{ color: 'var(--color-danger)' }} onClick={() => b.id && handleCancel(b.id)}>Hủy</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={isCustomer ? 8 : 9} style={{ textAlign: 'center', color: '#94a3b8' }}>
                    Chưa có yêu cầu đặt chỗ/báo giá nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isCustomer ? 'Đăng ký giữ chỗ mới' : 'Tạo báo giá & Giữ chỗ mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {!isCustomer && (
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Khách thuê</label>
                    <select
                      required
                      value={newBooking.customerId}
                      onChange={(e) => setNewBooking({ ...newBooking, customerId: e.target.value })}
                      style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      <option value="">Chọn khách thuê...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Chọn khu vực / Tầng</label>
                  <select
                    value={modalAreaId}
                    onChange={(e) => {
                      setModalAreaId(e.target.value);
                      // Reset selected booth when area changes
                      setNewBooking(prev => ({ ...prev, boothId: '' }));
                    }}
                    style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    <option value="">Chọn khu vực...</option>
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {modalAreaId && (
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Sơ đồ gian hàng</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#fee2e2', border: '1px solid #fca5a5', marginRight: '4px', borderRadius: '2px' }} /> Đã thuê (Khóa) &nbsp;
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', marginRight: '4px', borderRadius: '2px' }} /> Trống &nbsp;
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#dcfce7', border: '1px solid #22c55e', marginRight: '4px', borderRadius: '2px' }} /> Đang chọn
                      </span>
                    </label>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                      gap: '10px',
                      marginTop: '8px',
                      maxHeight: '190px',
                      overflowY: 'auto',
                      padding: '8px',
                      border: '1px solid #E9D5FF',
                      borderRadius: 'var(--radius-sm)',
                      background: '#FAF5FF'
                    }}>
                      {booths.filter(b => b.area.id === Number(modalAreaId)).map(b => {
                        const isAvailable = b.status === 'AVAILABLE';
                        const isSelected = String(b.id) === newBooking.boothId;
                        
                        let cardBg = '#FFFFFF'; 
                        let cardColor = 'var(--color-slate-900)';
                        let cardBorder = '1px solid #E9D5FF';
                        let cursor = 'pointer';
 
                        if (!isAvailable) {
                          cardBg = 'var(--color-danger-bg)'; 
                          cardColor = 'var(--color-danger)'; 
                          cardBorder = '1px solid var(--color-danger-border)';
                          cursor = 'not-allowed';
                        } else if (isSelected) {
                          cardBg = 'var(--color-success-bg)'; 
                          cardColor = 'var(--color-success)'; 
                          cardBorder = '2px solid var(--color-success-border)';
                        }

                        return (
                          <div
                            key={b.id}
                            onClick={() => {
                              if (isAvailable && b.id) {
                                setNewBooking(prev => ({ ...prev, boothId: String(b.id) }));
                              }
                            }}
                            style={{
                              background: cardBg,
                              color: cardColor,
                              border: cardBorder,
                              borderRadius: 'var(--radius-sm)',
                              padding: '10px 6px',
                              textAlign: 'center',
                              cursor: cursor,
                              userSelect: 'none',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ fontWeight: '700', fontSize: '12px' }}>{b.code}</div>
                            <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.7 }}>{b.size} m²</div>
                            <div style={{ fontSize: '9px', marginTop: '4px', fontWeight: '600' }}>
                              {!isAvailable ? 'Đã thuê' : (isSelected ? 'Chọn' : 'Trống')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày bắt đầu thuê</label>
                    <input
                      type="date"
                      required
                      value={newBooking.startDate}
                      onChange={(e) => setNewBooking({ ...newBooking, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày kết thúc thuê</label>
                    <input
                      type="date"
                      required
                      value={newBooking.endDate}
                      onChange={(e) => setNewBooking({ ...newBooking, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ước tính tổng tiền (VND)</label>
                    <input
                      type="number"
                      readOnly
                      disabled
                      value={newBooking.totalPrice}
                      style={{ background: '#f8fafc' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tiền đặt cọc đề xuất (VND)</label>
                    <input
                      type="number"
                      required
                      value={newBooking.deposit}
                      onChange={(e) => setNewBooking({ ...newBooking, deposit: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ghi chú thêm</label>
                  <textarea
                    rows={2}
                    value={newBooking.note}
                    onChange={(e) => setNewBooking({ ...newBooking, note: e.target.value })}
                    placeholder="Ghi chú điều khoản đặc biệt hoặc yêu cầu của khách thuê..."
                    style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn primary">Tạo giữ chỗ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
