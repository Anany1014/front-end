import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Package, BarChart3, Grid3x3, ChevronLeft, ChevronRight,
  Check, X, TrendingUp, Image as ImageIcon, Sparkles, Loader2,
  FileUp, AlertCircle, Search, Filter, Calendar, Eye
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Simulated categorization hook
const useCategorize = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const categorize = useCallback(async (file, title, description) => {
    setIsProcessing(true);
    setError(null);
    
    // Validate inputs
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      setIsProcessing(false);
      return null;
    }
    
    if (!title || !description) {
      setError('Please provide both title and description');
      setIsProcessing(false);
      return null;
    }

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const categories = [
      { name: 'Electronics', confidence: 92, color: '#8b5cf6' },
      { name: 'Fashion', confidence: 88, color: '#3b82f6' },
      { name: 'Home & Garden', confidence: 85, color: '#10b981' },
      { name: 'Sports', confidence: 79, color: '#f59e0b' },
      { name: 'Books', confidence: 76, color: '#ec4899' }
    ];

    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    
    const imageUrl = URL.createObjectURL(file);
    
    const categorizedResult = {
      id: Date.now(),
      image: imageUrl,
      title,
      description,
      category: selectedCategory.name,
      confidence: selectedCategory.confidence,
      color: selectedCategory.color,
      date: new Date().toISOString(),
      status: selectedCategory.confidence > 85 ? 'Verified' : 'Pending'
    };

    setResult(categorizedResult);
    setIsProcessing(false);
    return categorizedResult;
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return { categorize, isProcessing, result, error, reset };
};

// Toast notification component
const Toast = ({ message, type = 'success', onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 shadow-2xl backdrop-blur-xl"
  >
    {type === 'success' ? (
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="w-3 h-3 text-emerald-400" />
      </div>
    ) : (
      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-3 h-3 text-red-400" />
      </div>
    )}
    <span className="text-sm text-gray-200 font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-300 transition-colors">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('upload');
  const [inventory, setInventory] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef(null);

  const { categorize, isProcessing, result, error, reset } = useCategorize();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (uploadedFile) => {
    if (!uploadedFile.type.startsWith('image/')) {
      showToast('Please upload a valid image file', 'error');
      return;
    }
    setFile(uploadedFile);
  };

  const handleSubmit = async () => {
    const result = await categorize(file, title, description);
    
    if (result) {
      setInventory(prev => [result, ...prev]);
      showToast('Product categorized successfully!');
      
      // Reset form after success
      setTimeout(() => {
        setFile(null);
        setTitle('');
        setDescription('');
        reset();
      }, 2000);
    } else if (error) {
      showToast(error, 'error');
    }
  };

  const categoryDistribution = inventory.reduce((acc, item) => {
    const existing = acc.find(c => c.category === item.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ category: item.category, count: 1, color: item.color });
    }
    return acc;
  }, []);

  const navItems = [
    { icon: Grid3x3, label: 'Dashboard', view: 'dashboard' },
    { icon: Package, label: 'Inventory', view: 'inventory' },
    { icon: FileUp, label: 'Bulk Upload', view: 'upload' },
    { icon: BarChart3, label: 'Analytics', view: 'analytics' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? '80px' : '240px' }}
        className="fixed left-0 top-0 h-full bg-[#0f0f0f] border-r border-[#1a1a1a] z-40"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a]">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-sm">AI Categorizer</span>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <motion.button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              whileHover={{ x: 2 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeView === item.view
                  ? 'bg-[#1a1a1a] text-violet-400'
                  : 'text-gray-400 hover:bg-[#141414] hover:text-gray-200'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </motion.button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '240px' }}
      >
        <AnimatePresence mode="wait">
          {activeView === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen p-8"
            >
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Product Categorization
                  </h1>
                  <p className="text-gray-500">Upload your product and let AI categorize it instantly</p>
                </motion.div>

                {!result && !isProcessing ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Drag & Drop Zone */}
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all ${
                        dragActive
                          ? 'border-violet-500 bg-violet-500/5 shadow-[0_0_30px_rgba(139,92,246,0.3)]'
                          : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#0f0f0f]/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFile(e.target.files[0])}
                        className="hidden"
                      />
                      
                      <div className="text-center">
                        <motion.div
                          animate={{
                            scale: dragActive ? 1.1 : 1,
                            rotate: dragActive ? 5 : 0
                          }}
                          className="inline-flex w-16 h-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 mb-4"
                        >
                          {file ? (
                            <Check className="w-8 h-8 text-violet-400" />
                          ) : (
                            <Upload className="w-8 h-8 text-violet-400" />
                          )}
                        </motion.div>
                        
                        <h3 className="text-lg font-semibold mb-1">
                          {file ? file.name : 'Drop your product image here'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          or click to browse • PNG, JPG up to 10MB
                        </p>
                      </div>

                      {file && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute top-4 right-4"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </motion.div>
                      )}
                    </div>

                    {/* Input Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Product Title
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Wireless Headphones"
                          className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-gray-100 placeholder-gray-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Brief description..."
                          className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-gray-100 placeholder-gray-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleSubmit}
                      disabled={!file || !title || !description}
                      className="w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-500 to-blue-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] text-white"
                    >
                      Categorize with AI
                    </motion.button>
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl p-12"
                  >
                    <div className="text-center space-y-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-flex w-20 h-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20"
                      >
                        <Sparkles className="w-10 h-10 text-violet-400" />
                      </motion.div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Processing with AI</h3>
                        <p className="text-gray-500">Analyzing image and text...</p>
                      </div>

                      {/* Shimmer Effect */}
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0.3 }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="h-3 bg-gradient-to-r from-transparent via-gray-800 to-transparent rounded-full"
                            style={{ width: `${100 - i * 10}%`, margin: '0 auto' }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : result && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl overflow-hidden"
                  >
                    <div className="grid md:grid-cols-2 gap-6 p-6">
                      {/* Image */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#141414]">
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Results */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{result.title}</h3>
                          <p className="text-gray-500">{result.description}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-3">
                            Predicted Category
                          </label>
                          <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                            style={{ backgroundColor: `${result.color}20`, color: result.color }}
                          >
                            <Check className="w-4 h-4" />
                            {result.category}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-3">
                            Confidence Score
                          </label>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-3xl font-bold" style={{ color: result.color }}>
                                {result.confidence}%
                              </span>
                              <span className="text-sm text-gray-500">
                                {result.status}
                              </span>
                            </div>
                            <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${result.confidence}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: result.color }}
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setFile(null);
                            setTitle('');
                            setDescription('');
                            reset();
                          }}
                          className="w-full py-3 rounded-xl font-semibold bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
                        >
                          Categorize Another
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen p-8"
            >
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-8 flex items-center justify-between"
                >
                  <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      Product Inventory
                    </h1>
                    <p className="text-gray-500">{inventory.length} products categorized</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] transition-colors">
                      <Search className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] transition-colors">
                      <Filter className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </motion.div>

                {inventory.length === 0 ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl p-12 text-center"
                  >
                    <div className="inline-flex w-20 h-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 mb-4">
                      <Package className="w-10 h-10 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-6">Start by uploading your first product</p>
                    <button
                      onClick={() => setActiveView('upload')}
                      className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-500 to-blue-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
                    >
                      Upload Product
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl overflow-hidden"
                  >
                    <table className="w-full">
                      <thead className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2a2a]">
                        {inventory.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-[#141414] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-lg object-cover bg-[#1a1a1a]"
                                />
                                <div>
                                  <div className="font-medium text-gray-100">{item.title}</div>
                                  <div className="text-sm text-gray-500">{item.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium"
                                style={{ backgroundColor: `${item.color}20`, color: item.color }}
                              >
                                {item.category}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {new Date(item.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${
                                  item.status === 'Verified'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {item.status === 'Verified' ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                )}
                                {item.status}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen p-8"
            >
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-gray-500">Insights from your product catalog</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">Total Products</span>
                      <Package className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="text-3xl font-bold">{inventory.length}</div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">Avg Confidence</span>
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold">
                      {inventory.length > 0
                        ? Math.round(inventory.reduce((sum, item) => sum + item.confidence, 0) / inventory.length)
                        : 0}%
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">Categories</span>
                      <Grid3x3 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold">{categoryDistribution.length}</div>
                  </motion.div>
                </div>

                {categoryDistribution.length > 0 ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-semibold mb-6">Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                        <XAxis dataKey="category" stroke="#666" style={{ fontSize: 12 }} />
                        <YAxis stroke="#666" style={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f0f0f',
                            border: '1px solid #2a2a2a',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl p-12 text-center"
                  >
                    <div className="inline-flex w-20 h-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 mb-4">
                      <BarChart3 className="w-10 h-10 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No data yet</h3>
                    <p className="text-gray-500">Upload products to see analytics</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen p-8"
            >
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-gray-500">Overview of your AI categorization system</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    {inventory.length > 0 ? (
                      <div className="space-y-3">
                        {inventory.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#141414] transition-colors"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{item.title}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(item.date).toLocaleString()}
                              </div>
                            </div>
                            <div
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{ backgroundColor: `${item.color}20`, color: item.color }}
                            >
                              {item.category}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No recent activity
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0f0f0f]/50 border border-[#2a2a2a] rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveView('upload')}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="font-semibold">Upload New Product</span>
                      </button>
                      <button
                        onClick={() => setActiveView('inventory')}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Package className="w-5 h-5" />
                        <span className="font-semibold">View Inventory</span>
                      </button>
                      <button
                        onClick={() => setActiveView('analytics')}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-semibold">View Analytics</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default App;