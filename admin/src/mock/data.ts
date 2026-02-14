import { Booking, Client, Staff, InventoryItem, PoolTable, CafeItem, CafeOrder } from '../types';

export const mockBookings: Booking[] = [
    {
        id: '1',
        clientName: 'Rahul Sharma',
        phone: '+91 9876543210',
        type: 'pool',
        resourceName: 'Table 1',
        subType: '8-Ball',
        timeSlot: '14:00 - 15:00',
        duration: '1 hour',
        amount: 500,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        clientName: 'Rahul Sharma',
        phone: '+91 9876543210',
        type: 'pool',
        resourceName: 'Table 2',
        subType: 'Snooker',
        timeSlot: '16:00 - 18:00',
        duration: '2 hours',
        amount: 1000,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    },
    {
        id: '3',
        clientName: 'Anjali Gupta',
        phone: '+91 8765432109',
        type: 'cafe',
        resourceName: 'Table 5',
        subType: 'Dine-in',
        timeSlot: '18:00 - 19:00',
        duration: '1 hour',
        amount: 350,
        status: 'pending',
        createdAt: new Date().toISOString(),
    },
    {
        id: '4',
        clientName: 'Vikram Singh',
        phone: '+91 7654321098',
        type: 'pool',
        resourceName: 'Table 3',
        subType: 'Snooker',
        timeSlot: '16:00 - 17:00',
        duration: '1 hour',
        amount: 800,
        status: 'completed',
        createdAt: new Date().toISOString(),
    },
    {
        id: '5',
        clientName: 'Vikram Singh',
        phone: '+91 7654321098',
        type: 'pool',
        resourceName: 'Table 1',
        subType: '8-Ball',
        timeSlot: '12:00 - 13:00',
        duration: '1 hour',
        amount: 400,
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
];

export const mockClients: Client[] = [
    {
        id: '1',
        name: 'Rahul Sharma',
        phone: '+91 9876543210',
        email: 'rahul@example.com',
        totalBookings: 15,
        lastBookingDate: '2025-12-23',
    },
    {
        id: '2',
        name: 'Anjali Gupta',
        phone: '+91 8765432109',
        email: 'anjali@example.com',
        totalBookings: 3,
        lastBookingDate: '2025-12-24',
    },
    {
        id: '3',
        name: 'Vikram Singh',
        phone: '+91 7654321098',
        email: 'vikram@example.com',
        totalBookings: 8,
        lastBookingDate: '2025-12-22',
    },
    {
        id: '4',
        name: 'New User',
        phone: '+91 9999988888',
        email: 'new@example.com',
        totalBookings: 1,
        lastBookingDate: '2025-12-24',
        isNew: true,
    },
];

export const mockStaff: Staff[] = [
    {
        id: '1',
        name: 'Amit Kumar',
        role: 'Pool Staff',
        onDuty: true,
        contact: '+91 9111122222',
    },
    {
        id: '2',
        name: 'Suresh Rai',
        role: 'Cafe Staff',
        onDuty: true,
        contact: '+91 9333344444',
    },
];

export const mockInventory: InventoryItem[] = [
    {
        id: '1',
        name: 'Cue Chalk (Blue)',
        category: 'pool',
        totalStock: 50,
        used: 12,
        minStock: 10,
        unit: 'pcs',
    },
    {
        id: '2',
        name: 'Snooker Cues',
        category: 'pool',
        totalStock: 20,
        used: 2, // Broken or maintenance
        minStock: 5,
        unit: 'pcs',
    },
    {
        id: '3',
        name: 'Gloves',
        category: 'pool',
        totalStock: 30,
        used: 25,
        minStock: 8,
        unit: 'pairs',
    },
    {
        id: '4',
        name: 'Coffee Beans',
        category: 'cafe',
        totalStock: 10,
        used: 3,
        minStock: 2,
        unit: 'kg',
    },
    {
        id: '5',
        name: 'Cigarettes (Pack)',
        category: 'cafe',
        totalStock: 100,
        used: 45,
        minStock: 20,
        unit: 'packs',
    },
    {
        id: '6',
        name: 'Maggi Packets',
        category: 'cafe',
        totalStock: 200,
        used: 150,
        minStock: 30,
        unit: 'pcs',
    },
    {
        id: '7',
        name: 'Bread Loaves',
        category: 'cafe',
        totalStock: 15,
        used: 12,
        minStock: 5,
        unit: 'pcs',
    },
    {
        id: '8',
        name: 'Coke Cans',
        category: 'cafe',
        totalStock: 48,
        used: 48,
        minStock: 12,
        unit: 'cans',
    },
];

export const mockPoolTables: PoolTable[] = [
    { id: 't1', name: 'Snooker Table 1', category: 'Snooker', isActive: true, pricePerHour: 120 },
    { id: 't2', name: 'Snooker Table 2', category: 'Snooker', isActive: true, pricePerHour: 120 },
];

export const mockCafeItems: CafeItem[] = [
    {
        id: 'c1',
        name: 'Cappuccino',
        category: 'Beverages',
        price: 150,
        inStock: true,
        description: 'Freshly brewed italian coffee with steamed milk foam.',
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80'
    },
    {
        id: 'c2',
        name: 'Classic Burger',
        category: 'Food',
        price: 250,
        inStock: true,
        description: 'Juicy beef patty with lettuce, tomato, and cheese.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'
    },
    {
        id: 'c3',
        name: 'French Fries',
        category: 'Sides',
        price: 120,
        inStock: true,
        description: 'Crispy salted fries served with ketchup.',
        image: 'https://images.unsplash.com/photo-1573080496987-a199f8cd4054?w=800&q=80'
    },
    {
        id: 'c4',
        name: 'Iced Tea',
        category: 'Beverages',
        price: 100,
        inStock: true,
        description: 'Chilled lemon iced tea.',
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80'
    },
    {
        id: 'c5',
        name: 'Club Sandwich',
        category: 'Food',
        price: 200,
        inStock: false,
        description: 'Triple layer sandwich with chicken, bacon and egg.',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80'
    }
];

export const mockCafeOrders: CafeOrder[] = [
    {
        id: 'o1',
        tableId: 'T1',
        items: [
            { itemId: 'c1', name: 'Cappuccino', quantity: 2, price: 150 },
            { itemId: 'c3', name: 'French Fries', quantity: 1, price: 120 }
        ],
        totalAmount: 420,
        status: 'served',
        createdAt: new Date().toISOString()
    },
    {
        id: 'o2',
        tableId: 'T3',
        items: [
            { itemId: 'c2', name: 'Classic Burger', quantity: 1, price: 250 }
        ],
        totalAmount: 250,
        status: 'preparing',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
    }
];
