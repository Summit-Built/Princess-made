import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import path from "path";
import fs from "fs";

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(path.join(dataDir, "princess-made.db"));
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

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
    country TEXT NOT NULL DEFAULT 'US',
    isDefault INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
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
`);

// ============ USERS ============

export async function getUserById(id: number) {
  const result = db.select().from(schema.users).where(eq(schema.users.id, id)).get();
  return result ?? null;
}

export async function getUserByEmail(email: string) {
  const result = db.select().from(schema.users).where(eq(schema.users.email, email)).get();
  return result ?? null;
}

export async function createUser(data: { email: string; name: string | null; passwordHash: string }) {
  const result = db.insert(schema.users).values({
    email: data.email,
    name: data.name,
    passwordHash: data.passwordHash,
    role: "user",
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

// ============ ORDERS ============

export async function createOrder(data: {
  userId: number;
  stripeSessionId: string;
  totalAmount: number;
  status?: string;
  shippingAddressId?: number | null;
}) {
  const result = db.insert(schema.orders).values({
    userId: data.userId,
    stripeSessionId: data.stripeSessionId,
    totalAmount: data.totalAmount,
    status: (data.status ?? "pending") as any,
    shippingAddressId: data.shippingAddressId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning().get();
  return result;
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
