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
        this.angles = [];
      },

      //sets parameters for behavior
      addAngle: function(data) {
      console.log("angle=",data.angle);

        this.angles.push(data.angle);
      },

       update: function(index,data){
        if(data.angle){
          this.angles[index]+=data.angle;

        }
      },
      setup: function(data) {
       //adjust deltas to number defined by iterator... I think this is a good idea?
       if(data.n){ 
          this.angles.slice(0,data.n);
        }
      },


      calculate: function(data) {
  //set delta to same index as instance if applicable, OR most recent delta.
        var i = data.index;
        if(i>this.angles.length-1){
          i=this.angles.length-1;
        }
        console.log("angle=",this.angles[i],i);
        this.datatype.instances[data.index].rotation.angle += this.angles[i];
        return {instance:this.datatype.instances[data.index],index:data.index, terminate:false};
      },

      clean: function(data) {

      }



    });

    return RotateBehavior;
  });