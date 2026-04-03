const mariadb = require('mariadb');
const fs = require('fs');

const pool = mariadb.createPool({
  host: 'localhost', 
  user: 'root', 
  database: 'ev_fleet',
  connectionLimit: 5
});

async function main() {
  let conn;
  try {
    conn = await pool.getConnection();
    const admins = await conn.query("SELECT * FROM Admin");
    const customers = await conn.query("SELECT * FROM Customer");
    const riders = await conn.query("SELECT * FROM Rider");
    const vehicles = await conn.query("SELECT * FROM Vehicle");
    const orders = await conn.query("SELECT * FROM `Order`");
    const trips = await conn.query("SELECT * FROM Trip");

    console.log(`Admins: ${admins.length}, Customers: ${customers.length}, Riders: ${riders.length}`);
    console.log(`Vehicles: ${vehicles.length}, Orders: ${orders.length}, Trips: ${trips.length}`);

    fs.writeFileSync('raw_db_backup.json', JSON.stringify({
      admins, customers, riders, vehicles, orders, trips
    }, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
    
  } catch (err) {
    console.error("Error", err);
  } finally {
    if (conn) conn.release();
    pool.end();
  }
}
main();
