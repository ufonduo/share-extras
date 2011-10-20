/**
 * Sample Hello World dashboard component.
 * 
 * @namespace Alfresco
 * @class Alfresco.dashlet.HelloWorld
 * @author 
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
    * Dashboard HelloWorld constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.HelloWorld} The new component instance
    * @constructor
    */
   Alfresco.dashlet.HelloWorld = function HelloWorld_constructor(htmlId)
   {
      return Alfresco.dashlet.HelloWorld.superclass.constructor.call(this, "Alfresco.dashlet.HelloWorld", htmlId);
   };

   /**
    * Extend from Alfresco.component.Base and add class implementation
    */
   YAHOO.extend(Alfresco.dashlet.HelloWorld, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options:
      {
      },

      /**
       * Fired by YUI when parent element is available for scripting
       * 
       * @method onReady
       */
      onReady: function HelloWorld_onReady()
      {
         // Code goes here
      }
      
   });
})();
