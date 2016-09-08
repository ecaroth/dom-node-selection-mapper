function( match_node, classifier_matches, loose_match, parent_node ){
	//function to handle node mapping (returns selector string or false if invalid / unable to map)
	//match_node = DOM node to map
	//classifier_matches = string or array of strings that can be used for classification/mapping
	//loose_match = do we want to perform a loose or an exact match?
	
	if(!match_node || !classifier_matches) return false;

	//if parent_node is not supplied, or if global window is supplied, select body
	if(!parent_node || parent_node.self===parent_node) parent_node = document.body;

	if( ["#document","HTML"].indexOf(parent_node.nodeName) !== -1 || parent_node.self===parent_node){
		//passed in document or HTML as parentNode - select body element
		parent_node = parent_node.querySelector('body')[0];
	}

	//see if an iframe window was passed in as the parent, and if so try and select the document content
	if( parent_node.nodeName === 'IFRAME' ){
		var iframe_doc = (parent_node.contentWindow || parent_node.contentDocument);
		if (iframe_doc.document) iframe_doc = iframe_doc.document;
		parent_node = iframe_doc.querySelector('body');
	}

	_LOG("Parent node:", parent_node);
	_LOG("Mapping node:", match_node);
	_LOG("With classifiers:", classifier_matches);
	var matcher = NodeMatcher( classifier_matches, loose_match ); //create matcher object with classifiers

	//iterate over current node and parents until we can build a selector with a relative high confidence
	var node = match_node,		//current node to match while traversing
		selector_chain = [],	//chain of selector data as it's pulled from matcher during parent traversal
		confident = false;		//boolean has matcher returned a high confidence match yet that would allow us from stopping traversal?
	
	while( !confident ){
		if( node===parent_node ) break;
		
		var c_data = matcher.input( node ); //get current node info from matcher
		selector_chain.push( c_data );

		//if we have reached a high level of confidence from matcher, stop matching if we're doing a loose match
		//else keep going for exact match since we don't want to match multiple so continue traversal
		if( selector_chain[ selector_chain.length-1 ].confidence===CONFIDENCE.high && !loose_match ) break;

		node = node.parentNode;
	}

	_LOG("Final selector chain:",selector_chain);

	var selector_str = tools.build_selector_str( selector_chain, loose_match );

	_LOG("Final selector string:",selector_str);

	return selector_str;

}