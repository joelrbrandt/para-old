/*RadialDistributeBehavior.js
 * creates a radial distirbution defined by anchors
 */
define([
    'models/behaviors/BaseBehavior',
    'models/behaviors/BehaviorUpdates'
  ],

  function(BaseBehavior, BehaviorUpdates) {
    var paper = PaperManager.getPaperInstance();

    var Generator = BaseBehavior.extend({
      name: 'generator',
      type: 'generator',

       constructor: function() {
        this.behaviors = [];
        BehaviorUpdates.call(this);
      },


      setup: function(data){

      }

     loop: function(data, index) {
      ////console.log("loop geom");
     
        for (var j = 0; j < this.behaviors.length; j++) {
          this.behaviors[j].calculate(data, index);
        }
      }
      

      },

      calculate: function(data,index) {
        this.loop(data,index);
      },

      clean: function(data) {

      },



    });



    return Generator;
  });