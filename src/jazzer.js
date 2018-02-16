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
        [...this.nodes.triggers].forEach(trigger => {
            trigger.addEventListener('click', this.loadContent.bind(this));
        });
    }

    loadContent(event) {
        event.preventDefault();

        const href = event.state ? event.state.path : event.currentTarget.href || location.href;

        fetch(href).then(req => req.text()).then(text => {
            this.nodes.container.addEventListener('transitionend', this.updateDom.bind(this));
            this.newDom = text;
            this.nodes.container.classList.add(this.transition.class);
        }).catch(error => {
            console.error(`jazzer coulnd't get ${href}, the response was: ${error}`);
        });
    }

    updateDom() {
        let newDoc = document.implementation.createHTMLDocument('');

        newDoc.documentElement.innerHTML = this.newDom;
        this.nodes.container.innerHTML = newDoc.querySelector(this.selectors.container).innerHTML;
        this.newDom = '';

        this.nodes.container.removeEventListener('transitionend', this.updateDom.bind(this));
        this.nodes.container.classList.remove(this.transition.class);
    }
}

export default config => new Jazzer(config);
