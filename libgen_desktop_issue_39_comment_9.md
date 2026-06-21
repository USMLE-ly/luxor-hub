`libgen.lc` doesn't work because it returns relative URL now but Libgen Desktop expects absolute one.

The quick fix (can be made by user) is to change 5th line in file `%ProgramFiles%\Libgen Desktop\Mirrors\libgen_lc_nonfiction.xslt` to:
```
      <xsl:text>http://libgen.lc</xsl:text><xsl:value-of select="@href" />
```
I didn't try another mirrors but I suspect they have the same problem.

Correct fix, IMO, should be done in Libgen Desktop. But I'm not sure which one - the code handles URLs as plain strings which is somewhat incorrect and can't be easily fixed.