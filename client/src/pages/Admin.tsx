import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';
import {
  ShieldCheck,
  Package,
  Users,
  ChevronDown,
  Truck,
  Save,
  AlertTriangle,
  LayoutDashboard,
  Mail,
  DollarSign,
  TrendingUp,
  Search,
  Send,
  MapPin,
  Eye,
  EyeOff,
  ShoppingBag,
  Lock,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type TabType = 'dashboard' | 'orders' | 'users' | 'newsletter' | 'products';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function AdminLogin({ cartItems }: { cartItems: number }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [['auth', 'me']] });
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header cartCount={cartItems} />
        <section className="py-20 md:py-28 relative">
          <div className="absolute inset-0 gradient-rose-subtle" />
          <div className="container relative max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border border-border/40 bg-card p-8 md:p-10 space-y-8"
              style={{ borderRadius: '2px' }}
            >
              <div className="text-center space-y-3">
                <Lock size={20} className="text-accent mx-auto" />
                <h1 className="text-3xl font-serif font-light">Admin Login</h1>
                <p className="text-sm text-muted-foreground font-light">
                  Sign in to access the admin panel
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-destructive/5 border border-destructive/15 text-sm text-destructive text-center font-light"
                    style={{ borderRadius: '2px' }}
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="admin-email" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">
                    Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-elegant"
                    placeholder="admin@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="admin-password" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-elegant pr-12"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading && <Spinner size={16} />}
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    </PageTransition>
  );
}

export default function Admin() {
  usePageMeta({ title: 'Admin', description: 'princess-made admin dashboard.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  if (!isAuthenticated) {
    return <AdminLogin cartItems={cartItems} />;
  }

  if (user?.role !== 'admin') {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header
            cartCount={cartItems}
            isAuthenticated={isAuthenticated}
            onLogoutClick={logout}
          />
          <div className="container py-24 text-center space-y-6">
            <AlertTriangle size={32} className="text-accent mx-auto" />
            <h1 className="text-3xl font-serif font-light">Access Denied</h1>
            <p className="text-muted-foreground font-light">
              You do not have permission to view this page.
            </p>
            <motion.a
              whileHover={{ scale: 1.02 }}
              href="/"
              className="btn-primary inline-block cursor-pointer"
            >
              Return Home
            </motion.a>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders' as TabType, label: 'Orders', icon: Package },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'newsletter' as TabType, label: 'Newsletter', icon: Mail },
    { id: 'products' as TabType, label: 'Products', icon: ShoppingBag },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header cartCount={cartItems} isAuthenticated onLogoutClick={logout} />

        {/* Page Header */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 gradient-rose-subtle" />
          <div className="absolute inset-0 texture-linen opacity-50" />
          <div className="container relative">
            <div className="flex items-center gap-3 mb-1">
              <ShieldCheck size={20} className="text-accent" />
              <p className="font-script text-xl text-accent">Administration</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-light">
              Admin Panel
            </h1>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:col-span-1"
              >
                <div className="space-y-2 lg:sticky lg:top-28">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        whileHover={{ x: 2 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-light transition-all ${
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-cream'
                        }`}
                        style={{ borderRadius: '2px' }}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-3"
              >
                {activeTab === 'dashboard' && <DashboardTab />}

                {activeTab === 'orders' && (
                  <OrdersTab
                    expandedOrder={expandedOrder}
                    setExpandedOrder={setExpandedOrder}
                  />
                )}

                {activeTab === 'users' && <UsersTab />}

                {activeTab === 'newsletter' && <NewsletterTab />}
                {activeTab === 'products' && <ProductsTab />}
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}

// ========== DASHBOARD TAB ==========

function DashboardTab() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  if (isLoading) {
    return (
      <div className="border border-border/30 p-16 flex items-center justify-center" style={{ borderRadius: '2px' }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <h2 className="text-2xl font-serif font-light">Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={itemVariants}
          className="border border-border/30 p-5 space-y-2"
          style={{ borderRadius: '2px' }}
        >
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <Package size={14} />
            <p className="text-[10px] uppercase tracking-[0.2em] font-light">Total Orders</p>
          </div>
          <p className="text-3xl font-serif font-light text-foreground">{stats.totalOrders}</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="border border-border/30 p-5 space-y-2"
          style={{ borderRadius: '2px' }}
        >
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <DollarSign size={14} />
            <p className="text-[10px] uppercase tracking-[0.2em] font-light">Total Revenue</p>
          </div>
          <p className="text-3xl font-serif font-light text-accent">
            A${(stats.totalRevenue / 100).toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="border border-border/30 p-5 space-y-2"
          style={{ borderRadius: '2px' }}
        >
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <Users size={14} />
            <p className="text-[10px] uppercase tracking-[0.2em] font-light">Registered Users</p>
          </div>
          <p className="text-3xl font-serif font-light text-foreground">{stats.totalUsers}</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="border border-border/30 p-5 space-y-2"
          style={{ borderRadius: '2px' }}
        >
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <Mail size={14} />
            <p className="text-[10px] uppercase tracking-[0.2em] font-light">Subscribers</p>
          </div>
          <p className="text-3xl font-serif font-light text-foreground">{stats.totalSubscribers}</p>
        </motion.div>
      </div>

      {/* Orders by Status */}
      <motion.div
        variants={itemVariants}
        className="border border-border/30 p-6 space-y-4"
        style={{ borderRadius: '2px' }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-muted-foreground/50" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">
            Orders by Status
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['pending', 'completed', 'failed', 'cancelled'].map((status) => (
            <div key={status} className="text-center p-3 bg-cream/30" style={{ borderRadius: '2px' }}>
              <span
                className={`inline-block text-[9px] px-2.5 py-0.5 font-light tracking-wider uppercase mb-2 ${statusColors[status]}`}
                style={{ borderRadius: '2px' }}
              >
                {status}
              </span>
              <p className="text-2xl font-serif font-light">
                {stats.ordersByStatus[status] || 0}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        variants={itemVariants}
        className="border border-border/30 p-6 space-y-4"
        style={{ borderRadius: '2px' }}
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">
          Recent Orders
        </p>
        {stats.recentOrders.length > 0 ? (
          <div className="space-y-2">
            {stats.recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 px-4 border-b border-border/10 last:border-0 hover:bg-cream/30 transition-colors"
                style={{ borderRadius: '2px' }}
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-serif font-light">Order #{order.id}</p>
                    <span
                      className={`text-[9px] px-2 py-0.5 font-light tracking-wider uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}
                      style={{ borderRadius: '2px' }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/50 font-light truncate">
                    {order.guestEmail || order.user?.email || 'Unknown'} &middot;{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-AU', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <p className="text-sm font-serif font-light text-accent ml-3">
                  A${(order.totalAmount / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground/40 font-light text-sm py-4 text-center">No orders yet</p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ========== ORDERS TAB ==========

function OrdersTab({
  expandedOrder,
  setExpandedOrder,
}: {
  expandedOrder: number | null;
  setExpandedOrder: (id: number | null) => void;
}) {
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o: any) => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((o: any) => {
        const orderNum = `#${o.id}`;
        const pmNum = `pm-${1000 + o.id}`;
        const email = (o.guestEmail || o.user?.email || '').toLowerCase();
        const name = (o.guestName || o.user?.name || '').toLowerCase();
        return (
          orderNum.includes(q) ||
          pmNum.includes(q) ||
          String(o.id).includes(q) ||
          email.includes(q) ||
          name.includes(q)
        );
      });
    }

    return filtered;
  }, [orders, statusFilter, searchQuery]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <h2 className="text-2xl font-serif font-light">All Orders</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, email, or name..."
            className="input-elegant w-full pl-9 text-sm"
            style={{ borderRadius: '2px' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-elegant text-sm min-w-[140px]"
          style={{ borderRadius: '2px' }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="border border-border/30 p-16 flex items-center justify-center" style={{ borderRadius: '2px' }}>
          <Spinner size={24} />
        </div>
      ) : filteredOrders.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground/40 font-light">
            Showing {filteredOrders.length} of {orders?.length || 0} orders
          </p>
          <div className="space-y-3">
            {filteredOrders.map((order: any) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                isExpanded={expandedOrder === order.id}
                onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="border border-border/30 p-16 text-center" style={{ borderRadius: '2px' }}>
          <Package size={32} className="mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground font-light">
            {searchQuery || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ========== ADMIN ORDER CARD ==========

function AdminOrderCard({
  order,
  isExpanded,
  onToggle,
}: {
  order: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const utils = trpc.useUtils();

  const { data: orderItems } = trpc.admin.orders.getItems.useQuery(order.id, {
    enabled: isExpanded,
  });

  const [editStatus, setEditStatus] = useState(order.status || 'pending');
  const [editTracking, setEditTracking] = useState(order.trackingNumber || '');
  const [editShipping, setEditShipping] = useState(order.shippingStatus || 'processing');

  React.useEffect(() => {
    setEditStatus(order.status || 'pending');
    setEditTracking(order.trackingNumber || '');
    setEditShipping(order.shippingStatus || 'processing');
  }, [order.status, order.trackingNumber, order.shippingStatus]);

  const updateStatus = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.orders.list.invalidate();
      utils.admin.stats.invalidate();
      toast.success('Order status updated');
    },
    onError: (err) => toast.error(`Failed to update status: ${err.message}`),
  });

  const updateTracking = trpc.admin.orders.updateTracking.useMutation({
    onSuccess: () => {
      utils.admin.orders.list.invalidate();
      toast.success('Tracking information updated');
    },
    onError: (err) => toast.error(`Failed to update tracking: ${err.message}`),
  });

  const sendShippingEmail = trpc.admin.orders.sendShippingEmail.useMutation({
    onSuccess: () => toast.success('Shipping update email sent'),
    onError: (err) => toast.error(`Failed to send email: ${err.message}`),
  });

  const handleSaveStatus = () => {
    updateStatus.mutate({ orderId: order.id, status: editStatus });
  };

  const handleSaveTracking = () => {
    updateTracking.mutate({
      orderId: order.id,
      trackingNumber: editTracking || null,
      shippingStatus: editShipping,
    });
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    completed: 'bg-green-100 text-green-700 border border-green-200',
    failed: 'bg-red-100 text-red-700 border border-red-200',
    cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
  };

  const shippingColors: Record<string, string> = {
    processing: 'bg-blue-50 text-blue-600 border border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
    in_transit: 'bg-purple-50 text-purple-600 border border-purple-200',
    delivered: 'bg-green-50 text-green-700 border border-green-200',
  };

  return (
    <motion.div
      variants={itemVariants}
      className="border border-border/30 hover:border-accent/20 transition-colors overflow-hidden bg-white/50"
      style={{ borderRadius: '2px' }}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start justify-between text-left"
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-serif font-light text-sm">Order #{order.id}</p>
            <span
              className={`text-[9px] px-2.5 py-0.5 font-light tracking-wider uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}
              style={{ borderRadius: '2px' }}
            >
              {order.status}
            </span>
            {order.shippingStatus && (
              <span
                className={`text-[9px] px-2.5 py-0.5 font-light tracking-wider uppercase ${shippingColors[order.shippingStatus] || 'bg-gray-100 text-gray-500'}`}
                style={{ borderRadius: '2px' }}
              >
                {order.shippingStatus.replace('_', ' ')}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/60 font-light truncate">
            {order.guestEmail
              ? `${order.guestName || order.guestEmail} (guest)`
              : order.user?.name || order.user?.email || 'Unknown user'}{' '}
            &middot;{' '}
            {new Date(order.createdAt).toLocaleDateString('en-AU', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-3 shrink-0">
          <p className="text-lg font-serif font-light text-accent">
            A${(order.totalAmount / 100).toFixed(2)}
          </p>
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-5">
              {/* Order Status */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">
                  Order Status
                </p>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="input-elegant w-full text-sm"
                      style={{ borderRadius: '2px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveStatus}
                    disabled={updateStatus.isPending || editStatus === order.status}
                    className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {updateStatus.isPending ? (
                      <Spinner size={12} />
                    ) : (
                      <Save size={12} />
                    )}
                    Save
                  </motion.button>
                </div>
              </div>

              {/* Shipping & Tracking */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">
                  Shipping & Tracking
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-light">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      placeholder="Enter tracking number"
                      className="input-elegant mt-1 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-light">
                      Shipping Status
                    </label>
                    <select
                      value={editShipping}
                      onChange={(e) => setEditShipping(e.target.value)}
                      className="input-elegant mt-1 w-full text-sm"
                      style={{ borderRadius: '2px' }}
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveTracking}
                    disabled={updateTracking.isPending}
                    className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {updateTracking.isPending ? (
                      <Spinner size={12} />
                    ) : (
                      <Truck size={12} />
                    )}
                    Update Tracking
                  </motion.button>
                  {order.trackingNumber && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendShippingEmail.mutate({ orderId: order.id })}
                      disabled={sendShippingEmail.isPending}
                      className="border border-accent/30 text-accent hover:bg-accent/5 text-xs px-4 py-2.5 flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                      style={{ borderRadius: '2px' }}
                    >
                      {sendShippingEmail.isPending ? (
                        <Spinner size={12} />
                      ) : (
                        <Send size={12} />
                      )}
                      Send Shipping Email
                    </motion.button>
                  )}
                  {editTracking && (
                    <a
                      href={`https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(editTracking)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:text-accent/80 font-light underline"
                    >
                      View on AusPost
                    </a>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">
                    Shipping Address
                  </p>
                  <div className="flex items-start gap-2 bg-cream/30 p-3" style={{ borderRadius: '2px' }}>
                    <MapPin size={14} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                    <div className="text-sm font-light text-muted-foreground">
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">
                  Items
                </p>
                {orderItems ? (
                  <div className="space-y-0 border border-border/20 overflow-hidden" style={{ borderRadius: '2px' }}>
                    {orderItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 px-4 border-b border-border/10 last:border-0 bg-white/30"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-light truncate">
                            {item.productName || item.stripeProductId || `Product #${item.productId}`}
                          </p>
                          <p className="text-[11px] text-muted-foreground/50 font-light">
                            Qty: {item.quantity} x A${(item.priceAtTime / 100).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-light text-accent ml-3">
                          A${((item.priceAtTime * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3 px-4 bg-cream/40">
                      <p className="text-xs font-light text-muted-foreground/60 uppercase tracking-wider">Total</p>
                      <p className="text-base font-serif font-light text-accent">
                        A${(order.totalAmount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Spinner size={12} /> Loading items...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ========== USERS TAB ==========

function UsersTab() {
  const { data: users, isLoading } = trpc.admin.users.list.useQuery();
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <h2 className="text-2xl font-serif font-light">All Users</h2>

      {isLoading ? (
        <div className="border border-border/30 p-16 flex items-center justify-center" style={{ borderRadius: '2px' }}>
          <Spinner size={24} />
        </div>
      ) : users && users.length > 0 ? (
        <div className="border border-border/30 overflow-hidden" style={{ borderRadius: '2px' }}>
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-7 gap-4 px-5 py-3 bg-cream/50 border-b border-border/20">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light col-span-2">Email</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Name</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Role</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Orders / Spent</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Last Sign In</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Actions</p>
          </div>

          {/* Table Rows */}
          {users.map((u: any) => (
            <motion.div
              key={u.id}
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4 px-5 py-4 border-b border-border/10 last:border-0 hover:bg-cream/30 transition-colors"
            >
              <div className="col-span-2">
                <p className="text-sm font-light truncate">{u.email}</p>
                <p className="text-[10px] text-muted-foreground/40 font-light md:hidden">Email</p>
              </div>
              <div>
                <p className="text-sm font-light">
                  {u.name || <span className="text-muted-foreground/40 italic">No name</span>}
                </p>
              </div>
              <div>
                <span
                  className={`text-[9px] px-2 py-0.5 font-light tracking-wider uppercase ${
                    u.role === 'admin'
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  style={{ borderRadius: '2px' }}
                >
                  {u.role || 'user'}
                </span>
              </div>
              <div>
                <p className="text-sm font-light">
                  {u.orderCount > 0 ? (
                    <>
                      {u.orderCount} order{u.orderCount !== 1 ? 's' : ''}
                      <span className="text-accent ml-1">
                        (A${(u.totalSpent / 100).toFixed(2)})
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground/40">None</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 font-light">
                  {u.lastSignedIn
                    ? new Date(u.lastSignedIn).toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Never'}
                </p>
              </div>
              <div>
                {u.orderCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewingUserId(viewingUserId === u.id ? null : u.id)}
                    className="text-xs text-accent hover:text-accent/80 font-light flex items-center gap-1"
                  >
                    <Eye size={12} />
                    {viewingUserId === u.id ? 'Hide' : 'View'} Orders
                  </motion.button>
                )}
              </div>
              {/* User orders panel */}
              {viewingUserId === u.id && (
                <div className="col-span-full mt-2">
                  <UserOrdersPanel userId={u.id} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border border-border/30 p-16 text-center" style={{ borderRadius: '2px' }}>
          <Users size={32} className="mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground font-light">No users found</p>
        </div>
      )}
    </motion.div>
  );
}

// ========== USER ORDERS PANEL ==========

function UserOrdersPanel({ userId }: { userId: number }) {
  const { data: orders, isLoading } = trpc.admin.users.getOrders.useQuery(userId);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
        <Spinner size={12} /> Loading orders...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return <p className="text-xs text-muted-foreground/40 font-light py-2">No orders found</p>;
  }

  return (
    <div className="border border-border/20 overflow-hidden bg-cream/20" style={{ borderRadius: '2px' }}>
      {orders.map((order: any) => (
        <div
          key={order.id}
          className="flex items-center justify-between py-2.5 px-4 border-b border-border/10 last:border-0"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-serif font-light">Order #{order.id}</p>
            <span
              className={`text-[8px] px-1.5 py-0.5 font-light tracking-wider uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}
              style={{ borderRadius: '2px' }}
            >
              {order.status}
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-light">
              {new Date(order.createdAt).toLocaleDateString('en-AU', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <p className="text-xs font-serif font-light text-accent">
            A${(order.totalAmount / 100).toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}

// ========== NEWSLETTER TAB ==========

function NewsletterTab() {
  const { data: subscribers, isLoading } = trpc.admin.newsletter.list.useQuery();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-serif font-light">Newsletter Subscribers</h2>
        {subscribers && (
          <p className="text-sm text-muted-foreground/50 font-light">
            {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="border border-border/30 p-16 flex items-center justify-center" style={{ borderRadius: '2px' }}>
          <Spinner size={24} />
        </div>
      ) : subscribers && subscribers.length > 0 ? (
        <div className="border border-border/30 overflow-hidden" style={{ borderRadius: '2px' }}>
          {/* Header */}
          <div className="hidden md:grid grid-cols-2 gap-4 px-5 py-3 bg-cream/50 border-b border-border/20">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Email</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Subscribed</p>
          </div>

          {/* Rows */}
          {subscribers.map((sub: any) => (
            <motion.div
              key={sub.id}
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 px-5 py-3.5 border-b border-border/10 last:border-0 hover:bg-cream/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-accent/40 shrink-0" />
                <p className="text-sm font-light truncate">{sub.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 font-light">
                  {sub.createdAt
                    ? new Date(sub.createdAt).toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border border-border/30 p-16 text-center" style={{ borderRadius: '2px' }}>
          <Mail size={32} className="mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground font-light">No subscribers yet</p>
        </div>
      )}
    </motion.div>
  );
}
function ProductsTab() {
  const { data: products, isLoading } = trpc.admin.products.list.useQuery();
  const utils = trpc.useUtils();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState('');

  const updateCategory = trpc.admin.products.updateCategory.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      toast.success('Category updated');
      setEditingId(null);
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  if (isLoading) {
    return (
      <div className="border border-border/30 p-16 flex items-center justify-center" style={{ borderRadius: '2px' }}>
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <h2 className="text-2xl font-serif font-light">Products</h2>
      <div className="border border-border/30 overflow-hidden" style={{ borderRadius: '2px' }}>
        {products?.map((product: any) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            className="flex items-center gap-4 px-5 py-4 border-b border-border/10 last:border-0 hover:bg-cream/30 transition-colors"
          >
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover shrink-0" style={{ borderRadius: '2px' }} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-light truncate">{product.name}</p>
              <p className="text-xs text-accent font-light">A${(product.price / 100).toFixed(2)}</p>
            </div>
            {editingId === product.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="e.g. Bags"
                  className="input-elegant text-sm w-32"
                  autoFocus
                />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateCategory.mutate({ productId: product.id, category: categoryInput })}
                  disabled={updateCategory.isPending}
                  className="btn-primary text-xs px-3 py-2"
                >
                  {updateCategory.isPending ? <Spinner size={12} /> : <Save size={12} />}
                </motion.button>
                <button onClick={() => setEditingId(null)} className="text-xs text-muted-foreground/50 hover:text-foreground px-2">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground/50 font-light">{product.category}</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => { setEditingId(product.id); setCategoryInput(product.category === 'Uncategorized' ? '' : product.category); }}
                  className="text-xs text-accent hover:text-accent/80 font-light"
                >
                  Edit
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
