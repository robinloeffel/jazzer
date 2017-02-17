/*
    links           // (string)     css selector by which the links triggering smoothLoad will be fetched
                    //              defaults to '[data-jazzer-trigger]'

    container       // (string)     css selector by which the container will be identified, should be uniqe
                    //              defaults to '#jazzer'

    changeClass     // (string)     css class to apply during the dom change
                    //              defaults to 'jazzer-changing'

    duration        // (int)        duration of the dom change transition in ms
                    //              defaults to 500

    url             // (bool)       if the url should be changed or not
                    //              defaults to true

    linkNodes       // (NodeList)   link elements that trigger jazzer on click
                    //              will be populated by getLinks()

    containerNode   // (node)       dom element of which the contents will be changed
                    //              will be defined when calling jazzer()
*/

let links,
    container,
    changeClass,
    duration,
    url,
    linkNodes,
    containerNode;

const jazzer = (settings = {}) => {
    links = settings.links || '[data-jazzer-trigger]';
    container = settings.container || '#jazzer';
    changeClass = settings.changeClass || 'jazzer-changing';
    duration = settings.duration || 500;
    url = settings.url || true;

    containerNode = document.querySelector(container);

    setLinkListeners();
};

const setLinkListeners = () => {
    // remove the listeners of the old linkNodes
    if (linkNodes) {
        for (let i = 0; i < linkNodes.length; i++) {
            linkNodes[i].removeEventListener('click', loadContent);
        }
    }

    linkNodes = document.querySelectorAll(links);

    if (linkNodes.length === 0) {
        throw new Error(`jazzer couldn't find any links matching the css selector "${links}".`);
    }

    // set the listeners of the new linkNodes
    for (let i = 0; i < linkNodes.length; i++) {
        linkNodes[i].addEventListener('click', loadContent);
    }
};

const loadContent = (event) => {
    event.preventDefault();

    let request = new XMLHttpRequest(),
        // if there is event.state, use its path property (popstate not to root)
        // if there isn't one, fall back to currentTarget.href (click on a linkNode)
        // if there is no currentTarget, fall back to the location.href (popstate to root)
        href = event.state ? event.state.path : event.currentTarget.href || location.href;

    request.addEventListener('readystatechange', () => {
        if (request.readyState === 4) {
            // call updateDom() when the request has been successfully processed or throw an error
            if (request.status === 200) {
                updateDom(request.responseText, event.type, href);
            } else {
                throw new Error(`jazzer couldn't get "${href}", the server responded with "${request.status} ${request.statusText}".`);
            }
        }
    });

    request.open('get', href, true);
    request.send();
};

const updateDom = (newDom, eventType, href) => {
    // hide the container
    containerNode.classList.add(changeClass);

    setTimeout(() => {
        // create a new document object
        let newDocument = document.implementation.createHTMLDocument('');

        if (!containerNode) {
            throw new Error(`jazzer couldn't find any element matching the css selector "${container}".`);
        }

        // populate the new document with the dom from ajax
        newDocument.open();
        newDocument.write(newDom);
        newDocument.close();

        // out with the old, in with the new markup
        containerNode.innerHTML = newDocument.querySelector(container).innerHTML;

        // set the new title and add an entry to the browser history
        if (url) {
            document.title = newDocument.title;

            if (eventType === 'click') {
                history.pushState({
                    path: href,
                }, newDocument.title, href);
            }
        }

        setLinkListeners();

        emitCustomEvent('jazzerChanged');
    // duration + 5 so the transition is actually done before changing the content
    }, duration + 5);
};

const emitCustomEvent = (name) => {
    // create and dispatch an event with a given name
    let customEvent = document.createEvent('Event');
    customEvent.initEvent(name, true, true);
    document.dispatchEvent(customEvent);
};

window.addEventListener('popstate', (event) => {
    loadContent(event);
});

window.addEventListener('jazzerChanged', (event) => {
    // check the container for elements that might not have been loaded yet
    let blockers = containerNode.querySelectorAll('img, picture, image, video, audio, script, style'),
        toLoad = blockers.length;

    // show the new contents if all blockers have fired a load event
    const blockerLoaded = () => {
        toLoad--;

        if (toLoad === 0) {
            emitCustomEvent('jazzerDone');
        }
    };

    if (toLoad === 0) {
        emitCustomEvent('jazzerDone');
    } else {
        for (let i = 0; i < blockers.length; i++) {
            blockers[i].addEventListener('load', blockerLoaded);
        }
    }
});

window.addEventListener('jazzerDone', () => {
    containerNode.classList.remove(changeClass);
});

export default jazzer;
