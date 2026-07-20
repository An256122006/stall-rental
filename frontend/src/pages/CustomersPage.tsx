import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { customerApi } from '../api/rentalApi';
import type { User } from '../types';
import { useAppSelector } from '../store/store';

const maskSensitiveInfo = (val?: string) => {
  if (!val) return '—';
  if (val.length <= 6) return '••••••';
  return val.slice(0, 3) + '••••••' + val.slice(-3);
};

export default function CustomersPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState<User>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    taxCode: '',
    identityNumber: '',
    role: 'ROLE_CUSTOMER'
  });
  const [password, setPassword] = useState('customer123'); // Default password

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await customerApi.getAll();
      setCustomers(res.data);
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
      // Send username, password and role along with the profile data
      const payload = {
        ...newCustomer,
        password: password
      };
      await customerApi.create(payload);
      
      Swal.fire({
        title: 'Thành công',
        text: 'Đã tạo tài khoản khách thuê mới thành công!',
        icon: 'success',
        confirmButtonColor: '#0f172a'
      });

      setShowModal(false);
      setNewCustomer({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        taxCode: '',
        identityNumber: '',
        role: 'ROLE_CUSTOMER'
      });
      setPassword('customer123');
      fetchAll();
    } catch (err) {
      Swal.fire({
        title: 'Thất bại',
        text: 'Lỗi thêm khách thuê: ' + err,
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Tài khoản khách thuê này sẽ bị xóa khỏi hệ thống!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await customerApi.delete(id);
          Swal.fire({
            title: 'Đã xóa!',
            text: 'Tài khoản khách thuê đã được xóa.',
            icon: 'success',
            confirmButtonColor: '#0f172a'
          });
          fetchAll();
        } catch (err) {
          Swal.fire({
            title: 'Lỗi',
            text: 'Không thể xóa khách thuê này (đang liên kết với hợp đồng hoặc giao dịch hiện lực).',
            icon: 'error',
            confirmButtonColor: '#0f172a'
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="customers-page">
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
                  <th>Họ tên / Pháp nhân</th>
                  <th>Tên đăng nhập</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Mã số thuế</th>
                  <th>CCCD / GPKD</th>
                  <th>Địa chỉ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text" style={{ width: '130px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '70px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '150px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '80px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '160px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '50px', height: '14px' }} /></td>
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
    <div className="customers-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-slate-900)', letterSpacing: '-0.5px' }}>Quản lý Khách thuê</h2>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '14.5px', marginTop: '4px', fontWeight: 500 }}>Lưu trữ thông tin liên hệ, tài khoản đăng nhập, và thông tin doanh nghiệp của khách thuê.</p>
        </div>
        {isAdmin && (
          <button className="btn primary" onClick={() => setShowModal(true)}>+ Thêm khách thuê</button>
        )}
      </div>

      <div className="section-card">
        <div className="table-responsive">
          <table className="app-table">
            <thead>
              <tr>
                <th>Họ tên / Pháp nhân</th>
                <th>Tên đăng nhập</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Mã số thuế</th>
                <th>CCCD / GPKD</th>
                <th>Địa chỉ</th>
                {isAdmin && <th>Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.fullName}</strong></td>
                  <td><code style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>{c.username}</code></td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.email || 'Chưa cung cấp'}</td>
                  <td>{maskSensitiveInfo(c.taxCode)}</td>
                  <td>{maskSensitiveInfo(c.identityNumber)}</td>
                  <td>{c.address || '—'}</td>
                  {isAdmin && (
                    <td>
                      <button className="text-btn" style={{ color: 'var(--color-danger)' }} onClick={() => c.id && handleDelete(c.id)}>Xóa</button>
                    </td>
                  )}
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có khách thuê nào trong danh mục.</td>
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
              <h3>Thêm tài khoản & Khách thuê mới</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên đăng nhập (Username)</label>
                    <input
                      type="text"
                      required
                      value={newCustomer.username}
                      onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
                      placeholder="Ví dụ: nguyenvanA"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu đăng nhập</label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mật khẩu tài khoản"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Họ tên khách thuê / Tên doanh nghiệp</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.fullName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                    placeholder="Ví dụ: Công ty TNHH Thời trang ABC hoặc Nguyễn Văn A"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      required
                      value={newCustomer.phone || ''}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      placeholder="Số điện thoại liên hệ"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      required
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="Email nhận thông báo"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mã số thuế (nếu có)</label>
                    <input
                      type="text"
                      value={newCustomer.taxCode || ''}
                      onChange={(e) => setNewCustomer({ ...newCustomer, taxCode: e.target.value })}
                      placeholder="Mã số thuế xuất hóa đơn"
                    />
                  </div>
                  <div className="form-group">
                    <label>Số CCCD / GPKD</label>
                    <input
                      type="text"
                      value={newCustomer.identityNumber || ''}
                      onChange={(e) => setNewCustomer({ ...newCustomer, identityNumber: e.target.value })}
                      placeholder="Số giấy tờ định danh"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={newCustomer.address || ''}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    placeholder="Địa chỉ giao dịch chính"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
