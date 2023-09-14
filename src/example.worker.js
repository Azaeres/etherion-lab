import sqlite3InitModule from '@sqlite.org/sqlite-wasm'

self.onmessage = (event) => console.log('Worker received:', event.data)
self.postMessage('from Worker')

const log = (...args) => console.log('', ...args)
const error = (...args) => console.log('error', ...args)

log('Loading and initializing sqlite3 module...')
sqlite3InitModule({
  print: log,
  printErr: error,
}).then(function (sqlite3) {
  log('Done initializing. Running demo...')
  try {
    start(sqlite3)
  } catch (e) {
    error('Exception:', e.message)
  }
})

function start(sqlite3) {
  const capi = sqlite3.capi // C-style API
  const oo = sqlite3.oo1 // High-level OO API
  log('SQLite3 version', capi.sqlite3_libversion(), capi.sqlite3_sourceid())
  let db
  if ('OpfsDb' in oo) {
    db = new oo.OpfsDb('/mydb.sqlite3')
    log('The OPFS is available.')
    log('Persisted db =', db.filename)
  } else {
    db = new oo.DB('/mydb.sqlite3', 'ct')
    log('The OPFS is not available.')
    log('transient db =', db.filename)
  }

  try {
    log('Create a table...')
    db.exec('CREATE TABLE IF NOT EXISTS t(a,b)')
    log('Insert some data using exec()...')
    let i
    for (i = 20; i <= 25; ++i) {
      db.exec({
        sql: 'INSERT INTO t(a,b) VALUES (?,?)',
        bind: [i, i * 2],
      })
    }
    log("Query data with exec() using rowMode 'array'...")
    db.exec({
      sql: 'SELECT a FROM t ORDER BY a LIMIT 3',
      rowMode: 'array', // 'array' (default), 'object', or 'stmt'
      callback: function (row) {
        log('row ', ++this.counter, '=', row)
      }.bind({ counter: 0 }),
    })
  } finally {
    db.close()
  }
}
