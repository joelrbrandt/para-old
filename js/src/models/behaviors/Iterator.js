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
      },

      //sets parameters for behavior
      setIteration: function(data) {
        this.init = data.init;
        this.condition = data.condition;
        this.increment = data.increment;
      },

      setup: function(data) {
        return this.condition;
      },

      calculate: function(data, index) {
        this.count+=this.increment;
        //TODO: eventually set the condition as a function
        if(this.count<this.condition){
          return this.count;
        }
        else{
          return null;
        }

      },

      clean: function(data) {
        this.position=0;
      }



    });

    return Iterator;
  });