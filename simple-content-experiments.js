// our global experiment object:
var content_experiment = {
	id: "",
	variant_count:0,
	selected: 0,
	event_flavor: "unknown", // no default
	ga_name: '', // function name of Universal Analytics functions
	analytics_flavor: "unknown",
	cx_loaded: "pending", // has the content experiments code loaded?
	event: {
		category: "Simple Experiment",
		action: "notset",
		label: "",
		value: 0
	},
	ex_list: {}, // list of experiments (as marked up in DOM)
	dbgmsg: function(str){
		if (typeof simple_content_experiements_debug !== 'undefined' && simple_content_experiements_debug){ console.log(str);} // uses global simple_content_experiements_debug
	},
	
	/**
	 * Returns the currently running "flavor" of Google Analytics
	 * @returns {string} unknown | gtm | classic | universal
	 */
	get_analytics_event_flavor: function(){
		var retval = "unknown"
		// check for Google Tag Manager data layer functions
		if (typeof dataLayer !== "undefined" && typeof dataLayer.push === "function" ) {
			retval = "gtm";
		}
		
		// check for "classic" Google Analytics (_gaq)
		if ( "unknown" == retval){
			if  (typeof _gaq !== "undefined" && typeof _gaq.push === "function") {
				retval = "classic";
			}
		}
		
		// check for "Universal" Analytics (ga)
		if ( "unknown" == retval){
			if ( "string" == typeof window["GoogleAnalyticsObject"]){
				this.ga_name = window["GoogleAnalyticsObject"];
				retval = "universal";
			}
		}
		this.analytics_flavor = retval;
		return retval;
	},
	/**
	 * Updates the DOM to display the selected variant and 
	 * remove the other variations.
	 * @param {number} selected_variation - which variation to display
	 */
	display_experiment: function(selected_variation){
			this.dbgmsg("display_experiment()");
			this.event.label = this.id;
			this.event.action = "select";
			this.event.value = selected_variation;
			this.dbgmsg("chosenExperiment = " +  this.id );
			this.dbgmsg("number of variations: " + this.variant_count);
			this.dbgmsg("chosenVariation = " + selected_variation);
			for ( i = 1; i <= this.variant_count; i++) {
				if ( (i - 1) == selected_variation) { // 0 based
					 this.dbgmsg("showing variant " + i + ": " + this.id + "__" + i);
					jQuery("#" + this.id + "__" + i).show();
				} else {
					  this.dbgmsg("hiding variant " + i + ": " + this.id + "__" + i);
					jQuery("#" + this.id + "__" + i).remove();
				}
			}

	
	},
	analytics_event: function(){
		this.dbgmsg("analytics_event()");
		this.dbgmsg("analytics type: " + this.event_flavor);
	
	// sometimes the scripts load in the wrong order and Google Analytics won\'t get an event from chooseVariation()
			// Send any event to analytics to solve this:
			
			switch (this.event_flavor){
				case "classic": 
					_trackEvent( // category, action, opt_label, opt_value, opt_noninteraction
						this.event.category, 
						this.event.action, 
						this.event.label, 
						this.event.value, 
						true
					);
					this.dbgmsg("_trackEvent  posted ");
					break;
				
				case "gtm":
					dataLayer.push({
						  "event" : "SimpleXGAEvent",
						  "eventCategory" : this.event.category,
						  "eventAction" : this.event.action,
						  "eventLabel" : this.event.label,
						  "eventValue" : this.event.value,
						  "nonInteraction": true
					});
					this.dbgmsg("dataLayer.push  posted ");
					break;
				case "universal":
					window[this.ga_name]("send", "event", 
						this.event.category, 
						this.event.action, 
						this.event.label, 
						this.event.value, 
						{ nonInteraction: true }
					);
					this.dbgmsg( this.ga_name + " event posted ");
					break;
				default:
					this.dbgmsg("event_flavor: " + this.event_flavor);
			}

	},
	run_experiment: function(){
		this.dbgmsg("run_experiment");
		// create list of experiments (as marked up in DOM) and how many variations:
		jQuery( ".contentexperimentvariant" ).each(
			function( ) {
				var v_id = jQuery( this ).attr("data-contentexperimentid");
				if( "undefined" == typeof content_experiment.ex_list[v_id] ) {
					content_experiment.ex_list[v_id] = 0;
				}
				content_experiment.ex_list[v_id]++;
			}
		);
		// this.ex_list is object of experiment ID with counts
		var keys = Object.keys(this.ex_list);
		if (keys.length > 0){ // no experiments
			this.dbgmsg("detected " + keys.length + " experiment(s).");
			// pick an experiment to run on this page:
			var i =  Math.floor((Math.random() * keys.length)); // 0 based
			this.id = keys[i];
			this.variant_count = this.ex_list[this.id];
			jQuery.getScript(
				"//www.google-analytics.com/cx/api.js?experiment=" + content_experiment.id, 
				function(){ // callback function after lib is loaded:
					// Note that the library has been loaded:
					content_experiment.cx_loaded = "loaded_and_called";
				
					// Ask Google Analytics which variation to show the user:
					content_experiment.selected = cxApi.chooseVariation(); // 0 based options
					// Add some extra data for event tracking:
					for ( i = 1; i <=  content_experiment.variant_count; i++) {
						jQuery("#" + content_experiment.id + "__" + i).find("a").attr("data-xvariant", i);
						jQuery("#" + content_experiment.id + "__" + i).find("a").addClass("xvariantclick");
					}
					
					
					
					if ("loaded" == content_experiment.cx_loaded.substr( 0, 6 )){
						// Sanity check some values:
						if ("unknown" == content_experiment.analytics_flavor){
							content_experiment.dbgmsg("No analytics");
							content_experiment.selected = 0;
						}
						if (content_experiment.selected > content_experiment.variant_count){
							content_experiment.selected = 0;
							content_experiment.dbgmsg("selection out of range.");
						}
					} else { //loading error
						// fail case is already in the record. Report "not loaded yet" case as an event:
						if ( false !== content_experiment.cx_loaded ){
							content_experiment.dbgmsg("experiments didn't load.");
							content_experiment.label = content_experiment.cx_loaded;
							content_experiment.selected = 0;
						}
					}
					
					//display the chosen view:
					content_experiment.display_experiment(content_experiment.selected);

					content_experiment.analytics_event(); // move this until after we're sure it's loaded?
				}
			)
			.done(function( script, textStatus ) {
				if ( "pending" == content_experiment.cx_loaded ){
					content_experiment.cx_loaded = "loaded";
				}
			})
			.fail(function( jqxhr, settings, exception ) {
			
		
				console.log( "getScript: Triggered ajaxError handler." );
				content_experiment.action = "Fail";
				content_experiment.label = "jQuery.getScript";
				content_experiment.cx_loaded = false;
			})

		} else {
			content_experiment.dbgmsg("no experiments detected.");
		}
	}
};


	

	
	
	/*
	Load the Content Experiment JavaScript API client for the experiment
	we're going to go with jquery getScript so we can pass the experiment ID into API.
	Otherwise, we can't use chooseVariation() and would have to do a lot more processing
	*/	
jQuery(document).ready(function() {
	
			var flavor = content_experiment.get_analytics_event_flavor();
			content_experiment.dbgmsg("flavor: " + flavor);
			content_experiment.event_flavor = flavor;
			if ('gtm' != flavor){
				content_experiment.run_experiment();
			} else {
				content_experiment.dbgmsg("Defering experiment. Let GTM call back.");
			}

		});