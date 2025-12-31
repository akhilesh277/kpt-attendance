
/**
 * MongoDB Service Layer for KPT Attendance Pro
 * 
 * This service provides a robust interface for interacting with MongoDB.
 * It implements connection pooling and singleton patterns for performance.
 * 
 * NOTE: Ensure the MONGO_URI environment variable is set in your deployment environment.
 * (e.g., mongodb+srv://<user>:<password>@cluster.mongodb.net/kpt_portal)
 */

import { MongoClient, Db, ObjectId } from 'mongodb';
import { User, Student, Faculty, AttendanceRecord, Role } from '../types';

// Connection Configuration
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kpt_portal";
const DB_NAME = "kpt_portal";

// Singleton connection instances
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Initializes or returns the existing MongoDB connection.
 * Implements reconnect logic and error handling.
 */
async function getDb(): Promise<Db> {
  if (db) return db;
  
  try {
    if (!client) {
      client = new MongoClient(MONGO_URI, {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      await client.connect();
      console.log("Successfully established MongoDB connection pool.");
    }
    db = client.db(DB_NAME);
    return db;
  } catch (error) {
    console.error("CRITICAL: MongoDB Connection Failure", error);
    throw new Error("Database connection unavailable. Please check configuration.");
  }
}

/**
 * Utility to convert MongoDB documents to clean JSON objects
 * Handles _id conversion to string 'id' for frontend compatibility
 */
function mapDoc<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest } as unknown as T;
}

/**
 * Generic Fetch Helper
 */
async function fetchCollection<T>(collectionName: string, query: object = {}): Promise<T[]> {
  const database = await getDb();
  const cursor = database.collection(collectionName).find(query);
  const results = await cursor.toArray();
  // Fix: Explicitly pass the generic type T to mapDoc to avoid 'unknown[]' type inference issues
  return results.map(doc => mapDoc<T>(doc));
}

/**
 * USER MANAGEMENT
 */

/**
 * Retrieves all registered users
 */
export async function getUsers(): Promise<User[]> {
  return fetchCollection<User>('users');
}

/**
 * Retrieves all HOD level users
 */
export async function getHODs(): Promise<User[]> {
  return fetchCollection<User>('users', { role: Role.HOD });
}

/**
 * STUDENT MANAGEMENT
 */

/**
 * Retrieves students based on an optional filter
 */
export async function getStudents(query: object = {}): Promise<Student[]> {
  return fetchCollection<Student>('students', query);
}

/**
 * Saves or updates a student record
 */
export async function saveStudent(student: Student): Promise<boolean> {
  const database = await getDb();
  const collection = database.collection('students');
  const { id, ...data } = student;
  
  try {
    if (id && ObjectId.isValid(id)) {
      await collection.updateOne(
        { _id: new ObjectId(id) }, 
        { $set: data }, 
        { upsert: true }
      );
    } else {
      await collection.insertOne(data);
    }
    return true;
  } catch (err) {
    console.error("Failed to save student record:", err);
    return false;
  }
}

/**
 * FACULTY MANAGEMENT
 */

/**
 * Retrieves all faculty members
 */
export async function getFaculty(): Promise<Faculty[]> {
  return fetchCollection<Faculty>('faculty');
}

/**
 * ATTENDANCE MANAGEMENT
 */

/**
 * Batch saves attendance records using bulk operations for efficiency
 */
export async function saveAttendance(records: AttendanceRecord[]): Promise<boolean> {
  if (!records || records.length === 0) return true;
  
  const database = await getDb();
  const collection = database.collection('attendance');
  
  try {
    const operations = records.map(record => {
      const { id, ...data } = record;
      return {
        insertOne: { document: data }
      };
    });
    
    const result = await collection.bulkWrite(operations);
    return result.insertedCount === records.length;
  } catch (err) {
    console.error("Bulk attendance save failed:", err);
    return false;
  }
}

/**
 * GENERIC CRUD HELPERS
 */

/**
 * Inserts a single document into the specified collection
 */
export async function insertOne(collectionName: string, doc: any) {
  const database = await getDb();
  return database.collection(collectionName).insertOne(doc);
}

/**
 * Finds a single document by query
 */
export async function findOne(collectionName: string, query: any) {
  const database = await getDb();
  const result = await database.collection(collectionName).findOne(query);
  return result ? mapDoc(result) : null;
}

/**
 * Closes the database connection
 */
export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
