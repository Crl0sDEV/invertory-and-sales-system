//inventory types

export interface Product {
    id: string;
    name: string;
    sku: string | null;
    category: string | null;
    stock_quantity: number;
    price: number;
    created_at: string;
  }

// sales types

export interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  sku: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

// components dashboard types

export interface ChartDataPoint {
    day: string;
    sales: number;
  }

// components inventory types

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  stock_quantity: number;
  price: number;
}


// lib generate-receipt types

export interface ReceiptItem {
    name: string;
    quantity: number;
    price: number;
  }
  
export interface ReceiptData {
    id: string;
    items: ReceiptItem[];
    total: number;
    paymentMethod: string;
    shopName?: string;
    address?: string;
  }