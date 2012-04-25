<#include "/org/alfresco/components/component.head.inc">
<#-- This file is part of the Share Extras PdfJs Viewer project -->
<#-- Do not import pdfviewer.css with link directive, this ads media screen directive and breaks print css override -->
<style type="text/css">
   @import "${page.url.context}/res/extras/components/preview/pdfjs/pdfviewer.css";
</style>
<@script type="text/javascript" src="${page.url.context}/res/extras/components/preview/pdfjs/pdfviewercompatibility.js"></@script>
<@script type="text/javascript" src="${page.url.context}/extras/components/preview/pdfjs/pdf.js"></@script>
<script type="text/javascript">PDFJS.workerSrc = '${page.url.context}/res/extras/components/preview/pdfjs/pdf<#if DEBUG==false>-min.js<#else>.js</#if>';</script> 
<@script type="text/javascript" src="${page.url.context}/res/extras/components/preview/pdfjs/pdfviewer.js"></@script>
