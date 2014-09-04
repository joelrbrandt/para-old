/*Iterator.js
 */
define([
    'models/behaviors/BaseBehavior',
 
  ],

  function(BaseBehavior) {
  
    var Iterator = BaseBehavior.extend({
      name: 'iterator',
      type: 'generator',

      constructor: function() {
       this.init = 0;
       this.condition = 0;
       this.increment = 0;
       this.count = 0;
      },

      //sets parameters for behavior
      setIteration: function(data) {
        this.init = data.init;
        this.condition = data.condition;
        this.increment = data.increment;
        this.count = this.init;
      },

      setup: function(data) {
        return this.condition;
      },

      calculate: function(data, index) {
        console.log("iterator calculate");
        //TODO: eventually set the condition as a function
        if(this.count<this.condition){
          currentCount = this.count;
          this.count+=this.increment;
          return {terminate:false,index:currentCount};
        }
        else{
          this.count+=this.increment;
          return {terminate:true,index:this.count}
        }

      },

      clean: function(data) {
        this.position=0;
      }



    });

    return Iterator;
  });