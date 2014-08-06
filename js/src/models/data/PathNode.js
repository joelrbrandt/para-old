/*PathNode.js
 * path object
 * extends GeometryNode
 * node with actual path in it
 */


define([
  'underscore',
  'models/data/GeometryNode',
  'models/data/Instance',
  'models/PaperManager',
  'utils/TrigFunc'

], function(_, GeometryNode, Instance, PaperManager, TrigFunc) {
  //drawable paper.js path object that is stored in the pathnode
  var paper = PaperManager.getPaperInstance();
  var PathNode = GeometryNode.extend({

    type: 'path',
    name: 'none',


    constructor: function() {

      GeometryNode.apply(this, arguments);
      this.masterPath = null;
      this.path_literals = [];
    },


    initialize: function() {

    },

    getMasterPath: function() {
      return this.masterPath;

    },



    /*called when drawing of the path is complete. 
     * Removes the path and creates one instance
     * in original path location*/
    createInstanceFromPath: function(path) {
      var instance = this.createInstance();
      var position = {x:path.bounds.topLeft.x, y:path.bounds.topLeft.y};
      var width = path.bounds.width;
      var height = path.bounds.height;  
      instance.update({position:position,
        width: width,
        height: height,
        strokeWidth:path.strokeWidth,
        strokeColor:path.strokeColor,
        fillColor:path.fillColor, 
        closed:path.closed});
      path.position.x =0;
      path.position.y =0;
     

      path.translate(path.bounds.width/2,path.bounds.height/2);
     
     
      this.masterPath =path;
      this.masterPath.visible = false;
      
      path.instanceParentIndex = this.instances.length - 1;
      path.instanceIndex = this.path_literals.length - 1;
      path.nodeParent = this;
      return instance;

    },



    /*sets focus to this instance and unfocuses all siblings*/
    focus: function() {

      this.path_literals[0].strokeColor = 'black';

      var siblings = this.getSiblings();
      for (var i = 0; i < siblings.length; i++) {
        siblings[0].unfocus();
      }
    },

    /* unfocuses this by setting  stroke color to grey */
    unfocus: function() {
      this.path_literals[0].strokeColor = 'grey';
    },

    /*clears out all but first of literal paths*/
    clear: function() {
     GeometryNode.prototype.clear.apply(this, arguments);
      for (var j = 0; j < this.path_literals.length; j++) {
        this.path_literals[j].remove();

      }
      this.path_literals = [];

    },

    //called when path points are modified 
    updatePath: function(index,delta) {
      var newPath = this.masterPath.clone();

      //update the path
       var selSegment = newPath.segments[index];
      selSegment.point = selSegment.point.add(delta);
    
       var topLeftOld = this.masterPath.bounds.topLeft;
       var topLeftNew = newPath.bounds.topLeft;
       //calcualte differences between old and new positions
       var diff = TrigFunc.subtract({x:topLeftNew.x,y:topLeftNew.y},{x:topLeftOld.x,y:topLeftOld.y});

       //set position to upper left corner
       newPath.position.x = 0+newPath.bounds.width/2;
       newPath.position.y =0+newPath.bounds.height/2;

        for(var i=0;i<this.instances.length;i++){
          this.instances[i].update({width:newPath.bounds.width,height:newPath.bounds.height});
          this.instances[i].increment({position:diff});
        }

       //swap out old master for new
        this.masterPath.remove();
        this.masterPath = newPath;
        newPath.visible = false;
      

    },

    getInstanceDimensions: function(multiplier) {
      //console.log('setting relative position for'+this.type); 
      var leftX = this.instance_literals[0].position.x;
      var topY = this.instance_literals[0].position.y;
      var rightX = leftX + this.instance_literals[0].width;
      var bottomY = topY + this.instance_literals[0].height;

      for (var i = 0; i < this.instances.length*multiplier; i++) {

        var instance = this.instance_literals[i];
        var lX = instance.position.x;
        var tY = instance.position.y;
        var rX = instance.position.x + instance.width;
        var bY = instance.position.y + instance.height;
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


    /* renders instances of the original path
     * render data contains an array of objects containing
     * position, scale and rotation data for each instance
     * copies the render signature from the data and concats it with the
     *index of the instance used to render the path
     */
    render: function(data, currentNode) {
       var master = this.getMasterPath();
          for(var k=0;k<this.instance_literals.length;k++){
           console.log('render for ' +this.type+'=');
          console.log(this.instance_literals[k].position);
              
        }
     if(data){
     
  
      for (var k = 0; k < this.instance_literals.length; k++) {
            var instance_literal = this.instance_literals[k];
            instance_literal.compile(data[instance_literal.instanceParentIndex]);
            var rect = new paper.Path.Rectangle(0,0,this.dimensions.width,this.dimensions.height);
            rect.strokeColor='red';
            rect.transform(instance_literal.matrix);
            this.scaffolds.push(rect);
            var path_literal = master.clone();
            path_literal.nodeParent = this;
            path_literal.data.index = k;
            path_literal.instanceParentIndex =instance_literal.instanceParentIndex;
          
            path_literal.transform(instance_literal.matrix);
            path_literal.strokeColor = instance_literal.strokeColor;
            if (path_literal.closed) {
              path_literal.fillColor = instance_literal.fillColor;
            }
            if (path_literal.strokeWidth === 0) {
              path_literal.strokeWidth = 1;
            }

            if (this.nodeParent == currentNode) {
              path_literal.selected = instance_literal.selected;
          
              if (instance_literal.anchor) {
                if (instance_literal.index === 0) {
                  path_literal.strokeColor = '#83E779';
                } else {
                  path_literal.strokeColor = '#FF0000';

                }
                if (path_literal.strokeWidth < 3) {
                  path_literal.strokeWidth = 3;
                }
              }
            } else {
              path_literal.selected = data[instance_literal.instanceParentIndex].selected;
              if (data[instance_literal.instanceParentIndex].anchor) {
                if (data[instance_literal.instanceParentIndex].index === 0) {
                  path_literal.strokeColor = '#83E779';
                } else {
                  path_literal.strokeColor = '#FF0000';

                }
                if (path_literal.strokeWidth < 3) {
                  path_literal.strokeWidth = 3;
                }
              }
            }


            path_literal.visible = instance_literal.visible;

           /* if (this.nodeParent != currentNode && this.follow) {
              path_literal.visible=false;
            }*/
            this.path_literals.push(path_literal);
            path_literal.instanceIndex = this.path_literals.length - 1;

            //console.log('path matrix');
            //console.log(path_literal.matrix);
            /*var dot = new paper.Path.Circle(this.instances[k].position.x+data[d].position.x,this.instances[k].position.y+data[d].position.y,5);
                dot.fillColor = 'green';
                this.scaffolds.push(dot);*/
          }
        
      } else {
       
        for (var z = 0; z < this.instance_literals.length; z++) {
          var path_literal = master.clone();
          path_literal.nodeParent = this;
          path_literal.instanceParentIndex = z;
          path_literal.data.index = z;
          var nInstance = this.instance_literals[z];
          nInstance.compile({});
          var rect = new paper.Path.Rectangle(0,0,this.dimensions.width,this.dimensions.height);
          rect.strokeColor='red';
          rect.transform(nInstance.matrix);
          this.scaffolds.push(rect);

          path_literal.transform(nInstance.matrix);
          path_literal.visible = nInstance.visible;
          
          this.path_literals.push(path_literal);
          path_literal.instanceIndex = this.path_literals.length - 1;
          path_literal.selected = nInstance.selected;
        }
      }

    },



    //checks to see if path exists in masters array
    containsPath: function(path) {
      for (var i = 0; i < this.path_literals.length; i++) {
        if (this.path_literals[i].equals(path)) {
          console.log('contains path found');
          return true;
        }
      }
      return false;
    },

    /*selects according render signature
     * the render signature is a list of values that is generated upon rendering and
     * provides a means to track the inerhtiance structure of an instance
     * index= index at which to slice instance's render signature
     *  value= string which represents render signature that we are trying to match
     * path= original path literal that was selected- used to ensure we are selecting the right object
     */
    selectByValue: function(index, value, path, currentNode) {
      var sIndexes = [];

      if (this.containsPath(path)) {

        for (var i = 0; i < this.instance_literals.length; i++) {
          var compareSig = this.instance_literals[i].renderSignature.slice(0, index + 1);
          compareSig = compareSig.join();
          if (compareSig === value) {
            var last = this.instance_literals[i].renderSignature.length - 1;
            var iIndex = this.instance_literals[i].renderSignature[last];
            this.instances[iIndex].selected = true;
            var copySig = this.instance_literals[i].renderSignature.slice(0);

            copySig.pop();
            if (copySig.length > 0) {
              sIndexes.push(copySig);
            }
     
          }

        }
      }
      return sIndexes;
    },

    deleteNode: function() {
      for (var i = this.children.length - 1; i > -1; i--) {
        this.children[i].deleteNode();
        this.removeChildAt(i);
      }
      for (var i = 0; i < this.path_literals.length; i++) {
        this.path_literals[i].remove();
        this.path_literals[i] = null;
      }
      this.nodeParent.removeChildNode(this);
    },



    //selects or deselects all path instances
    selectAll: function() {
      for (var i = 0; i < this.path_literals.length; i++) {
        this.path_literals[i].selected = true;
      }

    },

    deselectAll: function() {
      for (var i = 0; i < this.path_literals.length; i++) {
        this.path_literals[i].selected = false;
      }
      for (var j = 0; j < this.instances.length; j++) {
        this.instances[j].selected = false;
      }

    },


    //update triggers change event in mouseup
    mouseUpInstance: function() {

      this.trigger('change:mouseUp', this);

    },

    /* placeholder functions for leftOf, rightOf geometric checks */
    instanceSide: function(instance) {
      for (var i = 0; i < this.instances.length; i++) {
        var side, pA, pB, pM;
        if (this.instances[i].closed) {

          pA = {
            x: this.instances[i].position.x,
            y: 0
          };
          pB = {
            x: this.instances[i].position.x,
            y: 100
          };


        } else {
          var master = this.path_literals[i + 1];
        
          pA = {
            x: master.segments[0].point.x,
            y: master.segments[0].point.y
          };
          pB = {
            x: master.segments[master.segments.length - 1].point.x,
            y: master.segments[master.segments.length - 1].point.y
          };

        }

        pM = instance.position;
        side = TrigFunc.side(pA, pB, pM);
        return side;

      }
    },

    //checks for intersection and returns the first path found
    checkIntersection: function() {
      for (var i = 1; i < this.path_literals.length; i++) {
        var path_literal = this.path_literals[i];
        var paths = paper.project.activeLayer.children;
        for (var j = 0; j < paths.length; j++) {

          if (paths[j].visible && !this.containsPath(paths[j])) {
            if (paths[j].nodeParent) {
              if (paths[j].nodeParent.nodeParent === this.nodeParent && this.nodeParent.type === 'behavior') {
              } else {
                var ints = paths[j].getIntersections(path_literal);
                if (ints.length > 0) {
                  return paths[j];
                }
              }
            }

          }
        }
      }
      return null;
    }



  });

  return PathNode;

});