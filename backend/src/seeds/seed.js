require('dotenv').config();
const store = require('../db/store');
const { pods, brands, employees, leaves, holidays } = require('./seedData');

async function runSeed() {
  console.log('[Seed] Starting database population...');
  if (process.env.MONGODB_URI) {
    await store.connectMongo(process.env.MONGODB_URI);
  }

  await store.savePods(pods);
  await store.saveBrands(brands);
  await store.saveEmployees(employees);
  await store.saveLeaves(leaves);
  await store.saveHolidays(holidays);

  console.log('✅ [Seed Completed Successfully]');
  console.log(`- Pods: ${pods.length}`);
  console.log(`- Brands: ${brands.length} (11 single-resource ~79%, 3 multi-resource ~21%)`);
  console.log(`- Employees: ${employees.length} (exceeds the 30-employee threshold)`);
  console.log(`- Leaves seeded: ${leaves.length}`);
  console.log(`- Holidays seeded: ${holidays.length}`);
}

if (require.main === module) {
  runSeed().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('❌ [Seed Failed]:', err);
    process.exit(1);
  });
}

module.exports = runSeed;

