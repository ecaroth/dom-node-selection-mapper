function( matches, loose_match ){
	//takes in a set of possible classifier matches, a (bool) perform loose match, and returns an object that exposes 1 function 
	//named 'input'. Input takes in a DOM node (which is current node in parent traversal), classifies, and returs
	//a data object in the format:
	//{ node: (DOM Node) node from input,
	//  matches: (array) of attribute matches in the format [attr,match_value],
	//  confidence: (int) confidence value from CONFIDENCE, indicating how confident we are in the match }


	if( typeof matches === 'string' ) matches = [matches]; //cast to array if string match is passed in
	matches = matches.map(function(v){ return v.toLowerCase(); }); //convert to lowercase for matching

	//attribute confidence for match - high confidence means start of selector string
	var ATTR_CONFIDENCE = {
		'id': 			CONFIDENCE.high,
		'name': 		CONFIDENCE.high,
		'class': 		CONFIDENCE.med,
		'value': 		CONFIDENCE.med,
		'title': 		CONFIDENCE.low,
		'placeholder': 	CONFIDENCE.low
	};

	function _input( node ){
		//main function to pass input node to for matching
		_LOG("---Matcher iteration node",node);

		var attr_matches = [],
			confidence = 0;

		for(var attr in ATTR_CONFIDENCE){
			//iterate through each possible attribute for classifier matching and see if there is a match

			var attr_val = node.getAttribute(attr);
			if(!attr_val) continue; //no matching attribute on the node

			var check_vals = [attr_val.trim()];

			//we have to split class names by spaces, but everything else is a straight match against atribute value
			if(attr==='class'){
				check_vals = check_vals[0].replace(/  +/g, ' ').split(/\s+/g);
			}

			_LOG("Matcher check vals",check_vals);

			check_vals.forEach(function(check){
				matches.forEach(function(match){
					//see if check matches for this attribute check value and determine current confidence
					var ind = check.toLowerCase().indexOf(match);
					if( ind !== -1 ){
						var css_attr_val = check;
						if(loose_match){
							//fix case for loose match - if check val was 'City_1', but check was 'city',
							//set the match value to be 'City' (preserving case and allowing loose match)
							css_attr_val = check.substr(ind, match.length ); 
						}
						attr_matches.push( [attr, css_attr_val] );
						confidence = Math.max( confidence, ATTR_CONFIDENCE[attr] );
					}
				});
			});

			_LOG("Attribute selector matches",attr_matches);

			//filter attr_matches to only include highest confidence attributes for brevity
			for( var i=attr_matches.length-1; i>=0; i-- ){
				if( ATTR_CONFIDENCE[attr_matches[i][0]] < confidence ){
					attr_matches.splice( i, 1 );
				}
			}
			_LOG("Attr selectors after stripping for confidence",attr_matches);
		}

		return {
			node: node,
			confidence: confidence,
			matches: attr_matches
		};

	}

	//expose input function
	return{
		input: _input
	};
}