/*
    links       // (string)     css selector by which the links triggering smoothLoad will be fetched
                //              defaults to '[data-jazzer-trigger]'

    container   // (string)     css selector by which the container will be identified, should be uniqe
                //              defaults to 'jazzer'

    changeClass // (string)     css class to apply during the dom change
                //              defaults to 'jazzer-changing'

    duration    // (int)        duration of the dom change transition in ms
                //              defaults to 500

    url         // (bool)       if the url should be changed or not
                //              defaults to true

    linkList    // (NodeList)   links that trigger smoothLoad
                //              will be populated by fetchLinks()
*/

let links,
    container,
    changeClass,
    duration,
    url,
    linkList;

const jazzer = (settings = {}) => {
    links = settings.links || '[data-jazzer-trigger]';
    container = settings.container || '#jazzer';
    changeClass = settings.changeClass || 'jazzer-changing';
    duration = settings.duration || 500;
    url = settings.url || true;

    fetchLinks();
};

const fetchLinks = () => {
    // skip on initial page load
    if (linkList) {
        for (let i = 0; i < linkList.length; i++) {
            // remove the event listeners of the old links
            linkList[i].removeEventListener('click', loadPage);
        }
    }

    // get the new links
    linkList = document.querySelectorAll(links);

    if (linkList.length === 0) {
        throw new Error(`jazzer couldn't find any links matching the css selector "${links}".`);
    }

    for (let i = 0; i < linkList.length; i++) {
        // add event listeners to the new links
        linkList[i].addEventListener('click', loadPage);
    }
};

const loadPage = (event) => {
    // prevent regular state change
    event.preventDefault();

    loadContent(event.currentTarget.href);
};

const loadContent = (link) => {
    let request = new XMLHttpRequest();

    request.addEventListener('readystatechange', () => {
        if (request.readyState === 4) {
            // call updateDom() when the request has been successfully processed, else throw an error
            if (request.status === 200) {
                updateDom(request.responseText, link);
            } else {
                throw new Error(`jazzer couldn't get "${link}", the server responded with "${request.status} ${request.statusText}".`);
            }
        }
    });

    request.open('get', link, true);
    request.send();
};

const updateDom = (newDom, link) => {
    // fetch the container on this dom and create a new document
    let containerNode = document.querySelector(container),
        newDocument = document.implementation.createHTMLDocument('');

    if (!containerNode) {
        throw new Error(`jazzer couldn't find any element matching the css selector "${container}".`);
    }

    // hide the container
    containerNode.classList.toggle(changeClass);

    // populate the new document with the dom (string) we got via ajax
    newDocument.body.insertAdjacentHTML('beforeend', newDom);

    // get the markup of the container inside the new document
    let newMarkup = newDocument.querySelector(container).innerHTML;

    // out with the old, in with the new markup
    setTimeout(() => {
        containerNode.innerHTML = newMarkup;

        let jazzerChangedEvent = document.createEvent('Event');
        jazzerChangedEvent.initEvent('jazzerChanged', true, true);
        window.dispatchEvent(jazzerChangedEvent);

        fetchLinks();
    // duration + 5 so we're sure the transition is actually done before changing the content
    }, duration + 5);

    // set the new title and add an entry to the browser history
    if (url) {
        document.title = newDocument.body.innerHTML.match(/<title>(.*)<\/title>/)[1];

        history.pushState({path: link}, '', link);
    }
};

const showNode = () => {
    // remove changeClass as soon as a new paint cycle starts
    setTimeout(() => {
        document.querySelector(container).classList.toggle(changeClass);
    });
};

window.addEventListener('popstate', (event) => {
    // go to where the browser already changed the url to (last/next entry of history)
    loadContent(location.href);
});

window.addEventListener('jazzerChanged', (event) => {
    // check the dom for elements that might not have been loaded yet
    let blockers = document.querySelectorAll('img, picture, image, video, audio'),
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
