export type OrderStatus =
  | "Placed"
  | "Picked Up"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

export type RiderInfo = {
  name: string;
  phone: string;
  vehicleCode: string;
};

export type Order = {
  id: string;
  createdAt: string;
  eta: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: string;
  items: OrderItem[];
  rider: RiderInfo;
};

export const userOrders: Order[] = [
  {
    id: "ORD-1001",
    createdAt: "2026-03-26 10:30 AM",
    eta: "20 mins",
    status: "Out for Delivery",
    totalAmount: 38.5,
    paymentMethod: "UPI",
    deliveryAddress: "A-21, Green Park, New Delhi",
    items: [
      { name: "Veg Sandwich", qty: 2, price: 6.5 },
      { name: "Fresh Juice", qty: 1, price: 4.0 },
      { name: "Energy Bar", qty: 3, price: 7.0 },
    ],
    rider: {
      name: "Mike Swift",
      phone: "+1 987 654 321",
      vehicleCode: "EBK-001",
    },
  },
  {
    id: "ORD-1000",
    createdAt: "2026-03-25 07:10 PM",
    eta: "Delivered",
    status: "Delivered",
    totalAmount: 24.0,
    paymentMethod: "Card",
    deliveryAddress: "B-118, Hauz Khas, New Delhi",
    items: [
      { name: "Wrap Combo", qty: 1, price: 12.0 },
      { name: "Cold Coffee", qty: 2, price: 6.0 },
    ],
    rider: {
      name: "Sarah Dash",
      phone: "+1 987 654 323",
      vehicleCode: "EBK-003",
    },
  },
  {
    id: "ORD-998",
    createdAt: "2026-03-24 12:45 PM",
    eta: "Cancelled",
    status: "Cancelled",
    totalAmount: 15.2,
    paymentMethod: "Cash",
    deliveryAddress: "D-94, Kalkaji, New Delhi",
    items: [
      { name: "Salad Bowl", qty: 1, price: 8.2 },
      { name: "Water Bottle", qty: 2, price: 3.5 },
    ],
    rider: {
      name: "Leo Bolt",
      phone: "+1 987 654 322",
      vehicleCode: "EBK-002",
    },
  },
];

export const getCurrentOrder = () =>
  userOrders.find((order) =>
    ["Placed", "Picked Up", "Out for Delivery"].includes(order.status)
  ) ?? userOrders[0];

export const getOrderById = (id: string) =>
  userOrders.find((order) => order.id === id);
