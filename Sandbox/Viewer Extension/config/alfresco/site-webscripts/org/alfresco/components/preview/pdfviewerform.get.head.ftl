<#include "../component.head.inc">
<#-- This file is part of the Share Extras PdfJs Viewer project -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/preview/pdfviewer.css" />
<@script type="text/javascript" src="${page.url.context}/res/components/preview/pdfviewercompatibility.js"></@script>
<@script type="text/javascript" src="${page.url.context}/res/components/preview/pdf.js"></@script>
<script type="text/javascript">PDFJS.workerSrc = '${page.url.context}/res/components/preview/pdf<#if DEBUG==false>-min.js<#else>.js</#if>';</script> 
<@script type="text/javascript" src="${page.url.context}/res/components/preview/pdfviewer.js"></@script>
