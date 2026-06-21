> <xsl:text>http://libgen.lc</xsl:text><xsl:value-of select="@href" />

<xsl:text>http://libgen.lc/</xsl:text><xsl:value-of select="@href" /> 

add the forward slash otherwise it does not generate the links correctly.