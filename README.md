# DOM Node Selection Mapper

This is a client-side JS library that allows you to pass in an HTML Element node and identifiable string(s) associated with that node, and builds a resuable CSS selector string that allows you to target that same node again in the future.

It conforms to [CSS Level 3](https://www.w3.org/TR/css3-selectors/) specifications, and builds selectors that are usable directly from javascript (aka ```document.querySelectorAll```) or via jQuery's sizzle selector engine.

It also allows you to build _loose_ selectors that can be flexible as the page format & item attributes change, or high-specificity selectors that target element attributes with exact matching based on your classifiers (such as ID & name attributes).

*Authored by* [Evan Carothers](https://github.com/ecaroth)

What can I use this library for?
------

It is ideally designed for use cases where a user selects an element on an HTML page, and you need to programatically target that same element in the future (on this _exact_ page , or pages with similar structure/formatting).

Installation
------

The package is available directly on github, or via package management (bower / npm):
```
bower install dom-node-selection-mapper --save
```
```
npm install git+https://github.com/ecaroth/dom-node-selection-mapper --save
```

Usage
------

Include the script file `/dist/dom_node_selection_mapper.min.js` on your webpage. This creates a global object __DOMNodeSelectionMapper__, which exposes a single static function:

####```DOMNodeSelectionMapper.mapNode( node, mappings, loose_match)``` 
> `node` _(HTML Element)_ DOM node that you wish to map selector for
> 
> `mappings` _(string or array of strings)_ Matches that you want to use when building the selector string that can help identify the node and it's parents
>
> `loose_match` _(boolean)_ Allow loose attribute matching based on mapping values, else uses strict attribute matching which can tighten up selector specificity, but also allows for less flexibility in the selector reuse if you expect changes in IDs/classnames/etc
>
> `parent` _(HTML Element, window, or document)_ The parent element that you wish to use to map against. If omitted, the BODY element of the current HTML page will be used. To do things like map within iframes, you can pass in the iframe object/contentWindow/document (please note that cross-origin restrictions apply)

For example, given the following HTML fragment:
```HTML
<body>
    <form>
        <div class="row address">
            <label>
                <input name="street" id="street_1" placeholder="Enter your street">
            </label>
            <label>
                <input name="city" id="city_1" placeholder="Enter your city">
            </label>
        </div>
        <div class="row address">
            <label>
                <input name="street" id="street_2" placeholder="Enter your street">
            </label>
            <label>
                <input name="city" id="city_2" placeholder="Enter your city">
            </label>
        </div>
    </form>
</body>
```
you can leverage the object to build reusable selectors to the **id="city_2"** input like so:
```javascript
var node = document.getElementById('city_2');
var selector = DOMNodeSelectionMapper.mapNode( node, ['address','city'], false );
```
with _loose_match_ set to **true** you would get a resulting selector string like:
> __FORM > DIV[class*="address"]:nth-of-type(2) INPUT[id*="city"][name*="city"]__

and with _loose_match_ set to **false** you would get a resulting selector string like:
> __INPUT[id="city_2"][name="city"]__


Specificity and mapping inputs
------

You will notice that for non-loose matching, more specificity is used which often means more brevity for the selector. And, when a match with high confidence can be found (aka with an ID or name attribute) then the selector mapping ends there matching the specific high-confidence values, since that will be adequite for reuse.

In the example above, you are able to get a more replicatable match by providing more than  1 item in **mappings**. If you were to simply pass in 'city' you would get a loose match result like:
> __FORM > DIV:nth-of-type(2) INPUT[id*="city"][name*="city"]__

Loose matching is intended for use cases where the context of the DOM node on the page might not be consistent, but you want to try and match it if possible. It _can_ lead to edge cases where more than 1 element on the page can be matched from the generated selector, but it usually does a good job of coercing the selector to include only the specificity it needs to match in the current context and leave it flexible enough for reuse.

Development
------

The dev server runs on localhost:3003. Once running you can load the JS in running local pages from _localhost:3003/dom_node_selection_mapper.js_

```
npm install
npm run dev
```

When working with the `DOMNodeSelectionMapper` object, you can enable a debug mode with verbose logging by setting the debug param to true

```javascript
DOMNodeSelectionMapper.debug = true;
```

There is an example of a page you can use locally for development in `dev/sample_dev_page.html`

### Testing

The test suite builds and checks for exact and loose matches in variety of HTML templates in the /test/templates directory.
To execute the tests you must install all the npm dependencies
```
npm test
```

### Building for distribution

You can generate the needed (dev & minified) files by running the gulp build command, which builds scripts in the _/dist_ directory
```
gulp build
```