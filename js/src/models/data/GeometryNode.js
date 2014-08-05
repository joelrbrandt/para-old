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

    getInstanceDimensions: function(multiplier) {
      //console.log('setting relative position for'+this.type); 
     
        var childDimensions = [];
        for (var k = 0; k < this.children.length; k++) {
          childDimensions.push(this.children[k].getInstanceDimensions(this.instances.length));
        }

      
        var masterDimension = TrigFunc.masterDimension(childDimensions);
         //console.log('master dimensions for ' +this.type+'=');
        //console.log(masterDimension);
        var leftX = this.instance_literals[0].position.x+masterDimension.x1;
        var topY = this.instance_literals[0].position.y+masterDimension.y1;
        var rightX = this.instance_literals[0].position.x + masterDimension.x2;
        var bottomY = this.instance_literals[0].position.y+ masterDimension.y2;

        for (var i = 0; i < this.instances.length*multiplier; i++) {

            var instance = this.instance_literals[i];
            var lX = instance.position.x+masterDimension.x1;
            var tY = instance.position.y+masterDimension.y1;
            var rX = instance.position.x + masterDimension.x2;
            var bY = instance.position.y + masterDimension.y2;
            leftX = (lX < leftX) ? lX : leftX;
            topY = (tY < topY) ? tY : topY;
            rightX = (rX > rightX) ? rX : rightX;
            bottomY = (bY > bottomY) ? bY : bottomY;
      }

      return {
        x1: leftX,
        y1: topY,
        x2: rightX,
        y2: bottomY,
        width: rightX-leftX,
        height: bottomY-topY
      };
       
     
    },

   
    setRelative: function(data){
     
      var dimensions = this.nodeParent.getInstanceDimensions();
     
      //console.log('relative dimensions for+ 'this.type +'=');
      console.log(dimensions);
      if(dimensions){
        for(var i=0;i<this.instance_literals.length;i++){
          var u_instance = this.instance_literals[i];
        u_instance.increment({position:{x:dimensions.x1,y:dimensions.y1}});
        u_instance.dimensions = dimensions;
        u_instance.position.x=  u_instance.position.x-data[u_instance.instanceParentIndex].dimensions.x1;
        u_instance.position.y=  u_instance.position.y-data[u_instance.instanceParentIndex].dimensions.y1;

        u_instance.render(data[u_instance.instanceParentIndex]);
        var rect = new paper.Path.Rectangle(0,0,dimensions.x2-dimensions.x1,dimensions.y2-dimensions.y1);
          
         var dot = new paper.Path.Circle(0, 0, 5);
            if (this.type === 'path') {
              dot.fillColor = '#00CFFF';
              rect.strokeColor='#00CFFF';
            } else if (this.type === 'behavior') {
              dot.fillColor = '#FF0000';
               rect.strokeColor='#FF0000';
            } else {
              dot.fillColor = '#00ff00';
                rect.strokeColor='#00ff00';
            }
            dot.transform(u_instance.matrix);
            this.scaffolds.push(dot);
           
            rect.transform(u_instance.matrix);
            this.scaffolds.push(rect);
          }
        }
        for(var j=0;j<this.children.length;j++){
          this.children[j].setRelative(this.instance_literals);
        }

    },


    
    compile: function(data,currentNode){
        if (data) {
      
        for (var i = 0; i < data.length; i++) {
          for (var j = 0; j < this.instances.length; j++) {
            this.instances[j].instanceParentIndex = i;

            var u_instance = this.instances[j].clone();

            if (data[i].renderSignature) {
              u_instance.renderSignature = data[i].renderSignature.slice(0);
            }

            u_instance.renderSignature.push(j);
            u_instance.index = j;
            u_instance.compile(data[i]);

            if (this.nodeParent == currentNode) {
              u_instance.selected = this.instances[j].selected;
              u_instance.anchor = this.instances[j].anchor;
            } else {
              u_instance.selected = data[i].selected;
              u_instance.anchor = data[i].anchor;
            }
            this.instance_literals.push(u_instance);
          }

        }



      } else {
       // console.log('no data');
        for (var f = 0; f < this.instances.length; f++) {
          var u_instance = this.instances[f].clone();
          u_instance.compile({});
          this.instance_literals.push(u_instance);

        }

      }


        for (var k = 0; k < this.children.length; k++) {

          this.children[k].compile(this.instance_literals, currentNode);
        }
        var multiplier = (this.nodeParent) ? this.nodeParent.instanceNum: 1;
        var dimensions = this.getInstanceDimensions(multiplier);
        console.log('dimensions for ' +this.type+'=');
        console.log(dimensions);
       if(this.children.length>0&&this.type!='root'){
          for(var i=0;i<this.instance_literals.length;i++){
            this.instance_literals[i].position.x+=dimensions.x1;
            this.instance_literals[i].position.y+=dimensions.y1;
          }
          for(var j=0;j<this.children.length;j++){
            for(var k=0;k<this.children[j].instance_literals.length;k++){
              this.children[j].instance_literals[k].position.x-=dimensions.x1;
              this.children[j].instance_literals[k].position.y-=dimensions.y1;
            }
          }
        }
 
      

        if(this.type==='root'){
          console.log('=====================================\n');
        }
      
    },

     render: function(data,currentNode) {
      //first create array of new instances that contain propogated updated data
        for(var k=0;k<this.instance_literals.length;k++){
           console.log('render for ' +this.type+'=');
          console.log(this.instance_literals[k].position);
          if(data!=null){
           this.instance_literals[k].compile(data[this.instance_literals[k].instanceParentIndex]);
         }
         else{
          this.instance_literals[k].compile({});  
         }
              
        }

        
        for (var f = 0; f < this.children.length; f++) {
          if(this.type==='root'){
            this.children[f].render(null,currentNode);
          }
          else{
            this.children[f].render(this.instance_literals,currentNode);
          }
        }
         if(this.type==='root'){
          console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n\n');
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