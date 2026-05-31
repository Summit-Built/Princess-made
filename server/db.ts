import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and, desc, like, sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import path from "path";
import fs from "fs";

// Ensure data directory exists — use DATABASE_DIR env var for persistent volumes (e.g. Railway)
const dataDir = process.env.DATABASE_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(path.join(dataDir, "princess-made.db"));
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Safe column addition helper
function addColumnIfNotExists(table: string, column: string, type: string) {
  try {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  } catch {
    // Column already exists
  }
}

// Run migrations on startup - create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    passwordHash TEXT,
    stripeCustomerId TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch()),
    lastSignedIn INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stripeProductId TEXT UNIQUE,
    stripePriceId TEXT,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    imageUrl TEXT,
    category TEXT,
    stockCount INTEGER NOT NULL DEFAULT 0,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postalCode TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'AU',
    isDefault INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    guestEmail TEXT,
    guestName TEXT,
    stripeSessionId TEXT UNIQUE,
    stripePaymentIntentId TEXT,
    totalAmount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    trackingNumber TEXT,
    shippingStatus TEXT,
    shippingAddressId INTEGER,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS orderItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    productId TEXT NOT NULL,
    stripeProductId TEXT,
    quantity INTEGER NOT NULL,
    priceAtTime INTEGER NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId TEXT NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId TEXT NOT NULL,
    productName TEXT NOT NULL,
    userId INTEGER,
    authorName TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

// Add guest columns to existing orders table
addColumnIfNotExists("orders", "guestEmail", "TEXT");
addColumnIfNotExists("orders", "guestName", "TEXT");

// ============ DEPOP REVIEW SEED ============
// One-time import of Depop seller reviews as pre-approved testimonials.
// Skips silently if already seeded (guard: productId = 'depop-import').
(function seedDepopReviews() {
  const existing = sqlite.prepare(
    "SELECT COUNT(*) as count FROM reviews WHERE productId = 'depop-import'"
  ).get() as { count: number };
  if (existing.count > 0) return;

  const ins = sqlite.prepare(
    `INSERT INTO reviews (productId, productName, authorName, rating, comment, approved, createdAt)
     VALUES ('depop-import', ?, ?, 5, ?, 1, ?)`
  );

  // Dates based on relative timestamps from 2026-05-31
  const d = (y: number, m: number, day: number) =>
    Math.floor(new Date(y, m - 1, day).getTime() / 1000);

  const data: [string, string, string, number][] = [
    // [productName, authorName, comment, unix_timestamp]
    ['Handmade Pouch',  '@rahnadoplaysfair',          'Such a great product! Thank you so much :)',                                                                                                                                   d(2026, 5, 11)],
    ['Handmade Pouch',  '@alicemira',                  'so cute !! lovely seller, thank you so much 💓',                                                                                                                              d(2026, 3, 31)],
    ['Handmade Pouch',  '@peachesncreambaby',           'Made really well. So cute! I love using it thank you 🩷',                                                                                                                     d(2026, 3, 28)],
    ['Handmade Pouch',  '@ktyxvu0',                    'so cute and such good quality',                                                                                                                                                d(2026, 3, 26)],
    ['Handmade Pouch',  '@nikkiiee_tr',                'Very high quality product !! ty 🫶🏻',                                                                                                                                       d(2026, 3, 24)],
    ['Handmade Pouch',  '@milk_lover111',               'So flippin cute',                                                                                                                                                             d(2026, 3, 22)],
    ['Handmade Pouch',  '@anya188',                    'super cute!!',                                                                                                                                                                 d(2026, 2, 28)],
    ['Handmade Pouch',  '@charlielovesliamgallagher',   'Such a cute pouch!! So happy with it and the seller is so sweet and helpful! 🩵',                                                                                            d(2026, 2, 26)],
    ['Handmade Pouch',  '@p6rfection',                 'cutest bag ever !!',                                                                                                                                                           d(2026, 2, 24)],
    ['Handmade Pouch',  '@morticiaaddams48',            "I can't recommend this seller enough. Super talented and the work is so neat. I'll be buying more ❤️",                                                                       d(2026, 2, 22)],
    ['Handmade Pouch',  '@obvi_jaylah',                'very fast shipping and easy to talk to',                                                                                                                                       d(2026, 2, 21)],
    ['Handmade Pouch',  '@tijana07',                   'prompt shipping and soo cute!!',                                                                                                                                               d(2026, 2, 20)],
    ['Handmade Pouch',  '@gisele_a726',                'Such a good quality pouch, so cute and the fabric is very fluffy!!',                                                                                                           d(2026, 2, 19)],
    ['Handmade Pouch',  '@fishball194',                'Super fast shipping and exactly as expected ^^ the pouch design is so cute and would definitely buy from this seller again!',                                                  d(2026, 2, 18)],
    ['Handmade Pouch',  '@werty__',                    'Perfect! Super nice seller. Friendly, quick to respond, and easy to buy from.',                                                                                                d(2026, 2, 17)],
    ['Handmade Pouch',  '@anastasiarose123',            'Lovely bag making skills and I love the pattern amazing 10/10 would recommend 🦌🎀',                                                                                          d(2026, 2, 16)],
    ['Custom Order',    '@hafsaswardrobexo',            'The most loveliest and talented seller ever!! The communication was perfect and they listened to everything I wanted for my custom order AND DELIVERRREDD 🤏🤏🤏🤏 the pouch is better than I what I asked for and it\'s so cute, underrated seller BUY FROM THEMMM 💕', d(2026, 2, 15)],
    ['Custom Pouch',    '@iluvbirbs',                  'My custom made pouch is sooo beautiful and well made! So friendly and fast communication! ❤️',                                                                                 d(2026, 2, 14)],
    ['Handmade Pouch',  '@princeoflesh',               'extremely happy with the quality and excellent customer service. will buy from again. x',                                                                                      d(2026, 2, 13)],
    ['Handmade Pouch',  '@astinad',                    'super sweet seller!! the fabric is so soft and it looks amazing! thank you!! 🤍🤍',                                                                                           d(2026, 2, 12)],
    ['Handmade Pouch',  '@aver1e',                     'Absolute amazing seller!!! The sweetest person ever please go buy from her!!!! So excited to order more 🥹❤️‍🩹',                                                             d(2026, 1, 31)],
    ['Handmade Pouch',  '@ri0t4cirrus',                'Absolutely gorgeous can\'t wait to use 💜🙈',                                                                                                                                 d(2026, 1, 30)],
    ['Handmade Pouch',  '@wastedyouthnlove19',          'My pouches looks really good and so soft!!!',                                                                                                                                 d(2026, 1, 29)],
    ['Handmade Pouch',  '@arn1eee',                    'Fast shipping, Amazing craftsmanship. Lovely seller 🩷',                                                                                                                      d(2026, 1, 28)],
    ['Handmade Pouch',  '@fwanette',                   'Made so well and it\'s so soft and lovely <3',                                                                                                                                d(2026, 1, 27)],
    ['Handmade Pouch',  '@mollyylovve',                'thank you! :)',                                                                                                                                                                d(2026, 1, 26)],
    ['Laptop Case',     '@alextavs',                   'She is so quick to respond and shipped out the next morning!! The quality is amazing I loveeeeeeee my laptop case so much the deer print is so so so cute',                   d(2026, 1, 25)],
    ['Custom Order',    '@20bin03',                    'Great seller and so lovely in helping me create a custom order! I absolutely adore it ❤️❤️',                                                                                  d(2026, 1, 24)],
    ['Handmade Pouch',  '@shopkenziie',                'Beautifully made bags and arrived very quickly!! Thank you!',                                                                                                                  d(2026, 1, 23)],
    ['Handmade Pouch',  '@wormarms',                   'item exactly as pictured and fabric is SO SOFT! seller super friendly and helpful :)))',                                                                                       d(2026, 1, 22)],
  ];

  const insertAll = sqlite.transaction(() => {
    for (const [productName, authorName, comment, ts] of data) {
      ins.run(productName, authorName, comment, ts);
    }
  });

  insertAll();
  console.log(`[DB] Seeded ${data.length} Depop reviews`);
})();

// ============ USERS ============

export async function getUserById(id: number) {
  const result = db.select().from(schema.users).where(eq(schema.users.id, id)).get();
  return result ?? null;
}

export async function getUserByEmail(email: string) {
  const result = db.select().from(schema.users).where(eq(schema.users.email, email)).get();
  return result ?? null;
}

export async function createUser(data: { email: string; name: string | null; passwordHash: string; role?: "user" | "admin" }) {
  const result = db.insert(schema.users).values({
    email: data.email,
    name: data.name,
    passwordHash: data.passwordHash,
    role: data.role ?? "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  }).returning().get();
  return result;
}

export async function updateUserLastSignedIn(id: number) {
  db.update(schema.users)
    .set({ lastSignedIn: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, id))
    .run();
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  db.update(schema.users)
    .set({ role, updatedAt: new Date() })
    .where(eq(schema.users.id, id))
    .run();
}

export async function updateUser(id: number, data: Partial<{ name: string; email: string }>) {
  db.update(schema.users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.users.id, id))
    .run();
  return getUserById(id);
}

export async function getAddressById(id: number) {
  return db.select().from(schema.addresses).where(eq(schema.addresses.id, id)).get() ?? null;
}

// ============ ORDERS ============

export async function createOrder(data: {
  userId?: number | null;
  guestEmail?: string | null;
  guestName?: string | null;
  stripeSessionId: string;
  totalAmount: number;
  status?: string;
  shippingAddressId?: number | null;
}) {
  const result = db.insert(schema.orders).values({
    userId: data.userId ?? null,
    guestEmail: data.guestEmail ?? null,
    guestName: data.guestName ?? null,
    stripeSessionId: data.stripeSessionId,
    totalAmount: data.totalAmount,
    status: (data.status ?? "pending") as any,
    shippingAddressId: data.shippingAddressId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning().get();
  return result;
}

export async function getOrdersByGuestEmail(email: string) {
  return db.select().from(schema.orders)
    .where(eq(schema.orders.guestEmail, email))
    .orderBy(desc(schema.orders.createdAt))
    .all();
}

export async function getOrderByIdAndEmail(orderId: number, email: string) {
  const order = db.select().from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .get();
  if (!order) return null;
  if (order.guestEmail === email || order.userId) return order;
  return null;
}

export async function createOrderItem(data: {
  orderId: number;
  productId: string;
  stripeProductId: string;
  quantity: number;
  priceAtTime: number;
}) {
  db.insert(schema.orderItems).values({
    orderId: data.orderId,
    productId: data.productId,
    stripeProductId: data.stripeProductId,
    quantity: data.quantity,
    priceAtTime: data.priceAtTime,
    createdAt: new Date(),
  }).run();
}

export async function getUserOrders(userId: number) {
  return db.select().from(schema.orders)
    .where(eq(schema.orders.userId, userId))
    .orderBy(desc(schema.orders.createdAt))
    .all();
}

export async function cancelPendingOrder(orderId: number, userId: number) {
  return db.update(schema.orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId), eq(schema.orders.status, "pending")))
    .returning()
    .get() ?? null;
}

export async function getOrderById(orderId: number) {
  return db.select().from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .get() ?? null;
}

export async function getOrderItems(orderId: number) {
  return db.select().from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, orderId))
    .all();
}

export async function updateOrderStatus(stripeSessionId: string, status: string) {
  db.update(schema.orders)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(schema.orders.stripeSessionId, stripeSessionId))
    .run();
}

export async function updateOrderStatusById(orderId: number, status: string) {
  db.update(schema.orders)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(schema.orders.id, orderId))
    .run();
}

export async function updateOrderPaymentIntent(stripeSessionId: string, paymentIntentId: string) {
  db.update(schema.orders)
    .set({ stripePaymentIntentId: paymentIntentId, updatedAt: new Date() })
    .where(eq(schema.orders.stripeSessionId, stripeSessionId))
    .run();
}

export async function updateOrderStatusByPaymentIntent(paymentIntentId: string, status: string) {
  db.update(schema.orders)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(schema.orders.stripePaymentIntentId, paymentIntentId))
    .run();
}

export async function getOrderBySessionId(stripeSessionId: string) {
  return db.select().from(schema.orders)
    .where(eq(schema.orders.stripeSessionId, stripeSessionId))
    .get() ?? null;
}

// ============ ADDRESSES ============

export async function getUserAddresses(userId: number) {
  return db.select().from(schema.addresses)
    .where(eq(schema.addresses.userId, userId))
    .all();
}

export async function createAddress(data: {
  userId: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: number;
}) {
  return db.insert(schema.addresses).values({
    ...data,
    isDefault: data.isDefault ?? 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning().get();
}

export async function updateAddress(id: number, data: Partial<{
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: number;
}>) {
  db.update(schema.addresses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.addresses.id, id))
    .run();
}

export async function deleteAddress(id: number) {
  db.delete(schema.addresses).where(eq(schema.addresses.id, id)).run();
  return true;
}

// ============ FAVORITES ============

export async function getUserFavorites(userId: number) {
  return db.select().from(schema.favorites)
    .where(eq(schema.favorites.userId, userId))
    .all();
}

export async function isFavorited(userId: number, productId: string): Promise<boolean> {
  const result = db.select().from(schema.favorites)
    .where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, productId)))
    .get();
  return !!result;
}

export async function addFavorite(userId: number, productId: string) {
  if (await isFavorited(userId, productId)) {
    return undefined;
  }
  return db.insert(schema.favorites).values({
    userId,
    productId,
    createdAt: new Date(),
  }).returning().get();
}

export async function removeFavorite(userId: number, productId: string) {
  db.delete(schema.favorites)
    .where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, productId)))
    .run();
  return true;
}

// ============ NEWSLETTER ============

export async function addNewsletterSubscriber(email: string) {
  try {
    db.insert(schema.newsletterSubscribers).values({
      email,
      createdAt: new Date(),
    }).run();
    return { success: true };
  } catch {
    // Unique constraint violation = already subscribed
    return { success: true, alreadySubscribed: true };
  }
}

// ============ PASSWORD RESET ============

export async function createPasswordResetToken(userId: number, token: string) {
  // Expire in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  db.insert(schema.passwordResetTokens).values({
    userId,
    token,
    expiresAt,
    createdAt: new Date(),
  }).run();
}

export async function getPasswordResetToken(token: string) {
  return db.select().from(schema.passwordResetTokens)
    .where(eq(schema.passwordResetTokens.token, token))
    .get() ?? null;
}

export async function markResetTokenUsed(token: string) {
  db.update(schema.passwordResetTokens)
    .set({ used: 1 })
    .where(eq(schema.passwordResetTokens.token, token))
    .run();
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  db.update(schema.users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(schema.users.id, userId))
    .run();
}

// ============ ADMIN ============

export async function getAllOrders() {
  return db.select().from(schema.orders)
    .orderBy(desc(schema.orders.createdAt))
    .all();
}

export async function updateOrderTracking(orderId: number, trackingNumber: string, shippingStatus: string) {
  db.update(schema.orders)
    .set({
      trackingNumber,
      shippingStatus: shippingStatus as any,
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, orderId))
    .run();
  return db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get() ?? null;
}

export async function getAllUsers() {
  return db.select({
    id: schema.users.id,
    email: schema.users.email,
    name: schema.users.name,
    role: schema.users.role,
    createdAt: schema.users.createdAt,
    lastSignedIn: schema.users.lastSignedIn,
  }).from(schema.users)
    .orderBy(desc(schema.users.createdAt))
    .all();
}

// ============ CONTACT MESSAGES ============

export async function insertContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return db.insert(schema.contactMessages).values({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    createdAt: new Date(),
  }).returning().get();
}

export async function getOrderWithUser(orderId: number) {
  const order = db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
  if (!order) return null;
  let user = null;
  if (order.userId) {
    user = db.select({ email: schema.users.email, name: schema.users.name }).from(schema.users).where(eq(schema.users.id, order.userId)).get() ?? null;
  }
  let shippingAddress = null;
  if (order.shippingAddressId) {
    shippingAddress = db.select().from(schema.addresses).where(eq(schema.addresses.id, order.shippingAddressId)).get() ?? null;
  }
  return { ...order, user, shippingAddress };
}

// ============ ADMIN STATS ============

export async function getAdminStats() {
  const totalOrders = db.select({ count: sql<number>`count(*)` }).from(schema.orders).get();
  const totalRevenue = db.select({ total: sql<number>`coalesce(sum(${schema.orders.totalAmount}), 0)` }).from(schema.orders).where(eq(schema.orders.status, "completed")).get();
  const totalUsers = db.select({ count: sql<number>`count(*)` }).from(schema.users).get();
  const totalSubscribers = db.select({ count: sql<number>`count(*)` }).from(schema.newsletterSubscribers).get();

  const ordersByStatus = db.select({
    status: schema.orders.status,
    count: sql<number>`count(*)`,
  }).from(schema.orders).groupBy(schema.orders.status).all();

  const recentOrders = db.select().from(schema.orders)
    .orderBy(desc(schema.orders.createdAt))
    .limit(5)
    .all();

  const enrichedRecent = await Promise.all(
    recentOrders.map(async (order) => {
      let user = null;
      if (order.userId) {
        user = db.select({ email: schema.users.email, name: schema.users.name })
          .from(schema.users)
          .where(eq(schema.users.id, order.userId))
          .get() ?? null;
      }
      return { ...order, user };
    })
  );

  return {
    totalOrders: totalOrders?.count ?? 0,
    totalRevenue: totalRevenue?.total ?? 0,
    totalUsers: totalUsers?.count ?? 0,
    totalSubscribers: totalSubscribers?.count ?? 0,
    ordersByStatus: ordersByStatus.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {} as Record<string, number>),
    recentOrders: enrichedRecent,
  };
}

// ============ ADMIN USERS WITH STATS ============

export async function getAllUsersWithStats() {
  const users = db.select({
    id: schema.users.id,
    email: schema.users.email,
    name: schema.users.name,
    role: schema.users.role,
    createdAt: schema.users.createdAt,
    lastSignedIn: schema.users.lastSignedIn,
  }).from(schema.users)
    .orderBy(desc(schema.users.createdAt))
    .all();

  return users.map((user) => {
    const orderStats = db.select({
      count: sql<number>`count(*)`,
      total: sql<number>`coalesce(sum(${schema.orders.totalAmount}), 0)`,
    }).from(schema.orders)
      .where(eq(schema.orders.userId, user.id))
      .get();

    return {
      ...user,
      orderCount: orderStats?.count ?? 0,
      totalSpent: orderStats?.total ?? 0,
    };
  });
}

export async function getUserOrdersAdmin(userId: number) {
  return db.select().from(schema.orders)
    .where(eq(schema.orders.userId, userId))
    .orderBy(desc(schema.orders.createdAt))
    .all();
}

// ============ NEWSLETTER ADMIN ============

export async function getAllNewsletterSubscribers() {
  return db.select().from(schema.newsletterSubscribers)
    .orderBy(desc(schema.newsletterSubscribers.createdAt))
    .all();
}

// ============ REVIEWS ============

export async function createReview(data: {
  productId: string;
  productName: string;
  userId?: number | null;
  authorName: string;
  rating: number;
  comment: string;
}) {
  return db.insert(schema.reviews).values({
    ...data,
    userId: data.userId ?? null,
    approved: 0,
    createdAt: new Date(),
  }).returning().get();
}

export async function getProductReviews(productId: string) {
  return db.select().from(schema.reviews)
    .where(and(eq(schema.reviews.productId, productId), eq(schema.reviews.approved, 1)))
    .orderBy(desc(schema.reviews.createdAt))
    .all();
}

export async function getApprovedReviews(limit = 6) {
  return db.select().from(schema.reviews)
    .where(eq(schema.reviews.approved, 1))
    .orderBy(desc(schema.reviews.createdAt))
    .limit(limit)
    .all();
}

export async function getAllReviews() {
  return db.select().from(schema.reviews)
    .orderBy(desc(schema.reviews.createdAt))
    .all();
}

export async function approveReview(id: number) {
  return db.update(schema.reviews)
    .set({ approved: 1 })
    .where(eq(schema.reviews.id, id))
    .returning().get() ?? null;
}

export async function deleteReview(id: number) {
  db.delete(schema.reviews).where(eq(schema.reviews.id, id)).run();
  return true;
}
