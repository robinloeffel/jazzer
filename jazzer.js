var jazzer = (function () {
'use strict';

/*
    links           // (string)     css selector by which the links triggering smoothLoad will be fetched
                    //              defaults to '[data-jazzer-trigger]'

    container       // (string)     css selector by which the container will be identified, should be uniqe
                    //              defaults to '#jazzer'

    transitionClass // (string)     css class to apply during the dom change
                    //              defaults to 'jazzer-changing'

    duration        // (int)        duration of the dom change transition in ms
                    //              defaults to 500

    changeUrl       // (bool)       if the url and title should be changed or not
                    //              defaults to true

    linkNodes       // (NodeList)   link elements that trigger jazzer on click
                    //              will be populated by getLinks()

    containerNode   // (node)       dom element of which the contents will be changed
                    //              will be defined when calling jazzer()
*/
var links, container, transitionClass, duration, changeUrl, linkNodes, containerNode;

var jazzer = function jazzer() {
  var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  links = settings.links || '[data-jazzer-trigger]';
  container = settings.container || '#jazzer';
  transitionClass = settings.transitionClass || 'jazzer-changing';
  duration = settings.duration || 500;
  changeUrl = settings.changeUrl || true;
  containerNode = document.querySelector(container);
  setLinkListeners();
};

var setLinkListeners = function setLinkListeners() {
  // remove the listeners of the old linkNodes
  if (linkNodes) {
    for (var i = 0; i < linkNodes.length; i++) {
      linkNodes[i].removeEventListener('click', loadContent);
    }
  }

  linkNodes = document.querySelectorAll(links);

  if (linkNodes.length === 0) {
    throw new Error("jazzer couldn't find any links matching the css selector \"".concat(links, "\"."));
  } // set the listeners of the new linkNodes


  for (var _i = 0; _i < linkNodes.length; _i++) {
    linkNodes[_i].addEventListener('click', loadContent);
  }
};

var loadContent = function loadContent(event) {
  event.preventDefault();
  var request = new XMLHttpRequest(),
      // if there is event.state, use its path property (popstate not to root)
  // if there isn't one, fall back to currentTarget.href (click on a linkNode)
  // if there is no currentTarget, fall back to the location.href (popstate to root)
  href = event.state ? event.state.path : event.currentTarget.href || location.href;
  request.addEventListener('readystatechange', function () {
    if (request.readyState === 4) {
      // call updateDom() when the request has been successfully processed or throw an error
      if (request.status === 200) {
        updateDom(request.responseText, event.type, href);
      } else {
        throw new Error("jazzer couldn't get \"".concat(href, "\", the server responded with \"").concat(request.status, " ").concat(request.statusText, "\"."));
      }
    }
  });
  request.open('get', href, true);
  request.send();
};

var updateDom = function updateDom(newDom, eventType, href) {
  // hide the container
  containerNode.classList.add(transitionClass);
  setTimeout(function () {
    // create a new document object
    var newDocument = document.implementation.createHTMLDocument('');

    if (!containerNode) {
      throw new Error("jazzer couldn't find any element matching the css selector \"".concat(container, "\"."));
    } // populate the new document with the dom from ajax


    newDocument.documentElement.innerHTML = newDom; // out with the old, in with the new markup

    containerNode.innerHTML = newDocument.querySelector(container).innerHTML; // set the new title and add an entry to the browser history

    if (changeUrl) {
      document.title = newDocument.title;

      if (eventType === 'click') {
        history.pushState({
          path: href
        }, newDocument.title, href);
      }
    }

    setLinkListeners();
    emitCustomEvent('jazzerChanged'); // duration + 5 so the transition is actually done before changing the content
  }, duration + 5);
};

var emitCustomEvent = function emitCustomEvent(name) {
  // create and dispatch an event with a given name
  var customEvent = document.createEvent('Event');
  customEvent.initEvent(name, true, true);
  document.dispatchEvent(customEvent);
};

window.addEventListener('popstate', function (event) {
  loadContent(event);
});
window.addEventListener('jazzerChanged', function (event) {
  // check the container for elements that might not have been loaded yet
  var blockers = containerNode.querySelectorAll('img, picture, image, video, audio, script, style'),
      toLoad = blockers.length; // show the new contents if all blockers have fired a load event

  var blockerLoaded = function blockerLoaded() {
    toLoad--;

    if (toLoad === 0) {
      emitCustomEvent('jazzerDone');
    }
  };

  if (toLoad === 0) {
    emitCustomEvent('jazzerDone');
  } else {
    for (var i = 0; i < blockers.length; i++) {
      blockers[i].addEventListener('load', blockerLoaded);
    }
  }
});
window.addEventListener('jazzerDone', function () {
  containerNode.classList.remove(transitionClass);
});

return jazzer;

}());
