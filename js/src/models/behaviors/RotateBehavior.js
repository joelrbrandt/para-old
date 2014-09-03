/*RadialDistributeBehavior.js
 * creates a radial distirbution defined by anchors
 */
define([
    'models/behaviors/BaseBehavior',
    'models/PaperManager',
    'utils/TrigFunc'
  ],

  function(BaseBehavior, PaperManager, TrigFunc) {
    var paper = PaperManager.getPaperInstance();

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
        console.log("rotate calculate called");
        this.instances[index].rotation.angle += this.angle;
      },

      clean: function(data) {

      }



    });

    return RotateBehavior;
  });