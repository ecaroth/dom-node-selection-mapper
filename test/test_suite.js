"use strict";

const expect = require('chai').expect,
	fs = require('fs'),
	jsdom = require('mocha-jsdom'),
	rerequire = jsdom.rerequire;

describe('test functionality', function() {

	jsdom({
		useEach: true,
		skipWindowCheck: true
	});

	var $, mapper;

	beforeEach(function() {
    	//initialize the page, document, and jquery
    	$ = rerequire('jquery');
    	mapper = rerequire('../dist/dom_node_selection_mapper.js').DOMNodeSelectionMapper;
    	//mapper.debug = true;
    });

	//function to build and check selector against intended node
	function check_selector( $el, matches, loose, parent ){

		if(!parent) parent = document.body;
		//console.log("EL:", $el);

		expect($el.length).to.equal(1); //make sure jquery element is a single
		var sel = mapper.mapNode( $el[0], matches, loose, parent ); //build selection

		//console.log("SEL: ",sel);
		expect( sel ).to.not.equal( false ); //expect result to not be false

		//test selector funcitonality w/ css3 + querySelectorAll
		var nodes = parent.querySelectorAll( sel ); //select num nodes with query sel
		expect( nodes.length ).to.equal( 1 ); //verify 1 node was selected
		expect( nodes[0] ).to.equal( $el[0] ); //verify node is exact node
		
		//test same functionality with jquery
		nodes = $(parent).find( sel );
		expect( nodes.length ).to.equal( 1 );
		expect( nodes[0] ).to.equal( $el[0] );

		return sel;
	}

	//set a template for the current test
	function set_template( name ){
		document.body.innerHTML = fs.readFileSync('./test/templates/'+name+'.html');
	}

	describe('parent object coercion & iframe support', function(){

		//TODO - implement a test for iframe

	});

	describe('multiple address inputs in form', function(){

		beforeEach(function() {
			set_template( 'test_address_form' );
		});

		it('providing parent_node works on child elements', function(){
			var $parent = $('section');
			check_selector( $('#my_city'), ['city'], true, $parent[0] );
			check_selector( $('#my_city'), ['city'], false, $parent[0] );
		});

		it('label wrapped input with placeholder and id placeholder is ignored',function(){
			check_selector( $('#city_1'), ['city'], true );
			check_selector( $('#city_1'), ['city'], false );
		});

		it('select with 2 high confidence mactches ignores traversal', function(){
			check_selector( $('#state_2'), ['state','address'], true );
			check_selector( $('#state_2'), ['state','address'], false );
		});

		it('input in class wrapped with nth child and no matching attr', function(){
		    check_selector( $('#home_2_1'), ['address'], true );
			check_selector( $('#home_2_1'), ['address'], false );
		});

		it('label wrapped input with non matching attr', function(){
			check_selector( $('#mailing_1_1'), ['address'], true );
			check_selector( $('#mailing_1_1'), ['address'], false );
		});

		it('label wrapped input with placeholder and non matching input', function(){
			check_selector( $('#postal_code_1'), ['zip'], true );
			check_selector( $('#postal_code_1'), ['zip'], false );
		});

		it('input selected with widely used presence and different wrapping works', function(){
			check_selector( $('#city_1'), ['city','address'], true );
			check_selector( $('#city_1'), ['city','address'], false );
			check_selector( $('#city_1'), ['city'], true );
			check_selector( $('#city_1'), ['city'], false );

			check_selector( $('#city_2'), ['city','address'], true );
			check_selector( $('#city_2'), ['city','address'], false );
			check_selector( $('#city_2'), ['city'], true );
			check_selector( $('#city_2'), ['city'], false );

			check_selector( $('#my_city'), ['city','address'], true );
			check_selector( $('#my_city'), ['city','address'], false );
			check_selector( $('#my_city'), ['city'], true );
			check_selector( $('#my_city'), ['city'], false );
		});

	});

	describe('crazy attributes and selectors', function(){
		beforeEach(function() {
			set_template( 'test_crazy_attr_values' );
		});

		it('odd chars with nth child', function(){
			check_selector( $('#test_input1'), ['biz','foo'], true );
			check_selector( $('#test_input1'), ['biz','foo'], false );
		});

		it('odd chars in class name', function(){
			check_selector( $('#bar_input2'), ['test'], true );
			check_selector( $('#bar_input2'), ['test'], false );
		})

	});

	describe('nested classes basic', function(){
		beforeEach(function() {
			set_template( 'test_nth_child_support' );
		});

		it('nth child support for class names',function(){
			check_selector( $('#sample2'), ['test'], true );
			check_selector( $('#sample2'), ['test'], false );
		});

		it('class names multi selectors',function(){
			check_selector( $('#sample3'), ['test','foo'], true );
			check_selector( $('#sample3'), ['test','foo'], false );
		});

		it('selector that matches name',function(){
			check_selector( $('#sample3'), ['test','thing'], true );
			check_selector( $('#sample3'), ['test','thing'], false );
		});

	});

});