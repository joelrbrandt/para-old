/*StrokeBehavior.js
 * sets the stroke color
 */

define([
    'models/behaviors/BaseBehavior',
  ],

  function(BaseBehavior) {

    var StrokeBehavior = BaseBehavior.extend({
      name: 'stroke',
      type: 'style',
      constructor: function() {
       this.color = 'black';
      },

      //sets parameters for behavior
      setStroke: function(data) {
        this.color = data.color;
      },

      setup: function(data) {

      },

      calculate: function(data) {
        this.datatype.instances[data.index].strokeColor =this.color;
        return {instance:this.datatype.instances[data.index],index:data.index, terminate:false};
      },

      clean: function(data) {

      }

    });

    return StrokeBehavior;
  });