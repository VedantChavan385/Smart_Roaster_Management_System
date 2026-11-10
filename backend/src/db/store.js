const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Pod, Employee, Brand, Leave, Holiday, Roster } = require('../models/schemas');

// File-based persistence fallback when MongoDB is not connected
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'db_store.json');

class DataStore {
  constructor() {
    this.isMongoConnected = false;
    this.memoryData = {
      pods: [],
      employees: [],
      brands: [],
      leaves: [],
      holidays: [],
      rosters: []
    };
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryData = JSON.parse(raw);
        console.log('[Store] Loaded state from local disk cache.');
      }
    } catch (err) {
      console.warn('[Store] Could not read local disk cache, initializing blank state.');
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Store] Failed to save state to disk cache:', err.message);
    }
  }

  async connectMongo(uri) {
    if (!uri) {
      console.log('[Store] No MONGODB_URI provided. Running in high-performance local store mode.');
      return;
    }
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      this.isMongoConnected = true;
      console.log('[Store] Successfully connected to MongoDB:', uri);
    } catch (err) {
      this.isMongoConnected = false;
      console.warn('[Store] MongoDB connection timed out or failed. Falling back to local store seamlessly.');
    }
  }

  // --- PODS ---
  async getPods() {
    if (this.isMongoConnected) {
      return await Pod.find({}).lean();
    }
    return this.memoryData.pods;
  }
  async savePods(pods) {
    this.memoryData.pods = pods;
    this.saveToFile();
    if (this.isMongoConnected) {
      await Pod.deleteMany({});
      await Pod.insertMany(pods);
    }
    return pods;
  }

  // --- EMPLOYEES ---
  async getEmployees() {
    if (this.isMongoConnected) {
      return await Employee.find({}).lean();
    }
    return this.memoryData.employees;
  }
  async getEmployeeById(id) {
    if (this.isMongoConnected) {
      return await Employee.findOne({ id }).lean();
    }
    return this.memoryData.employees.find(e => e.id === id);
  }
  async saveEmployees(employees) {
    this.memoryData.employees = employees;
    this.saveToFile();
    if (this.isMongoConnected) {
      await Employee.deleteMany({});
      await Employee.insertMany(employees);
    }
    return employees;
  }
  async addEmployee(employee) {
    this.memoryData.employees.push(employee);
    this.saveToFile();
    if (this.isMongoConnected) {
      await Employee.create(employee);
    }
    return employee;
  }
  async updateEmployee(id, updateData) {
    const idx = this.memoryData.employees.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.memoryData.employees[idx] = { ...this.memoryData.employees[idx], ...updateData };
      this.saveToFile();
    }
    if (this.isMongoConnected) {
      await Employee.findOneAndUpdate({ id }, updateData, { new: true });
    }
    return this.memoryData.employees[idx];
  }

  // --- BRANDS ---
  async getBrands() {
    if (this.isMongoConnected) {
      return await Brand.find({}).lean();
    }
    return this.memoryData.brands;
  }
  async saveBrands(brands) {
    this.memoryData.brands = brands;
    this.saveToFile();
    if (this.isMongoConnected) {
      await Brand.deleteMany({});
      await Brand.insertMany(brands);
    }
    return brands;
  }
  async addBrand(brand) {
    this.memoryData.brands.push(brand);
    this.saveToFile();
    if (this.isMongoConnected) {
      await Brand.create(brand);
    }
    return brand;
  }
  async updateBrand(id, updateData) {
    const idx = this.memoryData.brands.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.memoryData.brands[idx] = { ...this.memoryData.brands[idx], ...updateData };
      this.saveToFile();
    }
    if (this.isMongoConnected) {
      await Brand.findOneAndUpdate({ id }, updateData, { new: true });
    }
    return this.memoryData.brands[idx];
  }

  // --- LEAVES ---
  async getLeaves() {
    if (this.isMongoConnected) {
      return await Leave.find({}).lean();
    }
    return this.memoryData.leaves;
  }
  async addLeave(leave) {
    this.memoryData.leaves.push(leave);
    this.saveToFile();
    if (this.isMongoConnected) {
      await Leave.create(leave);
    }
    return leave;
  }
  async saveLeaves(leaves) {
    this.memoryData.leaves = leaves;
    this.saveToFile();
    if (this.isMongoConnected) {
      await Leave.deleteMany({});
      await Leave.insertMany(leaves);
    }
    return leaves;
  }

  // --- HOLIDAYS ---
  async getHolidays() {
    if (this.isMongoConnected) {
      return await Holiday.find({}).lean();
    }
    return this.memoryData.holidays;
  }
  async saveHolidays(holidays) {
    this.memoryData.holidays = holidays;
    this.saveToFile();
    if (this.isMongoConnected) {
      await Holiday.deleteMany({});
      await Holiday.insertMany(holidays);
    }
    return holidays;
  }

  // --- ROSTERS ---
  async getRosters() {
    if (this.isMongoConnected) {
      return await Roster.find({}).lean();
    }
    return this.memoryData.rosters;
  }
  async getRosterByMonth(month) {
    if (this.isMongoConnected) {
      return await Roster.findOne({ month }).lean();
    }
    return this.memoryData.rosters.find(r => r.month === month);
  }
  async saveRoster(roster) {
    const idx = this.memoryData.rosters.findIndex(r => r.month === roster.month);
    if (idx !== -1) {
      this.memoryData.rosters[idx] = roster;
    } else {
      this.memoryData.rosters.push(roster);
    }
    this.saveToFile();
    if (this.isMongoConnected) {
      await Roster.findOneAndUpdate({ month: roster.month }, roster, { upsert: true, new: true });
    }
    return roster;
  }
}

module.exports = new DataStore();

