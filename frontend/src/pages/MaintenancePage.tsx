import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector } from '../store/store';
import { maintenanceApi, boothApi, customerApi, contractApi } from '../api/rentalApi';
import type { MaintenanceRequest, Booth, User, Priority, MaintenanceStatus, Contract } from '../types';

export default function MaintenancePage() {
  const user = useAppSelector((state) => state.auth.user);
  const isCustomer = user?.role === 'ROLE_CUSTOMER';

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    boothId: '',
    customerId: '',
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [maintRes, boothRes, custRes, contractRes] = await Promise.all([
        maintenanceApi.getAll(),
        boothApi.getAll(),
        customerApi.getAll(),
        contractApi.getAll()
      ]);
      setRequests(maintRes.data);
      setBooths(boothRes.data);
      setCustomers(custRes.data);
      setContracts(contractRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedBooth = booths.find(b => b.id === Number(newRequest.boothId));
      const selectedCustomer = customers.find(c => c.id === Number(newRequest.customerId));

      if (!selectedBooth) {
        Swal.fire({
          title: 'Thông báo',
          text: 'Vui lòng chọn gian hàng!',
          icon: 'warning',
          confirmButtonColor: '#0f172a'
        });
        return;
      }

      await maintenanceApi.create({
        booth: selectedBooth,
        customer: selectedCustomer || undefined,
        title: newRequest.title,
        description: newRequest.description,
        priority: newRequest.priority,
        status: 'NEW'
      });

      Swal.fire({
        title: 'Thành công',
        text: 'Đã tạo yêu cầu hỗ trợ/vận hành kỹ thuật thành công!',
        icon: 'success',
        confirmButtonColor: '#0f172a'
      });

      setShowModal(false);
      setNewRequest({
        boothId: '',
        customerId: '',
        title: '',
        description: '',
        priority: 'MEDIUM'
      });
      fetchAll();
    } catch (err) {
      Swal.fire({
        title: 'Thất bại',
        text: 'Lỗi tạo yêu cầu vận hành: ' + err,
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
    }
  };

  const handleUpdateStatus = async (id: number, status: MaintenanceStatus) => {
    Swal.fire({
      title: 'Cập nhật trạng thái?',
      text: `Chuyển trạng thái yêu cầu này sang ${status === 'PROCESSING' ? 'Đang xử lý' : status === 'DONE' ? 'Hoàn thành' : 'Đã hủy'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await maintenanceApi.updateStatus(id, status);
          Swal.fire({
            title: 'Thành công',
            text: 'Cập nhật trạng thái yêu cầu bảo trì thành công!',
            icon: 'success',
            confirmButtonColor: '#0f172a'
          });
          fetchAll();
        } catch (err) {
          Swal.fire({
            title: 'Lỗi',
            text: 'Lỗi cập nhật trạng thái: ' + err,
            icon: 'error',
            confirmButtonColor: '#0f172a'
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="maintenance-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div className="skeleton skeleton-title" style={{ width: '280px', height: '24px' }} />
            <div className="skeleton skeleton-text" style={{ width: '380px', height: '14px' }} />
          </div>
        </div>
        <div className="kanban-board">
          {[1, 2, 3, 4].map(col => (
            <div key={col} className="kanban-col">
              <div className="skeleton skeleton-title" style={{ width: '80%', height: '16px', marginBottom: '16px' }} />
              {[1, 2].map(card => (
                <div key={card} className="skeleton-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton skeleton-text" style={{ width: '70%', height: '12px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '100%', height: '10px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '40%', height: '10px' }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group requests by status
  const columns: { label: string; status: MaintenanceStatus; bg: string }[] = [
    { label: 'Mới nhận', status: 'NEW', bg: '#eff6ff' },
    { label: 'Đang xử lý', status: 'PROCESSING', bg: '#fef3c7' },
    { label: 'Hoàn tất', status: 'DONE', bg: '#d1fae5' },
    { label: 'Đã hủy', status: 'CANCELLED', bg: '#f1f5f9' }
  ];

  const selectableBooths = isCustomer
    ? contracts.filter(c => c.status === 'ACTIVE').map(c => c.booking.booth)
    : booths;

  return (
    <div className="maintenance-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
            {isCustomer ? 'Yêu cầu hỗ trợ kỹ thuật' : 'Yêu cầu vận hành & Bảo trì'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            {isCustomer ? 'Gửi yêu cầu sửa chữa điện nước, cơ sở vật chất hoặc phản ánh dịch vụ vệ sinh an ninh.' : 'Theo dõi các báo cáo sửa chữa, sự cố điện nước, vệ sinh, an ninh hoặc bàn giao gian hàng.'}
          </p>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)} disabled={isCustomer && selectableBooths.length === 0}>
          + Tạo yêu cầu mới
        </button>
      </div>

      {isCustomer && selectableBooths.length === 0 && (
        <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '14px', marginBottom: '24px' }}>
          💡 Bạn không có gian hàng nào đang thuê để báo cáo bảo trì.
        </div>
      )}

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map(col => {
          const colRequests = requests.filter(r => r.status === col.status);
          return (
            <div key={col.status} className="kanban-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>
                  {col.label}
                </h3>
                <span className="badge secondary" style={{ fontSize: '12px' }}>{colRequests.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                {colRequests.map(req => (
                  <div key={req.id} className="kanban-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={`badge ${
                        req.priority === 'URGENT' ? 'danger' :
                        req.priority === 'HIGH' ? 'warning' :
                        req.priority === 'MEDIUM' ? 'info' : 'secondary'
                      }`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                        {req.priority}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                        Gian {req.booth.code}
                      </span>
                    </div>
                    
                    <h4 style={{ fontSize: '14px', margin: '4px 0' }}>{req.title}</h4>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>{req.description}</p>
                    
                    {!isCustomer && req.customer && (
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Khách: {req.customer.fullName}
                      </p>
                    )}

                    {/* Action buttons to transition status */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px', justifyContent: 'flex-end' }}>
                      {!isCustomer && req.status === 'NEW' && (
                        <button className="text-btn" style={{ fontSize: '11px' }} onClick={() => req.id && handleUpdateStatus(req.id, 'PROCESSING')}>
                          Xử lý
                        </button>
                      )}
                      {!isCustomer && req.status === 'PROCESSING' && (
                        <button className="text-btn" style={{ fontSize: '11px', color: '#10b981' }} onClick={() => req.id && handleUpdateStatus(req.id, 'DONE')}>
                          Hoàn tất
                        </button>
                      )}
                      {/* Customer can cancel only in NEW status. Admin can cancel any non-completed ticket */}
                      {((!isCustomer && req.status !== 'DONE' && req.status !== 'CANCELLED') || (isCustomer && req.status === 'NEW')) && (
                        <button className="text-btn" style={{ fontSize: '11px', color: '#ef4444' }} onClick={() => req.id && handleUpdateStatus(req.id, 'CANCELLED')}>
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {colRequests.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '24px 0' }}>Khu vực này trống.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Tạo yêu cầu sửa chữa / bảo trì</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>{isCustomer ? 'Chọn gian hàng của bạn gặp sự cố' : 'Chọn gian hàng xảy ra sự cố'}</label>
                  <select
                    required
                    value={newRequest.boothId}
                    onChange={(e) => setNewRequest({ ...newRequest, boothId: e.target.value })}
                    style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    <option value="">Chọn gian hàng...</option>
                    {selectableBooths.map(b => (
                      <option key={b.id} value={b.id}>{b.code} ({b.name}) - {b.area.name}</option>
                    ))}
                  </select>
                </div>

                {!isCustomer && (
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Khách thuê liên quan (không bắt buộc)</label>
                    <select
                      value={newRequest.customerId}
                      onChange={(e) => setNewRequest({ ...newRequest, customerId: e.target.value })}
                      style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      <option value="">Không có / Chưa xác định...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Tiêu đề sự cố</label>
                    <input
                      type="text"
                      required
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                      placeholder="Ví dụ: Rò rỉ nước ở chốt chặn A"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Mức độ ưu tiên</label>
                    <select
                      required
                      value={newRequest.priority}
                      onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as Priority })}
                      style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HIGH">Cao</option>
                      <option value="URGENT">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Chi tiết sự cố / Yêu cầu bảo trì</label>
                  <textarea
                    rows={3}
                    required
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Mô tả cụ thể hiện trạng hư hại, vị trí chi tiết để nhân viên vận hành đến xử lý kịp thời..."
                    style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn primary">Tạo yêu cầu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
