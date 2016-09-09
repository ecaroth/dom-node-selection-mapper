(function( module ){
	"use strict";

	const cssesc = <<CSS_ESCAPE>>

	const tools = {
		css_selector_escape: (val, as_identifier) => {
			return cssesc( val, {
			  'isIdentifier': as_identifier,
			  'quotes': 'double'
			});
		},
		build_selector_str: <<SELECTOR>>
	};

	//define confidence levels
	const CONFIDENCE = Object.freeze({
			'low': 	1,
			'med': 	2,
			'high': 3
		});
	
	const NodeMatcher = <<MATCHER>>; //instantiated in _matcher.js

	//define main object w/ available globally accessible params/functions
	const main = {
		  debug: false,					//can be set directly to true/false
		  mapNode: <<MAPPER>> 			//main mapping function
	};
	
	//logging function (used when main.debug===true)
	function _LOG( str, val ){
		if(!main.debug) return;
		console.log(`DOM-SEL>> ${str,val}`);
	}

	module.DOMNodeSelectionMapper = main;

})( (typeof exports !== 'undefined') ? exports : window );