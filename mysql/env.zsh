export LDFLAGS="-L/usr/local/opt/mysql@5.7/lib $LDFLAGS"
export CPPFLAGS="-I/usr/local/opt/mysql@5.7/include $CPPFLAGS"
export PKG_CONFIG_PATH="$PKG_CONFIG_PATH:/usr/local/opt/mysql@5.7/lib/pkgconfig"
