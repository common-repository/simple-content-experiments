<?php
/**
 * @package content-experiments
 * @version 3.1.1
 */
/*
Plugin Name: Simple Content Experiments
Description: Shortcodes to create Google Content Experiments elements in a page
Author: Lon Koenig (Firebrand LLC)
Version: 3.1.1
Author URI: //firebrand.net/

Calls the Google Experiments API:
https://developers.google.com/analytics/solutions/experiments-client-side#implement-send
Implement the following shortcodes:
[experiment][/experiment]
[ex_variant][/ex_variant]


sample:

[experiment id="EXPERIMENT ID"]
	[ex_variant]
		content for first variation
	[/ex_variant]
	[ex_variant]
		content for second variation
	[/ex_variant]
[experiment]
	

		
*/
// error_reporting(E_ALL | E_STRICT);


$content_experiments_plugin = new SimpleContentExperimentsPlugin();
$content_experiments_plugin->enable();

class SimpleContentExperimentsPlugin {

	public $shortcode = null;
	private static $variant_counter = 0;
	private static $experiment_id = null;
	private static $errmsg = '';
	public $debug_enable = 'false';

	public function __construct() {
	}
	
	function enable() {
	error_reporting(E_ALL | E_STRICT);
		add_action('wp_head', array($this, 'head_javascript'));
		add_action( 'wp_enqueue_scripts', array($this, 'load_scripts') );
		add_shortcode('experiment', array($this, 'process_experiment'));
		add_shortcode('ex_variant', array($this, 'process_ex_variant'));
	}

	function disable() {
		remove_shortcode('experiment');
		remove_shortcode('ex_variant');
	}


	function load_scripts($atts, $content = '') {
	/* ----------------------------------------------------
		Enque any scripts we might need. (Like jQuery)
	*/
   		wp_enqueue_script( 'jquery' );
   		// wp_enqueue_script( plugin_dir_url( __FILE__ ) . 'simple-content-experiments.js');
		wp_enqueue_script( 'simple_content_experiments', plugin_dir_url( __FILE__ ) . 'simple-content-experiments.js', array('jquery') );
	}

	function process_experiment($atts, $content = '') {
	/* ----------------------------------------------------
		shortform processor: 'experiment'
		Inputs:
			$atts - array of attributes specified in the shortcode
			$content - if this shortcode wraps around content, this is that content
			
		Outputs:
			returns rendered HTML
			
		This basically just resets the variant counter and calls do_shortcode to 
		process the variants inside the [experiment] shortcodes and adds the 
		Javascript needed to select them
	*/
	
		// reset the variation counter for this experiment group:
		self::$variant_counter = 0;
		$normalized_atts = shortcode_atts( array('id' => ''), $atts,  'experiment');
		self::$experiment_id = $normalized_atts['id'];
		
		// we process the content before building the 
		// JavaScript so we know how many variants there are.
		$processed_content =  trim( do_shortcode( shortcode_unautop($content) ) );
		


		return $processed_content;

	}
	


	function process_ex_variant($atts, $content = '') {
	/* ----------------------------------------------------
		shortform processor: 'ex_variant'
		Inputs:
			$atts - array of attributes specified in the shortcode
			$content - if this shortcode wraps around content, this is that content
			
		Outputs:
			returns rendered HTML
			
		Creates the individual variants of this experiment.
	*/
		
		self::$variant_counter++;
		$variant_div = self::$experiment_id  . '__' . self::$variant_counter;
		if (null == self::$experiment_id){
			$outStr = 'no experiment ID set up';
		} else {
		
			$outStr = '<div id="' . $variant_div .'"'
				.' class="contentexperimentvariant"'
				.' data-contentexperimentid="' . self::$experiment_id . '"';
			if ( 1 != self::$variant_counter){
				$outStr .= ' style="display:none;"';
			}
			$outStr .= ">\n";
			$outStr .= trim( do_shortcode( shortcode_unautop($content) ) );			  
			$outStr .= "</div>\n";
			return $outStr;
		}
	
	}



	function head_javascript() {
	/* ----------------------------------------------------
		echo out the required javascript
	*/
	// pass the user setting for debug mode into JavaScript
	$debug_enabled = 'false';
	echo '
	<!-- JavaScript init for Simple Content Experiments plugin: -->
	<script>
	// Object.keys polyfill for IE8 and below
	if (!Object.keys) Object.keys = function(o) {
		if (o !== Object(o))
			throw new TypeError("Object.keys called on a non-object");
		var k=[],p;
		for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
		return k;
	}';
	if ( (defined('WPSCE_DEBUG')) AND (true == WPSCE_DEBUG)){
		$debug_enabled = 'true';
	}
	echo "\n"
		. "var simple_content_experiements_debug = "
		. $debug_enabled
		. ";\n";

	echo '</script>';
	}



	

}

