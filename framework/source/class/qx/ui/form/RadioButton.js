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
     * Gabriel Munteanu (gabios)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The Radio button for mobile.
 */
qx.Class.define("qx.ui.form.RadioButton",
{
  extend : qx.ui.form.Input,


  /**
   * @param value {Boolean?null} The value of the checkbox.
   */
  construct : function(value)
  {
    this.super(qx.ui.form.Input, "constructor");

    this.value = !!value;
    this.on("tap", this._onTap, this);
  },


  properties :
  {
    // overridden
    defaultCssClass :
    {
      init : "radio"
    },


    /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons */
    radioGroup :
    {
      check  : "qx.ui.form.RadioGroup",
      nullable : true,
      apply : "_applyRadioGroup"
    },

    name : {
      nullable: true
    }
  },


  members :
  {
    _state : null,

    // overridden
    _getTagName : function()
    {
      return "span";
    },


    // overridden
    _getType : function()
    {
      return null;
    },


    /**
     * Reacts on tap on radio button.
     */
    _onTap : function() {
      qxWeb("." + this.defaultCssClass).forEach(function(el) {
        el = qxWeb(el);
        if (el.name == this.name) {
          el.value = false;
        }
      }.bind(this));

      this.emit("changeValue", {value: true, old: this.value, target: this});

      // Toggle State.
      this.value = true;
    },


    /**
     * The assigned {@link qx.ui.form.RadioGroup} which handles the switching between registered buttons
     * @param value {qx.ui.form.RadioGroup} the new radio group to which this radio button belongs.
     * @param old {qx.ui.form.RadioGroup} the old radio group of this radio button.
     */
    _applyRadioGroup : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },


    /**
     * Sets the value [true/false] of this radio button.
     * It is called by the setValue method of the qx.ui.form.MForm
     * mixin
     * @param value {Boolean} the new value of the radio button
     */
    _setValue : function(value) {
      if(value == true) {
        this.addClass("checked");
      } else {
        this.removeClass("checked");
      }

      this._state = value;
    },


    /**
     * Gets the value [true/false] of this radio button.
     * It is called by the getValue method of the qx.ui.form.MForm
     * mixin
     * @return {Boolean} the value of the radio button
     */
    _getValue : function() {
      return this._state;
    },


    dispose : function() {
      this.super(qx.ui.form.Input, "dispose");
      this.off("tap", this._onTap, this);
    }
  }
});
