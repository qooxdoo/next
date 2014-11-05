/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

describe("mobile.dialog.Menu", function() {

  beforeEach(function() {
    setUpRoot();
  });


  afterEach(function() {
    tearDownRoot();
  });


  it("Init", function() {
    var model = new qx.data.Array(["item1", "item2", "item3"]);
    var model2 = new qx.data.Array(["item4", "item5", "item6"]);

    var menu = new qx.ui.dialog.Menu(model).appendTo(getRoot());
    menu.model = model2;
    menu.dispose();
  });


  it("Factory", function() {
    var menu = qxWeb.create("<div>").toMenu().appendTo(getRoot());
    assert.instanceOf(menu, qx.ui.dialog.Menu);
    qx.core.Assert.assertEquals(menu, menu[0].$$widget);
    assert.equal("qx.ui.dialog.Menu", menu.getData("qxWidget"));

    menu.dispose();
  });


  it("Selected", function() {
    var model = new qx.data.Array(["item1", "item2", "item3"]);
    var menu = new qx.ui.dialog.Menu(model).appendTo(getRoot());

    var el = menu.find("*[data-row=1]")[0]; // item 1
    var spy = sinon.spy();
    menu.on("selected", spy);
    menu.find(".list").emit("tap", {_original : {target: el}});

    sinon.assert.calledOnce(spy);
    assert.equal(spy.args[0][0][0], el);

    menu.dispose();
  });
});
