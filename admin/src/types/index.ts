export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  clientName: string;
  phone: string;
  type: 'pool' | 'cafe';
  resourceName: string; // e.g., "Table 1" or "Turf A"
  subType: string; // e.g., "8-Ball", "Snooker", "Cricket", "Football"
  timeSlot: string; // e.g., "14:00 - 15:00"
  duration: string; // e.g., "1 hour"
  location?: string; // Only for turf
  amount: number;
  status: BookingStatus;
  createdAt: string;
  pre_orders?: { name: string; quantity: number; price: number }[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  lastBookingDate: string;
  isNew?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Pool Staff' | 'Cafe Staff' | 'Manager' | 'Admin';
  onDuty: boolean;
  contact: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'pool' | 'cafe' | 'general';
  totalStock: number;
  used: number;
  minStock: number;
  unit: string;
}


export interface TableSession {
  bookingId: string; // Added for backend actions
  customerName: string;
  phone: string;
  startTime: string; // ISO string for easier serialization
  bookedDuration: number; // minutes
  cafeOrders: { menu_item_id: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
}

export interface PoolTable {
  id: string;
  name: string;
  category: '8-Ball' | 'Snooker' | 'Small' | 'King Size' | 'Premium';
  isActive: boolean;
  pricePerHour: number;
  currentSession?: TableSession;
}

export interface CafeItem {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  image?: string;
  description?: string;
}

export interface CafeOrder {
  id: string;
  tableId: string; // or order #
  customerName?: string;
  items: { itemId: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'Pending' | 'preparing' | 'served' | 'paid';
  createdAt: string;
}

export interface CafeInventory {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
}
