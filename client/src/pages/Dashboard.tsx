import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import {
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Check,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';

type TabType = 'orders' | 'addresses' | 'favorites' | 'settings';

export default function Dashboard() {
  usePageMeta({ title: 'My Account', description: 'Manage your Princess Made account, orders, and favorites.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Address form state
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressPostal, setAddressPostal] = useState('');

  // Settings form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const utils = trpc.useUtils();

  const { data: orders } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: addresses } = trpc.addresses.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: favorites } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Address mutations
  const createAddress = trpc.addresses.create.useMutation({
    onSuccess: () => {
      utils.addresses.list.invalidate();
      setShowAddressForm(false);
      setAddressStreet('');
      setAddressCity('');
      setAddressState('');
      setAddressPostal('');
    },
  });

  const deleteAddress = trpc.addresses.delete.useMutation({
    onSuccess: () => utils.addresses.list.invalidate(),
  });

  // Favorites mutation
  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      utils.favorites.isFavorited.invalidate();
      toast.success('Removed from favorites');
    },
  });

  // Profile update
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    },
  });

  // Password change
  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to change password');
    },
  });

  // Initialize settings form when user loads
  React.useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header cartCount={cartItems} />
          <div className="container py-24 text-center space-y-6">
            <Sparkles size={24} className="text-accent mx-auto" />
            <h1 className="text-3xl font-serif font-light">Sign In to Continue</h1>
            <p className="text-muted-foreground font-light">
              View your orders, manage addresses, and save your favorites.
            </p>
            <motion.a
              whileHover={{ scale: 1.02 }}
              href="/login"
              className="btn-primary inline-block cursor-pointer"
            >
              Sign In
            </motion.a>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

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

  const tabs = [
    { id: 'orders' as TabType, label: 'Orders', icon: Package },
    { id: 'addresses' as TabType, label: 'Addresses', icon: MapPin },
    { id: 'favorites' as TabType, label: 'Favorites', icon: Heart },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressStreet || !addressCity || !addressState || !addressPostal) return;
    createAddress.mutate({
      street: addressStreet,
      city: addressCity,
      state: addressState,
      postalCode: addressPostal,
      country: 'AU',
      isDefault: addresses && addresses.length === 0 ? 1 : 0,
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { name?: string; email?: string } = {};
    if (editName !== user?.name) updates.name = editName;
    if (editEmail !== user?.email) updates.email = editEmail;
    if (Object.keys(updates).length > 0) {
      updateProfile.mutate(updates);
    }
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
            <p className="font-script text-xl text-accent mb-1">Welcome back</p>
            <h1 className="text-3xl md:text-4xl font-serif font-light">
              {user?.name || 'My Account'}
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
                        {tab.id === 'orders' && orders && orders.length > 0 && (
                          <span className="ml-auto text-[10px] opacity-60">{orders.length}</span>
                        )}
                        {tab.id === 'favorites' && favorites && favorites.length > 0 && (
                          <span className="ml-auto text-[10px] opacity-60">{favorites.length}</span>
                        )}
                      </motion.button>
                    );
                  })}

                  <div className="pt-4 border-t border-border/30 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-light text-muted-foreground hover:text-foreground border border-border/30 hover:border-accent/30 transition-all"
                      style={{ borderRadius: '2px' }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </motion.button>
                  </div>
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
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    <h2 className="text-2xl font-serif font-light">Order History</h2>

                    {orders && orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.map((order: any) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            isExpanded={expandedOrder === order.id}
                            onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="border border-border/30 p-16 text-center space-y-4" style={{ borderRadius: '2px' }}>
                        <Package size={32} className="mx-auto text-muted-foreground/20" />
                        <p className="text-muted-foreground font-light">No orders yet</p>
                        <Link href="/shop">
                          <motion.a className="inline-flex items-center gap-2 text-accent font-light text-sm hover:text-accent/80 cursor-pointer">
                            Start Shopping <ChevronRight size={14} />
                          </motion.a>
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ========== ADDRESSES ========== */}
                {activeTab === 'addresses' && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-serif font-light">Addresses</h2>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        Add
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {showAddressForm && (
                        <motion.form
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          onSubmit={handleSaveAddress}
                          className="border border-border/30 p-6 space-y-4"
                          style={{ borderRadius: '2px' }}
                        >
                          <h3 className="font-serif font-light text-sm">New Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Street"
                              value={addressStreet}
                              onChange={(e) => setAddressStreet(e.target.value)}
                              required
                              className="input-elegant"
                            />
                            <input
                              type="text"
                              placeholder="City"
                              value={addressCity}
                              onChange={(e) => setAddressCity(e.target.value)}
                              required
                              className="input-elegant"
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={addressState}
                              onChange={(e) => setAddressState(e.target.value)}
                              required
                              className="input-elegant"
                            />
                            <input
                              type="text"
                              placeholder="Postal Code"
                              value={addressPostal}
                              onChange={(e) => setAddressPostal(e.target.value)}
                              required
                              className="input-elegant"
                            />
                          </div>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              type="submit"
                              disabled={createAddress.isPending}
                              className="btn-primary text-xs px-5 py-2 flex items-center gap-2"
                            >
                              {createAddress.isPending && <Loader2 size={12} className="animate-spin" />}
                              Save
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              type="button"
                              onClick={() => setShowAddressForm(false)}
                              className="btn-outline text-xs px-5 py-2"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {addresses && addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address: any) => (
                          <motion.div
                            key={address.id}
                            variants={itemVariants}
                            className="border border-border/30 p-5 space-y-3"
                            style={{ borderRadius: '2px' }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <p className="font-light text-sm">{address.street}</p>
                                <p className="text-xs text-muted-foreground/60 font-light">
                                  {address.city}, {address.state} {address.postalCode}
                                </p>
                              </div>
                              {address.isDefault === 1 && (
                                <span className="badge-handmade text-[9px] py-0.5">Default</span>
                              )}
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-border/20">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => {
                                  if (confirm('Delete this address?')) {
                                    deleteAddress.mutate(address.id);
                                  }
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-light text-destructive hover:bg-destructive/5 transition-colors"
                                style={{ borderRadius: '2px' }}
                              >
                                <Trash2 size={12} /> Delete
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-border/30 p-16 text-center" style={{ borderRadius: '2px' }}>
                        <MapPin size={32} className="mx-auto mb-4 text-muted-foreground/20" />
                        <p className="text-muted-foreground font-light">No addresses saved</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ========== FAVORITES ========== */}
                {activeTab === 'favorites' && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    <h2 className="text-2xl font-serif font-light">Favorites</h2>

                    {favorites && favorites.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((fav: any) => (
                          <FavoriteCard
                            key={fav.id}
                            productId={fav.productId}
                            onRemove={() => removeFavorite.mutate(fav.productId)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="border border-border/30 p-16 text-center space-y-4" style={{ borderRadius: '2px' }}>
                        <Heart size={32} className="mx-auto text-muted-foreground/20" />
                        <p className="text-muted-foreground font-light">No favorites yet</p>
                        <Link href="/shop">
                          <motion.a className="inline-flex items-center gap-2 text-accent font-light text-sm hover:text-accent/80 cursor-pointer">
                            Browse Collection <ChevronRight size={14} />
                          </motion.a>
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ========== SETTINGS ========== */}
                {activeTab === 'settings' && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    <h2 className="text-2xl font-serif font-light">Settings</h2>

                    <form onSubmit={handleSaveProfile} className="border border-border/30 p-6 space-y-6" style={{ borderRadius: '2px' }}>
                      <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                          Profile
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-light">Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="input-elegant mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-light">Email</label>
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="input-elegant mt-1"
                            />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={updateProfile.isPending}
                          className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2"
                        >
                          {updateProfile.isPending && <Loader2 size={12} className="animate-spin" />}
                          {settingsSaved ? (
                            <>
                              <Check size={12} /> Saved
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </motion.button>
                      </motion.div>
                    </form>

                    {/* Change Password */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newPassword !== confirmPassword) {
                          toast.error('Passwords do not match');
                          return;
                        }
                        changePassword.mutate({ currentPassword, newPassword });
                      }}
                      className="border border-border/30 p-6 space-y-4"
                      style={{ borderRadius: '2px' }}
                    >
                      <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light flex items-center gap-2">
                        <KeyRound size={12} /> Change Password
                      </h3>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="input-elegant"
                        />
                        <input
                          type="password"
                          placeholder="New password (min 6 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                          className="input-elegant"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="input-elegant"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        type="submit"
                        disabled={changePassword.isPending}
                        className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2"
                      >
                        {changePassword.isPending && <Loader2 size={12} className="animate-spin" />}
                        Update Password
                      </motion.button>
                    </form>

                    <div className="border border-border/30 p-6 space-y-4" style={{ borderRadius: '2px' }}>
                      <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                        Account
                      </h3>
                      <p className="text-xs text-muted-foreground/60 font-light">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
                      </p>
                    </div>
                  </motion.div>
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

// ========== ORDER CARD COMPONENT ==========

function OrderCard({ order, isExpanded, onToggle }: { order: any; isExpanded: boolean; onToggle: () => void }) {
  const { data: orderItems } = trpc.orders.getItems.useQuery(order.id, {
    enabled: isExpanded,
  });

  const orderNumber = `PM-${1000 + order.id}`;

  const statusConfig: Record<string, { bg: string; dot: string; label: string }> = {
    pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', label: 'Pending' },
    completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', label: 'Completed' },
    failed: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400', label: 'Failed' },
    cancelled: { bg: 'bg-gray-50 text-gray-500 border-gray-200', dot: 'bg-gray-400', label: 'Cancelled' },
    refunded: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', label: 'Refunded' },
  };

  const status = statusConfig[order.status] || statusConfig.cancelled;
  const auspostUrl = order.trackingNumber
    ? `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(order.trackingNumber)}`
    : null;

  return (
    <motion.div
      className="border border-border/30 hover:border-accent/20 transition-colors overflow-hidden"
      style={{ borderRadius: '2px' }}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start justify-between text-left"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <p className="font-serif font-light text-sm">{orderNumber}</p>
            <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1 font-light tracking-wider uppercase border ${status.bg}`} style={{ borderRadius: '10px' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60 font-light">
            {new Date(order.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-lg font-serif font-light text-accent">
            A${(order.totalAmount / 100).toFixed(2)}
          </p>
          <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
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
            <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-4">
              {/* Tracking info with AusPost link */}
              {order.trackingNumber && (
                <div className="p-3 bg-cream/50 border border-border/20 space-y-2" style={{ borderRadius: '2px' }}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">
                        Australia Post Tracking
                      </p>
                      <p className="font-mono text-sm">{order.trackingNumber}</p>
                    </div>
                    {auspostUrl && (
                      <a
                        href={auspostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-[10px] px-3 py-1.5 inline-flex items-center gap-1.5"
                      >
                        Track on AusPost
                        <ChevronRight size={10} />
                      </a>
                    )}
                  </div>
                  {order.shippingStatus && (
                    <div className="flex items-center gap-2 text-xs font-light pt-1 border-t border-border/10">
                      <Package size={12} className="text-accent" />
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize font-medium">{order.shippingStatus.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order items */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Items</p>
                {orderItems ? (
                  <div className="space-y-2">
                    {orderItems.map((item: any) => (
                      <OrderItemRow key={item.id} item={item} />
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

// ========== ORDER ITEM ROW ==========

function OrderItemRow({ item }: { item: any }) {
  const { data: product } = trpc.products.getById.useQuery(item.productId, {
    enabled: !!item.productId,
  });

  return (
    <div className="flex items-center gap-3">
      {product?.imageUrl && (
        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover flex-shrink-0" style={{ borderRadius: '2px' }} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-light truncate">{product?.name || item.productId}</p>
        <p className="text-[11px] text-muted-foreground/50 font-light">Qty: {item.quantity}</p>
      </div>
      <p className="text-sm font-light text-accent">A${((item.priceAtTime * item.quantity) / 100).toFixed(2)}</p>
    </div>
  );
}

// ========== FAVORITE CARD ==========

function FavoriteCard({ productId, onRemove }: { productId: string; onRemove: () => void }) {
  const { data: product, isLoading } = trpc.products.getById.useQuery(productId);
  const addItem = useCartStore((state) => state.addItem);

  if (isLoading) {
    return (
      <div className="border border-border/30 p-8 flex items-center justify-center" style={{ borderRadius: '2px' }}>
        <Loader2 size={20} className="animate-spin text-accent/40" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="border border-border/30 p-5 space-y-3" style={{ borderRadius: '2px' }}>
        <p className="font-light text-sm text-muted-foreground">Product no longer available</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onRemove}
          className="text-xs text-destructive font-light flex items-center gap-1"
        >
          <Trash2 size={12} /> Remove
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className="border border-border/30 overflow-hidden hover:border-accent/20 transition-colors"
      style={{ borderRadius: '2px' }}
    >
      <div className="flex gap-4 p-4">
        {product.imageUrl && (
          <Link href={`/product/${product.id}`}>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 object-cover flex-shrink-0 cursor-pointer"
              style={{ borderRadius: '2px' }}
            />
          </Link>
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <Link href={`/product/${product.id}`}>
            <p className="font-serif font-light text-sm hover:text-accent cursor-pointer transition-colors truncate">
              {product.name}
            </p>
          </Link>
          <p className="text-accent font-serif font-light">A${(product.price / 100).toFixed(2)}</p>
          <div className="flex gap-2 pt-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => addItem({
                productId: product.id,
                stripePriceId: product.stripePriceId,
                quantity: 1,
                price: product.price,
                name: product.name,
                imageUrl: product.imageUrl ?? undefined,
              })}
              className="btn-primary text-[10px] px-3 py-1.5"
            >
              Add to Cart
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={onRemove}
              className="text-xs text-muted-foreground hover:text-destructive font-light flex items-center gap-1 px-2 transition-colors"
            >
              <Trash2 size={11} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
