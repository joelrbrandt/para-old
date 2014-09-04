/*Generator.js
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
        this.termniate = false;
        BehaviorUpdates.call(this);
      },


      setup: function(data){
        if(this.behaviors.length>0){
         var dataR= this.behaviors[0].setup(data);
        for (var j = 1; j < this.behaviors.length; j++) {
           dataR= this.behaviors[0].setup(dataR);
         
        }
        return dataR;
      }

      },

      calculate: function(data) {
         if(this.behaviors.length>0){
          var dataR= this.behaviors[0].calculate(data,index);
        for (var j = 0; j < this.behaviors.length; j++) {
          this.behaviors[j].calculate(data, index);
        }
      }
      },

      clean: function(data) {
        for (var j = 0; j < this.behaviors.length; j++) {
          this.behaviors[j].clean(data, index);
        }
        this.terminate = false;
      },



    });



    return Generator;
  });