"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * DOM manipulation module
 *
 * @ignore(qx.bom.element, qx.bom.element.AnimationJs)
 * @group (Core)
 */
qx.Class.define("qx.module.Manipulating", {
  statics :
  {
    /**
     * Creates a new collection from the given argument. This can either be an
     * HTML string, a single DOM element or an array of elements
     *
     * When no <code>context</code> is given the global document is used to
     * create new DOM elements.
     *
     * <strong>Note:</strong> When a complex HTML string is provided the <code>innerHTML</code>
     * mechanism of the browser is used. Some browsers do filter out elements like <code>&lt;html&gt;</code>,
     * <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code>. The better approach is to create
     * a single element and the appending the child nodes like in the example below.
     *
     * @attachStatic{qxWeb}
     * @param html {String|Element[]} HTML string or DOM element(s)
     * @param context {Document?document} Context in which the elements should be created
     * @return {qxWeb} Collection of elements
     */
    create : function(html, context) {
      return qxWeb.$init(qx.bom.Html.clean([html], context), qxWeb, true);
    },


    /**
     * Clones the items in the current collection and returns them in a new set.
     * Event listeners can also be cloned.
     *
     * @attach{qxWeb}
     * @param events {Boolean} clone event listeners. Default: <pre>false</pre>
     * @return {qxWeb} New collection with clones
     */
    clone : function(events) {
      var clones = [];
      for (var i=0; i < this.length; i++) {
        if (this[i] && this[i].nodeType === 1) {
          clones[i] = this[i].cloneNode(true);
        }
      }

      if (events === true && this.copyEventsTo) {
        this.copyEventsTo(clones);
      }

      return qxWeb(clones);
    },



    /**
     * Appends content to each element in the current set. Accepts an HTML string,
     * a single DOM element or an array of elements
     *
     * @attach{qxWeb}
     * @param html {String|Element[]|qxWeb} HTML string or DOM element(s) to append
     * @return {qxWeb} The collection for chaining
     */
    append : function(html) {
      var arr = qx.bom.Html.clean([html]);
      var children = qxWeb.$init(arr, qxWeb);

      this._forEachElement(function(item, index) {
        for (var j=0, m=children.length; j < m; j++) {
          if (index == 0) {
            // first parent: move the target node(s)
            qx.dom.Element.insertEnd(children[j], item);
          }
          else {
            qx.dom.Element.insertEnd(children.eq(j).clone(true)[0], item);
          }
        }
      }, this);

      return this;
    },


    /**
     * Add a child widget at the specified index
     *
     * @param html {String|Element[]|qxWeb} HTML string or DOM element(s) to append
     * @param index {Integer} Index, at which the widget will be inserted
     * @return {qxWeb} The collection for chaining
     */
    appendAt : function(html, index) {
      var ref = this.getChildren()[index];

      if (ref) {
        var arr = qx.bom.Html.clean([html]);
        var children = qxWeb.$init(arr, qxWeb);

        children.insertBefore(ref);
      } else {
        this.append(html);
      }

      return this;
    },


    /**
     * Appends all items in the collection to the specified parents. If multiple
     * parents are given, the items will be moved to the first parent, while
     * clones of the items will be appended to subsequent parents.
     *
     * @attach{qxWeb}
     * @param parent {String|Element[]|qxWeb} Parent selector expression or list of
     * parent elements
     * @return {qxWeb} The collection for chaining
     */
    appendTo : function(parent) {
      parent = qx.module.Manipulating.__getElementArray(parent);

      if (this.length == 1) {
        for (var i=0, l=parent.length; i < l; i++) {
          if (i == 0) {
            // first parent: move the target node(s)
            qx.dom.Element.insertEnd(this[0], parent[i]);
          }
          else {
            // further parents: clone the target node(s)
            qx.dom.Element.insertEnd(this.clone(true)[0], parent[i]);
          }
        }
      } else {
        this._forEachElement(function(item) {
          qxWeb(item).appendTo(parent);
        }, this);
      }


      return this;
    },


    /**
     * Generic insert function used for insertBefore and insertAfter.
     * @attach{qxWeb}
     * @param target {String|Element[]|qxWeb} Parent selector expression or list of
     * parent elements
     * @param method {String} Either <code>insertBefore</code> or <code>insertAfter</code>
     * @return {qxWeb} The collection for chaining
     */
    _insert: function(target, method) {
      target = qx.module.Manipulating.__getElementArray(target);

      var i, l;
      if (this.length == 1) {
        for (i = 0, l = target.length; i < l; i++) {
          if (!this[0] || this[0].nodeType !== 1) {
            continue;
          }
          if (i == 0) {
            // first target: move the target node(s)
            qx.dom.Element[method](this[0], target[i]);
          }
          else {
            // further targets: clone the target node(s)
            qx.dom.Element[method](this.clone(true)[0], target[i]);
          }

        }
      } else {
        if (method == "insertBefore") {
          this.forEach(function(item) {
            item[method](target, method);
          });
        } else {
          for (i = this.length - 1; i >= 0; i--) {
            qxWeb(this[i])[method](target, method);
          }
        }

      }

      return this;
    },


   /**
    * Inserts the current collection before each target item. The collection
    * items are moved before the first target. For subsequent targets,
    * clones of the collection items are created and inserted.
    *
    * @attach{qxWeb}
    * @param target {String|Element|Element[]|qxWeb} Selector expression, DOM element,
    * Array of DOM elements or collection
    * @return {qxWeb} The collection for chaining
    */
   insertBefore : function(target) {
     return this._insert(target, "insertBefore");
   },

    /**
     * Inserts the current collection after each target item. The collection
     * items are moved after the first target. For subsequent targets,
     * clones of the collection items are created and inserted.
     *
     * @attach{qxWeb}
     * @param target {String|Element|Element[]|qxWeb} Selector expression, DOM element,
     * Array of DOM elements or collection
     * @return {qxWeb} The collection for chaining
     */
    insertAfter : function(target) {
      return this._insert(target, "insertAfter");
    },


    /**
     * Returns an array from a selector expression or a single element
     *
     * @attach{qxWeb}
     * @param arg {String|Element} Selector expression or DOM element
     * @return {Element[]} Array of elements
     * @internal
     */
    __getElementArray : function(arg)
    {

      if (!qx.lang.Type.isArray(arg)) {
        var fromSelector = qxWeb(arg);
        arg = fromSelector.length > 0 ? fromSelector : [arg];
      }

      for (var i=arg.length -1; i >= 0; i--) {
        if (!(arg[i].nodeType === 1 || arg[i].nodeType === 11)) {
          arg.splice(i, 1);
        }
      }

      return arg;
    },


    /**
     * Wraps each element in the collection in a copy of an HTML structure.
     * Elements will be appended to the deepest nested element in the structure
     * as determined by a depth-first search.
     *
     * @attach{qxWeb}
     * @param wrapper {String|Element|Element[]|qxWeb} Selector expression, HTML string, DOM element or
     * list of DOM elements
     * @return {qxWeb} The collection for chaining
     */
    wrap : function(wrapper) {
      wrapper = qx.module.Manipulating.__getCollectionFromArgument(wrapper);

      if (wrapper.length == 0) {
        return this;
      }

      this._forEachElement(function(item) {
        var clonedwrapper = wrapper.eq(0).clone(true);
        qx.dom.Element.insertAfter(clonedwrapper[0], item);
        var innermost = qx.module.Manipulating.__getInnermostElement(clonedwrapper[0]);
        qx.dom.Element.insertEnd(item, innermost);
      });

      return this;
    },


    /**
     * Creates a new collection from the given argument
     * @param arg {var} Selector expression, HTML string, DOM element or list of
     * DOM elements
     * @return {qxWeb} Collection
     * @internal
     */
    __getCollectionFromArgument : function(arg) {
      var coll;
      // Collection/array of DOM elements
      if (qx.lang.Type.isArray(arg)) {
        coll = qxWeb(arg);
      }
      // HTML string
      else {
        var arr = qx.bom.Html.clean([arg]);
        if (arr.length > 0 && qx.dom.Node.isElement(arr[0])) {
          coll = qxWeb(arr);
        }
        // Selector or single element
        else {
          coll = qxWeb(arg);
        }
      }

      return coll;
    },


    /**
     * Returns the innermost element of a DOM tree as determined by a simple
     * depth-first search.
     *
     * @param element {Element} Root element
     * @return {Element} innermost element
     * @internal
     */
    __getInnermostElement : function(element)
    {
      if (element.childNodes.length == 0) {
        return element;
      }
      for (var i = 0, l = element.childNodes.length; i < l; i++) {
        if (element.childNodes[i].nodeType === 1) {
          return this.__getInnermostElement(element.childNodes[i]);
        }
      }
      return element;
    },


    /**
     * Removes each element in the current collection from the DOM
     *
     * @attach{qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    remove : function() {
      if (this.length == 1) {
        qx.dom.Element.remove(this[0]);
      } else {
        // do recursive calling. we could have widgets overriding the remove method
        this.forEach(function(item) {
          item.remove();
        });
      }
      return this;
    },


    /**
     * Removes all content from the elements in the collection
     *
     * @attach{qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    empty : function() {
      this._forEachElement(function(item) {
        // don't use innerHTML="" because of [BUG #7323]
        // and don't use textContent="" because of missing IE8 support
        while (item.firstChild) {
          item.removeChild(item.firstChild);
        }
      });
      return this;
    },


    /**
     * Inserts content before each element in the collection. This can either
     * be an HTML string, an array of HTML strings, a single DOM element or an
     * array of elements.
     *
     * @attach{qxWeb}
     * @param content {String|String[]|Element|Element[]|qxWeb} HTML string(s),
     * DOM element(s) or collection to insert
     * @return {qxWeb} The collection for chaining
     */
    before : function(content) {
      if (!qx.lang.Type.isArray(content)) {
        content = [content];
      }
      var fragment = document.createDocumentFragment();
      qx.bom.Html.clean(content, document, fragment);
      var kids = qx.lang.Array.cast(fragment.childNodes, Array);

      if (this.length == 1) {
        for (var i = 0, l = kids.length; i < l; i++) {
          qxWeb(kids[i]).insertBefore(this);
        }
      } else {
        this._forEachElement(function(item, index) {
          if (index > 0) {
            kids = kids.map(function(kid) {
              return kid.cloneNode(true);
            });
          }
          qxWeb(item).before(kids);
        }, this);
      }

      return this;
    },


    /**
     * Inserts content after each element in the collection. This can either
     * be an HTML string, an array of HTML strings, a single DOM element or an
     * array of elements.
     *
     * @attach{qxWeb}
     * @param content {String|String[]|Element|Element[]|qxWeb} HTML string(s),
     * DOM element(s) or collection to insert
     * @return {qxWeb} The collection for chaining
     */
    after : function(content) {
      if (!qx.lang.Type.isArray(content)) {
        content = [content];
      }
      var fragment = document.createDocumentFragment();
      qx.bom.Html.clean(content, document, fragment);
      var kids = qx.lang.Array.cast(fragment.childNodes, Array);

      if (this.length == 1) {
        for (var i = kids.length - 1; i >= 0; i--) {
          qxWeb(kids[i]).insertAfter(this);
        }
      } else {
        this._forEachElement(function(item, index) {
          if (index > 0) {
            kids = kids.map(function(kid) {
              return kid.cloneNode(true);
            });
          }
          qxWeb(item).after(kids);
        }, this);
      }

      return this;
    },


    /**
     * Returns the left scroll position of the first element in the collection.
     *
     * @attach{qxWeb}
     * @return {Number} Current left scroll position
     */
    getScrollLeft : function()
    {
      var obj = this[0];
      if (!obj) {
        return null;
      }

      var Node = qx.dom.Node;
      if (Node.isWindow(obj) || Node.isDocument(obj)) {
        return qx.bom.Viewport.getScrollLeft();
      }

      return obj.scrollLeft;
    },


    /**
     * Returns the top scroll position of the first element in the collection.
     *
     * @attach{qxWeb}
     * @return {Number} Current top scroll position
     */
    getScrollTop : function()
    {
      var obj = this[0];
      if (!obj) {
        return null;
      }

      var Node = qx.dom.Node;
      if (Node.isWindow(obj) || Node.isDocument(obj)) {
        return qx.bom.Viewport.getScrollTop();
      }

      return obj.scrollTop;
    },


    /** Default animation descriptions for animated scrolling **/
    _animationDescription: {
      scrollLeft : {duration: 700, timing: "ease-in", keep: 100, keyFrames : {
        0: {},
        100: {scrollLeft: 1}
      }},

      scrollTop : {duration: 700, timing: "ease-in", keep: 100, keyFrames : {
        0: {},
        100: {scrollTop: 1}
      }}
    },


    /**
     * Performs animated scrolling
     *
     * @param property {String} Element property to animate: <code>scrollLeft</code>
     * or <code>scrollTop</code>
     * @param value {Number} Final scroll position
     * @param duration {Number} The animation's duration in ms
     * @return {q} The collection for chaining.
     */
    __animateScroll : function(property, value, duration)
    {
      var desc = qx.lang.Object.clone(qx.module.Manipulating._animationDescription[property], true);
      desc.keyFrames[100][property] = value;
      return this.animate(desc, duration);
    },

    /**
     * Scrolls the elements of the collection to the given coordinate.
     *
     * @attach{qxWeb}
     * @param value {Number} Left scroll position
     * @param duration {Number?} Optional: Duration in ms for animated scrolling
     * @return {qxWeb} The collection for chaining
     */
    setScrollLeft : function(value, duration)
    {
      var Node = qx.dom.Node;

      if (duration && qx.bom.element && qx.bom.element.AnimationJs) {
        qx.module.Manipulating.__animateScroll.bind(this, "scrollLeft",
          value, duration)();
      }

      for (var i=0, l=this.length, obj; i<l; i++)
      {
        obj = this[i];

        if (Node.isElement(obj)) {
          if (!(duration && qx.bom.element && qx.bom.element.AnimationJs)) {
            obj.scrollLeft = value;
          }
        } else if (Node.isWindow(obj)) {
          obj.scrollTo(value, this.getScrollTop(obj));
        } else if (Node.isDocument(obj)) {
          Node.getWindow(obj).scrollTo(value, this.getScrollTop(obj));
        }
      }

      return this;
    },


    /**
     * Scrolls the elements of the collection to the given coordinate.
     *
     * @attach{qxWeb}
     * @param value {Number} Top scroll position
     * @param duration {Number?} Optional: Duration in ms for animated scrolling
     * @return {qxWeb} The collection for chaining
     */
    setScrollTop : function(value, duration)
    {
      var Node = qx.dom.Node;

      if (duration && qx.bom.element && qx.bom.element.AnimationJs) {
        qx.module.Manipulating.__animateScroll.bind(this, "scrollTop",
           value, duration)();
      }

      for (var i=0, l=this.length, obj; i<l; i++)
      {
        obj = this[i];

        if (Node.isElement(obj)) {
          if (!(duration && qx.bom.element && qx.bom.element.AnimationJs)) {
            obj.scrollTop = value;
          }
        } else if (Node.isWindow(obj)) {
          obj.scrollTo(this.getScrollLeft(obj), value);
        } else if (Node.isDocument(obj)) {
          Node.getWindow(obj).scrollTo(this.getScrollLeft(obj), value);
        }
      }

      return this;
    },


    /**
     * Focuses the first element in the collection
     *
     * @attach{qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    focus : function()
    {
      try {
        this[0].focus();
      }
      catch(ex) {}

      return this;
    },


    /**
     * Blurs each element in the collection
     *
     * @attach{qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    blur : function()
    {
      this.forEach(function(item) {
        try {
          item.blur();
        }
        catch(ex) {}
      });

      return this;
    }
  },


  classDefined : function(statics) {
    qxWeb.$attachStatic({
      "create" : statics.create
    });

    qxWeb.$attach({
      "append" : statics.append,
      "appendAt" : statics.appendAt,
      "appendTo" : statics.appendTo,
      "remove" : statics.remove,
      "empty" : statics.empty,

      "before" : statics.before,
      "insertBefore" : statics.insertBefore,
      "after" : statics.after,
      "insertAfter" : statics.insertAfter,
      "_insert" : statics._insert,

      "wrap" : statics.wrap,

      "clone" : statics.clone,

      "getScrollLeft" : statics.getScrollLeft,
      "setScrollLeft" : statics.setScrollLeft,
      "getScrollTop" : statics.getScrollTop,
      "setScrollTop" : statics.setScrollTop,

      "focus" : statics.focus,
      "blur" : statics.blur
    });
  }
});
