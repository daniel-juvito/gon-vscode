#!/usr/bin/env bash
# Runs `gon check --json` (the extension's own call) on every fixture listed in
# expected-fixtures.txt and compares the exit code and the per-code counts, and
# that stdout is a Protocol v1 envelope. Usage: scripts/check-fixtures.sh [gon]
set -u
gon=${1:-gon}
root=$(cd "$(dirname "$0")/.." && pwd)
fail=0
n=0
while IFS='|' read -r dir file want_exit want_codes; do
  case "$dir" in ''|\#*) continue ;; esac
  dir=$(echo "$dir" | xargs); file=$(echo "$file" | xargs)
  want_exit=$(echo "$want_exit" | xargs); want_codes=$(echo "$want_codes" | xargs)

  out=$(cd "$root/$dir" && $gon check --json "$file" 2>/dev/null)
  got_exit=$?
  got_codes=$(printf '%s\n' "$out" | grep -o '"code":"G[NW][0-9]*"' | sed 's/"code":"//; s/"//' \
    | sort | uniq -c | awk '{printf "%s%s=%s", (NR>1?" ":""), $2, $1}')
  envelope=ok
  printf '%s' "$out" | grep -q '^{"schemaVersion":1,"diagnostics":\[' || envelope=BAD
  n=$((n+1))
  if [ "$got_exit" != "$want_exit" ] || [ "$got_codes" != "$want_codes" ] || [ "$envelope" != ok ]; then
    echo "FAIL $dir/$file"
    echo "  want: exit $want_exit  [$want_codes]"
    echo "  got:  exit $got_exit  [$got_codes]  envelope=$envelope"
    fail=1
  else
    echo "ok   $dir/$file: exit $got_exit [$got_codes]"
  fi
done < "$root/expected-fixtures.txt"

echo "$n fixtures checked"
exit $fail
