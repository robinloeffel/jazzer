# jazzer
[![jazzer on npm](https://img.shields.io/npm/v/jazzer.svg?style=flat-square)](https://www.npmjs.com/package/jazzer)

[jazzer](https://robinloeffel.ch/jazzer) lets you easily freshen up your site and improve its memorability by _a bunch_. You know these short white flashes when changing between pages? Ugggh, right? jazzer fixes that. It lets you control exactly what should visually happen when clicking on an internal link. Install it, import it, configure it. Give your project the sexyness it deserves!

## How to Install
You can install and use jazzer in one of two ways. Install it in a terminal with either yarn or npm and later import / require it somewhere along the line.
```
// your terminal
yarn add jazzer --save

// your script
import jazzer from 'jazzer';
```
Or, if this whole node stuff just isn't your style, no worries. Download the latest release from [here](https://github.com/rbnlffl/jazzer/releases/latest) or reference it from some CDN and add it to your DOM in a script tag.
```
// your html
<script src="jazzer.js"></script>
```

## Setting up jazzer
Setting up jazzer is _fast_. Whip this up somewhere in your code and you're almost good to go.
```
// your script
jazzer();
```
Now you need to add two things to your DOM: An element with the id `jazzer` and some links with the attribute `data-jazzer-trigger`. When clicking on `data-jazzer-trigger`, jazzer will look for the `href` attribute on the clicked link and load the contents of the HTML document laying there. If it could identify an element with the same id, in our case `jazzer`, in the loaded document, it will replace the contents of the `#jazzer` on this document with the contents of the `#jazzer` of the loaded document. That's how simple it is.

A document body, ready to be manipulated by jazzer, looks something like this:
```
<body>
    <header>
        <a href="faq.html" data-jazzer-trigger>Imma trigger jazzer!</a>
    </header>

    <main id="jazzer">
        <p>I will be replaced via AJAX! Whoop, whoop!</p>
    </main>

    <script src="jazzer.min.js"></script>
    <script>
        jazzer();
    </script>
</body>
```

## Adding the Jazz
jazzer will apply a class of your choosing, or if you just roll with the defaults, `jazzer-changing` to your container `#jazzer`, while performing the AJAX request and changing the markup. This gives you full control over what should visually happen on your page, while everything gets loaded and injected in the background. The CSS of the [demo page](https://robinloeffel.ch/jazzer) looks like that:
```
#jazzer {
    transition: opacity .5s ease-in-out, transform .5s ease-in-out;
}

.jazzer-changing {
    opacity: 0;
    transform: scale(.75) translateY(100px);
    pointer-events: none;
}
```

## Custom Settings
Of course you can configure jazzer to float your boat if you're not content with the defaults. The configurable values are `links`, `container`, `changeClass`, `duration` and `url`. You can give jazzer an object with (some of) these properties when calling it. Here's an example:
```
jazzer({
    links: '.i-will-trigger-jazzer-on-click',
    container: '#my-contents-will-change',
    changeClass: '.i-get-applied-to-container-when-changing',
    duration: 10000, // love me some long animations
    url: false // i don't want jazzer to change the url
});
```
When working with your own values, or in general, make sure to synchronize the `duration` property with the `transition-duration` of `container`. As mentioned, you don't need to overwrite all of these. You can just modify the ones you want to change and leave the rest be. The defaults are:
```
links = '[data-jazzer-trigger]';
container = '#jazzer';
changeClass = 'jazzer-changing',
duration = 500;
url = true;
```

## Browser Compatibility
This package is functional on
- Internet Explorer 11
- Microsoft Edge
- Google Chrome
- Mozilla Firefox
- Apple Safari (WebKit in general)

## Licence
MIT

Created by [Robin Löffel](https://robinloeffel.ch), 2017
