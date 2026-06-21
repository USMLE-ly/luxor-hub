# `search` is not working: 504 Server Error: Gateway Time-out

**State**: closed | **Created**: 2019-07-24T15:00:35Z | **Updated**: 2019-08-16T05:41:10Z

504 Server Error: Gateway Time-out

```
Python 3.7.3 (default, Mar 27 2019, 22:11:17) 
[GCC 7.3.0] :: Anaconda, Inc. on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> from pylibgen import Library
>>> import requests
>>> l = Library()
>>> ids = l.search('stallman essays')
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/home/tomas/anaconda3/lib/python3.7/site-packages/pylibgen/pylibgen.py", line 104, in search
    per_page=per_page,
  File "/home/tomas/anaconda3/lib/python3.7/site-packages/pylibgen/pylibgen.py", line 160, in __req
    r.raise_for_status()
  File "/home/tomas/anaconda3/lib/python3.7/site-packages/requests/models.py", line 940, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 504 Server Error: Gateway Time-out for url: http://libgen.io/search.php?req=stallman+essays&page=1&res=25&column=title&lg_topic=libgen&view=simple&open=0&phrase=0
```