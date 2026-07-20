import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { managerApi, areaApi } from '../api/rentalApi';
import type { Manager, Area, User } from '../types';

const maskSensitiveInfo = (val?: string) => {
  if (!val) return '—';
  if (val.length <= 6) return '••••••';
  return val.slice(0, 3) + '••••••' + val.slice(-3);
};

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [areaId, setAreaId] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [mgrRes, areaRes] = await Promise.all([
        managerApi.getAll(),
        areaApi.getAll()
      ]);
      setManagers(mgrRes.data);
      setAreas(areaRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAddModal = () => {
    setEditingManager(null);
    setUsername('');
    setPassword('manager123');
    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setTaxCode('');
    setIdentityNumber('');
    setAreaId('');
    setShowModal(true);
  };

  const openEditModal = (mgr: Manager) => {
    setEditingManager(mgr);
    setUsername(mgr.user.username);
    setPassword(''); // leave blank for no change
    setFullName(mgr.user.fullName);
    setEmail(mgr.user.email);
    setPhone(mgr.user.phone || '');
    setAddress(mgr.user.address || '');
    setTaxCode(mgr.user.taxCode || '');
    setIdentityNumber(mgr.user.identityNumber || '');
    setAreaId(mgr.area ? String(mgr.area.id) : '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userPayload: Partial<User> = {
        username,
        fullName,
        email,
        phone,
        address,
        taxCode,
        identityNumber,
        role: 'ROLE_MANAGER'
      };

      const payload = {
        user: userPayload,
        areaId: areaId ? Number(areaId) : null,
        password: password || null
      };

      if (editingManager && editingManager.id) {
        await managerApi.update(editingManager.id, payload);
        Swal.fire({
          title: 'Thành công',
          text: 'Đã cập nhật thông tin quản lý thành công!',
          icon: 'success',
          confirmButtonColor: '#0f172a'
        });
      } else {
        await managerApi.create(payload);
        Swal.fire({
          title: 'Thành công',
          text: 'Đã thêm quản lý mới thành công!',
          icon: 'success',
          confirmButtonColor: '#0f172a'
        });
      }

      setShowModal(false);
      fetchAll();
    } catch (err) {
      Swal.fire({
        title: 'Thất bại',
        text: 'Lỗi lưu thông tin quản lý: ' + err,
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Tài khoản quản lý này và liên kết của họ sẽ bị xóa khỏi hệ thống!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await managerApi.delete(id);
          Swal.fire({
            title: 'Đã xóa!',
            text: 'Tài khoản quản lý đã được xóa.',
            icon: 'success',
            confirmButtonColor: '#0f172a'
          });
          fetchAll();
        } catch (err) {
          Swal.fire({
            title: 'Lỗi',
            text: 'Không thể xóa quản lý này: ' + err,
            icon: 'error',
            confirmButtonColor: '#0f172a'
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="managers-page">
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
                  <th>Họ tên</th>
                  <th>Tên đăng nhập</th>
                  <th>Khu vực quản lý</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text" style={{ width: '130px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '70px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '120px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
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

  return (
    <div className="managers-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-slate-900)', letterSpacing: '-0.5px' }}>Quản lý Managers</h2>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '14.5px', marginTop: '4px', fontWeight: 500 }}>
            Quản trị viên quản lý danh sách quản lý viên (Manager), phân quyền và gán khu vực làm việc (Area).
          </p>
        </div>
        <button className="btn primary" onClick={openAddModal}>+ Thêm quản lý</button>
      </div>

      <div className="section-card">
        <div className="table-responsive">
          <table className="app-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Tên đăng nhập</th>
                <th>Khu vực phụ trách</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>CCCD</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {managers.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.user.fullName}</strong></td>
                  <td>
                    <code style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {m.user.username}
                    </code>
                  </td>
                  <td>
                    {m.area ? (
                      <span className="chat-booth-pill" style={{ margin: 0, background: '#e0f2fe', color: '#0369a1' }}>
                        {m.area.name}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-danger)', fontWeight: 500 }}>Chưa gán khu vực</span>
                    )}
                  </td>
                  <td>{m.user.phone || '—'}</td>
                  <td>{m.user.email}</td>
                  <td>{maskSensitiveInfo(m.user.identityNumber)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="text-btn" style={{ color: 'var(--color-primary)' }} onClick={() => openEditModal(m)}>Sửa</button>
                      <button className="text-btn" style={{ color: 'var(--color-danger)' }} onClick={() => m.id && handleDelete(m.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có quản lý nào trong danh mục.</td>
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
              <h3>{editingManager ? 'Cập nhật thông tin Quản lý' : 'Thêm Quản lý mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên đăng nhập (Username)</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingManager}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ví dụ: managerA"
                    />
                  </div>
                  <div className="form-group">
                    <label>{editingManager ? 'Mật khẩu mới (Bỏ trống nếu giữ nguyên)' : 'Mật khẩu'}</label>
                    <input
                      type="text"
                      required={!editingManager}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mật khẩu tài khoản"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Họ tên Quản lý</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Quản Lý"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Khu vực phụ trách (Area)</label>
                    <select
                      value={areaId}
                      onChange={(e) => setAreaId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--color-slate-200)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        background: '#FFFFFF'
                      }}
                    >
                      <option value="">-- Chọn khu vực quản lý --</option>
                      {areas.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Số điện thoại liên hệ"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Số CCCD / Hộ chiếu</label>
                    <input
                      type="text"
                      value={identityNumber}
                      onChange={(e) => setIdentityNumber(e.target.value)}
                      placeholder="Số giấy tờ định danh"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mã số thuế (nếu có)</label>
                    <input
                      type="text"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      placeholder="Mã số thuế"
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Địa chỉ cư trú"
                    />
                  </div>
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
