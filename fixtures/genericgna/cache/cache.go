// Package cache is the "imported" generic library of the generic .gna fixture.
package cache

// Logger is a stand-in pointer-field type.
type Logger struct{}

// Cache is a generic struct; the .gna `types:` entry gives its fields a
// contract that must survive every instantiation.
type Cache[K comparable, V any] struct {
	Items map[K]V
	Log   *Logger
}

// Must is generic over the element; params / results are annotated "!*V".
func Must[V any](p *V) *V { return p }

// Keys is generic over a map-shaped type parameter M; "!M" is valid because
// M ~map[K]V is restricted to a nilable kind.
func Keys[M ~map[K]V, K comparable, V any](m M) []K {
	keys := make([]K, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

// Describe takes a plain string. Its .gna entry claims "!string" ON PURPOSE:
// a `!` on a non-nilable kind is meaningless, so Gon reports GN003 and drops
// just that flag.
func Describe(s string) string { return s }
