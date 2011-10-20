<html>
<head>
<title>Site Info for ${site.title}</title>
<link rel="stylesheet" href="${url.context}/css/base.css" type="text/css" />
</head>
<body>
<h1>Site Info for ${site.title}</h1>
<h2>Document Library</h2>
<dl>
<dt>Content Items</dt>
<dd>${siteInfo.doclib.contentItems?string.number}</dd>
<dt>Space Items</dt>
<dd>${siteInfo.doclib.spaceItems?string.number}</dd>
<dt>Content Size</dt>
<dd>${siteInfo.doclib.contentSize?string.number} bytes</dd>
</dl>
<h2>Wiki</h2>
<#if siteInfo.wiki?exists>
<dt>Content Items</dt>
<dd>${siteInfo.wiki.contentItems?string.number}</dd>
<dt>Content Size</dt>
<dd>${siteInfo.wiki.contentSize?string.number} bytes</dd>
</dl>
<#else>
<p>No wiki component was found</p>
</#if>
</body>
</html>