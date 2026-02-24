export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  name: string;
  sku: string;
  qty: number;
  rate: number;
  amount: number;
  image?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid';
  total: number;
  amountPaid: number;
  amountDue: number;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Payment {
  id: string;
  date: string;
  invoiceId: string;
  amount: number;
  method: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Cash' | 'Check' | 'UPI';
  reference: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  date: string;
  items: { name: string; qty: number; reason: string }[];
  status: 'Requested' | 'Approved' | 'Rejected' | 'Picked Up' | 'Refunded';
  refundAmount: number;
  refundMethod: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdDate: string;
  lastUpdate: string;
  messages: { sender: string; message: string; date: string; isAgent: boolean }[];
}

export interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export const customerProfile = {
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@techcorp.in',
  phone: '+91 98765 43210',
  company: 'TechCorp Solutions Pvt. Ltd.',
  customerId: 'CUST-2024-00142',
  loyaltyPoints: 4850,
  loyaltyTier: 'Gold',
  memberSince: '2022-03-15',
  creditLimit: 500000,
  outstandingBalance: 78450,
  totalSpent: 2456780,
  avatar: '',
};

export const orders: Order[] = [
  {
    id: 'SO-2026-0234', date: '2026-02-10', status: 'Shipped', total: 45600, paymentMethod: 'Credit Card',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK9876543210', estimatedDelivery: '2026-02-15',
    items: [
      { name: 'Dell Latitude 5540 Laptop', sku: 'DELL-LAT-5540', qty: 2, rate: 18500, amount: 37000 },
      { name: 'Logitech MX Master 3S Mouse', sku: 'LOG-MX3S', qty: 4, rate: 2150, amount: 8600 },
    ]
  },
  {
    id: 'SO-2026-0221', date: '2026-02-08', status: 'Processing', total: 128900, paymentMethod: 'Bank Transfer',
    shippingAddress: '42 MG Road, Bangalore 560001',
    items: [
      { name: 'HP ProDesk 400 G9 Desktop', sku: 'HP-PD400G9', qty: 3, rate: 35000, amount: 105000 },
      { name: 'Samsung 27" Monitor S27C390', sku: 'SAM-S27C390', qty: 3, rate: 7966, amount: 23900 },
    ]
  },
  {
    id: 'SO-2026-0198', date: '2026-02-05', status: 'Delivered', total: 23400, paymentMethod: 'UPI',
    shippingAddress: '15 Residency Road, Bangalore 560025', trackingNumber: 'TRK1234567890',
    items: [
      { name: 'Jabra Evolve2 75 Headset', sku: 'JAB-EV275', qty: 6, rate: 3900, amount: 23400 },
    ]
  },
  {
    id: 'SO-2026-0185', date: '2026-02-02', status: 'Delivered', total: 67800, paymentMethod: 'Credit Card',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK5678901234',
    items: [
      { name: 'Apple iPad Air M2', sku: 'APL-IPAD-M2', qty: 2, rate: 28900, amount: 57800 },
      { name: 'Apple Pencil Pro', sku: 'APL-PEN-PRO', qty: 2, rate: 5000, amount: 10000 },
    ]
  },
  {
    id: 'SO-2026-0172', date: '2026-01-28', status: 'Delivered', total: 156000, paymentMethod: 'Bank Transfer',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK3456789012',
    items: [
      { name: 'Cisco Catalyst 1000-8T Switch', sku: 'CSC-C1000-8T', qty: 4, rate: 25000, amount: 100000 },
      { name: 'Cat6 Ethernet Cable 50m', sku: 'CAB-CAT6-50', qty: 20, rate: 800, amount: 16000 },
      { name: 'APC Smart-UPS 1500VA', sku: 'APC-SU1500', qty: 2, rate: 20000, amount: 40000 },
    ]
  },
  {
    id: 'SO-2026-0158', date: '2026-01-25', status: 'Cancelled', total: 34500, paymentMethod: 'PayPal',
    shippingAddress: '15 Residency Road, Bangalore 560025',
    items: [
      { name: 'Lenovo ThinkPad Dock Gen 2', sku: 'LEN-TPD-G2', qty: 5, rate: 6900, amount: 34500 },
    ]
  },
  {
    id: 'SO-2026-0145', date: '2026-01-22', status: 'Delivered', total: 89200, paymentMethod: 'Credit Card',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK7890123456',
    items: [
      { name: 'Microsoft Surface Pro 9', sku: 'MS-SP9', qty: 1, rate: 72000, amount: 72000 },
      { name: 'Surface Type Cover', sku: 'MS-TC', qty: 1, rate: 12200, amount: 12200 },
      { name: 'Surface Pen', sku: 'MS-PEN', qty: 1, rate: 5000, amount: 5000 },
    ]
  },
  {
    id: 'SO-2026-0132', date: '2026-01-18', status: 'Delivered', total: 42000, paymentMethod: 'UPI',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK2345678901',
    items: [
      { name: 'Canon PIXMA G3060 Printer', sku: 'CAN-G3060', qty: 3, rate: 14000, amount: 42000 },
    ]
  },
  {
    id: 'SO-2026-0119', date: '2026-01-15', status: 'Delivered', total: 198500, paymentMethod: 'Bank Transfer',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK4567890123',
    items: [
      { name: 'Dell PowerEdge T150 Server', sku: 'DELL-PE-T150', qty: 1, rate: 145000, amount: 145000 },
      { name: 'Seagate Exos 4TB HDD', sku: 'SEA-EX4TB', qty: 3, rate: 12500, amount: 37500 },
      { name: 'Kingston 32GB DDR4 ECC', sku: 'KNG-32DDR4E', qty: 2, rate: 8000, amount: 16000 },
    ]
  },
  {
    id: 'SO-2026-0106', date: '2026-01-12', status: 'Delivered', total: 15600, paymentMethod: 'Cash',
    shippingAddress: '15 Residency Road, Bangalore 560025', trackingNumber: 'TRK6789012345',
    items: [
      { name: 'TP-Link Archer AX73 Router', sku: 'TPL-AX73', qty: 2, rate: 5800, amount: 11600 },
      { name: 'TP-Link RE605X Range Extender', sku: 'TPL-RE605X', qty: 2, rate: 2000, amount: 4000 },
    ]
  },
  {
    id: 'SO-2025-0998', date: '2025-12-28', status: 'Delivered', total: 76400, paymentMethod: 'Credit Card',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK8901234567',
    items: [
      { name: 'Samsung Galaxy Tab S9 FE', sku: 'SAM-GTS9FE', qty: 4, rate: 19100, amount: 76400 },
    ]
  },
  {
    id: 'SO-2025-0985', date: '2025-12-22', status: 'Delivered', total: 54300, paymentMethod: 'Bank Transfer',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK0123456789',
    items: [
      { name: 'Epson EcoTank L3250 Printer', sku: 'EPS-L3250', qty: 2, rate: 9500, amount: 19000 },
      { name: 'Logitech C920 HD Webcam', sku: 'LOG-C920', qty: 5, rate: 4500, amount: 22500 },
      { name: 'Blue Yeti USB Microphone', sku: 'BLU-YETI', qty: 2, rate: 6400, amount: 12800 },
    ]
  },
  {
    id: 'SO-2025-0972', date: '2025-12-18', status: 'Delivered', total: 234000, paymentMethod: 'Bank Transfer',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK1122334455',
    items: [
      { name: 'Apple MacBook Air M3 15"', sku: 'APL-MBA-M3-15', qty: 2, rate: 117000, amount: 234000 },
    ]
  },
  {
    id: 'SO-2025-0960', date: '2025-12-15', status: 'Delivered', total: 18900, paymentMethod: 'PayPal',
    shippingAddress: '15 Residency Road, Bangalore 560025', trackingNumber: 'TRK5566778899',
    items: [
      { name: 'Anker PowerConf S500 Speakerphone', sku: 'ANK-S500', qty: 3, rate: 6300, amount: 18900 },
    ]
  },
  {
    id: 'SO-2025-0948', date: '2025-12-10', status: 'Delivered', total: 92500, paymentMethod: 'Credit Card',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK9988776655',
    items: [
      { name: 'LG UltraWide 34" Monitor', sku: 'LG-UW34', qty: 2, rate: 38000, amount: 76000 },
      { name: 'Ergotron LX Monitor Arm', sku: 'ERG-LX', qty: 2, rate: 8250, amount: 16500 },
    ]
  },
  {
    id: 'SO-2025-0935', date: '2025-12-05', status: 'Delivered', total: 28700, paymentMethod: 'UPI',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK4433221100',
    items: [
      { name: 'WD My Passport 2TB SSD', sku: 'WD-MP2TB', qty: 4, rate: 7175, amount: 28700 },
    ]
  },
  {
    id: 'SO-2025-0922', date: '2025-12-01', status: 'Delivered', total: 165000, paymentMethod: 'Bank Transfer',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK6677889900',
    items: [
      { name: 'Synology DS923+ NAS', sku: 'SYN-DS923', qty: 1, rate: 52000, amount: 52000 },
      { name: 'Seagate IronWolf 8TB NAS HDD', sku: 'SEA-IW8TB', qty: 4, rate: 18500, amount: 74000 },
      { name: 'APC Back-UPS 1100VA', sku: 'APC-BU1100', qty: 2, rate: 8500, amount: 17000 },
      { name: 'Cat6a Patch Cable 3m (10-pack)', sku: 'CAB-C6A-3M', qty: 2, rate: 11000, amount: 22000 },
    ]
  },
  {
    id: 'SO-2025-0910', date: '2025-11-28', status: 'Delivered', total: 43200, paymentMethod: 'Credit Card',
    shippingAddress: '15 Residency Road, Bangalore 560025', trackingNumber: 'TRK1234509876',
    items: [
      { name: 'Herman Miller Sayl Chair', sku: 'HM-SAYL', qty: 2, rate: 21600, amount: 43200 },
    ]
  },
  {
    id: 'SO-2025-0898', date: '2025-11-22', status: 'Delivered', total: 37800, paymentMethod: 'UPI',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK9876501234',
    items: [
      { name: 'Poly Studio P15 Video Bar', sku: 'PLY-P15', qty: 1, rate: 37800, amount: 37800 },
    ]
  },
  {
    id: 'SO-2025-0885', date: '2025-11-18', status: 'Delivered', total: 112000, paymentMethod: 'Bank Transfer',
    shippingAddress: '42 MG Road, Bangalore 560001', trackingNumber: 'TRK5432109876',
    items: [
      { name: 'HP LaserJet Pro MFP M428fdw', sku: 'HP-LJ-M428', qty: 2, rate: 32000, amount: 64000 },
      { name: 'HP 59A Toner Cartridge', sku: 'HP-59A', qty: 8, rate: 6000, amount: 48000 },
    ]
  },
  {
    id: 'SO-2026-0240', date: '2026-02-11', status: 'Pending', total: 89500, paymentMethod: 'Bank Transfer',
    shippingAddress: '42 MG Road, Bangalore 560001',
    items: [
      { name: 'Lenovo ThinkCentre M90q Gen 4', sku: 'LEN-M90Q-G4', qty: 2, rate: 44750, amount: 89500 },
    ]
  },
  {
    id: 'SO-2026-0238', date: '2026-02-11', status: 'Confirmed', total: 56200, paymentMethod: 'Credit Card',
    shippingAddress: '42 MG Road, Bangalore 560001',
    items: [
      { name: 'BenQ GW2785TC Monitor', sku: 'BNQ-GW2785', qty: 4, rate: 14050, amount: 56200 },
    ]
  },
];

export const invoices: Invoice[] = [
  {
    id: 'INV-2026-0189', orderId: 'SO-2026-0234', date: '2026-02-10', dueDate: '2026-03-12', status: 'Unpaid',
    total: 45600, amountPaid: 0, amountDue: 45600,
    items: [
      { description: 'Dell Latitude 5540 Laptop', qty: 2, rate: 18500, amount: 37000 },
      { description: 'Logitech MX Master 3S Mouse', qty: 4, rate: 2150, amount: 8600 },
    ]
  },
  {
    id: 'INV-2026-0178', orderId: 'SO-2026-0221', date: '2026-02-08', dueDate: '2026-03-10', status: 'Partially Paid',
    total: 128900, amountPaid: 50000, amountDue: 78900,
    items: [
      { description: 'HP ProDesk 400 G9 Desktop', qty: 3, rate: 35000, amount: 105000 },
      { description: 'Samsung 27" Monitor S27C390', qty: 3, rate: 7966, amount: 23900 },
    ]
  },
  {
    id: 'INV-2026-0165', orderId: 'SO-2026-0198', date: '2026-02-05', dueDate: '2026-03-07', status: 'Paid',
    total: 23400, amountPaid: 23400, amountDue: 0,
    items: [{ description: 'Jabra Evolve2 75 Headset', qty: 6, rate: 3900, amount: 23400 }]
  },
  {
    id: 'INV-2026-0152', orderId: 'SO-2026-0185', date: '2026-02-02', dueDate: '2026-03-04', status: 'Paid',
    total: 67800, amountPaid: 67800, amountDue: 0,
    items: [
      { description: 'Apple iPad Air M2', qty: 2, rate: 28900, amount: 57800 },
      { description: 'Apple Pencil Pro', qty: 2, rate: 5000, amount: 10000 },
    ]
  },
  {
    id: 'INV-2026-0140', orderId: 'SO-2026-0172', date: '2026-01-28', dueDate: '2026-02-27', status: 'Paid',
    total: 156000, amountPaid: 156000, amountDue: 0,
    items: [
      { description: 'Cisco Catalyst 1000-8T Switch', qty: 4, rate: 25000, amount: 100000 },
      { description: 'Cat6 Ethernet Cable 50m', qty: 20, rate: 800, amount: 16000 },
      { description: 'APC Smart-UPS 1500VA', qty: 2, rate: 20000, amount: 40000 },
    ]
  },
  {
    id: 'INV-2026-0128', orderId: 'SO-2026-0145', date: '2026-01-22', dueDate: '2026-02-21', status: 'Paid',
    total: 89200, amountPaid: 89200, amountDue: 0,
    items: [
      { description: 'Microsoft Surface Pro 9', qty: 1, rate: 72000, amount: 72000 },
      { description: 'Surface Type Cover', qty: 1, rate: 12200, amount: 12200 },
      { description: 'Surface Pen', qty: 1, rate: 5000, amount: 5000 },
    ]
  },
  {
    id: 'INV-2026-0115', orderId: 'SO-2026-0132', date: '2026-01-18', dueDate: '2026-02-17', status: 'Paid',
    total: 42000, amountPaid: 42000, amountDue: 0,
    items: [{ description: 'Canon PIXMA G3060 Printer', qty: 3, rate: 14000, amount: 42000 }]
  },
  {
    id: 'INV-2026-0102', orderId: 'SO-2026-0119', date: '2026-01-15', dueDate: '2026-02-14', status: 'Overdue',
    total: 198500, amountPaid: 145000, amountDue: 53500,
    items: [
      { description: 'Dell PowerEdge T150 Server', qty: 1, rate: 145000, amount: 145000 },
      { description: 'Seagate Exos 4TB HDD', qty: 3, rate: 12500, amount: 37500 },
      { description: 'Kingston 32GB DDR4 ECC', qty: 2, rate: 8000, amount: 16000 },
    ]
  },
  {
    id: 'INV-2026-0090', orderId: 'SO-2026-0106', date: '2026-01-12', dueDate: '2026-02-11', status: 'Paid',
    total: 15600, amountPaid: 15600, amountDue: 0,
    items: [
      { description: 'TP-Link Archer AX73 Router', qty: 2, rate: 5800, amount: 11600 },
      { description: 'TP-Link RE605X Range Extender', qty: 2, rate: 2000, amount: 4000 },
    ]
  },
  {
    id: 'INV-2025-0978', orderId: 'SO-2025-0998', date: '2025-12-28', dueDate: '2026-01-27', status: 'Paid',
    total: 76400, amountPaid: 76400, amountDue: 0,
    items: [{ description: 'Samsung Galaxy Tab S9 FE', qty: 4, rate: 19100, amount: 76400 }]
  },
  {
    id: 'INV-2025-0965', orderId: 'SO-2025-0985', date: '2025-12-22', dueDate: '2026-01-21', status: 'Paid',
    total: 54300, amountPaid: 54300, amountDue: 0,
    items: [
      { description: 'Epson EcoTank L3250 Printer', qty: 2, rate: 9500, amount: 19000 },
      { description: 'Logitech C920 HD Webcam', qty: 5, rate: 4500, amount: 22500 },
      { description: 'Blue Yeti USB Microphone', qty: 2, rate: 6400, amount: 12800 },
    ]
  },
  {
    id: 'INV-2025-0952', orderId: 'SO-2025-0972', date: '2025-12-18', dueDate: '2026-01-17', status: 'Paid',
    total: 234000, amountPaid: 234000, amountDue: 0,
    items: [{ description: 'Apple MacBook Air M3 15"', qty: 2, rate: 117000, amount: 234000 }]
  },
  {
    id: 'INV-2025-0940', orderId: 'SO-2025-0960', date: '2025-12-15', dueDate: '2026-01-14', status: 'Paid',
    total: 18900, amountPaid: 18900, amountDue: 0,
    items: [{ description: 'Anker PowerConf S500 Speakerphone', qty: 3, rate: 6300, amount: 18900 }]
  },
  {
    id: 'INV-2025-0928', orderId: 'SO-2025-0948', date: '2025-12-10', dueDate: '2026-01-09', status: 'Paid',
    total: 92500, amountPaid: 92500, amountDue: 0,
    items: [
      { description: 'LG UltraWide 34" Monitor', qty: 2, rate: 38000, amount: 76000 },
      { description: 'Ergotron LX Monitor Arm', qty: 2, rate: 8250, amount: 16500 },
    ]
  },
  {
    id: 'INV-2025-0915', orderId: 'SO-2025-0935', date: '2025-12-05', dueDate: '2026-01-04', status: 'Paid',
    total: 28700, amountPaid: 28700, amountDue: 0,
    items: [{ description: 'WD My Passport 2TB SSD', qty: 4, rate: 7175, amount: 28700 }]
  },
  {
    id: 'INV-2025-0903', orderId: 'SO-2025-0922', date: '2025-12-01', dueDate: '2025-12-31', status: 'Paid',
    total: 165000, amountPaid: 165000, amountDue: 0,
    items: [
      { description: 'Synology DS923+ NAS', qty: 1, rate: 52000, amount: 52000 },
      { description: 'Seagate IronWolf 8TB NAS HDD', qty: 4, rate: 18500, amount: 74000 },
      { description: 'APC Back-UPS 1100VA', qty: 2, rate: 8500, amount: 17000 },
      { description: 'Cat6a Patch Cable 3m (10-pack)', qty: 2, rate: 11000, amount: 22000 },
    ]
  },
];

export const payments: Payment[] = [
  { id: 'PAY-2026-0145', date: '2026-02-08', invoiceId: 'INV-2026-0178', amount: 50000, method: 'Bank Transfer', reference: 'NEFT/2026/FEB/08/001', status: 'Completed' },
  { id: 'PAY-2026-0138', date: '2026-02-05', invoiceId: 'INV-2026-0165', amount: 23400, method: 'UPI', reference: 'UPI/2026/FEB/05/RK001', status: 'Completed' },
  { id: 'PAY-2026-0131', date: '2026-02-02', invoiceId: 'INV-2026-0152', amount: 67800, method: 'Credit Card', reference: 'CC-XXXX-4521/FEB02', status: 'Completed' },
  { id: 'PAY-2026-0124', date: '2026-01-28', invoiceId: 'INV-2026-0140', amount: 156000, method: 'Bank Transfer', reference: 'NEFT/2026/JAN/28/003', status: 'Completed' },
  { id: 'PAY-2026-0117', date: '2026-01-22', invoiceId: 'INV-2026-0128', amount: 89200, method: 'Credit Card', reference: 'CC-XXXX-4521/JAN22', status: 'Completed' },
  { id: 'PAY-2026-0110', date: '2026-01-18', invoiceId: 'INV-2026-0115', amount: 42000, method: 'UPI', reference: 'UPI/2026/JAN/18/RK002', status: 'Completed' },
  { id: 'PAY-2026-0103', date: '2026-01-15', invoiceId: 'INV-2026-0102', amount: 145000, method: 'Bank Transfer', reference: 'NEFT/2026/JAN/15/001', status: 'Completed' },
  { id: 'PAY-2026-0096', date: '2026-01-12', invoiceId: 'INV-2026-0090', amount: 15600, method: 'Cash', reference: 'CASH/JAN/12/001', status: 'Completed' },
  { id: 'PAY-2025-0989', date: '2025-12-28', invoiceId: 'INV-2025-0978', amount: 76400, method: 'Credit Card', reference: 'CC-XXXX-4521/DEC28', status: 'Completed' },
  { id: 'PAY-2025-0982', date: '2025-12-22', invoiceId: 'INV-2025-0965', amount: 54300, method: 'Bank Transfer', reference: 'NEFT/2025/DEC/22/002', status: 'Completed' },
  { id: 'PAY-2025-0975', date: '2025-12-18', invoiceId: 'INV-2025-0952', amount: 234000, method: 'Bank Transfer', reference: 'NEFT/2025/DEC/18/001', status: 'Completed' },
  { id: 'PAY-2025-0968', date: '2025-12-15', invoiceId: 'INV-2025-0940', amount: 18900, method: 'PayPal', reference: 'PP-TXN-DEC15-001', status: 'Completed' },
  { id: 'PAY-2025-0961', date: '2025-12-10', invoiceId: 'INV-2025-0928', amount: 92500, method: 'Credit Card', reference: 'CC-XXXX-4521/DEC10', status: 'Completed' },
  { id: 'PAY-2025-0954', date: '2025-12-05', invoiceId: 'INV-2025-0915', amount: 28700, method: 'UPI', reference: 'UPI/2025/DEC/05/RK003', status: 'Completed' },
  { id: 'PAY-2025-0947', date: '2025-12-01', invoiceId: 'INV-2025-0903', amount: 165000, method: 'Bank Transfer', reference: 'NEFT/2025/DEC/01/004', status: 'Completed' },
  { id: 'PAY-2025-0940', date: '2025-11-28', invoiceId: 'INV-2025-0890', amount: 43200, method: 'Credit Card', reference: 'CC-XXXX-4521/NOV28', status: 'Completed' },
  { id: 'PAY-2025-0933', date: '2025-11-22', invoiceId: 'INV-2025-0878', amount: 37800, method: 'UPI', reference: 'UPI/2025/NOV/22/RK004', status: 'Completed' },
  { id: 'PAY-2025-0926', date: '2025-11-18', invoiceId: 'INV-2025-0865', amount: 112000, method: 'Bank Transfer', reference: 'NEFT/2025/NOV/18/002', status: 'Completed' },
];

export const returnRequests: ReturnRequest[] = [
  {
    id: 'RET-2026-0012', orderId: 'SO-2026-0198', date: '2026-02-07', status: 'Approved',
    items: [{ name: 'Jabra Evolve2 75 Headset', qty: 1, reason: 'Defective - left ear speaker not working' }],
    refundAmount: 3900, refundMethod: 'Original Payment Method (UPI)'
  },
  {
    id: 'RET-2026-0008', orderId: 'SO-2026-0145', date: '2026-01-30', status: 'Refunded',
    items: [{ name: 'Surface Pen', qty: 1, reason: 'Wrong color received' }],
    refundAmount: 5000, refundMethod: 'Credit Card Refund'
  },
  {
    id: 'RET-2025-0045', orderId: 'SO-2025-0998', date: '2025-12-30', status: 'Refunded',
    items: [{ name: 'Samsung Galaxy Tab S9 FE', qty: 1, reason: 'Screen flickering issue' }],
    refundAmount: 19100, refundMethod: 'Credit Card Refund'
  },
  {
    id: 'RET-2025-0038', orderId: 'SO-2025-0935', date: '2025-12-08', status: 'Rejected',
    items: [{ name: 'WD My Passport 2TB SSD', qty: 1, reason: 'Changed mind - no longer needed' }],
    refundAmount: 0, refundMethod: 'N/A'
  },
  {
    id: 'RET-2026-0015', orderId: 'SO-2026-0234', date: '2026-02-11', status: 'Requested',
    items: [{ name: 'Logitech MX Master 3S Mouse', qty: 1, reason: 'Scroll wheel not smooth' }],
    refundAmount: 2150, refundMethod: 'Pending'
  },
];

export const supportTickets: SupportTicket[] = [
  {
    id: 'TKT-2026-0089', subject: 'Invoice discrepancy on INV-2026-0102', category: 'Billing',
    priority: 'High', status: 'In Progress', createdDate: '2026-02-10', lastUpdate: '2026-02-11',
    messages: [
      { sender: 'Rajesh Kumar', message: 'The invoice INV-2026-0102 shows a total of ₹198,500 but I was quoted ₹195,000 for the server bundle. Please review and correct.', date: '2026-02-10 09:30', isAgent: false },
      { sender: 'Priya Sharma (Support)', message: 'Thank you for reaching out, Rajesh. I\'m looking into the pricing discrepancy. The difference might be due to updated shipping charges. Let me verify with the sales team.', date: '2026-02-10 14:15', isAgent: true },
      { sender: 'Rajesh Kumar', message: 'The original quote clearly mentioned free shipping for orders above ₹100,000. Please check the quote reference QT-2026-0055.', date: '2026-02-11 10:00', isAgent: false },
    ]
  },
  {
    id: 'TKT-2026-0082', subject: 'Tracking not updating for SO-2026-0234', category: 'Shipping',
    priority: 'Medium', status: 'Open', createdDate: '2026-02-11', lastUpdate: '2026-02-11',
    messages: [
      { sender: 'Rajesh Kumar', message: 'My order SO-2026-0234 was shipped 2 days ago but the tracking number TRK9876543210 shows no movement. Can you check with the courier?', date: '2026-02-11 08:45', isAgent: false },
    ]
  },
  {
    id: 'TKT-2026-0075', subject: 'Request for bulk pricing on monitors', category: 'Sales',
    priority: 'Low', status: 'Resolved', createdDate: '2026-02-05', lastUpdate: '2026-02-07',
    messages: [
      { sender: 'Rajesh Kumar', message: 'We are planning to order 50+ monitors for our new office. Can we get special bulk pricing?', date: '2026-02-05 11:00', isAgent: false },
      { sender: 'Amit Patel (Sales)', message: 'Absolutely! For orders of 50+ units, we can offer 12% off the listed price. I\'ll prepare a custom quotation for you.', date: '2026-02-06 09:30', isAgent: true },
      { sender: 'Amit Patel (Sales)', message: 'Quotation QT-2026-0068 has been sent to your email with the bulk pricing details. Please review and let us know.', date: '2026-02-07 15:00', isAgent: true },
    ]
  },
  {
    id: 'TKT-2026-0068', subject: 'Warranty claim for Canon printer', category: 'Warranty',
    priority: 'Medium', status: 'Resolved', createdDate: '2026-01-25', lastUpdate: '2026-02-01',
    messages: [
      { sender: 'Rajesh Kumar', message: 'One of the Canon PIXMA G3060 printers from order SO-2026-0132 is showing paper jam errors frequently. It\'s still under warranty.', date: '2026-01-25 14:00', isAgent: false },
      { sender: 'Priya Sharma (Support)', message: 'I\'ve initiated a warranty claim with Canon. A service engineer will visit your office within 2-3 business days. Claim ID: WC-2026-0034.', date: '2026-01-26 10:30', isAgent: true },
      { sender: 'Priya Sharma (Support)', message: 'The service engineer has confirmed the visit for January 29th between 10 AM - 1 PM. Please keep the printer accessible.', date: '2026-01-27 16:00', isAgent: true },
      { sender: 'Rajesh Kumar', message: 'The engineer came and fixed the issue. Printer is working fine now. Thanks for the quick resolution!', date: '2026-02-01 09:00', isAgent: false },
    ]
  },
  {
    id: 'TKT-2025-0156', subject: 'Credit limit increase request', category: 'Account',
    priority: 'High', status: 'Closed', createdDate: '2025-12-15', lastUpdate: '2025-12-20',
    messages: [
      { sender: 'Rajesh Kumar', message: 'We need to increase our credit limit from ₹3,00,000 to ₹5,00,000 due to increased procurement needs for Q1 2026.', date: '2025-12-15 10:00', isAgent: false },
      { sender: 'Amit Patel (Sales)', message: 'Based on your excellent payment history, we\'ve approved the credit limit increase to ₹5,00,000. This is effective immediately.', date: '2025-12-20 11:30', isAgent: true },
    ]
  },
];

export const addresses: Address[] = [
  {
    id: 'ADDR-001', label: 'Office - Head Office', name: 'TechCorp Solutions Pvt. Ltd.',
    line1: '42, MG Road, 3rd Floor', line2: 'Prestige Towers', city: 'Bangalore',
    state: 'Karnataka', zip: '560001', country: 'India', phone: '+91 80 4567 8900', isDefault: true
  },
  {
    id: 'ADDR-002', label: 'Office - Branch', name: 'TechCorp Solutions Pvt. Ltd.',
    line1: '15, Residency Road', line2: 'Commerce House, Suite 201', city: 'Bangalore',
    state: 'Karnataka', zip: '560025', country: 'India', phone: '+91 80 4567 8901', isDefault: false
  },
  {
    id: 'ADDR-003', label: 'Warehouse', name: 'TechCorp Solutions Pvt. Ltd.',
    line1: 'Plot 78, Phase 2', line2: 'Electronic City', city: 'Bangalore',
    state: 'Karnataka', zip: '560100', country: 'India', phone: '+91 80 4567 8902', isDefault: false
  },
];

export const monthlySpending = [
  { month: 'Sep', amount: 85000 },
  { month: 'Oct', amount: 142000 },
  { month: 'Nov', amount: 193000 },
  { month: 'Dec', amount: 698800 },
  { month: 'Jan', amount: 587200 },
  { month: 'Feb', amount: 320100 },
];

export const categorySpending = [
  { name: 'Laptops & Desktops', value: 892500, color: '#1a365d' },
  { name: 'Monitors & Displays', value: 356600, color: '#0d9488' },
  { name: 'Networking', value: 271600, color: '#7c3aed' },
  { name: 'Peripherals', value: 198400, color: '#ea580c' },
  { name: 'Printers', value: 175000, color: '#dc2626' },
  { name: 'Storage & Servers', value: 563200, color: '#2563eb' },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
