export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id?: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  identityNumber?: string;
  role: string;
}

export interface Area {
  id?: number;
  name: string;
  description?: string;
  status: boolean;
}

export type BoothStatus = 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';

export interface Booth {
  id?: number;
  code: string;
  name: string;
  area: Area;
  size: number;
  rentPrice: number;
  serviceFee?: number;
  status: BoothStatus;
  image?: string;
  description?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id?: number;
  customer: User;
  booth: Booth;
  bookingDate?: string;
  startDate: string;
  endDate: string;
  deposit?: number;
  totalPrice: number;
  status: BookingStatus;
  note?: string;
}

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export interface Contract {
  id?: number;
  contractCode?: string;
  booking: Booking;
  startDate: string;
  endDate: string;
  rentPrice: number;
  deposit: number;
  status: ContractStatus;
  contractFile?: string;
  createdAt?: string;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'PARTIAL';

export interface Payment {
  id?: number;
  contract: Contract;
  amount: number;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  status: PaymentStatus;
  note?: string;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type MaintenanceStatus = 'NEW' | 'PROCESSING' | 'DONE' | 'CANCELLED';

export interface MaintenanceRequest {
  id?: number;
  booth: Booth;
  customer?: User;
  title: string;
  description: string;
  priority: Priority;
  status: MaintenanceStatus;
  createdAt?: string;
  completedAt?: string;
}

export interface Notification {
  id?: number;
  user: User;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
