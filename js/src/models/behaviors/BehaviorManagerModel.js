/*BehaviorManagerModel.js
 *model that manages assignment of behaviors*/

define([
  'jquery',
  'underscore',
  'backbone',
  'utils/TrigFunc',
  'models/data/GeometryNode',
  'models/behaviors/CopyBehavior',
  'models/behaviors/DistributeBehavior',
  'models/behaviors/RadialDistributeBehavior',
  'models/behaviors/FollowPathBehavior'

], function($, _, Backbone, TrigFunc, GeometryNode, CopyBehavior, DistributeBehavior, RadialDistributeBehavior, FollowPathBehavior) {
  var nameVal = 0;
  var BehaviorManagerModel = Backbone.Model.extend({


    initialize: function(event_bus) {
      this.event_bus = event_bus;
      this.listenTo(this.event_bus, 'openMenu', this.openMenu);
      this.listenTo(this.event_bus, 'sendTestObj', this.testObj);
      this.listenTo(this.event_bus, 'newBehavior', this.newBehavior);
      this.conditional_line=null;
      this.test= true;
    },

    newCondition: function(nodes,conditional_node){
      conditional_node.instances[0].strokeColor = '#FF0000';
      conditional_node.instances[0].strokeWidth = 4;

      for(var i=0;i<nodes.length;i++){
        nodes[0].addCondition(null,'color',conditional_node,null);
        nodes[0].update([{}]);

      }
    },

    newBehavior: function(nodes, type, data) {
     //create a parent if none exists
      var nodeParent = nodes[0].nodeParent;
      var behaviorNode;
      if(nodeParent.type=='behavior'){
        behaviorNode = nodes[0].nodeParent;
      }
      else{
        behaviorNode  = new GeometryNode();
        behaviorNode.name = 'Behavior_' + nameVal;
        behaviorNode.type = 'behavior';
        nameVal++;

        for(var i=0;i<nodes.length;i++){
          behaviorNode.addChildNode(nodes[i]);
        }
        this.event_bus.trigger('nodeAdded', behaviorNode);

      }

      //console.log('behaviors='+behaviorNode.behaviors);

      if (type === 'copy') {
        this.addCopyBehavior(nodes,2,data);
      }

      else if(type=='linear'){
       if(!data){
          this.addCopyBehavior(nodes,3);
        }
        this.addLinearBehavior(nodes,data);
       
      }
      else if (type =='radial'){
        if(!data){
          this.addCopyBehavior(nodes,6);
        }
        this.addRadialBehavior(nodes,data);
      }  
      else if (type == 'followPath') {
         if(!data){
          this.addCopyBehavior(nodes,4);
        }
          this.addFollowPathBehavior(nodes,data);
      
        }
    
    

      behaviorNode.update([{}]);
      this.event_bus.trigger('rootRender');

      this.event_bus.trigger('moveDownNode', nodes[0].instance_literals[1]);

      

    },


    addCopyBehavior: function(nodes,copyNum,data){
      var copyBehavior = new CopyBehavior();
      for(var i=0;i<nodes.length;i++){
        var node = nodes[i];
        var containsCopy=node.containsBehaviorType('copy');
        if(!containsCopy){  
          nodes[i].addBehavior(copyBehavior,['update'],'last');
        }
        if(data){
          node.setCopyNum(data.copyNum);
        }
        else{
          node.setCopyNum(copyNum);
        }
        node.update([{}]);
      }
    },

    addFollowPathBehavior: function(nodes,data){
        nodes[0].copyNum=1;
        nodes[0].nodeParent.instances[0].position={x:nodes[0].instances[0].position.x,y:nodes[0].instances[0].position.y};
        nodes[0].instances[0].position={x:0,y:0};
        var followPathBehavior;
        var start = 1;
        if(data){
          //assumes that path child is always the first child
          followPathBehavior=new FollowPathBehavior(nodes.nodeParent.getChildAt(0));
          start = 0;
        }
        else{
          followPathBehavior=new FollowPathBehavior(nodes[0]);
        }
        for(var i=start;i<nodes.length;i++){
          nodes[i].addBehavior(followPathBehavior, ['update','calculate','clean']);
        }
    },

    addRadialBehavior: function(nodes,data){
      var radialBehavior = new RadialDistributeBehavior();
       for(var i=0;i<nodes.length;i++){
          var node = nodes[i];
          var containsDist=node.containsBehaviorType('distribution');
          var containsLin = node.containsBehaviorName('radial');
          if(containsDist && !containsLin){
            //TODO: code to remove a behavior here
          }
         else{
            node.addBehavior(radialBehavior);
            node.override('update',radialBehavior.update);
            node.override('calculate',radialBehavior.calculate);
            node.override('clean',radialBehavior.clean);
        }
      }
    },

    addLinearBehavior: function(nodes,data){
      var linearBehavior = new DistributeBehavior();
         for(var i=0;i<nodes.length;i++){
          var node = nodes[i];
          var containsDist=node.containsBehaviorType('distribution');
          var containsLin = node.containsBehaviorName('linear');
          if(containsDist && !containsLin){
            //TODO: code to remove a behavior here
          }
         else{
            node.addBehavior(linearBehavior,  ['update','calculate','clean']);
        }
      }
    },

   



  });
  return BehaviorManagerModel;

});