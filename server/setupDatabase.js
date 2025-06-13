const { Client } = require('pg');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres',
};

const dbName = process.env.DB_NAME;

const setupDatabase = async () => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('Connected to PostgreSQL server...');

    // Check if the database already exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating it...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    await client.end();
    console.log('Connection to PostgreSQL server closed.');
  }
};

setupDatabase();