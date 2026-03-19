import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Plus,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

type TabType = 'orders' | 'addresses' | 'favorites' | 'settings';

export default function Dashboard() {
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [showAddressForm, setShowAddressForm] = useState(false);

  const { data: orders } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: addresses } = trpc.addresses.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: favorites } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

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
                {/* Orders */}
                {activeTab === 'orders' && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    <h2 className="text-2xl font-serif font-light">Order History</h2>

                    {orders && orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.map((order: any) => (
                          <motion.div
                            key={order.id}
                            variants={itemVariants}
                            className="border border-border/30 p-5 hover:border-accent/20 transition-colors"
                            style={{ borderRadius: '2px' }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <p className="font-serif font-light text-sm">Order #{order.id}</p>
                                  <span className="badge-handmade text-[9px] py-0.5">
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground/60 font-light">
                                  {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              </div>
                              <p className="text-lg font-serif font-light text-accent">
                                ${(order.totalAmount / 100).toFixed(2)}
                              </p>
                            </div>
                          </motion.div>
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

                {/* Addresses */}
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

                    {showAddressForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-border/30 p-6 space-y-4"
                        style={{ borderRadius: '2px' }}
                      >
                        <h3 className="font-serif font-light text-sm">New Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input type="text" placeholder="Street" className="input-elegant" />
                          <input type="text" placeholder="City" className="input-elegant" />
                          <input type="text" placeholder="State" className="input-elegant" />
                          <input type="text" placeholder="Postal Code" className="input-elegant" />
                        </div>
                        <div className="flex gap-3">
                          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary text-xs px-5 py-2">
                            Save
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowAddressForm(false)} className="btn-outline text-xs px-5 py-2">
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

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
                              {address.isDefault && (
                                <span className="badge-handmade text-[9px] py-0.5">Default</span>
                              )}
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-border/20">
                              <motion.button whileHover={{ scale: 1.02 }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-light hover:bg-cream transition-colors" style={{ borderRadius: '2px' }}>
                                <Edit2 size={12} /> Edit
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.02 }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-light text-destructive hover:bg-destructive/5 transition-colors" style={{ borderRadius: '2px' }}>
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

                {/* Favorites */}
                {activeTab === 'favorites' && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    <h2 className="text-2xl font-serif font-light">Favorites</h2>

                    {favorites && favorites.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((fav: any) => (
                          <motion.div
                            key={fav.id}
                            variants={itemVariants}
                            className="border border-border/30 overflow-hidden hover:border-accent/20 transition-colors"
                            style={{ borderRadius: '2px' }}
                          >
                            <div className="aspect-square bg-cream flex items-center justify-center">
                              <Heart size={32} className="text-accent/20" />
                            </div>
                            <div className="p-4 space-y-3">
                              <p className="font-serif font-light text-sm">Product {fav.productId}</p>
                              <Link href={`/product/${fav.productId}`}>
                                <motion.a whileHover={{ scale: 1.02 }} className="btn-primary w-full text-center block text-xs py-2 cursor-pointer">
                                  View Product
                                </motion.a>
                              </Link>
                            </div>
                          </motion.div>
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

                {/* Settings */}
                {activeTab === 'settings' && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    <h2 className="text-2xl font-serif font-light">Settings</h2>

                    <div className="border border-border/30 p-6 space-y-6" style={{ borderRadius: '2px' }}>
                      <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                          Profile
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-light">Name</label>
                            <input
                              type="text"
                              value={user?.name || ''}
                              readOnly
                              className="input-elegant mt-1 bg-cream/50"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-light">Email</label>
                            <input
                              type="email"
                              value={user?.email || ''}
                              readOnly
                              className="input-elegant mt-1 bg-cream/50"
                            />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="border-t border-border/20 pt-6 space-y-4">
                        <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                          Preferences
                        </h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border/30 accent-accent" />
                          <span className="text-sm font-light">Order updates via email</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border/30 accent-accent" />
                          <span className="text-sm font-light">Promotional emails</span>
                        </label>
                      </motion.div>
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
