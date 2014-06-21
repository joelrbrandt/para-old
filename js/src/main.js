/* Filename: main.js */

require.config({

    // Setup paths so our require.js text plugin can be resolved.
    baseUrl: "js/src",
    // Boost module timeout slightly for slower machines.
	paths : {   
        "jquery" : "../lib/jquery/jquery", //specific libraries -- can be specified later
        "paper" : "../lib/paper/dist/paper",
        "backbone" : "../lib/backbone/backbone",
        "underscore" : "../lib/underscore/underscore",
        "mustache"  : "../lib/mustache/mustache"
    },
    
    shim: {
        paper : {
            exports: "paper"
        },
        backbone: {
        deps: ["underscore", "jquery"],
        exports: "Backbone"
        },

        underscore: {
         exports: "_"
        }
    },
});

require([
  // Load our app module and pass it to our definition function
  "app",

], function(App){
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  App.initialize();
});


