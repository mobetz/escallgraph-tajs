jQuery = function() {}

jQuery.extend = function() {
    for (i = 0; i < 1; i++ ) {
	    options = arguments[ 0 ]
	    //options = {a:2, b:9 } // Works!
	    TAJS_dumpObject(options)
	    for ( name in options ) {
	      TAJS_dumpValue("Inside loop")
	    }
    }
}

jQuery.extend({
    each: function( ) {},
    browser: {}
});

