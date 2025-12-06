export enum ProductStatus {
  IN_USE = '正在使用',
  RETIRED = '已退役',
  SOLD = '已出售',
  LOST = '丢失'
}

export enum ProductCategory {
  VEHICLE = '交通工具',
  PHONE = '手机',
  LAPTOP = '电脑/平板',
  AUDIO = '音频设备',
  WEARABLE = '穿戴设备',
  PERIPHERAL = '外设显示',
  COMPONENT = '硬件配件',
  GAMING = '游戏设备',
  OTHER = '其他'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  purchaseDate: string; // ISO Date string YYYY-MM-DD
  category: ProductCategory;
  status: ProductStatus;
  resalePrice?: number; // If sold
  notes?: string;
}

export interface ProductStats {
  daysOwned: number;
  costPerDay: number;
  currentValue?: number; // Estimated
}

export interface AIAnalysisResult {
  summary: string;
  bestValueItem: string;
  worstValueItem: string;
  upgradeSuggestions: Array<{
    productName: string;
    reason: string;
  }>;
  categoryInsights: string;
}