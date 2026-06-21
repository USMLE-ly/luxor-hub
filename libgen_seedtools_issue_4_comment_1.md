```
TTPConnectionPool(host='localhost', port=9091): Max retries exceeded with url: /transmission/rpc (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x7f23ad096d60>: Failed to establish a new connection: [Errno 111] Connection refused'))
```

It's trying to contact transmission torrent server.  You apparently don't have one, or haven't provided the correct credentials.

disable the torrent part by changing the config value to false.  All this tool will do is download `.torrent` files at that point, according to your specification (400GB worth, or "scimag only", for example).

FWIW, this is super early stage development.  