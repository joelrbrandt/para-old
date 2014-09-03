/*TranslateBehavior.js
 * performs a translation
 */

define([
    'models/behaviors/BaseBehavior',
    'models/PaperManager',
    'utils/TrigFunc'
  ],

  function(BaseBehavior, PaperManager, TrigFunc) {
    var paper = PaperManager.getPaperInstance();

    var TranslateBehavior = BaseBehavior.extend({
      name: 'translate',
      type: 'transform',
      constructor: function() {
        this.x = 0;
        this.y = 0;
      },

      //sets parameters for behavior
      setPosition: function(data) {
        this.x = data.x;
        this.y = data.y;
      },

      setup: function(data) {

      },

      calculate: function(data, index) {
        console.log("translate calculate called");
        this.datatype.instances[index].delta += this.delta;
      },

      clean: function(data) {

      }



    });

    return TranslateBehavior;
  });