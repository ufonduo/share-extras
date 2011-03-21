/**
 * Copyright (C) 2005-2009 Alfresco Software Limited.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.

 * As a special exception to the terms and conditions of version 2.0 of 
 * the GPL, you may redistribute this Program in connection with Free/Libre 
 * and Open Source Software ("FLOSS") applications as described in Alfresco's 
 * FLOSS exception.  You should have recieved a copy of the text describing 
 * the FLOSS exception, and it is also available here: 
 * http://www.alfresco.com/legal/licensing
 */
 
/**
 * Dashboard blog component.
 * 
 * @namespace Alfresco
 * @class Alfresco.dashlet.Notice
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $combine = Alfresco.util.combinePaths;


   /**
    * Dashboard Notice constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.Notice} The new component instance
    * @constructor
    */
   Alfresco.dashlet.Notice = function Notice_constructor(htmlId)
   {
      return Alfresco.dashlet.Notice.superclass.constructor.call(this, "Alfresco.dashlet.Notice", htmlId);
   };

   /**
    * Extend from Alfresco.component.Base and add class implementation
    */
   YAHOO.extend(Alfresco.dashlet.Notice, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options:
      {
         /**
          * The component id.
          *
          * @property componentId
          * @type string
          */
         componentId: "",

         /**
          * Title of the notice to display
          * 
          * @property title
          * @type string
          * @default ""
          */
         title: "",

         /**
          * Notice text to be displayed
          * 
          * @property text
          * @type string
          * @default ""
          */
         text: ""
      },
      
      /* Frequently-used DOM Containers - prevents these having to be reloaded each time 
       * they are used */

      /**
       * Notice title DOM container.
       * 
       * @property titleContainer
       * @type object
       */
      titleContainer: null,

      /**
       * Notice text DOM container.
       * 
       * @property textContainer
       * @type object
       */
      textContainer: null,

      /**
       * Fired by YUI when parent element is available for scripting
       * 
       * @method onReady
       */
      onReady: function Notice_onReady()
      {
         Event.addListener(this.id + "-configure-link", "click", this.onConfigClick, this, true);
         
         // The user timeline container
         this.textContainer = Dom.get(this.id + "-text");
         
         // The dashlet title container
         this.titleContainer = Dom.get(this.id + "-title");
         
         // Write the title and text into the dashlet
         this.refresh();
      },

      /**
       * Reload the contents of the dashlet
       * 
       * @method refresh
       */
      refresh: function Notice_refresh()
      {
         this.titleContainer.innerHTML = this.options.title != "" ? this.options.title : this.msg("notice.defaultTitle");
         this.textContainer.innerHTML = this.options.text != "" ? this.options.text : "<p>" + this.msg("notice.defaultText") + "</p>";
      },

      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */

      /**
       * Configuration click handler
       *
       * @method onConfigClick
       * @param e {object} HTML event
       */
      onConfigClick: function Notice_onConfigClick(e)
      {
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + encodeURIComponent(this.options.componentId);
         
         Event.stopEvent(e);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlets/notice/config", 
               actionUrl: actionUrl,
               onSuccess:
               {
                  fn: function VideoWidget_onConfigFeed_callback(response)
                  {
                     // Refresh the feed
                     this.options.title = Dom.get(this.configDialog.id + "-title").value;
                     this.options.text = Dom.get(this.configDialog.id + "-text").value;
                     this.refresh();
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function VideoWidget_doSetupForm_callback(form)
                  {
                     Dom.get(this.configDialog.id + "-title").value = this.options.title;
                     Dom.get(this.configDialog.id + "-text").value = this.options.text;
                     if (!this.configDialog.editor)
                     {
                        this.configDialog.editor = new Alfresco.util.RichEditor("tinyMCE", this.configDialog.id + "-text",
                        {
                           height: 150,
                           width: 404,
                           inline_styles: false,
                           convert_fonts_to_spans: false,
                           theme: 'advanced',
                           theme_advanced_buttons1: "bold,italic,underline,|,bullist,numlist,|,undo,redo,|,link,unlink,anchor,image,code,removeformat,|,forecolor,backcolor",
                           theme_advanced_toolbar_location: "top",
                           theme_advanced_toolbar_align: "left",
                           theme_advanced_statusbar_location: "bottom",
                           theme_advanced_resizing: true,
                           theme_advanced_buttons2: null,
                           theme_advanced_buttons3: null,
                           theme_advanced_path: false,
                           language: 'en',
                           extended_valid_elements: "a[href|target|name],font[face|size|color|style],span[class|align|style],div[class|align|style]"
                        });
                     }
                     this.configDialog.editor.render();
                     this.configDialog.editor.subscribe("onKeyUp", this._onTextContentChange, this.configDialog, true);
                     this.configDialog.editor.subscribe("onChange", this._onTextContentChange, this.configDialog, true);
                  },
                  scope: this
               }
            });
         }
         else
         {
            this.configDialog.setOptions(
            {
               actionUrl: actionUrl
            });
         }
         this.configDialog.show();
      },
      
      /**
       * Handles the content being changed in the TinyMCE control.
       * 
       * @method _onTextContentChange
       * @param type
       * @param args
       * @param obj
       * @private
       */
      _onTextContentChange: function Notice__onTextContentChange(type, args, obj)
      {
         // save the current contents of the editor to the underlying textarea
         this.editor.save();
         
         // TODO Let the form know
      }
      
   });
})();
