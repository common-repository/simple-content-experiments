=== Simple Content Experiments ===
Contributors: firebrandllc, lonkoenig
Donate link: http://firebrand.net
Tags:  testing, google, content experiments, a/b testing, adopt-me
Requires at least: 3.2.1
Tested up to: 4.8
Requires PHP: 5.3.3
Stable tag: 3.1.0
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Use Google Experiments to test content variations within a single page using simple shortcodes.

== Description ==

As of August 2019, Google [no longer allows new Experiments](https://support.google.com/analytics/answer/9366791?hl=en&ref_topic=1745146) using the Experiments API.

So this project will not get updated.

Please use [Google Optimize](https://marketingplatform.google.com/about/optimize/).

---


As part of Analytics, Google offers a free content testing service called [Google Experiments](https://support.google.com/analytics/topic/1745146?hl=en&ref_topic=1120718).

NOTE: Google is deprecating Analytics Content Experiments.
> Google Optimize is the free, preferred way to run experiments. Analytics Content Experiments remain available but are being deprecated in the future. 

We are currently supporting this plugin, but will discontinue support as the Content Experiments API becomes deprecated.

In the simple (page) form of Google Experiments, the user is redirected to a separate page which contains the variation. There are a [number of plugins](https://wordpress.org/plugins/search.php?q=google+experiments) that can help you implement this scheme.

The **Simple Content Experiments** plugin implements the "Client-side" model described in [Content Experiments Without Redirects (Browser-only implementation)](https://developers.google.com/analytics/solutions/experiments-client-side)
This scheme is more complicated to set up, but allows more flexibility. 
The Simple Content Experiments plugin allows you to define sections within a single page that contain multiple variations with simple shortcodes..
For example, you can test if one call-to-action image gets more clicks than another. 



To use this plugin, you will need:

1. Google Universal Analytics installed on your site
1. [A Content Experiment](https://developers.google.com/analytics/solutions/experiments-client-side#define)
1. Your experiment ID (Will be displayed when setting up the experiment above.)

Sample content experiment:
~~~
	[experiment id="EXPERIMENT ID"]
      [ex_variant]
         content for first variation
      [/ex_variant]
      [ex_variant]
         content for second variation
      [/ex_variant]
   [/experiment]
~~~
## Features:
* Allows in-page variations. You don't need to create a whole page for each variation
* Simple shortcode syntax
* Uses Google Experiments API to determine which user sees which variation
* Adds class ("xvariantclick") and custom data attribute ("data-xvariant") which can be used for Analytics event goals and tracking


## Goals and Tracking:
Anchors within an experiment variation get an additional class: "xvariantclick"
This class can be used with Google Tag Manager to create a rule that responds to clicks on those elements.

Note: If you are using Google Tag Manager, you need to create a trigger and tag to have the Experiment run properly.
See the section called "Google Tag Manager" for information on how to set this up.
    
### Google Analytics Experiments:
To track clicked items within an experiment, use these new events in your goal definitions.
You can look for an event where Category = "experiment" or whatever you named your category above.

### Debugging
You can enable JavaScript console log debugging messages by adding the following to your wp-config.php file:
~~~php
/** Enable console log debugging messages for the Simple Content Experiments plugin: */
define('WPSCE_DEBUG', true);
~~~

### Google Tag Manager
As simple as "Simple Content Experiments" is, [Google Optimize](https://www.google.com/analytics/optimize/) is even simpler. And the recommended solution if you're running GTM.

But if you still want to use the old Content Experiments, you can. (For now.)
When running Google Tag Manager, sometimes the Experiments API will run before Analytics is loaded and ready.

Don't worry if that is just programmer-speak, you just need to add a new Tag and Trigger.
Obviously, none of this applies if you're not running Tag Manager.
###Trigger
####Name:
I called mine "AnalyticsLoaded" but you can name it whatever you want.
####Choose Event:
"Page View"
####Configure Trigger:
"Window Loaded"
####Fire On:
"All Page Views"


###Tag
####Name:
Whatever you want. I called mine "SimpleExperimentPlugin"
####Choose Product: 
"Custom HTML" tag

####Configure Tag:
~~~html
<script>
  if("function" == typeof(content_experiment.run_experiment)){
  	content_experiment.run_experiment();
  }
</script>
~~~
####Fire On:
"AnalyticsLoaded" or whatever you named the trigger above.



== Installation ==

###Install from WordPress.org

1. Log into your website administrator panel
1. Go to Plugins page and select "Add New"
1. Search for "Simple Content Experiments"
1. Click "Install Now" on the Content Experiments entry
1. Click Activate Plugin

###Install via ftp

1. Download the plugin zip file using the button above
1. Log into your website administrator panel
1. Go to Plugins page and select "Add New"
1. Click "Upload"
1. Choose your recently downloaded zip file
1. Click the Install Now button
1. Click Activate Plugin

== Requirements ==

+ Google Analytics (Universal Analytics)
+ This version of the plugin requires jQuery 1.6 or higher.

While jQuery is probably already available in your theme, in the unlikely event that it isn't, you can use a plugin like [WP jQuery Plus](https://wordpress.org/plugins/wp-jquery-plus/) to add it to your site.




== Frequently Asked Questions ==

= Can I run whole-page variations with the Simple Content Experiments plugin? =

This version of the plugin only supports in-page variations. There are other plugins that offer the whole page option.

= Do all of the variations get loaded into the user's browser? =

Yes. (Sort of)
Each variation is wrapped in a `<div>` and all of unused variations are removed via JavaScript/jQuery. 

= The shortcodes are visible on the rendered page. What went wrong? =
Make sure the plugin is activated.

If you're running an experiment outside the regular Post/Page content, please describe where you're putting the experiment in the support forum. 

= Can I run experiments on widgets? =
You can use the shortcodes to create variant content within a text widget. The current version does not have built-in mechanisms for swapping whole widgets or sidebars.

= Can I run multiple experiments at the same time? =
Yes, but it's probably more complicated than you think...
You can define more than one experiment on a page.
But unless your experiments are completely independent, they will skew each other's results and make the results Google generates incorrect.

Our solution is to only run one experiment per user per page view.  
1. Scan the page for experiments.
1. If more than one experiment is available, pick one at random.
1. Make a call to the Google Content Experiments API to determine if this visitor is part of this experiment, and which variation they should see.
1. Display the appropriate variation.
The only issue we've found with this model is that if you have experiments with different group sizes (100% of visitors vs 20% of visitors, for example), those groups will get skewed. The test results are still valid, but it may take longer to complete a test since users may be diverted to a different test.



== Changelog ==
= 3.1
New method for activating debug mode
Fix Markdown issues in readme
Add Google Optimize recommendations to readme

= 3.0.2
Fixed test for uninitialized debug flag when running script blockers

= 3.0.1
Update for WordPress 4.8

= 3.0.0
+ Restructure code
+ Add new Google Tag Manager instructions
+ Add new debugging features
+ Add "select" Analytics event to report when an experiment variant is selected
+ Improve Analytics "flavor" detection (Classic, Universal, GTM)


= 2.5.1 = 
Fix Google Tag Manager firing

= 2.5 =
Fix script order execution issue.

= 2.4.1 =
Just updating version number to WordPress.org recognizes new update date

= 2.4 =
+Fix shortcode example code
+Fix error in counting variants that prevented some from appearing
+Fix problem instantiating and calling jQuery

= 2.3 =
Update readme.txt for WordPress 4.0

= 2.2 =
Supports Internet Explorer 8.

= 2.1 =
Add support for multiple experiments within the same page.

= 2.0 =
+ Restructured plugin to NOT scan content before inserting JavaScript in head. This ensures compatibility with more plugins and widgets.
+ This means a small amount of code is added to every page.
+ Removed code that scanned Multiple Content Blocks since the scanning now happens in JavaScript on the rendered page.

= 1.2 =
Changed from .hide() to .remove() to hide alternative experiment content

= 1.1 =
Added support for Multiple Content Blocks plugin

= 1.0 =
Initial commit

== Upgrade notice ==

= 2.4 =
Fixes critical bugs that prevent the plugin from working for many users.

= 2.3 =
No code changes. Just updates compatibility for WordPress 4.0.

= 2.2 =
Adds support for Internet Explorer 8
