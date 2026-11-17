package lib

type Item struct{ Name string }

type Store struct{ items map[string]*Item }

func Open() *Store { return &Store{items: map[string]*Item{}} }

func (s *Store) Put(it *Item) { s.items[it.Name] = it }

type Entry struct {
	Item *Item
}
