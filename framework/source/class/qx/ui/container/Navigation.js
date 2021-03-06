"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * The navigation container includes a {@link qx.ui.Widget} container
 * with a {@link qx.ui.layout.Card} layout.
 * All widgets that implement the {@link qx.ui.container.INavigation}
 * interface can be added to the container. The added widget provides the
 * navigation bar.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var container = new qx.ui.container.Navigation();
 *   this.getRoot().append(container);
 *   var page = new qx.ui.page.NavigationPage();
 *   container.append(page);
 *   page.show();
 * </pre>
 */
qx.Class.define("qx.ui.container.Navigation",
{
  extend : qx.ui.Widget,

  /**
   * @param element {Element?null} The new navigation widget.
   * @param element {Element?} The element used to create the widget.
   */
  construct : function(element)
  {
    this.super("construct", element);
    this.layout = new qx.ui.layout.VBox();

    this.__navBarListeners = {};
    this.__content = this._createContent();
    this.__content.layoutPrefs = {flex: 1};
    this.super("append", this.__content);
  },


  properties : {
    // overridden
    defaultCssClass : {
      init : "navigation"
    }
  },


  events :
  {
    /** Fired when the navigation bar gets updated */
    "update" : "qx.ui.Widget"
  },


  members :
  {
    __content : null,
    __navBarListeners: null,


    // overridden
    append : function(html) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInterface(html, qx.ui.container.INavigation);
      }

      this.getContent().append(html);
      return this;
    },


    /**
     * Returns the content container. Add all your widgets to this container.
     *
     * @return {qx.ui.Widget} The content container
     */
    getContent : function() {
      return this.__content;
    },


    /**
     * Creates the content container.
     *
     * @return {qx.ui.Widget} The created content container
     */
    _createContent : function()
    {
      var layout = new qx.ui.layout.Card();
      layout.on("animationStart", this._onAnimationStart, this);
      layout.on("animationEnd", this._onAnimationEnd, this);

      var content = new qx.ui.Widget();
      content.on("addedChild", this._onContentAddedChild, this);
      content.on("removedChild", this._onContentRemovedChild, this);
      content.layout = layout;
      return content;
    },


    /**
    * Handler for the "animationStart" event on the layout.
    */
    _onAnimationStart : function() {
      this.addClass("blocked");
    },


    /**
    * Handler for the "animationEnd" event on the layout.
    */
    _onAnimationEnd : function() {
      this.removeClass("blocked");
    },


    /**
     * Triggers an update if a child becomes visible
     *
     * @param e {Map} changeVisibility event data
     */
    _onChangeChildVisibility : function(e) {
      if (e.value == "visible") {
        this._update(e.target);
      }
    },


    /**
     * Triggers an initial update if a child is added and listens for
     * visibility changes on the child
     *
     * @param child {qx.ui.Widget} added child
     */
    _onContentAddedChild : function(child) {
      this._update(child);
      child.on("changeVisibility", this._onChangeChildVisibility, this);

      var navBarListener = this._update.bind(this, child);
      this.__navBarListeners[child.getAttribute("id")] = navBarListener;
      child.on("changeNavigationBarHidden", navBarListener, this);
    },


    /**
     * Removes the visibility change listener from a removed child widget
     * and updates the view
     *
     * @param child {qx.ui.Widget} added child
     */
    _onContentRemovedChild : function(child) {
      child.off("changeVisibility", this._onChangeChildVisibility, this);
      child.off("changeNavigationBarHidden", this.__navBarListeners[child.getAttribute("id")], this);
      delete this.__navBarListeners[child.getAttribute("id")];
      this._update(child);
    },


    /**
     * Updates the navigation bar depending on the set widget.
     *
     * @param widget {qx.ui.Widget} The widget that should be merged into the navigation bar.
     */
    _update : function(widget) {
      this.setStyle("transitionDuration", widget.navigationBarToggleDuration+"s");
      this.find(".navigationbar").forEach(function(bar) {
        bar.exclude();
      });

      var newNavBar = widget.getNavigationBar();
      if (this.find(".navigationbar").indexOf(newNavBar) == -1) {
        newNavBar.insertBefore(this.getContent());
      }

      if (widget.navigationBarHidden) {
        this.addClass("hidden");
      } else {
        newNavBar.show();
        this.removeClass("hidden");
      }

      if (widget.basename) {
        this.setData("target-page", widget.basename.toLowerCase());
      }

      this.emit("update", widget);
    },

    dispose : function()
    {
      this.super("dispose");
      this.getContent().off("addedChild", this._onContentAddedChild, this)
        .off("removedChild", this._onContentRemovedChild, this);
      this.getContent().layout.off("animationStart", this._onAnimationStart, this);
      this.getContent().layout.off("animationEnd", this._onAnimationEnd, this);
      this.__content.dispose();
    }
  },


  classDefined : function(statics) {
    qxWeb.$attachWidget(statics);
  }
});
