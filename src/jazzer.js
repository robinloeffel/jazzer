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

        window.addEventListener('popstate', this.loadContent.bind(this));
    }

    loadContent(event) {
        event.preventDefault();

        const href = event.state ? event.state.path : event.currentTarget.href || location.href;

        fetch(href).then(req => req.text()).then(text => {
            this.updatePage(text, href);
        });
    }

    updatePage(dom, href) {
        this.nodes.container.classList.add(this.transition.class);

        setTimeout(() => {
            let newDoc = document.implementation.createHTMLDocument('');

            newDoc.documentElement.innerHTML = dom;
            this.nodes.container.innerHTML = newDoc.querySelector(this.selectors.container).innerHTML;

            if (this.url) {
                document.title = newDoc.title;

                history.pushState({
                    path: href
                }, newDoc.title, href);
            }

            this.nodes.container.classList.remove(this.transition.class);
        }, this.transition.duration);
    }
}

export default config => new Jazzer(config);
