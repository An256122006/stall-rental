import axiosClient from './axiosClient';
import type {
  Area,
  Booth,
  User,
  Booking,
  BookingStatus,
  Contract,
  ContractStatus,
  Payment,
  PaymentMethod,
  MaintenanceRequest,
  MaintenanceStatus,
  Notification
} from '../types';

export const areaApi = {
  getAll: () => axiosClient.get<Area[]>('/api/areas'),
  getById: (id: number) => axiosClient.get<Area>(`/api/areas/${id}`),
  create: (data: Area) => axiosClient.post<Area>('/api/areas', data),
  update: (id: number, data: Area) => axiosClient.put<Area>(`/api/areas/${id}`, data),
  delete: (id: number) => axiosClient.delete<void>(`/api/areas/${id}`)
};

export const boothApi = {
  getAll: () => axiosClient.get<Booth[]>('/api/booths'),
  getById: (id: number) => axiosClient.get<Booth>(`/api/booths/${id}`),
  getByArea: (areaId: number) => axiosClient.get<Booth[]>(`/api/booths/area/${areaId}`),
  create: (data: Booth) => axiosClient.post<Booth>('/api/booths', data),
  update: (id: number, data: Booth) => axiosClient.put<Booth>(`/api/booths/${id}`, data),
  delete: (id: number) => axiosClient.delete<void>(`/api/booths/${id}`)
};

export const customerApi = {
  getAll: () => axiosClient.get<User[]>('/api/customers'),
  getById: (id: number) => axiosClient.get<User>(`/api/customers/${id}`),
  create: (data: User) => axiosClient.post<User>('/api/customers', data),
  update: (id: number, data: User) => axiosClient.put<User>(`/api/customers/${id}`, data),
  delete: (id: number) => axiosClient.delete<void>(`/api/customers/${id}`)
};

export const bookingApi = {
  getAll: () => axiosClient.get<Booking[]>('/api/bookings'),
  getById: (id: number) => axiosClient.get<Booking>(`/api/bookings/${id}`),
  create: (data: Booking) => axiosClient.post<Booking>('/api/bookings', data),
  update: (id: number, data: Booking) => axiosClient.put<Booking>(`/api/bookings/${id}`, data),
  updateStatus: (id: number, status: BookingStatus) =>
    axiosClient.patch<Booking>(`/api/bookings/${id}/status?status=${status}`),
  delete: (id: number) => axiosClient.delete<void>(`/api/bookings/${id}`)
};

export const contractApi = {
  getAll: () => axiosClient.get<Contract[]>('/api/contracts'),
  getById: (id: number) => axiosClient.get<Contract>(`/api/contracts/${id}`),
  create: (data: Contract) => axiosClient.post<Contract>('/api/contracts', data),
  update: (id: number, data: Contract) => axiosClient.put<Contract>(`/api/contracts/${id}`, data),
  updateStatus: (id: number, status: ContractStatus) =>
    axiosClient.patch<Contract>(`/api/contracts/${id}/status?status=${status}`),
  delete: (id: number) => axiosClient.delete<void>(`/api/contracts/${id}`)
};

export const paymentApi = {
  getAll: () => axiosClient.get<Payment[]>('/api/payments'),
  getById: (id: number) => axiosClient.get<Payment>(`/api/payments/${id}`),
  getByContract: (contractId: number) => axiosClient.get<Payment[]>(`/api/payments/contract/${contractId}`),
  create: (data: Payment) => axiosClient.post<Payment>('/api/payments', data),
  update: (id: number, data: Payment) => axiosClient.put<Payment>(`/api/payments/${id}`, data),
  pay: (id: number, method: PaymentMethod, note?: string) =>
    axiosClient.post<Payment>(`/api/payments/${id}/pay?method=${method}${note ? `&note=${encodeURIComponent(note)}` : ''}`),
  delete: (id: number) => axiosClient.delete<void>(`/api/payments/${id}`)
};

export const maintenanceApi = {
  getAll: () => axiosClient.get<MaintenanceRequest[]>('/api/maintenance-requests'),
  getById: (id: number) => axiosClient.get<MaintenanceRequest>(`/api/maintenance-requests/${id}`),
  getByBooth: (boothId: number) => axiosClient.get<MaintenanceRequest[]>(`/api/maintenance-requests/booth/${boothId}`),
  getByCustomer: (customerId: number) => axiosClient.get<MaintenanceRequest[]>(`/api/maintenance-requests/customer/${customerId}`),
  create: (data: MaintenanceRequest) => axiosClient.post<MaintenanceRequest>('/api/maintenance-requests', data),
  update: (id: number, data: MaintenanceRequest) => axiosClient.put<MaintenanceRequest>(`/api/maintenance-requests/${id}`, data),
  updateStatus: (id: number, status: MaintenanceStatus) =>
    axiosClient.patch<MaintenanceRequest>(`/api/maintenance-requests/${id}/status?status=${status}`),
  delete: (id: number) => axiosClient.delete<void>(`/api/maintenance-requests/${id}`)
};

export const notificationApi = {
  getAll: () => axiosClient.get<Notification[]>('/api/notifications'),
  getById: (id: number) => axiosClient.get<Notification>(`/api/notifications/${id}`),
  getByUser: (userId: number) => axiosClient.get<Notification[]>(`/api/notifications/user/${userId}`),
  getUnreadByUser: (userId: number) => axiosClient.get<Notification[]>(`/api/notifications/user/${userId}/unread`),
  create: (data: Notification) => axiosClient.post<Notification>('/api/notifications', data),
  markAsRead: (id: number) => axiosClient.patch<Notification>(`/api/notifications/${id}/read`),
  delete: (id: number) => axiosClient.delete<void>(`/api/notifications/${id}`)
};
