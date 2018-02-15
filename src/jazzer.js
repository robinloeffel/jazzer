class Jazzer {
    constructor(triggersSelector = '[data-jazzer-trigger]', containerSelector = '#jazzer', transitionClass = 'jazzer-changing', transitionDuration = 500, url = true) {
        this.selectors = {};
        this.transition = {};
        this.nodes = {};

        this.selectors.triggers = triggersSelector;
        this.selectors.container = containerSelector;

        this.transition.class = transitionClass;
        this.transition.duration = transitionDuration;

        this.nodes.triggers = document.querySelectorAll(this.selectors.triggers);
        this.nodes.container = document.querySelector(this.selectors.container);

        this.url = url;

        this.setListeners();
    }

    setListeners() {
        Array.from(this.nodes.triggers).forEach(trigger => {
            trigger.addEventListener('click', this.loadContent);
        });
    }

    async loadContent(event) {
        event.preventDefault();

        const href = event.state ? event.state.path : event.currentTarget.href || location.href;

        const req = await fetch(href);
        const res = await req.text();

        console.log(res);
    }
}

const jazzer = config => new Jazzer(config);

export default jazzer;

// const loadContent = (event) => {
//     event.preventDefault();
//
//     let request = new XMLHttpRequest(),
//         // if there is event.state, use its path property (popstate not to root)
//         // if there isn't one, fall back to currentTarget.href (click on a linkNode)
//         // if there is no currentTarget, fall back to the location.href (popstate to root)
//         href = event.state ? event.state.path : event.currentTarget.href || location.href;
//
//     request.addEventListener('readystatechange', () => {
//         if (request.readyState === 4) {
//             // call updateDom() when the request has been successfully processed or throw an error
//             if (request.status === 200) {
//                 updateDom(request.responseText, event.type, href);
//             } else {
//                 throw new Error(`jazzer couldn't get "${href}", the server responded with "${request.status} ${request.statusText}".`);
//             }
//         }
//     });
//
//     request.open('get', href, true);
//     request.send();
// };
//
// const updateDom = (newDom, eventType, href) => {
//     // hide the container
//     containerNode.classList.add(transitionClass);
//
//     setTimeout(() => {
//         // create a new document object
//         let newDocument = document.implementation.createHTMLDocument('');
//
//         if (!containerNode) {
//             throw new Error(`jazzer couldn't find any element matching the css selector "${container}".`);
//         }
//
//         // populate the new document with the dom from ajax
//         newDocument.documentElement.innerHTML = newDom;
//
//         // out with the old, in with the new markup
//         containerNode.innerHTML = newDocument.querySelector(container).innerHTML;
//
//         // set the new title and add an entry to the browser history
//         if (changeUrl) {
//             document.title = newDocument.title;
//
//             if (eventType === 'click') {
//                 history.pushState({
//                     path: href,
//                 }, newDocument.title, href);
//             }
//         }
//
//         setLinkListeners();
//
//         emitCustomEvent('jazzerChanged');
//     // duration + 5 so the transition is actually done before changing the content
//     }, duration + 5);
// };
//
// const emitCustomEvent = (name) => {
//     // create and dispatch an event with a given name
//     let customEvent = document.createEvent('Event');
//     customEvent.initEvent(name, true, true);
//     document.dispatchEvent(customEvent);
// };
//
// window.addEventListener('popstate', (event) => {
//     loadContent(event);
// });
//
// window.addEventListener('jazzerChanged', (event) => {
//     // check the container for elements that might not have been loaded yet
//     let blockers = containerNode.querySelectorAll('img, picture, image, video, audio, script, style'),
//         toLoad = blockers.length;
//
//     // show the new contents if all blockers have fired a load event
//     const blockerLoaded = () => {
//         toLoad--;
//
//         if (toLoad === 0) {
//             emitCustomEvent('jazzerDone');
//         }
//     };
//
//     if (toLoad === 0) {
//         emitCustomEvent('jazzerDone');
//     } else {
//         for (let i = 0; i < blockers.length; i++) {
//             blockers[i].addEventListener('load', blockerLoaded);
//         }
//     }
// });
//
// window.addEventListener('jazzerDone', () => {
//     containerNode.classList.remove(transitionClass);
// });
//
// export default jazzer;
