/*Generator.js
 */
define([
    'models/behaviors/BaseBehavior',
    'models/behaviors/BehaviorUpdates'
  ],

  function(BaseBehavior, BehaviorUpdates) {

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
         var dataR= this.behaviors[0].behavior.setup(data);
        for (var j = 1; j < this.behaviors.length; j++) {
           dataR= this.behaviors[0].behavior.setup(dataR);
         
        }
        return dataR;
      }

      },

      calculate: function(data) {
        console.log("generator calculate for",this.datatype.type);
         if(this.behaviors.length>0){
          var dataR= this.behaviors[0].behavior.calculate(data);
          console.log("dataR=",dataR);
        for (var j = 1; j < this.behaviors.length; j++) {
            console.log("generator is calculating for behavior");

            console.log(this.behaviors[j].behavior.type);
            dataR= this.behaviors[j].behavior.calculate(dataR);
            console.log("dataR=",dataR);
            }
        }
        this.terminate = true;
      },

      clean: function(data) {
        for (var j = 0; j < this.behaviors.length; j++) {
          this.behaviors[j].behavior.clean(data);
        } 
        this.terminate = false;
      },

    });

    return Generator;
  });