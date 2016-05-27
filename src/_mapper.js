function( match_node, classifier_matches, loose_match ){
	//function to handle node mapping (returns selector string or false if invalid / unable to map)
	//match_node = DOM node to map
	//classifier_matches = string or array of strings that can be used for classification/mapping
	//loose_match = do we want to perform a loose or an exact match?
	
	if(!match_node || !classifier_matches) return false;

	_LOG("Mapping node:", node);
	_LOG("With classifiers:", classifier_matches);
	var classifier = NodeClassifier( classifier_matches, loose_match ); //create classifier object with matches

	//iterate over current node and parents until we can build a selector with a relative high confidence
	var node = match_node,		//current node to classify while traversing
		selector_chain = [],	//chain of selector data as it's pulled from classifier during parent traversal
		confident = false;		//boolean has classifier returned a high confidence match yet that would allow us from stopping traversal?
	
	while( !confident ){
		if( node.tagName==='BODY' ) break; //reached body during traversal, stop

		var c_data = classifier.input( node, loose_match ); //get current node info from classifier
		selector_chain.push( c_data );

		//if we have reached a high level of confidence from classifier, stop matching if we doing an exact match
		//else keep going for loose match since we don't want to match multiple else so continue traversal
		if( selector_chain[ selector_chain.length-1 ].confidence===CONFIDENCE.high && !loose_match ) break;

		node = node.parentNode;
	}

	_LOG("Final selector chain:",selector_chain);

	var selector_str = tools.build_selector_str( selector_chain, loose_match );

	_LOG("Final selector string:",selector_str);

	return selector_str;

}