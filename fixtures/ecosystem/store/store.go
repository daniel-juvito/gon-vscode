package store

type DB struct{}

// Conn.DB is annotated "!*DB" in ../annotations/gonfix/store.gna.
type Conn struct {
	DB *DB
}
