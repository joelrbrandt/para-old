/*BehaviorManagerModel.js
 *model that manages assignment of behaviors*/

define([
  'jquery',
  'underscore',
  'backbone',
  'utils/TrigFunc',
  'models/data/GeometryNode',
   'models/behaviors/Generator',
   'models/behaviors/Iterator',
  'models/behaviors/CopyBehavior',
  'models/behaviors/TranslateBehavior',
  'models/behaviors/DistributeBehavior',
  'models/behaviors/RadialDistributeBehavior',
  'models/behaviors/FollowPathBehavior',
  'models/behaviors/RotateBehavior',

], function($, _, Backbone, TrigFunc, GeometryNode, Generator, Iterator, CopyBehavior, TranslateBehavior, DistributeBehavior, RadialDistributeBehavior, FollowPathBehavior, RotateBehavior) {
  var nameVal = 0;
  var BehaviorManagerModel = Backbone.Model.extend({


    initialize: function(event_bus) {
      this.event_bus = event_bus;
      this.listenTo(this.event_bus, 'openMenu', this.openMenu);
      this.listenTo(this.event_bus, 'sendTestObj', this.testObj);
      this.listenTo(this.event_bus, 'newBehavior', this.newBehavior);
      this.conditional_line = null;
      this.test = true;
    },

    newCondition: function(nodes, conditional_node) {
      conditional_node.instances[0].strokeColor = '#FF0000';
      conditional_node.instances[0].strokeWidth = 4;

      for (var i = 0; i < nodes.length; i++) {
        nodes[0].addCondition(null, 'color', conditional_node, null);
        nodes[0].setup([{}]);

      }
    },

    newBehavior: function(nodes, name, data) {
      //create a parent if none exists
      //console.log("adding behavior");

      var nodeParent = nodes[0].nodeParent;
      var behaviorNode;
      if (nodeParent.type == 'behavior') {
        behaviorNode = nodes[0].nodeParent;
      } else {
        behaviorNode = new GeometryNode();
        behaviorNode.name = 'Behavior_' + nameVal;
        behaviorNode.type = 'behavior';
        nameVal++;

        for (var i = 0; i < nodes.length; i++) {
          behaviorNode.addChildNode(nodes[i]);
        }
        this.event_bus.trigger('nodeAdded', behaviorNode);

      }

      ////console.log('behaviors='+behaviorNode.behaviors);

      if (name === 'copy') {
        this.addCopyBehavior(nodes, 2, data);
      } else if (name == 'linear') {
       
        this.addLinearBehavior(nodes, behaviorNode);

      } else if (name == 'radial') {
        //console.log("adding radial behavior");
        if (!data) {
          if (!nodes[0].getBehaviorByName('copy'))
           {
            this.addCopyBehavior(nodes, 6);
          } else {
            this.addCopyBehavior(nodes);
          }
        }
        this.addRadialBehavior(nodes, data);
      } else if (name == 'followpath') {
        if (!data) {
          if (!nodes[0].getBehaviorByName('copy')) {
            this.addCopyBehavior(nodes, 4);
          } else {
            this.addCopyBehavior(nodes);
          }
        }
        this.addFollowPathBehavior(nodes, data);

      }

      behaviorNode.setup([{}]);
      this.event_bus.trigger('rootRender');
      this.event_bus.trigger('moveDownNode', nodes[0].instance_literals[0]);



    },


    addCopyBehavior: function(nodes, copyNum, data) {
      var copyBehavior = new CopyBehavior();
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var containsCopy = node.containsBehaviorType('copy');
        if (!containsCopy) {
          nodes[i].addBehavior(copyBehavior, nodes[i]);
        }
        //TODO: eventually will need a method of updating the correct copy behavior to update (ie via scope)
        if (data) {
          node.getBehaviorByName('copy').setCopyNum(data.copyNum);
        } else {
          if (copyNum) {
            node.getBehaviorByName('copy').setCopyNum(copyNum);
          }
        }
        node.setup([{}]);
      }
    },

    addFollowPathBehavior: function(nodes, data) {
      nodes[0].getBehaviorByName('copy').setCopyNum(1);
      nodes[0].nodeParent.instances[0].position = {
        x: nodes[0].instances[0].position.x,
        y: nodes[0].instances[0].position.y
      };
      nodes[0].nodeParent.setOriginByChild(0);
      nodes[0].instances[0].position = {
        x: 0,
        y: 0
      };
      var followPathBehavior, rotateBehavior;
      var start = 1;
      if (data) {
        //console.log('follow path data');
        followPathBehavior = new FollowPathBehavior(nodes[0].nodeParent.getChildAt(0));
        rotateBehavior = new RotateBehavior();
        start = 0;
        for (var i = start; i < nodes.length; i++) {
          nodes[i].addBehavior(rotateBehavior,nodes[i]);
          nodes[i].addBehavior(followPathBehavior, nodes[i]);

        }
      } else {
        followPathBehavior = new FollowPathBehavior(nodes[0]);
         rotateBehavior = new RotateBehavior();
        nodes[0].scaffold=true;
        for (var i = start; i < nodes.length; i++) {
           nodes[i].addBehavior(rotateBehavior, nodes[i]);
          nodes[i].addBehavior(followPathBehavior,nodes[i]);
         
          nodes[i].instances[0].delta.x = nodes[0].getLiteral().firstSegment.point.x;
          nodes[i].instances[0].delta.y =  nodes[0].getLiteral().firstSegment.point.y;
          nodes[i].instances[nodes[i].instances.length-1].delta.x = nodes[0].getLiteral().lastSegment.point.x;
          nodes[i].instances[nodes[i].instances.length-1].delta.y = nodes[0].getLiteral().lastSegment.point.y;
        }
      }

    },

    addRadialBehavior: function(nodes, data) {
      var radialBehavior = new RadialDistributeBehavior();
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var containsDist = node.containsBehaviorType('distribution');
        var containsLin = node.containsBehaviorName('radial');
        if (containsDist && !containsLin) {
          var toRemove = node.getBehaviorByType('distribution');
          for (var j = 0; j < toRemove.length; j++) {
            //console.log('removing behavior at:'+i+','+toRemove[j].behavior.name);
            node.removeBehavior(toRemove[j].behavior.name);
          }
        }

        node.addBehavior(radialBehavior,node);

      }
    },

    addLinearBehavior: function(nodes, parentNode) {
      console.log("parentNode=",parentNode);
       var pgenerator = parentNode.getBehaviorByName('generator');
       pgenerator.sname = "parent dist";
      pgenerator.iterator.condition=1;
      var ptranslate = new TranslateBehavior();
      ptranslate.addDelta({x:0,y:0});
      //translate.addDelta({x:delta.x+5,y:delta.y+5});
      pgenerator.addBehavior(ptranslate,parentNode);

      var protate = new RotateBehavior();
      protate.addAngle({angle:0});
      pgenerator.addBehavior(protate,parentNode);


      var node = nodes[0];
    node.getBehaviorByName('generator').iterator.condition=2;

      var distribution = new DistributeBehavior();
      var generator = new Generator();
      generator.sname="distribute"
      var iterator = new Iterator();
      iterator.setIteration({
        init: 0,
        condition: 2,
        increment: 1
      });
      generator.setIterator(iterator);
      generator.setDistribution(distribution);
      node.addBehavior(generator, node);

      generator.iterator.condition=2;
      generator.distribution = distribution;
      var translate =new TranslateBehavior();
      translate.addDelta({x:0,y:0});
      translate.addDelta({x:10,y:10});
      generator.addBehavior(translate,node);


      
    },



  });
  return BehaviorManagerModel;

});