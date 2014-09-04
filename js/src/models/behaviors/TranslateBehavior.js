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

      calculate: function(data) {
        console.log("translate calculate called for index",data.index);

        console.log("total number of instances for datatype:",this.datatype.instances.length);
        console.log("translate delta:", this.x,",",this.y);
        this.datatype.instances[data.index].delta.x +=this.x;
        this.datatype.instances[data.index].delta.y +=this.y;
        return {instance:this.datatype.instances[data.index],index:data.index, terminate:false};


      },

      clean: function(data) {

      }



    });

    return TranslateBehavior;
  });