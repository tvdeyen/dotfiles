export LDFLAGS="-L/opt/homebrew/opt/openssl@3.5/lib"
export CPPFLAGS="-I/opt/homebrew/opt/openssl@3.5/include"
export PKG_CONFIG_PATH="/opt/homebrew/opt/openssl@3.5/lib/pkgconfig"
echo "⚠️ ACHTUNG ☢️\nUsing outdated OpenSSL 3.5.4!!\nTry to update to OpenSSL 3.6.1 after this Ruby bug (*) has been fixed and delete $(basename $0)\n\n(*) https://github.com/ruby/openssl/issues/949"
