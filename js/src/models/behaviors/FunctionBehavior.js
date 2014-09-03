/*RadialDistributeBehavior.js
 * creates a radial distirbution defined by anchors
 */
define([
    'models/behaviors/Generator'
  ],

  function(Generator) {

    var FunctionBehavior = Generator.extend({
      name: 'function',
      type: 'abstract',
      constructor: function() {
        Generator.apply(this, arguments);
        this.executed = false;
      },

      setup: function(data) {

      },

      loop: function(data) {
      ////console.log("loop geom");
      for(var i=0;i<this.datatype.instances.length;i++){
        for (var j = 0; j < this.behaviors.length; j++) {
          this.behaviors[j].calculate(data, i);
        }
      }
      
        this.executed = true;

      },

      calculate: function(data) {
        this.loop(data);
      },

      clean: function(data) {
       this.executed=false;

      },

      getReturn: function(){

      }



    });

    return FunctionBehavior;
  });