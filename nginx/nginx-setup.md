# NGINX Setup

- Install Nginx: `brew install nginx` or `apt-get install nginx`
- Go to your Nginx folder (`cd /usr/local/etc/nginx` if installed from homebrew)
- Create a `servers/` directory if not already present: `mkdir -p servers`
- Edit the file nginx.conf to make sure that it contains the `include servers/*;` config inside the `http { … }` block.
- Copy or symlink the `nginx/development.conf` file from this repo to `servers/`
- Generate a self-signed certificate for this subdomain in your Nginx folder i.e. `/usr/local/etc/nginx`:

```

mkdir -p /usr/local/etc/nginx/keys && cd $_

cat > openssl.cnf <<-EOF
  [req]
  distinguished_name = req_distinguished_name
  x509_extensions = v3_req
  prompt = no
  [req_distinguished_name]
  CN = *.davidrapson.site
  [v3_req]
  keyUsage = keyEncipherment, dataEncipherment
  extendedKeyUsage = serverAuth
  subjectAltName = @alt_names
  [alt_names]
  DNS.1 = *.davidrapson.site
  DNS.2 = davidrapson.site
EOF

openssl req \
  -new \
  -newkey rsa:2048 \
  -sha1 \
  -days 3650 \
  -nodes \
  -x509 \
  -keyout davidrapson.key \
  -out davidrapson.crt \
  -config openssl.cnf

rm openssl.cnf
```

- Reload Nginx: `sudo nginx -s reload`.
- Either add the new host to `/etc/hosts` or [setup dsnmasq](http://passingcuriosity.com/2013/dnsmasq-dev-osx/) (recommended)
- Launch the app by going back to your terminal and running `gulp`
- You may want to trust the local certificate by [adding it to the OSX keychain](https://gist.github.com/jed/6147872)
- The application should be available from `https://davidrapson.site`
