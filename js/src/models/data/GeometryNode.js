/*GeometryNode.js
 * base class for geometry object
 * extends SceneNode
 */

define([
  'jquery',
  'underscore',
  'models/data/SceneNode',
  'models/data/Instance',
  'models/PaperManager',
  'models/data/Condition',
  'utils/TrigFunc'


], function($, _, SceneNode, Instance, PaperManager, Condition, TrigFunc) {
  var paper = PaperManager.getPaperInstance();

  var GeometryNode = SceneNode.extend({


    type: 'geometry',

    constructor: function() {
      /* instances contain objects that provide geometric info
    * this is propogated down to the leaves of the tree to 
    * draw the actual shapes 
    {  position: x,y coordinates of instance
        scale: scale of instance
        rotation: rotation of instance
        selected: boolean indicating selection state          
    }
    */

      this.instances = [];
      this.scaffolds = [];
      this.instance_literals = [];
      this.dimensioned_instances = [];
      this.behaviors = [];
      this.follow = false;
      this.conditions = [];



      SceneNode.apply(this, arguments);
    },


    initialize: function() {

      this.createInstance();
    },

    addChildNode: function(node) {
      SceneNode.prototype.addChildNode.apply(this, arguments);
    },



    getLeft: function() {
      var left = this.instances[0].position.x;
      for (var i = 1; i < this.instances.length; i++) {
        var l = this.instances[i].position.x;
        if (l < left) {
          left = l;
        }
      }
      return left;
    },

    getRight: function() {
      var right = this.instances[0].position.x;
      for (var i = 1; i < this.instances.length; i++) {
        var r = this.instances[i].position.x;
        if (r > right) {
          right = r;
        }
      }
      return right;
    },

    getTop: function() {
      var top = this.instances[0].position.y;
      for (var i = 1; i < this.instances.length; i++) {
        var r = this.instances[i].position.y;
        if (r < top) {
          top = r;
        }
      }
      return top;
    },

    getBottom: function() {
      var bottom = this.instances[0].position.y;
      for (var i = 1; i < this.instances.length; i++) {
        var r = this.instances[i].position.y;
        if (r > bottom) {
          bottom = r;
        }
      }
      return bottom;
    },

    getChildrenLeft: function() {
      if (this.children.length > 0) {
        var left = this.children[0].getLeft();
        for (var i = 1; i < this.children.length; i++) {
          var l = this.children[i].getLeft();
          if (l < left) {
            left = l;
          }
        }
        return left;
      } else {
        return 0;
      }
    },

    getChildrenRight: function() {
      if (this.children.length > 0) {
        var right = this.children[0].getRight();
        for (var i = 1; i < this.children.length; i++) {
          var r = this.children[i].getRight();
          if (r < right) {
            right = r;
          }
        }
        return right;
      } else {
        return 0;
      }
    },

    getChildrenTop: function() {
      if (this.children.length > 0) {

        var top = this.children[0].getTop();
        for (var i = 1; i < this.children.length; i++) {
          var r = this.children[i].getTop();
          if (r < top) {
            top = r;
          }
        }
        return top;
      } else {
        return 0;
      }
    },

    getChildrenBottom: function() {
      if (this.children.length > 0) {
        var bottom = this.children[0].getBottom();
        for (var i = 1; i < this.children.length; i++) {
          var r = this.children[i].getBottom();
          if (r < bottom) {
            bottom = r;
          }
        }
        return bottom;
      } else {
        return 0;
      }
    },


    exportJSON: function() {
      this.set({
        type: this.type
      });
      var data = this.toJSON();
      var jInstances = [];
      var children = [];
      var lInstances = [];
      var behaviors = [];
      for (var i = 0; i < this.instances.length; i++) {

        jInstances.push(this.instances[i].exportJSON());
      }
      for (var j = 0; j < this.instance_literals.length; j++) {
        lInstances.push(this.instance_literals[j].exportJSON());
      }
      for (var k = 0; k < this.children.length; k++) {

        children.push(this.children[k].exportJSON());
      }
      for (var m = 0; m < this.behaviors.length; m++) {
        //behaviors.push(this.behaviors[i].exportJSON());
      }
      data.instances = jInstances;
      data.instance_literals = lInstances;
      data.children = children;
      data.behaviors = behaviors;
      // console.log(JSON.stringify(data));
      return data;
    },


    /*called when drawing of the path is complete. 
     * Removes the path and creates one instance
     * in original path location
     */
    createInstance: function(data) {
      var instance;
      if (data) {
        instance = data.clone();
      } else {
        instance = new Instance();
      }
      instance.nodeParent = this;
      this.instances.push(instance);
      instance.index = this.instances.length - 1;
      return instance;

    },

    createInstanceAt: function(data, index) {
      var instance;
      if (data) {
        instance = data.clone();

      } else {
        instance = new Instance();
      }
      instance.nodeParent = this;
      instance.anchor = false;
      this.instances.splice(index, 0, instance);
      for (var i = 0; i < this.instances.length; i++) {
        this.instances[i].index = i;
      }
      return instance;
    },

    removeInstanceAt: function(index) {
      this.instances.splice(index, 1);
    },

    getInstancesofParent: function(index) {
      var iInstances = [];
      for (var i = 0; i < this.instances.length; i++) {
        if (this.instances[i].instanceParentIndex === index) {
          iInstances.push(this.instances[i]);
        }
      }
      return iInstances;
    },


    //updates instances according to data and the passes the updated instances to child function
    update: function(data) {
      //console.log('geom update: '+ this.type);
      var parentType = '';
      if (this.nodeParent) {
        parentType = this.nodeParent.type;
      }
      for (var j = 0; j < this.instances.length; j++) {
        for (var i = 0; i < data.length; i++) {
          var instance = this.instances[j];
          instance.update(data[i]);

        }
      }

      for (var k = 0; k < this.children.length; k++) {
        this.children[k].update([{}]);
      }



    },

    increment: function(data) {

      for (var j = 0; j < this.instances.length; j++) {
        for (var i = 0; i < data.length; i++) {
          var instance = this.instances[j];
          instance.render(data[i]);
        }
      }

    },

    updateSelected: function(data) {
      for (var j = 0; j < this.instances.length; j++) {
        if (this.instances[j].selected) {
          for (var i = 0; i < data.length; i++) {
            var instance = this.instances[j];
            instance.increment(data[i]);

          }
        }
      }



    },


    reset: function() {
      for (var j = 0; j < this.instances.length; j++) {
        this.instances[j].reset();
      }
    },

    /*sets focus to this instance and unfocuses all siblings*/
    focus: function() {

      var siblings = this.getSiblings();
      for (var i = 0; i < siblings.length; i++) {
        siblings[0].unfocus();
      }
      for (var j = 0; j < this.children.length; j++) {
        this.children[j].focus();
      }
    },

    /* unfocuses this by setting  stroke color to grey */
    unfocus: function() {
      this.instance_literals[0].strokeColor = 'red';
      for (var j = 0; j < this.children.length; j++) {
        this.children[j].unfocus();
      }
    },

    /*shows or hides all instances*/
    setVisible: function(v) {
      for (var j = 0; j < this.instances.length; j++) {
        this.instances[j].visible = v;
      }

      for (var i = 0; i < this.children.length; i++) {
        this.children[i].setVisible(v);
      }
    },


    clear: function() {
      this.instance_literals = [];
      this.clearScaffolds();
      this.dInstances = [];
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].clear();
      }

    },

    getInstanceDimensions: function() {
      //console.log('setting relative position for'+this.type); 
      if(this.children.length>0){
        var childDimensions = [];
        for (var k = 0; k < this.children.length; k++) {
          childDimensions.push(this.children[k].getInstanceDimensions());
        }
        console.log("num child dimensions "+childDimensions.length);
        var masterDimensions = TrigFunc.masterDimension(childDimensions);
        console.log("masterDimensions=");
        console.log(masterDimensions)
        return masterDimensions;
      }

     
    },

    /*renders geometry
     * if data is provided, creates a temporary instance array with updated values according to data
     *  otherwise just renders its children with its permanent instances
     * copies the render signature from the data and concats it with the
     *index of the instance used to render the path
     */


   /* setDimensions: function(){
      var childDimensions = [];
        var masterDimension;
        if(this.children.length<0){
          for (var f = 0; f < this.children.length; f++) {
            var dimensions = this.children[f].setDimensions();
            childDimensions.push(dimensions);
          }
        
        
        masterDimension = TrigFunc.masterDimension(childDimensions);
        
      }
      else{
        masterDimension= this.getInstanceDimensions();
      }
      for(var i=0;i<this.instances.length;i++){
          var dInstance = this.instances[i].clone();
          if(this.children.length<0){
            dInstance.width = masterDimension.width;
            dInstance.height = masterDimension.height;
            dInstance.increment({position:{x:masterDimension.x1,y:masterDimension.y1}});
          }
            dInstance.dimensions= masterDimension;
          this.dimensioned_instances.push(dInstance);
        }
      return masterDimension;
    },*/


    render: function(data, currentNode) {
      //first create array of new instances that contain propogated updated data

     


      //console.log('render: '+this.type);
      if (data) {
        //console.log('found data');

       
       
        var dimensions = this.getInstanceDimensions();
        if(this.children.length<1){
          dimensions = {x1:0,y1:0,x2:0,y2:0};
        }
      
        //console.log('dimensions of ' + this.type + ' =');
        //console.log(dimensions);

        for (var i = 0; i < data.length; i++) {
          for (var j = 0; j < this.instances.length; j++) {
            this.instances[j].instanceParentIndex = i;
            var u_instance = this.instances[j].clone();

            var posDiff = TrigFunc.subtract({
              x: 0,
              y: 0
            }, {
              x: data[i].position.x,
              y: data[i].position.y,
            });

            /*console.log('posDiff of ' + this.type + ' =');
            console.log(posDiff);
            
            u_instance.increment({
              position: posDiff
            });
            /*console.log('instance position ' + j + ',' + this.type + ' =');
            console.log(u_instance.position);*/
            console.log('instance position before increment ' + j + ',' + this.type + ' =');
            console.log(u_instance.position);
            u_instance.dimensions = dimensions
          
            u_instance.increment({position:{x:dimensions.x1,y:dimensions.y1}});
            u_instance.position.x=  u_instance.position.x-data[i].dimensions.x1;
            u_instance.position.y=  u_instance.position.y-data[i].dimensions.y1;

            console.log('instance position after increment ' + j + ',' + this.type + ' =');
            console.log(u_instance.position);
         

            if (data[i].renderSignature) {
              u_instance.renderSignature = data[i].renderSignature.slice(0);
            }
            u_instance.renderSignature.push(j);
            u_instance.index = j;
            
            u_instance.render(data[i]);

            if (this.nodeParent == currentNode) {
              u_instance.selected = this.instances[j].selected;
              u_instance.anchor = this.instances[j].anchor;
            } else {
              u_instance.selected = data[i].selected;
              u_instance.anchor = data[i].anchor;
            }

            var dot = new paper.Path.Circle(0, 0, 5);
            if (this.type === 'path') {
              dot.fillColor = '#00CFFF';
            } else if (this.type === 'behavior') {
              dot.fillColor = '#FF0000';
            } else {
              dot.fillColor = '#00ff00';
            }
            dot.transform(u_instance.matrix);
            this.scaffolds.push(dot);
            var rect = new paper.Path.Rectangle(0,0,dimensions.x2-dimensions.x1,dimensions.y2-dimensions.y1)
            rect.strokeColor='red';
            rect.transform(u_instance.matrix);
            this.scaffolds.push(rect);
            this.instance_literals.push(u_instance);



          }



        }



        for (var k = 0; k < this.children.length; k++) {

          this.children[k].render(this.instance_literals, currentNode);
        }
      } else {
       // console.log('no data');
        for (var f = 0; f < this.instances.length; f++) {
          this.instances[f].render({});
        }

        for (var f = 0; f < this.children.length; f++) {

          this.children[f].render(this.instances, currentNode);
        }
      }

    },

    setSelection: function(currentNode, instanceParent) {
      if (this == currentNode) {
        return;
      } else {
        this.selectByInstanceParent(instanceParent);
        if (this.nodeParent !== null) {
          this.nodeParent.setSelection(currentNode);
        }
      }
    },


    deleteNode: function() {
      for (var i = this.children.length - 1; i > -1; i--) {
        this.children[i].deleteNode();
      }
      this.clear();
      this.nodeParent.removeChildNode(this);
    },

    //selects according render signature
    selectByValue: function(index, value, path, currentNode) {
      var sIndexes = [];
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].containsPath(path)) {
          var results = this.children[i].selectByValue(index, value, path, currentNode);

          if (this != currentNode) {
            for (var j = 0; j < results.length; j++) {
              if (results[j].length > 0) {
                var last = results[j].length - 1;
                this.instances[results[j][last]].selected = true;

                results[j].pop();
                if (results[j].length > 0) {
                  sIndexes.push(results[j]);
                }
              }
            }
          }

        }
      }
      return sIndexes;
    },

    //selects or deselects all path instances
    selectAll: function() {
      for (var i = 0; i < this.instances.length; i++) {
        this.instances[i].selected = true;
      }
      for (var j = 0; j < this.children.length; j++) {
        this.children[j].selectAll();
      }


    },

    //selects or deselects all path instances
    deselectAll: function() {
      for (var i = 0; i < this.instances.length; i++) {
        this.instances[i].selected = false;
      }
      for (var j = 0; j < this.children.length; j++) {
        this.children[j].deselectAll();
      }
    },

    //returns first selected instance
    getFirstSelectedInstance: function() {
      for (var i = 0; i < this.instances.length; i++) {
        if (this.instances[i].selected) {
          return {
            instance: this.instances[i],
            index: i
          };
        }
      }
      return null;

    },

    //checks to see if path literal is contained by any children
    containsPath: function(path) {
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].containsPath(path)) {
          return true;
        }
      }
      return false;
    },

    //checks to see if behavior type has been added to this instance
    containsBehaviorType: function(type) {
      var indexes = [];
      for (var i = 0; i < this.behaviors.length; i++) {
        if (this.behaviors[i].type === type) {

          indexes.push(i);
        }
      }
      if (indexes.length > 0) {
        return indexes;
      }
      return false;

    },

    //returns first behavior that matches name
    getBehaviorByName: function(name) {
      for (var i = 0; i < this.behaviors.length; i++) {
        if (this.behaviors[i].name === name) {
          return this.behaviors[i];
        }
      }
      return null;
    },

    //checks by name to see if behavior type has been added to this instance
    containsBehaviorName: function(name) {
      var indexes = [];
      for (var i = 0; i < this.behaviors.length; i++) {
        if (this.behaviors[i].name === name) {
          indexes.push(i);
        }
      }
      if (indexes.length > 0) {
        return indexes;
      }
      return false;


    },

    /* placeholder functions for leftOf, rightOf geometric checks */
    instanceSide: function(instance) {
      return -1;
    },

    checkIntersection: function() {
      for (var i = 0; i < this.children.length; i++) {
        var intersection = this.children[i].checkIntersection();
        if (intersection !== null) {
          return intersection;

        }
      }
    },

    clearScaffolds: function() {
      for (var j = 0; j < this.scaffolds.length; j++) {
        this.scaffolds[j].remove();

      }
      this.scaffolds = [];

    },

    //registers overriding function for overriding methods- determined by parent node- this calls new method first
    extendBehaviorFirst: function(from, methods) {
      if (!this.containsBehaviorName(from.name)) {
        this.behaviors.push(from);
        // if the method is defined on from ...
        // we add those methods which exists on `from` but not on `to` to the latter
        _.defaults(this, from);
        // … and we do the same for events
        _.defaults(this.events, from.events);
        // console.log(this);
        // console.log(from);
        for (var i = 0; i < methods.length; i++) {
          var methodName = methods;
          if (!_.isUndefined(from[methodName])) {
            // console.log('setting methods');
            var old = this[methodName];

            // ... we create a new function on to
            this[methodName] = function() {

              // and then call the method on `from`
              var rArgs = from[methodName].apply(this, arguments);
              var oldReturn;
              if (rArgs) {
                // wherein we first call the method which exists on `to`
                oldReturn = old.apply(this, rArgs);
              } else {
                oldReturn = old.apply(this, arguments);
              }

              // and then return the expected result,
              // i.e. what the method on `to` returns
              return oldReturn;

            };
          }
        }
      }

    },

    //registers overriding function for overriding methods- determined by parent node- this calls new method second
    extendBehaviorSecond: function(from, methods) {
      if (!this.containsBehaviorName(from.name)) {
        this.behaviors.push(from);
        // if the method is defined on from ...
        // we add those methods which exists on `from` but not on `to` to the latter
        _.defaults(this, from);
        // … and we do the same for events
        _.defaults(this.events, from.events);
        // console.log(this);
        // console.log(from);
        for (var i = 0; i < methods.length; i++) {
          var methodName = methods;
          if (!_.isUndefined(from[methodName])) {
            // console.log('setting methods');
            var old = this[methodName];

            // ... we create a new function on to
            this[methodName] = function() {

              // and then call the method on `from`
              var rArgs = old.apply(this, arguments);
              var newReturn;
              if (rArgs) {
                // wherein we first call the method which exists on `to`
                newReturn = from[methodName].apply(this, rArgs);
              } else {
                newReturn = from[methodName].apply(this, arguments);
              }

              // and then return the expected result,
              // i.e. what the method on `to` returns
              return newReturn;

            };
          }
        }
      }

    },

    addConstraint: function(constraint) {

    },

    addCondition: function(propA, operator, targetB, propB) {
      var condition = new Condition(propA, operator, targetB, propB);
      this.conditions.push(condition);
    },

    checkConditions: function(instance) {
      for (var i = 0; i < this.conditions.length; i++) {
        if (!this.conditions[i].evaluate(instance)) {
          return false;
        }
      }
      return true;
    },

    checkConstraints: function(constraint, Jinstance) {

    },



  });

  return GeometryNode;

});