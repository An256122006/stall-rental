import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector } from '../store/store';
import { contractApi, bookingApi } from '../api/rentalApi';
import type { Contract, Booking } from '../types';

export default function ContractsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isCustomer = user?.role === 'ROLE_CUSTOMER';
  const isAdmin = user?.role === 'ROLE_ADMIN';

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
  const [uploading, setUploading] = useState(false);
  const [viewContract, setViewContract] = useState<Contract | null>(null);

  const sha1 = async (str: string) => {
    const utf8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      Swal.fire({
        title: 'Lỗi cấu hình',
        text: 'Thiếu cấu hình Cloudinary trong file .env!',
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
      return;
    }

    try {
      setUploading(true);
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'contracts';
      const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = await sha1(signatureStr);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', folder);
      formData.append('signature', signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Lỗi tải lên Cloudinary');
      }

      const data = await response.json();
      setNewContract(prev => ({ ...prev, contractFile: data.secure_url }));
      Swal.fire({
        title: 'Thành công',
        text: 'Đã tải tệp lên Cloudinary thành công!',
        icon: 'success',
        confirmButtonColor: '#0f172a',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Tải tệp thất bại',
        text: err.message || 'Lỗi kết nối hoặc chữ ký không hợp lệ.',
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
    } finally {
      setUploading(false);
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-slate-900)', letterSpacing: '-0.5px' }}>
            {isCustomer ? 'Hợp đồng của tôi' : 'Hợp đồng thuê gian hàng'}
          </h2>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '14.5px', marginTop: '4px', fontWeight: 500 }}>
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
        <div style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-warning-border)', fontSize: '14px', marginBottom: '32px', fontWeight: 500 }}>
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
                <th>Hành động</th>
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
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isCustomer ? (
                        c.contractFile ? (
                          <button
                            type="button"
                            className="text-btn"
                            style={{ fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontFamily: 'inherit' }}
                            onClick={() => setViewContract(c)}
                          >
                            Xem hợp đồng
                          </button>
                        ) : (
                          <span style={{ color: 'var(--color-slate-400)', fontSize: '13px', fontStyle: 'italic' }}>Chưa có tệp</span>
                        )
                      ) : (
                        <>
                          {c.status === 'DRAFT' && isAdmin && (
                            <button className="text-btn" onClick={() => c.id && handleActivate(c.id)}>Kích hoạt</button>
                          )}
                          {c.status === 'ACTIVE' && isAdmin && (
                            <button className="text-btn" style={{ color: 'var(--color-danger)' }} onClick={() => c.id && handleTerminate(c.id)}>Thanh lý</button>
                          )}
                          {c.status === 'DRAFT' && !isAdmin && (
                            <span style={{ color: 'var(--color-slate-400)', fontSize: '13px', fontStyle: 'italic' }}>Chờ Admin kích hoạt</span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8' }}>
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
                  <label>Tệp đính kèm (Bản quét / Ảnh chụp hợp đồng)</label>
                  {uploading ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      border: '1px dashed var(--color-slate-300)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-slate-50)',
                      color: 'var(--color-slate-600)'
                    }}>
                      <div className="spinner" style={{
                        width: '20px',
                        height: '20px',
                        borderWidth: '2px'
                      }}></div>
                      <span>Đang tải tệp lên đám mây... Vui lòng đợi</span>
                    </div>
                  ) : newContract.contractFile ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      border: '1px solid #22c55e',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      fontSize: '14px',
                      fontWeight: 500
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>📄</span>
                        <a href={newContract.contractFile} target="_blank" rel="noopener noreferrer" style={{ color: '#166534', textDecoration: 'underline', fontWeight: 600 }}>
                          Xem tệp đã tải lên
                        </a>
                      </div>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '13px'
                        }}
                        onClick={() => setNewContract(prev => ({ ...prev, contractFile: '' }))}
                      >
                        Xóa & Tải lại
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px',
                      border: '2px dashed var(--color-slate-300)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-slate-50)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}>
                      <input
                        type="file"
                        accept="image/*,application/pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{ fontSize: '24px', marginBottom: '8px' }}>📤</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                        Nhấp hoặc kéo thả để tải lên bản quét hợp đồng
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
                        Hỗ trợ PDF, hình ảnh, Word (Tối đa 10MB)
                      </span>
                    </div>
                  )}
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
      {viewContract && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', width: '90%' }}>
            <div className="modal-header">
              <h3>Chi tiết Hợp đồng: {viewContract.contractCode}</h3>
              <button className="modal-close" onClick={() => setViewContract(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ marginBottom: '16px', color: 'var(--color-slate-800)', borderBottom: '2px solid var(--color-slate-200)', paddingBottom: '8px', fontWeight: 600 }}>
                  Thông tin hợp đồng
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--color-slate-500)', width: '40%' }}>Mã hợp đồng:</td>
                      <td style={{ padding: '10px 0', color: 'var(--color-slate-900)' }}><strong>{viewContract.contractCode}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--color-slate-500)' }}>Khách thuê:</td>
                      <td style={{ padding: '10px 0', color: 'var(--color-slate-900)' }}>{viewContract.booking.customer.fullName}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--color-slate-500)' }}>Gian hàng:</td>
                      <td style={{ padding: '10px 0', color: 'var(--color-slate-900)', fontWeight: 600 }}>{viewContract.booking.booth.code} ({viewContract.booking.booth.name})</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--color-slate-500)' }}>Thời hạn thuê:</td>
                      <td style={{ padding: '10px 0', color: 'var(--color-slate-900)' }}>
                        {new Date(viewContract.startDate).toLocaleDateString()} - {new Date(viewContract.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--color-slate-500)' }}>Đơn giá thuê:</td>
                      <td style={{ padding: '10px 0', color: 'var(--color-slate-900)', fontWeight: 600 }}>{formatCurrency(viewContract.rentPrice)}/tháng</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--color-slate-500)' }}>Tiền đặt cọc:</td>
                      <td style={{ padding: '10px 0', color: 'var(--color-slate-900)' }}>{formatCurrency(viewContract.deposit)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--color-slate-500)' }}>Trạng thái:</td>
                      <td style={{ padding: '10px 0' }}>
                        <span className={`badge ${
                          viewContract.status === 'DRAFT' ? 'warning' :
                          viewContract.status === 'ACTIVE' ? 'success' :
                          viewContract.status === 'TERMINATED' ? 'danger' : 'secondary'
                        }`}>
                          {
                            viewContract.status === 'DRAFT' ? 'Nháp / Chờ duyệt' :
                            viewContract.status === 'ACTIVE' ? 'Hiệu lực' :
                            viewContract.status === 'TERMINATED' ? 'Đã thanh lý' : 'Hết hạn'
                          }
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h4 style={{ marginBottom: '16px', color: 'var(--color-slate-800)', borderBottom: '2px solid var(--color-slate-200)', paddingBottom: '8px', fontWeight: 600 }}>
                  Bản quét hợp đồng
                </h4>
                {viewContract.contractFile ? (
                  <div style={{ border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--color-slate-50)', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {viewContract.contractFile.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={viewContract.contractFile}
                        title="Bản quét hợp đồng"
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                      />
                    ) : viewContract.contractFile.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/) ? (
                      <img
                        src={viewContract.contractFile}
                        alt="Bản quét hợp đồng"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '16px', fontSize: '14.5px', color: 'var(--color-slate-600)', fontWeight: 500 }}>
                          Xem hoặc tải xuống bản quét hợp đồng đã ký do Quản lý/Admin tạo:
                        </p>
                        <a
                          href={viewContract.contractFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn primary"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}
                        >
                          📥 Tải tệp xuống / Xem trực tiếp
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: '350px', border: '1px dashed var(--color-slate-300)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-slate-400)', fontSize: '14px', fontStyle: 'italic' }}>
                    Chưa đính kèm bản quét hợp đồng.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-slate-200)', paddingTop: '16px', marginTop: '16px' }}>
              {viewContract.contractFile && (
                <a
                  href={viewContract.contractFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn secondary"
                  style={{ textDecoration: 'none' }}
                >
                  Mở tệp ở tab mới
                </a>
              )}
              <button className="btn primary" onClick={() => setViewContract(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
