/*TranslateBehavior.js
 * performs a translation
 */

define([
    'models/behaviors/BaseBehavior',
  ],

  function(BaseBehavior) {

    var TranslateBehavior = BaseBehavior.extend({
      name: 'translate',
      type: 'transform',
      constructor: function() {
       this.deltas = [];
      },

      //sets parameters for behavior
      addDelta: function(data) {
        this.deltas.push({x:data.x,y:data.y});
      },

      update: function(index,data){
        if(data.delta){
          this.deltas[index].x+=data.delta.x;
          this.deltas[index].y+=data.delta.y;

        }
      },
      setup: function(data) {
       //adjust deltas to number defined by iterator... I think this is a good idea?
       if(data.n){ 
          this.deltas.slice(0,data.n);
        }
      },

      calculate: function(data) {
          //set delta to same index as instance if applicable, OR most recent delta.
       
        var i = data.index;
        if(i>this.deltas.length-1){
          i=this.deltas.length-1;
        }
         console.log("translate calculate",this.datatype.type);
        this.datatype.instances[data.index].delta.x +=this.deltas[i].x;
        this.datatype.instances[data.index].delta.y +=this.deltas[i].y;
        debugger;
        return {instance:this.datatype.instances[data.index],index:data.index, terminate:false};


      },

      clean: function(data) {

      }



    });

    return TranslateBehavior;
  });