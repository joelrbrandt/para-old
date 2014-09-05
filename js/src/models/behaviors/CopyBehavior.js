/*CopyBehavior.js
creates correct number of copies
 */
define([
    'models/behaviors/BaseBehavior',
    'models/data/Instance',
    'utils/TrigFunc'



  ],

  function(BaseBehavior, Instance, TrigFunc) {

    var CopyBehavior = BaseBehavior.extend({
      name: 'copy',
      type: 'copy',

      exportJSON: function(data) {

        var jdata;
        if (!data) {

          jdata = {};
          jdata.type = this.type;
          jdata.name = this.name;
        } else {
          jdata = data;
        }
        //console.log(jdata);
        return BaseBehavior.prototype.exportJSON.apply(this, [jdata]);
      },

     setup: function(data) {
        //checks to see if we have the correct number of copies
       /* console.log("copy setup")
        console.log("datatype ="+this.datatype.instances.length);
        var numInstances = this.datatype.instances.length;
        if (numInstances < this.copyNum) {
          var newCopy = this.copyNum - numInstances;

          for (var i = 0; i < newCopy; i++) {
            var selected = this.datatype.instances[this.datatype.instances.length - 1];
            var index;
            if (!selected) {
               console.log('selected:' + selected.index);
              selected = this.datatype.instances[0];
              index = 1;
            } else {
             console.log('selected:' + selected.index);
             console.log('correct index:', this.datatype.instances.length - 1);
              index = selected.index;
              console.log('index:' + index);

            }

            // //console.log('no selected instance found, making copy from first');
            //target = child.instances[0];
            //console.log('creating instance at' + index);
            var instance = this.datatype.createInstanceAt(selected, index);
            // //console.log('creating instance'+instance);
            instance.copy = true;
            console.log("inserted index="+instance.index);
              console.log("datatype ="+this.datatype.instances.length);
            
            instance.anchor = false;
            instance.selected = false;
          }
        } else if (numInstances > this.copyNum) {
          var start= numInstances-2;
          if(!this.datatype.containsBehaviorType('distribution')){
            start = numInstances-1;
          }
          
          for (var k = start; k > this.copyNum-1; k--) {
            //var removeIndex = this.instances.length > 2 ? this.instances.length - 3 : this.instances.length - 2;
            ////console.log('remove index = '+removeIndex);
           
           

              this.datatype.removeInstanceAt(k);
            
            //TODO: what happens when there are only 2 instances left?
          }
        }*/

        //child.instances[child.instances.length-1].anchor=true;


      },

      calculate: function(data){
        // console.log("copy calculate");
        if(data.terminate){
          return {terminate:true};
        }
        else{
          var instance = this.datatype.createInstance();
          //console.log("total number of instances for datatype:",this.datatype.instances.length);
          return {instance:instance,index:data.index};
        }
        
      },

      clean: function(data){

      },

      setCopyNum: function(data) {
        this.copyNum = data;
      },

      incrementCopyNum: function(data) {
        this.copyNum += data;
        if (this.copyNum < 2) {
          if (this.datatype.containsBehaviorType('distribution')) {
            this.copyNum = 2;
          }
          if (theis.copyNum < 1) {
            this.copyNum = 1;
          }
        }
        console.log(this.copyNum);
      }
      
    });


    return CopyBehavior;
  });