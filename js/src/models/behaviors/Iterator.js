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
       this.terminate = false;
      },

      //sets parameters for behavior
      setIteration: function(data) {
        this.init = data.init;
        this.condition = data.condition;
        this.increment = data.increment;
        this.count = this.init;
      },

      setup: function(data) {
        return {n:this.condition};
      },

      calculate: function(data, index) {
        console.log('iterator calculate');
        //TODO: eventually set the condition as a function
        if(this.count<this.condition){
          var currentCount = this.count;
          this.count+=this.increment;

          return {index:currentCount};
        }
        else{
          this.terminate= true;
          return null;
        }

      },

      clean: function(data) {
        this.count=0;
        this.terminate = false;
      }



    });

    return Iterator;
  });