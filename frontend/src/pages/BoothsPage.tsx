import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { areaApi, boothApi } from '../api/rentalApi';
import type { Area, Booth, BoothStatus } from '../types';

export default function BoothsPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showBoothModal, setShowBoothModal] = useState(false);
  const [newArea, setNewArea] = useState<Area>({ name: '', description: '', status: true });
  const [newBooth, setNewBooth] = useState({
    code: '',
    name: '',
    areaId: '',
    size: 0,
    rentPrice: 0,
    serviceFee: 0,
    status: 'AVAILABLE' as BoothStatus,
    description: ''
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [areaRes, boothRes] = await Promise.all([
        areaApi.getAll(),
        boothApi.getAll()
      ]);
      setAreas(areaRes.data);
      setBooths(boothRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await areaApi.create(newArea);
      Swal.fire({
        title: 'Thành công',
        text: 'Đã tạo phân khu/tầng mới thành công!',
        icon: 'success',
        confirmButtonColor: '#0f172a'
      });
      setShowAreaModal(false);
      setNewArea({ name: '', description: '', status: true });
      fetchAll();
    } catch (err) {
      Swal.fire({
        title: 'Thất bại',
        text: 'Lỗi tạo khu vực: ' + err,
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
    }
  };

  const handleCreateBooth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedAreaObj = areas.find(a => a.id === Number(newBooth.areaId));
      if (!selectedAreaObj) {
        Swal.fire({
          title: 'Thông báo',
          text: 'Vui lòng chọn khu vực hợp lệ!',
          icon: 'warning',
          confirmButtonColor: '#0f172a'
        });
        return;
      }

      await boothApi.create({
        code: newBooth.code,
        name: newBooth.name,
        area: selectedAreaObj,
        size: Number(newBooth.size),
        rentPrice: Number(newBooth.rentPrice),
        serviceFee: Number(newBooth.serviceFee),
        status: newBooth.status,
        description: newBooth.description
      });

      Swal.fire({
        title: 'Thành công',
        text: 'Đã tạo gian hàng mới thành công!',
        icon: 'success',
        confirmButtonColor: '#0f172a'
      });

      setShowBoothModal(false);
      setNewBooth({
        code: '',
        name: '',
        areaId: '',
        size: 0,
        rentPrice: 0,
        serviceFee: 0,
        status: 'AVAILABLE',
        description: ''
      });
      fetchAll();
    } catch (err) {
      Swal.fire({
        title: 'Thất bại',
        text: 'Lỗi tạo gian hàng: ' + err,
        icon: 'error',
        confirmButtonColor: '#0f172a'
      });
    }
  };

  const handleDeleteBooth = async (id: number) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Gian hàng này sẽ bị xóa khỏi danh mục hệ thống!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await boothApi.delete(id);
          Swal.fire({
            title: 'Đã xóa!',
            text: 'Gian hàng đã được xóa thành công.',
            icon: 'success',
            confirmButtonColor: '#0f172a'
          });
          fetchAll();
        } catch (err) {
          Swal.fire({
            title: 'Lỗi',
            text: 'Không thể xóa gian hàng này (đang có giao dịch hoặc hợp đồng hiện lực).',
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

  const filteredBooths = selectedAreaId === 'ALL'
    ? booths
    : booths.filter(b => b.area.id === Number(selectedAreaId));

  if (loading) {
    return (
      <div className="booths-page">
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
                  <th>Mã</th>
                  <th>Tên gian hàng</th>
                  <th>Diện tích</th>
                  <th>Giá thuê mặc định</th>
                  <th>Phí dịch vụ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text" style={{ width: '50px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '160px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '40px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '80px', height: '14px' }} /></td>
                    <td><div className="skeleton skeleton-text" style={{ width: '70px', height: '14px' }} /></td>
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
    <div className="booths-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Danh mục Gian hàng & Khu vực</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Quản lý sơ đồ mặt bằng, bảng giá, trạng thái các gian hàng.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn secondary" onClick={() => setShowAreaModal(true)}>+ Thêm khu vực</button>
          <button className="btn primary" onClick={() => setShowBoothModal(true)}>+ Thêm gian hàng</button>
        </div>
      </div>

      {/* Filter and overview tab */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Lọc theo khu vực:</span>
        <select
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minWidth: '180px' }}
        >
          <option value="ALL">Tất cả khu vực</option>
          {areas.map(area => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          Hiển thị: <strong>{filteredBooths.length}</strong> gian hàng.
        </span>
      </div>

      {/* Booths list */}
      <div className="section-card">
        <div className="table-responsive">
          <table className="app-table">
            <thead>
              <tr>
                <th>Mã gian hàng</th>
                <th>Tên</th>
                <th>Khu vực</th>
                <th>Diện tích</th>
                <th>Giá thuê mặc định</th>
                <th>Phí dịch vụ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooths.map(booth => (
                <tr key={booth.id}>
                  <td><strong>{booth.code}</strong></td>
                  <td>{booth.name}</td>
                  <td>{booth.area.name}</td>
                  <td>{booth.size} m²</td>
                  <td>{formatCurrency(booth.rentPrice)}</td>
                  <td>{booth.serviceFee ? formatCurrency(booth.serviceFee) : '0 ₫'}</td>
                  <td>
                    <span className={`badge ${
                      booth.status === 'AVAILABLE' ? 'success' :
                      booth.status === 'RESERVED' ? 'warning' :
                      booth.status === 'RENTED' ? 'info' : 'danger'
                    }`}>
                      {
                        booth.status === 'AVAILABLE' ? 'Trống' :
                        booth.status === 'RESERVED' ? 'Giữ chỗ' :
                        booth.status === 'RENTED' ? 'Đang thuê' : 'Bảo trì'
                      }
                    </span>
                  </td>
                  <td>
                    <button className="text-btn" style={{ color: '#ef4444' }} onClick={() => booth.id && handleDeleteBooth(booth.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
              {filteredBooths.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có gian hàng nào trong danh mục này.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Area Modal */}
      {showAreaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Thêm khu vực mới</h3>
              <button className="modal-close" onClick={() => setShowAreaModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateArea}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Tên khu vực / Tầng / Phân khu</label>
                  <input
                    type="text"
                    required
                    value={newArea.name}
                    onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                    placeholder="Ví dụ: Tầng 1 - Khu A"
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả thêm</label>
                  <textarea
                    rows={3}
                    value={newArea.description}
                    onChange={(e) => setNewArea({ ...newArea, description: e.target.value })}
                    placeholder="Mô tả vị trí hoặc phân loại mặt hàng kinh doanh..."
                    style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn secondary" onClick={() => setShowAreaModal(false)}>Hủy</button>
                <button type="submit" className="btn primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booth Modal */}
      {showBoothModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Thêm gian hàng mới</h3>
              <button className="modal-close" onClick={() => setShowBoothModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateBooth}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Mã gian hàng</label>
                    <input
                      type="text"
                      required
                      value={newBooth.code}
                      onChange={(e) => setNewBooth({ ...newBooth, code: e.target.value })}
                      placeholder="Ví dụ: GH-101"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên gian hàng</label>
                    <input
                      type="text"
                      required
                      value={newBooth.name}
                      onChange={(e) => setNewBooth({ ...newBooth, name: e.target.value })}
                      placeholder="Ví dụ: Gian hàng Thời trang A"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Khu vực</label>
                    <select
                      required
                      value={newBooth.areaId}
                      onChange={(e) => setNewBooth({ ...newBooth, areaId: e.target.value })}
                      style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      <option value="">Chọn khu vực...</option>
                      {areas.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Diện tích (m²)</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      value={newBooth.size}
                      onChange={(e) => setNewBooth({ ...newBooth, size: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Giá thuê mặc định (VND)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newBooth.rentPrice}
                      onChange={(e) => setNewBooth({ ...newBooth, rentPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phí dịch vụ mặc định (VND)</label>
                    <input
                      type="number"
                      min="0"
                      value={newBooth.serviceFee}
                      onChange={(e) => setNewBooth({ ...newBooth, serviceFee: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả chi tiết</label>
                  <textarea
                    rows={2}
                    value={newBooth.description}
                    onChange={(e) => setNewBooth({ ...newBooth, description: e.target.value })}
                    placeholder="Mô tả ngành hàng phù hợp, thiết bị đi kèm..."
                    style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn secondary" onClick={() => setShowBoothModal(false)}>Hủy</button>
                <button type="submit" className="btn primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
