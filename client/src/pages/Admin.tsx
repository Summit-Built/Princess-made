import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Package,
  Users,
  ChevronDown,
  Loader2,
  Truck,
  Save,
  AlertTriangle,
} from 'lucide-react';

type TabType = 'orders' | 'users';

export default function Admin() {
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Redirect non-admin users
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header
            cartCount={cartItems}
            isAuthenticated={isAuthenticated}
            onLoginClick={() => (window.location.href = '/login')}
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
    { id: 'orders' as TabType, label: 'Orders', icon: Package },
    { id: 'users' as TabType, label: 'Users', icon: Users },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

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
                {/* ========== ORDERS ========== */}
                {activeTab === 'orders' && (
                  <OrdersTab
                    containerVariants={containerVariants}
                    expandedOrder={expandedOrder}
                    setExpandedOrder={setExpandedOrder}
                  />
                )}

                {/* ========== USERS ========== */}
                {activeTab === 'users' && (
                  <UsersTab containerVariants={containerVariants} />
                )}
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}

// ========== ORDERS TAB ==========

function OrdersTab({
  containerVariants,
  expandedOrder,
  setExpandedOrder,
}: {
  containerVariants: any;
  expandedOrder: number | null;
  setExpandedOrder: (id: number | null) => void;
}) {
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <h2 className="text-2xl font-serif font-light">All Orders</h2>

      {isLoading ? (
        <div className="border border-border/30 p-16 flex items-center justify-center" style={{ borderRadius: '2px' }}>
          <Loader2 size={24} className="animate-spin text-accent/40" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <AdminOrderCard
              key={order.id}
              order={order}
              isExpanded={expandedOrder === order.id}
              onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            />
          ))}
        </div>
      ) : (
        <div className="border border-border/30 p-16 text-center" style={{ borderRadius: '2px' }}>
          <Package size={32} className="mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground font-light">No orders found</p>
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

  // Sync local state when order prop changes
  React.useEffect(() => {
    setEditStatus(order.status || 'pending');
    setEditTracking(order.trackingNumber || '');
    setEditShipping(order.shippingStatus || 'processing');
  }, [order.status, order.trackingNumber, order.shippingStatus]);

  const updateStatus = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.orders.list.invalidate();
      toast.success('Order status updated');
    },
    onError: (err) => {
      toast.error(`Failed to update status: ${err.message}`);
    },
  });

  const updateTracking = trpc.admin.orders.updateTracking.useMutation({
    onSuccess: () => {
      utils.admin.orders.list.invalidate();
      toast.success('Tracking information updated');
    },
    onError: (err) => {
      toast.error(`Failed to update tracking: ${err.message}`);
    },
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
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  const shippingColors: Record<string, string> = {
    processing: 'bg-blue-50 text-blue-600',
    shipped: 'bg-indigo-50 text-indigo-600',
    in_transit: 'bg-purple-50 text-purple-600',
    delivered: 'bg-green-50 text-green-700',
  };

  return (
    <motion.div
      className="border border-border/30 hover:border-accent/20 transition-colors overflow-hidden"
      style={{ borderRadius: '2px' }}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start justify-between text-left"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-serif font-light text-sm">Order #{order.id}</p>
            <span
              className={`text-[9px] px-2 py-0.5 font-light tracking-wider uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}
              style={{ borderRadius: '2px' }}
            >
              {order.status}
            </span>
            {order.shippingStatus && (
              <span
                className={`text-[9px] px-2 py-0.5 font-light tracking-wider uppercase ${shippingColors[order.shippingStatus] || 'bg-gray-100 text-gray-500'}`}
                style={{ borderRadius: '2px' }}
              >
                {order.shippingStatus.replace('_', ' ')}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/60 font-light">
            {order.guestEmail ? `${order.guestEmail} (guest)` : order.user?.email || order.userEmail || 'Unknown user'} &middot;{' '}
            {new Date(order.createdAt).toLocaleDateString('en-AU', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
                      <Loader2 size={12} className="animate-spin" />
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
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Truck size={12} />
                    )}
                    Update Tracking
                  </motion.button>
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

              {/* Order Items */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">
                  Items
                </p>
                {orderItems ? (
                  <div className="space-y-2">
                    {orderItems.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-light truncate">
                            {item.productName || `Product #${item.productId}`}
                          </p>
                          <p className="text-[11px] text-muted-foreground/50 font-light">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-light text-accent">
                          A${((item.priceAtTime * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={12} className="animate-spin" /> Loading items...
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

function UsersTab({ containerVariants }: { containerVariants: any }) {
  const { data: users, isLoading } = trpc.admin.users.list.useQuery();

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <h2 className="text-2xl font-serif font-light">All Users</h2>

      {isLoading ? (
        <div className="border border-border/30 p-16 flex items-center justify-center" style={{ borderRadius: '2px' }}>
          <Loader2 size={24} className="animate-spin text-accent/40" />
        </div>
      ) : users && users.length > 0 ? (
        <div className="border border-border/30 overflow-hidden" style={{ borderRadius: '2px' }}>
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-4 gap-4 px-5 py-3 bg-cream/50 border-b border-border/20">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Email</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Name</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Role</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Joined</p>
          </div>

          {/* Table Rows */}
          {users.map((u: any) => (
            <motion.div
              key={u.id}
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 px-5 py-4 border-b border-border/10 last:border-0 hover:bg-cream/30 transition-colors"
            >
              <div>
                <p className="text-sm font-light truncate">{u.email}</p>
                <p className="text-[10px] text-muted-foreground/40 font-light md:hidden">Email</p>
              </div>
              <div>
                <p className="text-sm font-light">{u.name || <span className="text-muted-foreground/40 italic">No name</span>}</p>
                <p className="text-[10px] text-muted-foreground/40 font-light md:hidden">Name</p>
              </div>
              <div>
                <span
                  className={`text-[9px] px-2 py-0.5 font-light tracking-wider uppercase ${
                    u.role === 'admin'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  style={{ borderRadius: '2px' }}
                >
                  {u.role || 'user'}
                </span>
                <p className="text-[10px] text-muted-foreground/40 font-light md:hidden mt-1">Role</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 font-light">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
                <p className="text-[10px] text-muted-foreground/40 font-light md:hidden">Joined</p>
              </div>
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
