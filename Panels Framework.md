# Panels Framework
## Panels is a simple SPA framework that uses Vue & Grapnel (look into named routes). (Promises would be nice to).

### Example Panels App:

```javascript
var app = new Panels({
	// …
});

var home = new app.Panel({
	// Undefined === use first <panel-output> on page
	parentEl: document.getElementById(‘main’),
	
	// Undefined === added programatically only
	route: ‘/jobs/:id’,
	
	// Required (or template)
	templateUrl: ‘views/home.pnl’,
	
	// Requried (or templateUrl)
	template: ‘<h1>Dickbutt</h1>’,
	
	// Defaults false
	append: false,
	
	// Defaults false (unless route has a parent, but if no parentEl or <panel-output> found, it replaces)
	appendChild: true,
	
	// Undefined === ‘div’
	tag: ‘header’,
	
	// If true, logic from the template file will be used
	templateLogic: false
}, {
	data: { … },
	methods: { … }
	// …
}, {
	init: function () { … }
});
```

### Panel
`Panel(opts, vue, logic)`

- `opts` contains the panels options
- `vue` contains the Vue contents
- `logic` contains the logic (has access to `this.app` (core app stuff like router) & `this.v` (vue data from above) )

### Templates
```html
<template class=“butts” data-dick=“butts”>
	<a route=“[‘/job/:id’, {id:’22’}]”>Link</a>
	[…]
</template>

<script>
	v = {
		data: { … },
		methods: { … }
		// …
	};

	exports = {
		init: function () { … }
	};
</script>
```

Templates like the above allow for html & additional logic (merged with panel where possible, panel takes priority?). All attributes on the template are added to the parent element when the template is rendered. Only one template tag and one script tag are allowed (the first of each will be used)

If a template file does not include a template tag, the entire file will be treated as the template, and any script tags will not be merged.

Templates can be any filetype, but `.pnl` (or whatever) should support Vue syntax highlighting in WebStorm (hopefully).

### Replace / Append
By default, panels will replace their predecessor (if they share a `parentEl`). If `append` is **true** (default is *false*), the panel will be appended to the parent (no containing tag).

If `appendChild` is **true**, the panel will be appended within it’s tag. If the parent contains an `<panel-output></panel-output>` tag, the child will replace that tag (only one child tag per parent?)

### Programatically Opening Panels
If a panel does not have a route, it can only be opened programatically using `myPanel.open()` (and closed using `myPanel.close()`) (useful for modals).

### Routing
The attribute `route` will be parsed and the `href` attribute will be populated accordingly. If the route is the current route, the class `active` will be added to the element (can be configured).