import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Smartphone, 
  DollarSign, 
  CalendarClock, 
  PieChart, 
  Sparkles, 
  Trash2, 
  Edit2,
  TrendingUp,
  LayoutDashboard,
  List,
  Cpu,
  Car,
  Gamepad2,
  Laptop,
  Headphones,
  Monitor,
  Watch,
  Package,
  HardDrive,
  Zap,
  Archive,
  Tv,
  Speaker,
  Filter,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';
import { Product, ProductCategory, ProductStatus, AIAnalysisResult } from './types';
import StatsCard from './components/StatsCard';
import ProductForm from './components/ProductForm';
import { analyzePortfolio } from './services/geminiService';

// Initial Data extracted from User Screenshots (Merged all)
const INITIAL_PRODUCTS: Product[] = [
  // Image Set 2 (Recent)
  {
    id: 'c16',
    name: '零跑C16',
    price: 160000.0,
    purchaseDate: '2024-10-04',
    category: ProductCategory.VEHICLE,
    status: ProductStatus.IN_USE
  },
  {
    id: 'xc60',
    name: '沃尔沃xc60',
    price: 410000.0,
    purchaseDate: '2014-12-30',
    category: ProductCategory.VEHICLE,
    status: ProductStatus.IN_USE
  },
  {
    id: 'legiongo',
    name: 'legiongo',
    price: 2750.0,
    purchaseDate: '2025-08-21',
    category: ProductCategory.GAMING,
    status: ProductStatus.IN_USE
  },
  {
    id: '4070ti',
    name: '七彩虹4070ti',
    price: 5100.0,
    purchaseDate: '2025-03-01',
    category: ProductCategory.COMPONENT,
    status: ProductStatus.IN_USE
  },
  {
    id: 'aw3418dw-1',
    name: '外星人aw3418dw',
    price: 1500.0,
    purchaseDate: '2025-07-01',
    category: ProductCategory.PERIPHERAL,
    status: ProductStatus.IN_USE
  },
  {
    id: 'nuc9',
    name: 'nuc9',
    price: 895.0,
    purchaseDate: '2022-04-14',
    category: ProductCategory.LAPTOP,
    status: ProductStatus.RETIRED
  },
  {
    id: 'bose-v35',
    name: 'BOSE v35',
    price: 7000.0,
    purchaseDate: '2021-08-10',
    category: ProductCategory.AUDIO,
    status: ProductStatus.IN_USE
  },
  {
    id: 'sp7',
    name: 'surface pro7',
    price: 970.0,
    purchaseDate: '2021-04-01',
    category: ProductCategory.LAPTOP,
    status: ProductStatus.RETIRED
  },
  {
    id: 'mac-m1',
    name: 'MacBook air m1',
    price: 3099.0,
    purchaseDate: '2022-10-04',
    category: ProductCategory.LAPTOP,
    status: ProductStatus.RETIRED
  },
  {
    id: 'aw3418dw-2',
    name: '外星人aw3418dw',
    price: 1850.0,
    purchaseDate: '2024-05-03',
    category: ProductCategory.PERIPHERAL,
    status: ProductStatus.SOLD
  },
  {
    id: 'u2723qe',
    name: 'Dell u2723qe',
    price: 2630.0,
    purchaseDate: '2022-10-15',
    category: ProductCategory.PERIPHERAL,
    status: ProductStatus.IN_USE
  },
  {
    id: 'sre8',
    name: '零刻sre8',
    price: 412.0,
    purchaseDate: '2024-05-31',
    category: ProductCategory.LAPTOP,
    status: ProductStatus.RETIRED
  },
  {
    id: 'steamdeck',
    name: 'steamdeck',
    price: 1240.0,
    purchaseDate: '2023-01-26',
    category: ProductCategory.GAMING,
    status: ProductStatus.RETIRED
  },
  // Image Set 1 (Legacy)
  {
    id: 'lg-660',
    name: 'LG 660电视',
    price: 4899.0,
    purchaseDate: '2014-06-17',
    category: ProductCategory.PERIPHERAL, // TV fits here or Other
    status: ProductStatus.IN_USE
  },
  {
    id: 'bose-c5',
    name: 'bose c5',
    price: 3130.0,
    purchaseDate: '2014-06-10',
    category: ProductCategory.AUDIO,
    status: ProductStatus.IN_USE
  },
  {
    id: 'lg-monitor',
    name: 'LG显示器',
    price: 1299.0,
    purchaseDate: '2019-11-11',
    category: ProductCategory.PERIPHERAL,
    status: ProductStatus.RETIRED
  },
  {
    id: 'ie80',
    name: '森海塞尔 ie80',
    price: 1920.0,
    purchaseDate: '2012-07-18',
    category: ProductCategory.AUDIO,
    status: ProductStatus.IN_USE
  },
  {
    id: 'p2414',
    name: 'Dell P2414',
    price: 1200.0,
    purchaseDate: '2014-03-30',
    category: ProductCategory.PERIPHERAL,
    status: ProductStatus.IN_USE
  },
  {
    id: 'r590',
    name: '蓝宝石r590显卡',
    price: 299.0,
    purchaseDate: '2019-03-01',
    category: ProductCategory.COMPONENT,
    status: ProductStatus.RETIRED
  }
];

// Color Palette for Charts
const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

const App: React.FC = () => {
  // State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('techcycle_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [view, setView] = useState<'dashboard' | 'list' | 'ai'>('dashboard');
  const [activeFilter, setActiveFilter] = useState<'ALL' | ProductStatus>('ALL');
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('techcycle_products', JSON.stringify(products));
  }, [products]);

  // Calculations
  const stats = useMemo(() => {
    const today = new Date();
    let totalSpent = 0;
    let totalRecovered = 0;
    
    const productStats = products.map(p => {
      const start = new Date(p.purchaseDate);
      const diffTime = Math.abs(today.getTime() - start.getTime());
      const daysOwned = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      let cost = p.price;
      if (p.status === ProductStatus.SOLD && p.resalePrice) {
        cost = p.price - p.resalePrice;
        totalRecovered += p.resalePrice;
      }
      
      totalSpent += p.price;
      
      return {
        ...p,
        daysOwned,
        dailyCost: cost / daysOwned
      };
    });

    const activeProducts = productStats.filter(p => p.status === ProductStatus.IN_USE);
    const retiredProducts = productStats.filter(p => p.status === ProductStatus.RETIRED);
    const avgDailyCost = activeProducts.reduce((acc, curr) => acc + curr.dailyCost, 0) / (activeProducts.length || 1);

    // Chart Data: Category Spending
    const categoryDataMap = new Map<string, number>();
    products.forEach(p => {
      const current = categoryDataMap.get(p.category) || 0;
      categoryDataMap.set(p.category, current + p.price);
    });
    const categoryChartData = Array.from(categoryDataMap.entries()).map(([name, value]) => ({ name, value }));

    // Chart Data: Top 5 Daily Cost
    const costlyDaily = [...productStats]
      .sort((a, b) => b.dailyCost - a.dailyCost)
      .slice(0, 5)
      .map(p => ({ name: p.name, cost: parseFloat(p.dailyCost.toFixed(2)) }));

    return {
      totalSpent,
      totalRecovered,
      totalCount: products.length,
      activeCount: activeProducts.length,
      retiredCount: retiredProducts.length,
      avgDailyCost,
      productStats,
      categoryChartData,
      costlyDaily
    };
  }, [products]);

  // Handlers
  const handleAddProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([product, ...products]);
    }
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个产品记录吗？')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleEdit = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzePortfolio(products);
      setAnalysis(result);
    } catch (error) {
      alert("AI分析失败，请检查API Key设置或稍后重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFilterClick = (filter: 'ALL' | ProductStatus) => {
    setActiveFilter(filter);
    setView('list');
  };

  // Helper: Get Icon by Category
  const getCategoryIcon = (category: ProductCategory, className?: string) => {
    const props = { size: 24, className: className || "text-slate-600" };
    switch (category) {
      case ProductCategory.VEHICLE: return <Car {...props} />;
      case ProductCategory.PHONE: return <Smartphone {...props} />;
      case ProductCategory.LAPTOP: return <Laptop {...props} />;
      case ProductCategory.AUDIO: return <Speaker {...props} />;
      case ProductCategory.WEARABLE: return <Watch {...props} />;
      case ProductCategory.PERIPHERAL: return <Monitor {...props} />;
      case ProductCategory.COMPONENT: return <Cpu {...props} />;
      case ProductCategory.GAMING: return <Gamepad2 {...props} />;
      case ProductCategory.OTHER: 
      default: return <Package {...props} />;
    }
  };

  // Helper: Get Card Style based on Status
  const getStatusStyles = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.IN_USE:
        return 'bg-emerald-500 text-white';
      case ProductStatus.RETIRED:
        return 'bg-slate-400 text-white';
      case ProductStatus.SOLD:
        return 'bg-amber-400 text-white';
      case ProductStatus.LOST:
        return 'bg-gray-800 text-white';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Render Helpers
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);

  // Filter products for List View
  const filteredProducts = stats.productStats.filter(p => 
    activeFilter === 'ALL' ? true : p.status === activeFilter
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 md:pb-0">
      
      {/* Sidebar / Mobile Nav */}
      <nav className="fixed bottom-0 w-full md:w-64 md:h-screen bg-white border-t md:border-r border-slate-200 z-40 flex md:flex-col justify-around md:justify-start md:items-stretch md:p-6">
        <div className="hidden md:flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Cpu size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            TechCycle
          </h1>
        </div>

        <button 
          onClick={() => { setView('dashboard'); setActiveFilter('ALL'); }}
          className={`p-3 md:px-4 md:py-3 rounded-xl flex flex-col md:flex-row items-center gap-2 md:gap-3 transition-all ${view === 'dashboard' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <LayoutDashboard size={22} />
          <span className="text-xs md:text-sm">概览</span>
        </button>

        <button 
          onClick={() => { setView('list'); setActiveFilter('ALL'); }}
          className={`p-3 md:px-4 md:py-3 rounded-xl flex flex-col md:flex-row items-center gap-2 md:gap-3 transition-all ${view === 'list' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <List size={22} />
          <span className="text-xs md:text-sm">设备</span>
        </button>

        <button 
          onClick={() => setView('ai')}
          className={`p-3 md:px-4 md:py-3 rounded-xl flex flex-col md:flex-row items-center gap-2 md:gap-3 transition-all ${view === 'ai' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Sparkles size={22} />
          <span className="text-xs md:text-sm">AI 分析</span>
        </button>

        <div className="hidden md:block mt-auto">
          <div className="p-4 bg-slate-100 rounded-xl">
             <p className="text-xs text-slate-500 mb-2">总投资</p>
             <p className="font-bold text-slate-800">{formatCurrency(stats.totalSpent)}</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-slate-50/90 backdrop-blur-sm z-30 py-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {view === 'dashboard' && '资产概览'}
              {view === 'list' && '设备清单'}
              {view === 'ai' && '智能顾问'}
            </h2>
            <p className="text-slate-500 text-sm mt-1 hidden md:block">
              管理你的数字生活成本
            </p>
          </div>
          <button 
            onClick={() => { setEditingProduct(undefined); setIsFormOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">添加设备</span>
            <span className="sm:hidden">添加</span>
          </button>
        </header>

        {/* Views */}
        {view === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <StatsCard 
                title="总支出" 
                value={formatCurrency(stats.totalSpent)} 
                icon={DollarSign} 
                color="text-indigo-600"
              />
              <StatsCard 
                title="日均使用成本" 
                value={formatCurrency(stats.avgDailyCost)} 
                icon={CalendarClock} 
                color="text-emerald-500"
                trend="基于活跃设备"
              />
              <StatsCard 
                title="在用物品" 
                value={stats.activeCount.toString()} 
                icon={Zap} 
                color="text-green-600"
                onClick={() => handleFilterClick(ProductStatus.IN_USE)}
              />
              <StatsCard 
                title="断舍离" 
                value={stats.retiredCount.toString()} 
                icon={Archive} 
                color="text-slate-500"
                trend="已退役"
                onClick={() => handleFilterClick(ProductStatus.RETIRED)}
              />
              <StatsCard 
                title="已回血(出售)" 
                value={formatCurrency(stats.totalRecovered)} 
                icon={TrendingUp} 
                color="text-amber-500"
                onClick={() => handleFilterClick(ProductStatus.SOLD)}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Per Day Bar Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-500" />
                  日均成本最高的设备 Top 5
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.costlyDaily} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                      <Tooltip formatter={(value) => [`¥${value}`, '日均成本']} cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="cost" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Pie Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                 <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <PieChart size={18} className="text-pink-500" />
                  消费类别占比
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={stats.categoryChartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'list' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'ALL' 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setActiveFilter(ProductStatus.IN_USE)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === ProductStatus.IN_USE 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white text-slate-600 hover:bg-emerald-50'
                }`}
              >
                正在使用
              </button>
              <button
                onClick={() => setActiveFilter(ProductStatus.SOLD)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === ProductStatus.SOLD 
                    ? 'bg-amber-400 text-white' 
                    : 'bg-white text-slate-600 hover:bg-amber-50'
                }`}
              >
                已出售
              </button>
              <button
                onClick={() => setActiveFilter(ProductStatus.RETIRED)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === ProductStatus.RETIRED 
                    ? 'bg-slate-400 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                已退役
              </button>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">该分类下暂无数据</p>
                {activeFilter !== 'ALL' && (
                  <button 
                    onClick={() => setActiveFilter('ALL')}
                    className="text-indigo-600 text-sm font-medium mt-2 hover:underline"
                  >
                    查看全部
                  </button>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => handleEdit(product)}
                  className={`relative overflow-hidden rounded-2xl p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer group ${getStatusStyles(product.status)}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl backdrop-blur-sm bg-white/20 text-white`}>
                        {getCategoryIcon(product.category, "text-current")}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                        <p className="text-xs opacity-90 mt-0.5">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="block text-2xl font-bold">{product.daysOwned} <span className="text-sm font-normal opacity-75">天</span></span>
                       <div className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-black/10 backdrop-blur-md mt-1">
                          {product.status}
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="opacity-90">
                       <p className="text-sm">
                         {formatCurrency(product.price)}
                         <span className="mx-1.5 opacity-50">·</span>
                         <span className="font-medium">¥{product.dailyCost.toFixed(2)}/天</span>
                       </p>
                       <p className="text-xs mt-1 opacity-75">{product.purchaseDate}</p>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={(e) => handleEdit(product, e)}
                         className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                       <button 
                         onClick={(e) => handleDelete(product.id, e)}
                         className="p-2 bg-white/20 hover:bg-rose-500/50 rounded-lg backdrop-blur-sm transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'ai' && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
            {!analysis && !isAnalyzing && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI 智能资产分析</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  使用 Google Gemini 模型分析你的消费习惯，找出最具性价比的设备，并获取升级建议。
                </p>
                <button
                  onClick={runAnalysis}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all"
                >
                  开始分析
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">正在分析你的设备数据...</p>
                <p className="text-slate-400 text-sm mt-2">Connecting to Gemini 2.5 Flash</p>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-500 to-violet-600 p-6 rounded-2xl text-white shadow-lg">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Sparkles size={20} /> 分析总结
                  </h3>
                  <p className="leading-relaxed opacity-90">{analysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2 relative z-10">👑 最具性价比</h4>
                    <p className="text-2xl font-bold text-slate-800 relative z-10">{analysis.bestValueItem}</p>
                    <p className="text-sm text-emerald-600 mt-2 relative z-10">这点钱花得真值！</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2 relative z-10">💸 成本黑洞</h4>
                    <p className="text-2xl font-bold text-slate-800 relative z-10">{analysis.worstValueItem}</p>
                    <p className="text-sm text-rose-500 mt-2 relative z-10">也许该考虑多用用或者出二手了？</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-4">💡 升级与处理建议</h4>
                  <div className="space-y-4">
                    {analysis.upgradeSuggestions.map((sug, idx) => (
                      <div key={idx} className="flex gap-4 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{sug.productName}</p>
                          <p className="text-slate-600 text-sm mt-1">{sug.reason}</p>
                        </div>
                      </div>
                    ))}
                    {analysis.upgradeSuggestions.length === 0 && (
                      <p className="text-slate-500 italic">暂无特别的升级建议，你的设备配置很合理！</p>
                    )}
                  </div>
                </div>

                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-2">📊 类别洞察</h4>
                  <p className="text-slate-600 leading-relaxed">{analysis.categoryInsights}</p>
                </div>

                <button 
                  onClick={runAnalysis} 
                  className="w-full py-3 text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  重新分析
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {isFormOpen && (
        <ProductForm 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleAddProduct}
          initialData={editingProduct}
        />
      )}
    </div>
  );
};

export default App;