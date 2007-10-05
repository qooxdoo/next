/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.core.LayoutQueue",
{
  statics :
  {

    _layoutQueue : {},

    /**
     * Mark a widget's layout as invalid and add its layout root to
     * the queue.
     *
     * @type static
     * @param widget {qx.ui2.core.Widget} Widget to add.
     * @return {void}
     */
    add : function(widget)
    {
      this._layoutQueue[widget.toHashCode()] = widget;
      qx.ui2.core.QueueManager.scheduleFlush();
    },


    /**
     * Update the layout of all widgets, which layout is marked as invalid.
     *
     * @type static
     * @return {void}
     */
    flush : function()
    {
      // get sorted widgets to (re-)layout
      var queue = this.__getSortedQueue();

      // iterate in reversed order to process widgets with the smalles nesting
      // level first because these may affect the inner lying children
      for (var i=queue.length-1; i>=0; i--)
      {
        var item = queue[i];

        // continue if a relayout of one of the root's parents has made the
        // layout valid
        if (item.hasValidLayout() || item.getRoot() == null) {
          continue;
        }

        // overflow areas or qx.ui2.item.*
        if (item.isLayoutRoot())
        {
          // This is a real item widget. Set its size to its preferred size.
          var rootHint = item.getSizeHint();
          item.renderLayout(0, 0, rootHint.width, rootHint.height);
        }
        else
        {
          // This is an inner item of layout changes. Do a relayout of its
          // children without changing its position and size.
          // TODO: rerenderLayout() method missing
          item.renderLayout(
            item._left,
            item._top,
            item._width,
            item._height
          );
        }
      }
    },








    /**
     * Group widget by their nesting level.
     *
     * @return {Map[]} A sparse array. Each entry of the array contains a widget
     *     map with all widgets of the same level as the array index.
     */
    __getLevelGroupedWidgets : function()
    {
       // sparse level array
      var levels = [];
      var widgets = this._layoutQueue;

      for (var widgetHash in widgets)
      {
        var widget = widgets[widgetHash];
        var level = widget.getNestingLevel();

        if (!levels[level]) {
          levels[level] = {};
        }

        levels[level][widgetHash] = widget;
      }

      return levels;
    },


    /**
     * Compute all layout roots of the given widgets. Layout roots are either
     * root widgets or widgets, which preferred size has not changed by the
     * layout changes of its children.
     *
     * This function returns the roots ordered by their nesting factors. The
     * layout with the largest nesting level comes first.
     *
     * @return {qx.ui2.core.Widget[]} Ordered list or layout roots.
     */
    __getSortedQueue : function()
    {
      var sortedQueue = [];
      var levels = this.__getLevelGroupedWidgets();

      for (var level=levels.length-1; level>=0; level--)
      {
        // Ignore empty levels (levels is an sparse array)
        if (!levels[level]) {
          continue;
        }

        for (var widgetHash in levels[level])
        {
          var widget = levels[level][widgetHash];

          // This is a real layout root. Add it directly to the list
          if (level == 0 || widget.isLayoutRoot())
          {
            sortedQueue.push(widget);
            widget.invalidateLayoutCache();
            continue;
          }

          var oldSizeHint = widget.getSizeHint();
          widget.invalidateLayoutCache();
          var newSizeHint = widget.getSizeHint();

          var hintChanged = (
            oldSizeHint.minWidth !== newSizeHint.minWidth ||
            oldSizeHint.width !== newSizeHint.width ||
            oldSizeHint.maxWidth !== newSizeHint.maxWidth ||
            oldSizeHint.minHeight !== newSizeHint.minHeight ||
            oldSizeHint.height !== newSizeHint.height ||
            oldSizeHint.maxHeight !== newSizeHint.maxHeight
          );

          if (hintChanged)
          {
            // invalidateLayoutCache parent. Since the level is > 0, the widget must
            // have a parent != null.
            var parent = widget.getParent();
            if (!levels[level-1]) {
              levels[level-1] = {};
            }

            levels[level-1][parent.toHashCode()] = parent;
          }
          else
          {
            // this is an internal layout root since its own preferred size
            // has not changed.
            sortedQueue.push(widget);
          }
        }
      }

      return sortedQueue;
    }
  }
});
