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

    refreshEventListeners();
};

const refreshEventListeners = () => {
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
        url = event.currentTarget.href;

    request.addEventListener('readystatechange', () => {
        if (request.readyState === 4) {
            // call updateDom() when the request has been successfully processed, else throw an error
            if (request.status === 200) {
                updateDom(request.responseText, url);
            } else {
                throw new Error(`jazzer couldn't get "${url}", the server responded with "${request.status} ${request.statusText}".`);
            }
        }
    });

    request.open('get', url, true);
    request.send();
};

const updateDom = (newDom, url) => {
    // create a new document object
    let newDocument = document.implementation.createHTMLDocument('');

    if (!containerNode) {
        throw new Error(`jazzer couldn't find any element matching the css selector "${container}".`);
    }

    // hide the container
    containerNode.classList.add(changeClass);

    setTimeout(() => {
        // populate the new document with the dom from ajax
        newDocument.open();
        newDocument.write(newDom);
        newDocument.close();

        // get the markup of the container inside the new document
        let newMarkup = newDocument.querySelector(container).innerHTML;

        // out with the old, in with the new markup
        containerNode.innerHTML = newMarkup;

        refreshEventListeners();

        // emit jazzerChanged event
        let jazzerChangedEvent = document.createEvent('Event');
        jazzerChangedEvent.initEvent('jazzerChanged', true, true);
        window.dispatchEvent(jazzerChangedEvent);
    // duration + 5 so we're sure the transition is actually done before changing the content
    }, duration + 5);

    // set the new title and add an entry to the browser history
    if (url) {
        document.title = newDocument.title;

        history.pushState({path: url}, '', url);
    }
};

const showNode = () => {
    // remove changeClass as soon as a new paint cycle starts
    setTimeout(() => {
        containerNode.classList.remove(changeClass);
    });
};

window.addEventListener('popstate', (event) => {
    // go to where the browser already changed the url to (last/next entry of history)
    loadContent(location.href);
});

window.addEventListener('jazzerChanged', (event) => {
    // check the dom for elements that might not have been loaded yet
    let blockers = containerNode.querySelectorAll('img, picture, image, video, audio'),
        loaded = 0;

    // show the new contents if all elements have fired a load event
    const checkLoaded = () => {
        loaded++;

        if (loaded === blockers.length) {
            showNode();
        }
    };

    // add a listener to the load event on each blocker or just show the new node if there are none
    if (blockers.length > 0) {
        for (let i = 0; i < blockers.length; i++) {
            blockers[i].addEventListener('load', checkLoaded);
        }
    } else {
        showNode();
    }
});

export default jazzer;
