import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector } from '../store/store';
import { contractApi, bookingApi } from '../api/rentalApi';
import type { Contract, Booking } from '../types';

export default function ContractsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isCustomer = user?.role === 'ROLE_CUSTOMER';

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newContract, setNewContract] = useState({
    bookingId: '',
    startDate: '',
    endDate: '',
    rentPrice: 0,
    deposit: 0,
    contractFile: ''
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [contractRes, bookingRes] = await Promise.all([
        contractApi.getAll(),
        bookingApi.getAll()
      ]);
      setContracts(contractRes.data);
      // Filter out bookings that are approved but do not have a contract yet
      const activeContractBookingIds = contractRes.data.map(c => c.booking.id);
      setConfirmedBookings(bookingRes.data.filter(b => b.status === 'CONFIRMED' && !activeContractBookingIds.includes(b.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Update default values when booking changes
  useEffect(() => {
    const bookingObj = confirmedBookings.find(b => b.id === Number(newContract.bookingId));
    if (bookingObj) {
      setNewContract(prev => ({
        ...prev,
        startDate: bookingObj.startDate,
        endDate: bookingObj.endDate,
        rentPrice: Math.round(bookingObj.totalPrice / (Math.max(1, Math.ceil((new Date(bookingObj.endDate).getTime() - new Date(bookingObj.startDate).getTime()) / (1000 * 60 * 60 * 24))) / 30)),
        deposit: bookingObj.deposit || 0
      }));
    }
  }, [newContract.bookingId, confirmedBookings]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedBooking = confirmedBookings.find(b => b.id === Number(newContract.bookingId));
      if (!selectedBooking) {
        Swal.fire({
          title: 'Thông báo',
          text: 'Vui lòng chọn yêu cầu đặt chỗ hợp lệ!',
          icon: 'warning',
          confirmButtonColor: '#0f172a'
        });
        return;
      }

      await contractApi.create({
        booking: selectedBooking,
        startDate: newContract.startDate,
        endDate: newContract.endDate,
        rentPrice: Number(newContract.rentPrice),
        deposit: Number(newContract.deposit),
        status: 'DRAFT',
        contractFile: newContract.contractFile
      });

      Swal.fire({
        title: 'Thành công',
        text: 'Đã lập hợp đồng mới (bản nháp) thành công!',
        icon: 'success',
        confirmButtonColor: '#0f172a'
      });

      setShowModal(false);
      setNewContract({
        bookingId: '',
        startDate: '',
        endDate: '',
        rentPrice: 0,
        deposit: 0,
        contractFile: ''
      });
      fetchAll();
    } catch (err) {
      Swal.fire({
        title: 'Thất bại',
        text: 'Lỗi lập hợp đồng: ' + err,
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
    }
  };

  const handleActivate = async (id: number) => {
    Swal.fire({
      title: 'Duyệt hợp đồng?',
      text: 'Kích hoạt hợp đồng này và chuyển trạng thái gian hàng sang đã thuê?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Kích hoạt',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await contractApi.updateStatus(id, 'ACTIVE');
          // Also mark the linked booking as completed
          const contractObj = contracts.find(c => c.id === id);
          if (contractObj && contractObj.booking.id) {
            await bookingApi.updateStatus(contractObj.booking.id, 'COMPLETED');
          }
          Swal.fire({
            title: 'Thành công',
            text: 'Hợp đồng đã được kích hoạt thành công.',
            icon: 'success',
            confirmButtonColor: '#0f172a'
          });
          fetchAll();
        } catch (err) {
          Swal.fire({
            title: 'Lỗi',
            text: 'Lỗi duyệt kích hoạt hợp đồng: ' + err,
            icon: 'error',
            confirmButtonColor: '#0f172a'
          });
        }
      }
    });
  };

  const handleTerminate = async (id: number) => {
    Swal.fire({
      title: 'Thanh lý hợp đồng?',
      text: 'Hành động này sẽ thanh lý hợp đồng và giải phóng gian hàng thuê!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý thanh lý',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await contractApi.updateStatus(id, 'TERMINATED');
          Swal.fire({
            title: 'Đã thanh lý!',
            text: 'Hợp đồng đã được thanh lý.',
            icon: 'success',
            confirmButtonColor: '#0f172a'
          });
          fetchAll();
        } catch (err) {
          Swal.fire({
            title: 'Lỗi',
            text: 'Lỗi thanh lý hợp đồng: ' + err,
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
      <div className="contracts-page">
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
                  <th>Số hợp đồng</th>
                  <th>Khách thuê</th>
                  <th>Gian hàng</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Giá thuê</th>
                  <th>Tiền cọc</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '130px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '80px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
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
    <div className="contracts-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
            {isCustomer ? 'Hợp đồng của tôi' : 'Hợp đồng thuê gian hàng'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            {isCustomer ? 'Theo dõi danh sách các hợp đồng thuê gian hàng của bạn.' : 'Quản lý hợp đồng chính thức, thời hạn thuê, bảng giá thuê và trạng thái phê duyệt.'}
          </p>
        </div>
        {!isCustomer && (
          <button className="btn primary" onClick={() => setShowModal(true)} disabled={confirmedBookings.length === 0}>
            + Lập hợp đồng mới
          </button>
        )}
      </div>

      {!isCustomer && confirmedBookings.length === 0 && (
        <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '14px', marginBottom: '24px' }}>
          💡 Không có yêu cầu đặt chỗ nào ở trạng thái <strong>Đã duyệt</strong> để lập hợp đồng. Vui lòng phê duyệt một đặt chỗ trước.
        </div>
      )}

      <div className="section-card">
        <div className="table-responsive">
          <table className="app-table">
            <thead>
              <tr>
                <th>Mã hợp đồng</th>
                <th>Khách thuê</th>
                <th>Gian hàng</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Đơn giá thuê</th>
                <th>Tiền cọc</th>
                <th>Trạng thái</th>
                {!isCustomer && <th>Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.contractCode}</strong></td>
                  <td>{c.booking.customer.fullName}</td>
                  <td>{c.booking.booth.code}</td>
                  <td>{new Date(c.startDate).toLocaleDateString()}</td>
                  <td>{new Date(c.endDate).toLocaleDateString()}</td>
                  <td>{formatCurrency(c.rentPrice)}/tháng</td>
                  <td>{formatCurrency(c.deposit)}</td>
                  <td>
                    <span className={`badge ${
                      c.status === 'DRAFT' ? 'warning' :
                      c.status === 'ACTIVE' ? 'success' :
                      c.status === 'TERMINATED' ? 'danger' : 'secondary'
                    }`}>
                      {
                        c.status === 'DRAFT' ? 'Nháp / Chờ duyệt' :
                        c.status === 'ACTIVE' ? 'Hiệu lực' :
                        c.status === 'TERMINATED' ? 'Đã thanh lý' : 'Hết hạn'
                      }
                    </span>
                  </td>
                  {!isCustomer && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {c.status === 'DRAFT' && (
                          <button className="text-btn" onClick={() => c.id && handleActivate(c.id)}>Kích hoạt</button>
                        )}
                        {c.status === 'ACTIVE' && (
                          <button className="text-btn" style={{ color: '#ef4444' }} onClick={() => c.id && handleTerminate(c.id)}>Thanh lý</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={isCustomer ? 8 : 9} style={{ textAlign: 'center', color: '#94a3b8' }}>
                    Chưa có hợp đồng nào được tạo.
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
              <h3>Lập hợp đồng thuê mới</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Chọn đặt chỗ / giữ chỗ đã duyệt</label>
                  <select
                    required
                    value={newContract.bookingId}
                    onChange={(e) => setNewContract({ ...newContract, bookingId: e.target.value })}
                    style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    <option value="">Chọn yêu cầu giữ chỗ...</option>
                    {confirmedBookings.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.customer.fullName} - Gian {b.booth.code} ({new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày bắt đầu hợp đồng</label>
                    <input
                      type="date"
                      required
                      value={newContract.startDate}
                      onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày kết thúc hợp đồng</label>
                    <input
                      type="date"
                      required
                      value={newContract.endDate}
                      onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Giá thuê thỏa thuận (VND/tháng)</label>
                    <input
                      type="number"
                      required
                      value={newContract.rentPrice}
                      onChange={(e) => setNewContract({ ...newContract, rentPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tiền đặt cọc (VND)</label>
                    <input
                      type="number"
                      required
                      value={newContract.deposit}
                      onChange={(e) => setNewContract({ ...newContract, deposit: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tệp đính kèm (URL / Bản quét hợp đồng)</label>
                  <input
                    type="text"
                    value={newContract.contractFile}
                    onChange={(e) => setNewContract({ ...newContract, contractFile: e.target.value })}
                    placeholder="Đường dẫn file đính kèm hợp đồng đã ký..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn primary">Tạo HĐ Nháp</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
