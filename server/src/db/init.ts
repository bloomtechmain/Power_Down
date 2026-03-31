import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function initDatabase() {
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL');

    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'powerdown'"
    );

    if (dbCheck.rowCount === 0) {
      await adminClient.query('CREATE DATABASE powerdown');
      console.log('✅ Database "powerdown" created');
    } else {
      console.log('ℹ️  Database "powerdown" already exists');
    }
  } catch (err) {
    console.error('❌ Error connecting to PostgreSQL:', err);
    process.exit(1);
  } finally {
    await adminClient.end();
  }

  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'powerdown',
  });

  try {
    await client.connect();

    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ uuid-ossp extension enabled');
    } catch {
      console.log('ℹ️  uuid-ossp not available, using fallback UUIDs');
    }

    // Drop tables if they exist to apply new schema
    await client.query('DROP TABLE IF EXISTS outage_reports CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✅ Dropped existing tables for schema update');

    // Create users table with password_hash
    await client.query(`
      CREATE TABLE users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Table "users" ready');

    // Create outage_reports table
    await client.query(`
      CREATE TABLE outage_reports (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        reason VARCHAR(50),
        phone_number VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired', 'pending_expiration')),        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 hours')
      );
    `);
    console.log('✅ Table "outage_reports" ready');

    // Create indexes for performance
    await client.query(`
      CREATE INDEX idx_outage_reports_status ON outage_reports(status);
      CREATE INDEX idx_outage_reports_created_at ON outage_reports(created_at);
      CREATE INDEX idx_outage_reports_location ON outage_reports(latitude, longitude);
      CREATE INDEX idx_outage_reports_expires_at ON outage_reports(expires_at);
      CREATE INDEX idx_users_email ON users(email);
    `);
    console.log('✅ Indexes created');

    console.log('\n🎉 Database initialization complete!\n');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
