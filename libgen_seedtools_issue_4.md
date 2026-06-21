# Errno 111 connection refused

**State**: closed | **Created**: 2021-02-01T04:11:06Z | **Updated**: 2025-01-11T12:19:20Z






```
(env) user:~$ libgen-seedtools generate-config
generated /home/user/config.json
Edit this file, then run the fetch command
(env) user:~$ libgen-seedtools fetch          
Loading torrent data.
Found 5932 torrent files (130.47 TB) needing seeders
  Seeders   MEAN=2.1174983142279165 MEDIAN=2.0
  DHT Peers MEAN=6.12862440997977 MEDIAN=5.0
  Size      MEAN=21.99 GB MEDIAN=9.74 GB
Searching for criteria:
  max_disk_usage: 2TB
  min_seeders:    1
  max_seeders:    3
  types:          ['fiction', 'books', 'scimag']
Found 503 matches totaling 2 TB
Traceback (most recent call last):
  File "/home/user/env/lib/python3.8/site-packages/urllib3/connection.py", line 169, in _new_conn
    conn = connection.create_connection(
  File "/home/user/env/lib/python3.8/site-packages/urllib3/util/connection.py", line 96, in create_connection
    raise err
  File "/home/user/env/lib/python3.8/site-packages/urllib3/util/connection.py", line 86, in create_connection
    sock.connect(sa)
ConnectionRefusedError: [Errno 111] Connection refused

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/home/user/env/lib/python3.8/site-packages/urllib3/connectionpool.py", line 699, in urlopen
    httplib_response = self._make_request(
  File "/home/user/env/lib/python3.8/site-packages/urllib3/connectionpool.py", line 394, in _make_request
    conn.request(method, url, **httplib_request_kw)
  File "/home/user/env/lib/python3.8/site-packages/urllib3/connection.py", line 234, in request
    super(HTTPConnection, self).request(method, url, body=body, headers=headers)
  File "/usr/lib/python3.8/http/client.py", line 1255, in request
    self._send_request(method, url, body, headers, encode_chunked)
  File "/usr/lib/python3.8/http/client.py", line 1301, in _send_request
    self.endheaders(body, encode_chunked=encode_chunked)
  File "/usr/lib/python3.8/http/client.py", line 1250, in endheaders
    self._send_output(message_body, encode_chunked=encode_chunked)
  File "/usr/lib/python3.8/http/client.py", line 1010, in _send_output
    self.send(msg)
  File "/usr/lib/python3.8/http/client.py", line 950, in send
    self.connect()
  File "/home/user/env/lib/python3.8/site-packages/urllib3/connection.py", line 200, in connect
    conn = self._new_conn()
  File "/home/user/env/lib/python3.8/site-packages/urllib3/connection.py", line 181, in _new_conn
    raise NewConnectionError(
urllib3.exceptions.NewConnectionError: <urllib3.connection.HTTPConnection object at 0x7f23ad096d60>: Failed to establish a new connection: [Errno 111] Connection refused

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/home/user/env/lib/python3.8/site-packages/requests/adapters.py", line 439, in send
    resp = conn.urlopen(
  File "/home/user/env/lib/python3.8/site-packages/urllib3/connectionpool.py", line 755, in urlopen
    retries = retries.increment(
  File "/home/user/env/lib/python3.8/site-packages/urllib3/util/retry.py", line 573, in increment
    raise MaxRetryError(_pool, url, error or ResponseError(cause))
urllib3.exceptions.MaxRetryError: HTTPConnectionPool(host='localhost', port=9091): Max retries exceeded with url: /transmission/rpc (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x7f23ad096d60>: Failed to establish a new connection: [Errno 111] Connection refused'))

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/home/user/env/bin/libgen-seedtools", line 8, in <module>
    sys.exit(cli())
  File "/home/user/env/lib/python3.8/site-packages/click/core.py", line 829, in __call__
    return self.main(*args, **kwargs)
  File "/home/user/env/lib/python3.8/site-packages/click/core.py", line 782, in main
    rv = self.invoke(ctx)
  File "/home/user/env/lib/python3.8/site-packages/click/core.py", line 1259, in invoke
    return _process_result(sub_ctx.command.invoke(sub_ctx))
  File "/home/user/env/lib/python3.8/site-packages/click/core.py", line 1066, in invoke
    return ctx.invoke(self.callback, **ctx.params)
  File "/home/user/env/lib/python3.8/site-packages/click/core.py", line 610, in invoke
    return callback(*args, **kwargs)
  File "/home/user/env/lib/python3.8/site-packages/click/decorators.py", line 33, in new_func
    return f(get_current_context().obj, *args, **kwargs)
  File "/home/user/env/lib/python3.8/site-packages/libgen_seedtools/cli.py", line 61, in fetch
    fetchall(ctx, update_list, dry_run, auto_verify)
  File "/home/user/env/lib/python3.8/site-packages/libgen_seedtools/routines.py", line 150, in fetchall
    torrents.append(transmission_add_torrent(ctx, row, auto_verify))
  File "/home/user/env/lib/python3.8/site-packages/libgen_seedtools/transmission.py", line 23, in add_torrent
    c = _make_client(ctx)
  File "/home/user/env/lib/python3.8/site-packages/libgen_seedtools/transmission.py", line 12, in _make_client
    return client.Client(
  File "/home/user/env/lib/python3.8/site-packages/transmission_rpc/client.py", line 112, in __init__
    self.get_session()
  File "/home/user/env/lib/python3.8/site-packages/transmission_rpc/client.py", line 748, in get_session
    self._request("session-get", timeout=timeout)
  File "/home/user/env/lib/python3.8/site-packages/transmission_rpc/client.py", line 216, in _request
    http_data = self._http_query(query, timeout)
  File "/home/user/env/lib/python3.8/site-packages/transmission_rpc/client.py", line 173, in _http_query
    r = self._http_session.post(
  File "/home/user/env/lib/python3.8/site-packages/requests/sessions.py", line 590, in post
    return self.request('POST', url, data=data, json=json, **kwargs)
  File "/home/user/env/lib/python3.8/site-packages/requests/sessions.py", line 542, in request
    resp = self.send(prep, **send_kwargs)
  File "/home/user/env/lib/python3.8/site-packages/requests/sessions.py", line 655, in send
    r = adapter.send(request, **kwargs)
  File "/home/user/env/lib/python3.8/site-packages/requests/adapters.py", line 516, in send
    raise ConnectionError(e, request=request)
requests.exceptions.ConnectionError: HTTPConnectionPool(host='localhost', port=9091): Max retries exceeded with url: /transmission/rpc (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x7f23ad096d60>: Failed to establish a new connection: [Errno 111] Connection refused'))
(env) user:~$ 
```
Hi, I got this error after generating config file. It says to change the config file but I don't really know what I have to change. Sorry for being so illiterate :(