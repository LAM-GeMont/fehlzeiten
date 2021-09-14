module.exports = {
  type: 'better-sqlite3',
  database: './db.db',
  synchronize: true,
  logging: true,
  entities: [
    'src/entity/**/*.ts'
  ],
  migrations: [
    'src/migration/**/*.ts'
  ],
  subscribers: [
    'src/subscriber/**/*.ts'
  ]
}
