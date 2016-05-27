(function( module ){
	"use strict";

	var cssesc = <<CSS_ESCAPE>>

	var tools = {
		css_selector_escape: function( val, as_identifier ){
			return cssesc( val, {
			  'isIdentifier': as_identifier,
			  'quotes': 'double'
			});
		},
		build_selector_str: <<SELECTOR>>
	};

	//define confidence levels
	var CONFIDENCE = {
			'low': 	1,
			'med': 	2,
			'high': 3
		},
		NodeClassifier = <<CLASSIFIER>>; //instantiated in classifier.js

	//define main object w/ available globally accessible params/functions
	var main = {
		debug: false,					//can be set directly to true/false
		mapNode: <<MAPPER>> 			//main mapping function
	};
	
	//logging function (used when main.debug===true)
	function _LOG( str, val ){
		if(!main.debug) return;
		console.log("DOM-SEL>> "+str,val);
	}

	module.DOMNodeSelectorMappingClassifier = main;

})( (typeof exports !== 'undefined') ? exports : window );