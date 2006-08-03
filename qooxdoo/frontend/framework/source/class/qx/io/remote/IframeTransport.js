/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
     2006 by Derrell Lipman

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(transport)
#require(qx.io.remote.RemoteExchange)
#require(qx.constant.Mime)

************************************************************************ */

/*!
  Transports requests to a server using an IFRAME.

  This class should not be used directly by client programmers.
 */
qx.OO.defineClass("qx.io.remote.IframeTransport", qx.io.remote.AbstractRemoteTransport,
function()
{
  qx.io.remote.AbstractRemoteTransport.call(this);

  var vUniqueId = (new Date).valueOf();
  var vFrameName = "frame_" + vUniqueId;
  var vFormName = "form_" + vUniqueId;

  // Mshtml allows us to define a full HTML as a parameter for createElement.
  // Using this method is the only (known) working to register the frame
  // to the known elements of the Internet Explorer.
  if (qx.sys.Client.isMshtml()) {
    this._frame = document.createElement('<iframe name="' + vFrameName + '"></iframe>');
  } else {
    this._frame = document.createElement("iframe");
  }

  this._frame.src = "javascript:void(0)";
  this._frame.id = this._frame.name = vFrameName;
  this._frame.onload = function(e) { return o._onload(e); }

  this._frame.style.width = this._frame.style.height = this._frame.style.left = this._frame.style.top = "0px";
  this._frame.style.visibility = "hidden";

  document.body.appendChild(this._frame);

  this._form = document.createElement("form");
  this._form.target = vFrameName;
  this._form.id = this._form.name = vFormName;

  this._form.style.width = this._frame.style.height = this._frame.style.left = this._frame.style.top = "0px";
  this._form.style.visibility = "hidden";

  document.body.appendChild(this._form);

  this._data = document.createElement("textarea");
  this._data.id = this._data.name = "_data_";
  this._form.appendChild(this._data);

  var o = this;
  this._frame.onreadystatechange = function(e) { return o._onreadystatechange(e); }
});

qx.Proto._lastReadyState = 0;





/*
---------------------------------------------------------------------------
  CLASS PROPERTIES AND METHODS
---------------------------------------------------------------------------
*/

// basic registration to qx.io.remote.RemoteExchange
// the real availability check (activeX stuff and so on) follows at the first real request
qx.io.remote.RemoteExchange.registerType(qx.io.remote.IframeTransport, "qx.io.remote.IframeTransport");

qx.io.remote.IframeTransport.handles =
{
  synchronous : false,
  asynchronous : true,
  crossDomain : true,
  fileUpload: true,
  responseTypes : [ qx.constant.Mime.TEXT, qx.constant.Mime.JAVASCRIPT, qx.constant.Mime.JSON, qx.constant.Mime.XML, qx.constant.Mime.HTML ]
}

qx.io.remote.IframeTransport.isSupported = function() {
  return true;
}






/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

qx.Proto.send = function()
{
  var vMethod = this.getMethod();
  var vAsynchronous = this.getAsynchronous();
  var vUrl = this.getUrl();



  // --------------------------------------
  //   Adding parameters
  // --------------------------------------

  var vParameters = this.getParameters();
  var vParametersList = [];
  for (var vId in vParameters) {
    vParametersList.push(vId + qx.constant.Core.EQUAL + vParameters[vId]);
  }

  if (vParametersList.length > 0) {
    vUrl += (vUrl.indexOf(qx.constant.Core.QUESTIONMARK) >= 0 ? qx.constant.Core.AMPERSAND : qx.constant.Core.QUESTIONMARK) + vParametersList.join(qx.constant.Core.AMPERSAND);
  }



  // --------------------------------------
  //   Preparing form
  // --------------------------------------

  this._form.action = vUrl;
  this._form.method = vMethod;



  // --------------------------------------
  //   Sending data
  // --------------------------------------

  this._data.appendChild(document.createTextNode(this.getData()));
  this._form.submit();
}






/*
---------------------------------------------------------------------------
  EVENT LISTENER
---------------------------------------------------------------------------
*/

// For reference:
// http://msdn.microsoft.com/workshop/author/dhtml/reference/properties/readyState_1.asp
qx.io.remote.IframeTransport._numericMap =
{
  "uninitialized" : 1,
  "loading" : 2,
  "loaded" : 2,
  "interactive" : 3,
  "complete" : 4
}

/*!
  Converting complete state to numeric value and update state property
*/
qx.Proto._onload = function(e)
{
  if (this._form.src) {
    return;
  }

  this._switchReadyState(qx.io.remote.IframeTransport._numericMap.complete);
}

/*!
  Converting named readyState to numeric value and update state property
*/
qx.Proto._onreadystatechange = function(e) {
  this._switchReadyState(qx.io.remote.IframeTransport._numericMap[this._frame.readyState]);
}

qx.Proto._switchReadyState = function(vReadyState)
{
  // Ignoring already stopped requests
  switch(this.getState())
  {
    case qx.constant.Net.STATE_COMPLETED:
    case qx.constant.Net.STATE_ABORTED:
    case qx.constant.Net.STATE_FAILED:
    case qx.constant.Net.STATE_TIMEOUT:
      this.warn("Ignore Ready State Change");
      return;
  }

  // Updating internal state
  while (this._lastReadyState < vReadyState) {
    this.setState(qx.io.remote.RemoteExchange._nativeMap[++this._lastReadyState]);
  }
}





/*
---------------------------------------------------------------------------
  REQUEST HEADER SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.setRequestHeader = function(vLabel, vValue)
{
  // TODO
  // throw new Error("setRequestHeader is abstract");
}






/*
---------------------------------------------------------------------------
  RESPONSE HEADER SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.getResponseHeader = function(vLabel)
{
  return null;

  // TODO
  // this.error("Need implementation", "getResponseHeader");
}

/*!
  Provides an hash of all response headers.
*/
qx.Proto.getResponseHeaders = function()
{
  return {}

  // TODO
  // throw new Error("getResponseHeaders is abstract");
}







/*
---------------------------------------------------------------------------
  STATUS SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Returns the current status code of the request if available or -1 if not.
*/
qx.Proto.getStatusCode = function()
{
  return 200;

  // TODO
  // this.error("Need implementation", "getStatusCode");
}

/*!
  Provides the status text for the current request if available and null otherwise.
*/
qx.Proto.getStatusText = function()
{
  return qx.constant.Core.EMPTY;

  // TODO
  // this.error("Need implementation", "getStatusText");
}







/*
---------------------------------------------------------------------------
  FRAME UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getIframeWindow = function() {
  return qx.dom.DomIframe.getWindow(this._frame);
}

qx.Proto.getIframeDocument = function() {
  return qx.dom.DomIframe.getDocument(this._frame);
}

qx.Proto.getIframeBody = function() {
  return qx.dom.DomIframe.getBody(this._frame);
}








/*
---------------------------------------------------------------------------
  RESPONSE DATA SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.getIframeTextContent = function()
{
  var vBody = this.getIframeBody();

  if (!vBody) {
    return null;
  }

  // Mshtml returns the content inside a PRE
  // element if we use plain text
  if (vBody.firstChild.tagName == "PRE")
  {
    return vBody.firstChild.innerHTML;
  }
  else
  {
    return vBody.innerHTML;
  }
}

qx.Proto.getIframeHtmlContent = function()
{
  var vBody = this.getIframeBody();
  return vBody ? vBody.innerHTML : null;
}

/*!
  Returns the length of the content as fetched thus far
*/
qx.Proto.getFetchedLength = function()
{
  return 0;

  // TODO
  // throw new Error("getFetchedLength is abstract");
}

qx.Proto.getResponseContent = function()
{
  if (this.getState() !== qx.constant.Net.STATE_COMPLETED)
  {
    if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
      this.warn("Transfer not complete, ignoring content!");
    }

    return null;
  }

  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
    this.debug("Returning content for responseType: " + this.getResponseType());
  }

  var vText = this.getIframeTextContent();

  switch(this.getResponseType())
  {
    case qx.constant.Mime.TEXT:
      return vText;
      break;

    case qx.constant.Mime.HTML:
      return this.getIframeHtmlContent();
      break;

    case qx.constant.Mime.JSON:
      try {
        return vText && vText.length > 0 ? qx.io.Json.parseQx(vText) : null;
      } catch(ex) {
        return this.error("Could not execute json: (" + vText + ")", ex);
      }

    case qx.constant.Mime.JAVASCRIPT:
      try {
        return vText && vText.length > 0 ? window.eval(vText) : null;
      } catch(ex) {
        return this.error("Could not execute javascript: (" + vText + ")", ex);
      }

    case qx.constant.Mime.XML:
      return this.getIframeDocument();

    default:
      this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
      return null;
  }
}






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }

  if (this._frame)
  {
    this._frame.onload = null;
    this._frame.onreadystatechange = null;

    // Reset source to a blank image for gecko
    // Otherwise it will switch into a load-without-end behaviour
    if (qx.sys.Client.isGecko()) {
      this._frame.src = qx.manager.object.ImageManager.buildUri("static/image/blank.gif");
    }

    // Finally remove element node
    document.body.removeChild(this._frame);

    this._frame = null;
  }

  if (this._form)
  {
    document.body.removeChild(this._form);
    this._form = null;
  }

  return qx.io.remote.AbstractRemoteTransport.prototype.dispose.call(this);
}
