function( chain, loose_match ){
	//build a selector string based on chained result data

	function _sel_from_stack( parts ){
		return parts.slice().reverse().join(" ").replace(/\\/g, "\\");
	}

	function _test_for_child_collision( parts, c_data, node ){

		var match_sel = _sel_from_stack( parts );

		var el_matches =  Array.from( node.parentNode.querySelectorAll( match_sel ) );
		//console.log("MATCHES",el_matches);
		if( el_matches.length === 1 ) return false; //no nth-child needed

		//just check immediate siblings now
		el_matches = Array.from( node.parentNode.querySelectorAll( _build_selector_from_chain([c_data],false) ) );
		if(el_matches.length === 1 ) return false;

		var match_ind = false;
		el_matches.some(function(el,ind){
			if( el === node ){
				match_ind = ind+1; //nth-child selector uses 1 based indexes
				return true;
			}
		});
		return match_ind;
	}

	function _build_selector_from_chain( chain, check_for_child_collission ){
		var parts = [],
			used_last = false,
			last_was_nth_child = false;

		for(var i=0, len=chain.length; i<len; i++){
			var c = chain[i],
				sel = "";

			var this_used_nth_child = false;

			sel += c.node.tagName;
			//then comes any attribute selectors
			c.matches.forEach(function(match){
				var comparator = loose_match ? '*=' : (match[0]==='class' ? '~=' : '=');
				//creates attribute based selector w/ case insensitive matching
				sel += '[' + match[0] + comparator + '"' + tools.css_selector_escape(match[1],false) + '"]';
				
			});

			if(check_for_child_collission){
				var temp_sel = sel;
				if(used_last) temp_sel += ' >'; //temporary sel for testing
				var nth_child = _test_for_child_collision( parts.concat([temp_sel]), c, c.node );
				if(nth_child){
					sel += ':nth-of-type('+nth_child+')';
					this_used_nth_child = true;
				}
			}

			if(c.matches.length===0 && i!==0 && !last_was_nth_child && !this_used_nth_child){
				used_last = false;
				continue;
			}

			last_was_nth_child = this_used_nth_child;

			//check for immediate child match
			if(used_last) sel += ' >';

			used_last = true;

			parts.push( sel );
		}
		return _sel_from_stack(parts);
	}

	return _build_selector_from_chain(chain, true);
}