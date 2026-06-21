And [here](https://github.com/grv87/LibgenDesktop/commit/c97c016b3e86031f4075a1ca623eb15bfe47b138) are working configurations for `library.lol`, including IPFS.

(non-fiction only)

UPD: Some URLs from `library.lol` still don't work.

I hit it on filename containing both non-Latin characters and parentheses. `Uri.IsWellFormedUriString` returns false.
Probably dotnet/runtime#21626.