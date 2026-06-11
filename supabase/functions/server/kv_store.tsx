// MongoDB Atlas connection for Shabach Properties
import { MongoClient, ObjectId } from "npm:mongodb@6.9.0";

// Initialize MongoDB client (connection reuse for serverless)
let cachedClient: MongoClient | null = null;

const getMongoClient = async (): Promise<MongoClient> => {
  if (cachedClient && cachedClient.topology?.isConnected()) {
    return cachedClient;
  }

  const mongoUri = Deno.env.get("MONGODB_URI");
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable not set");
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  cachedClient = client;
  return client;
};

const getDatabase = async () => {
  const client = await getMongoClient();
  return client.db("shabach_properties");
};

// Collection management
export const getPropertiesCollection = async () => {
  const db = await getDatabase();
  return db.collection("properties");
};

export const getLeadsCollection = async () => {
  const db = await getDatabase();
  return db.collection("leads");
};

// Properties operations
export const createProperty = async (property: any) => {
  const collection = await getPropertiesCollection();
  const result = await collection.insertOne({
    ...property,
    _id: new ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId;
};

export const getProperty = async (id: string) => {
  const collection = await getPropertiesCollection();
  return collection.findOne({ _id: new ObjectId(id) });
};

export const getAllProperties = async () => {
  const collection = await getPropertiesCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
};

export const updateProperty = async (id: string, updates: any) => {
  const collection = await getPropertiesCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );
  return result.modifiedCount > 0;
};

export const deleteProperty = async (id: string) => {
  const collection = await getPropertiesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
};

// Leads operations
export const createLead = async (lead: any) => {
  const collection = await getLeadsCollection();
  const result = await collection.insertOne({
    ...lead,
    _id: new ObjectId(),
    createdAt: new Date(),
  });
  return result.insertedId;
};

export const getAllLeads = async () => {
  const collection = await getLeadsCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
};

// Legacy KV-style operations for compatibility
export const set = async (key: string, value: any): Promise<void> => {
  const db = await getDatabase();
  const collection = db.collection("kv_store");
  await collection.updateOne(
    { key },
    { $set: { key, value, updatedAt: new Date() } },
    { upsert: true }
  );
};

export const get = async (key: string): Promise<any> => {
  const db = await getDatabase();
  const collection = db.collection("kv_store");
  const doc = await collection.findOne({ key });
  return doc?.value;
};

export const del = async (key: string): Promise<void> => {
  const db = await getDatabase();
  const collection = db.collection("kv_store");
  await collection.deleteOne({ key });
};

export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const db = await getDatabase();
  const collection = db.collection("kv_store");
  const docs = await collection
    .find({ key: { $regex: `^${prefix}` } })
    .toArray();
  return docs.map((d) => d.value);
};