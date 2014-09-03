/*RotateBehavior.js
 * performs a rotation
 */
define([
    'models/behaviors/BaseBehavior',
 
  ],

  function(BaseBehavior) {
  
    var RotateBehavior = BaseBehavior.extend({
      name: 'rotate',
      type: 'transform',
      constructor: function() {
        this.angle = 0;
      },

      //sets parameters for behavior
      setRotation: function(data) {
        this.angle = data;
      },

      setup: function(data) {

      },

      calculate: function(data, index) {
        this.datatype.instances[index].rotation.angle += this.angle;
      },

      clean: function(data) {

      }



    });

    return RotateBehavior;
  });