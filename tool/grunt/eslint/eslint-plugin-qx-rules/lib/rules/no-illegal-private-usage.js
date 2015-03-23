/**
 * @fileoverview Prevent references within members property initialization
 * @author rsternagel
 */
'use strict';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

// http://esprima.org/demo/parse.html
/**
 *  qx.Bootstrap.define("qx.foo.Bar",
 *  {
 *    constructor: function() {
 *       this.__known = true   // ok
 *    }
 *    statics: {
 *       __KNOWN : null;
 *    },
 *    members: {
 *      __known: null,
 *      foo: function() {
 *        this.__known         // ok
 *        qx.foo.Bar.__known   // ok
 *        this.__KNOWN = true  // ok
 *
 *        this.__notDeclared   // bad
 *        f.__notDeclared      // bad
 *        Foo.__notDeclared    // bad
 *      }
 *    }
 *  });
 */

module.exports = function(context) {

  // --------------------------------------------------------------------------
  // Public
  // --------------------------------------------------------------------------

<<<<<<< HEAD
=======
  var endsWith = function (str, prefix) {
    return (str.indexOf(prefix, str.length - prefix.length) !== -1);
  };
  var startsWith = function (str, suffix) {
    return (str.indexOf(suffix) === 0);
  };
>>>>>>> master
  var usedPrivateNodes = [];
  var declaredPrivates = [];
  var className = "";

  return {
    'ExpressionStatement': function(node) {
      if (node.parent && node.parent.type === "Program") {

        if (node.expression && node.expression.type === "AssignmentExpression") {
          var expr = node.expression;
          if (expr.left
<<<<<<< HEAD
            && expr.left.object && expr.left.object.name === "qx"
            && expr.left.property && expr.left.property.name === "Class") {
              className = "qx.Class";
=======
              && expr.left.object && expr.left.object.name === "qx"
              && expr.left.property && expr.left.property.name === "Class") {
            className = "qx.Class";
>>>>>>> master
          }
        }

        if (node.expression
            && node.expression.arguments
            && node.expression.arguments.length >= 2
            && node.expression.arguments[1].properties) {
          node.expression.arguments[1].properties.forEach(function(prop) {
            if (prop.key.name === "members" || prop.key.name === "statics") {
              if (prop.value && prop.value.properties) {
                prop.value.properties.forEach(function(prop) {
                  var curMember = prop.key.name;
<<<<<<< HEAD
                  if (curMember && curMember.indexOf("__") === 0) {
=======
                  if (curMember && startsWith(curMember, '__')) {
>>>>>>> master
                    declaredPrivates.push(curMember);
                  }
                });
              }
            }
          });
        }

      }
    },


    'Identifier': function(node) {
<<<<<<< HEAD
      if (node.name.indexOf("__") === 0) {
=======
      if (startsWith(node.name, '__') && !endsWith(node.name, '__')) {
>>>>>>> master
        usedPrivateNodes.push(node);
      }

      usedPrivateNodes.forEach(function(privNode, i) {
        var privName = privNode.name;
<<<<<<< HEAD
=======
        // find all used and not declared privates but skip qx.Class
>>>>>>> master
        if (declaredPrivates.indexOf(privName) === -1 && className !== "qx.Class") {
          context.report(privNode, "Do not use private '"+privName+"' of foreign class");
          delete usedPrivateNodes[i];
        }
      });
    }
  };

};
