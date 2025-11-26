#!/usr/bin/env node
/**
 * Simple migration runner for local/dev use.
 *
 * Usage:
 * 1. Install deps: npm install pg
 * 2. Ensure env var DATABASE_URL is set (Postgres connection string)
 * 3. Run: node scripts/apply_migrations.js
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function run() {
  try {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      console.error('Missing DATABASE_URL environment variable')
      process.exit(1)
    }

    const sqlPath = path.resolve(__dirname, '001_create_tables.sql')
    if (!fs.existsSync(sqlPath)) {
      console.error('Migration file not found:', sqlPath)
      process.exit(1)
    }

    const sql = fs.readFileSync(sqlPath, 'utf8')

    const client = new Client({ connectionString: databaseUrl })
    await client.connect()

    console.log('Applying migrations from', sqlPath)
    // Run the whole SQL file. The script uses IF NOT EXISTS so it's idempotent.
    await client.query(sql)

    console.log('Migrations applied successfully')
    await client.end()
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

run()
