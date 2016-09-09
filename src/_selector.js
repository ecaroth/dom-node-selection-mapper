(chain, loose_match) => {
	//build a selector string based on chained result data

	//generate selector from stack of selector pieces
	function _sel_from_stack( parts ){
		return parts.slice().reverse().join(" ").replace(/\\/g, "\\");
	}

	function _test_for_child_collision( parts, c_data, node ){

		let match_sel = _sel_from_stack( parts );

		let el_matches =  Array.from( node.parentNode.querySelectorAll( match_sel ) );
		if( el_matches.length === 1 ) return false; //no nth-child needed

		//check siblings of type to find the nth-of-type match for this element
		let siblings = Array.from(node.parentNode.children),
			node_type_iter = 0,
			match_ind = false;

		siblings.some( sib_node => {
			if(sib_node.tagName !== node.tagName) return false; //continue
			node_type_iter++;

			if(sib_node === node){
				match_ind = node_type_iter;
				return true; //break
			}
		});
		return match_ind;
	}

	function _test_for_uniqueness_with_node_type( parts ){
		let match_sel = _sel_from_stack( parts ),
			el_matches = Array.from( document.querySelectorAll( match_sel ) );
		return el_matches.length === 1;
	}

	function _build_selector_from_chain( chain, check_for_node_collission ){
		let parts = [],
			used_last = false,
			last_was_node_match = false;			

		chain.some( (c, i) => {	
			let sel = "", 
				this_used_node_match = false;

			sel += c.node.tagName;
			//then comes any attribute selectors
			c.matches.forEach( match => {
				let comparator = loose_match ? '*=' : (match[0]==='class' ? '~=' : '=');
				//creates attribute based selector w/ case insensitive matching
				sel += `[${match[0]}${comparator}"${tools.css_selector_escape(match[1],false)}"]`;
				
			});

			//if we are doing a loose match and there are no matches, see if we can use the nodeType from the node 
			//to see if the element is uniquely identified on the page. If so, stop building the selection chain
			if(check_for_node_collission){

				if(loose_match && c.matches.length === 0){
					//check to see if direct parent match will satisfy for loose match
					if(used_last){
						let temp_node_sel = `${sel} >`;
						if( _test_for_uniqueness_with_node_type( parts.concat([temp_node_sel]) ) ){
							//was unique with general parent match, should be good for loose match
							parts.push( temp_node_sel );
							return true; //break
						}
					}
					//check to see if general (non-parent match) will satisfy for loose match
					if( _test_for_uniqueness_with_node_type( parts.concat([sel]) ) ){
						//was unique with specific parent match, should be good for loose match
						parts.push( sel );
						return true; //break
					}
				}

				//now, check against nth-child collision

				let temp_sel = sel;
				if(used_last) temp_sel += ' >'; //temporary sel for testing
				
				let nth_child = _test_for_child_collision( parts.concat([temp_sel]), c, c.node );
				if(nth_child){
					sel += `:nth-of-type(${nth_child})`;
					this_used_node_match = true;
				}
			}

			if(c.matches.length === 0 && i !== 0 && !last_was_node_match && !this_used_node_match){
				used_last = false;
				return;
			}

			last_was_node_match = this_used_node_match;

			//check for immediate child match
			if(used_last) sel += ' >';

			used_last = true;

			parts.push( sel );
		});

		return _sel_from_stack(parts);
	}

	return _build_selector_from_chain(chain, true);
}