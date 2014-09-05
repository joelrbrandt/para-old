/*WeightBehavior.js
 * sets the stroke weight
 */

define([
    'models/behaviors/BaseBehavior',
  ],

  function(BaseBehavior) {

    var WeightBehavior = BaseBehavior.extend({
      name: 'weight',
      type: 'style',
      constructor: function() {
       this.weight = 1
      },

      //sets parameters for behavior
      setWeight: function(data) {
        this.weight = data.weight;
      },

      setup: function(data) {

      },

      calculate: function(data) {
        this.datatype.instances[data.index].strokeWidth = this.weight;
        return {instance:this.datatype.instances[data.index],index:data.index, terminate:false};
      },

      clean: function(data) {

      }

    });

    return WeightBehavior;
  });