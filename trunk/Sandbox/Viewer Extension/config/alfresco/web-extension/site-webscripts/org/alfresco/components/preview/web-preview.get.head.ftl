<#include "../component.head.inc">
<#-- This is a copy of Alfresco (www.alfresco.com) source file and subject to their license -->

<!-- Alfresco.WebPreview  -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/preview/web-preview.css" />
<@script type="text/javascript" src="${page.url.context}/res/components/preview/web-preview.js"></@script>

<!-- Alfresco.WebPreview.Plugins -->

<!-- Alfresco.WebPreviewer.Plugins.WebPreviewer -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/preview/WebPreviewerHTML.css" />
<@script type="text/javascript" src="${page.url.context}/res/components/preview/WebPreviewer.js"></@script>
<@script type="text/javascript" src="${page.url.context}/res/js/flash/extMouseWheel.js"></@script>

<!-- Alfresco.WebPreviewer.Plugins.FlashFox -->
<@script type="text/javascript" src="${page.url.context}/res/components/preview/FlashFox.js"></@script>

<!-- Alfresco.WebPreviewer.Plugins.StrobeMediaPlayback -->
<@script type="text/javascript" src="${page.url.context}/res/components/preview/StrobeMediaPlayback.js"></@script>

<!-- Alfresco.WebPreviewer.Plugins.Video -->
<@script type="text/javascript" src="${page.url.context}/res/components/preview/Video.js"></@script>

<!-- Alfresco.WebPreviewer.Plugins.Audio -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/preview/Audio.css" />
<@script type="text/javascript" src="${page.url.context}/res/components/preview/Audio.js"></@script>

<!-- Alfresco.WebPreviewer.Plugins.Flash -->
<@script type="text/javascript" src="${page.url.context}/res/components/preview/Flash.js"></@script>

<!-- Alfresco.WebPreviewer.Plugins.Image -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/preview/Image.css" />
<@script type="text/javascript" src="${page.url.context}/res/components/preview/Image.js"></@script>

<!-- Share Extras viewers -->
<#-- Extend base web-preview with common methods -->
<@script type="text/javascript" src="${page.url.context}/res/extras/components/preview/web-preview-extend.js"></@script>
<@script type="text/javascript" src="${page.url.context}/res/extras/components/preview/pdfviewerloader.js"></@script>
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/extras/components/preview/pdfviewerloader.css" />
<@script type="text/javascript" src="${page.url.context}/res/extras/components/preview/IframeView.js"></@script>
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/extras/components/preview/IframeView.css" />