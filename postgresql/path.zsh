export PATH="/Applications/Postgres.app/Contents/Versions/12/bin:$PATH"
# Installed libpq via homebrew
export LDFLAGS="-L/opt/homebrew/opt/libpq/lib $LDFLAGS"
export CPPFLAGS="-I/opt/homebrew/opt/libpq/include $CPPFLAGS"
