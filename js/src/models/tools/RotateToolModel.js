/*SelectToolModel.js
 *base model class for all direct manipulation tool models*/

define([
  'underscore',
  'backbone',
  'models/tools/BaseToolModel',
  'models/PaperManager'


], function(_, Backbone, BaseToolModel, PaperManager) {


  var paper = PaperManager.getPaperInstance();
  var RotateToolModel = BaseToolModel.extend({
    defaults: _.extend({}, BaseToolModel.prototype.defaults, {}),

    initialize: function() {
      this.selectedNodes = [];
      this.angle = 0;
      this.startAngle = 0;
      this.selectedIndexes = [];

    },

    /*mousedown event
     */
    mouseDown: function(event) {
      this.trigger('getSelection');
      console.log('num of selected shapes =' + this.selectedNodes.length);
      if (this.selectedNodes.length > 0) {
        var pos = this.selectedNodes[this.selectedNodes.length - 1].getFirstSelectedInstance().delta;
        for (var i = 0; i < this.selectedNodes.length; i++) {
          this.selectedIndexes.push(this.selectedNodes[i].getSelectedIndexes());
        }
        var posPoint = this.selectedNodes[this.selectedNodes.length - 1].instances[this.selectedIndexes[0]].getWindowCoordinates();
        this.angle = event.point.subtract(posPoint).angle;

        console.log(this.angle);
      }

    },


    dblClick: function(event) {


    },

    //mouse up event
    mouseUp: function(event) {

    },

    //mouse drag event
    mouseDrag: function(event) {
      if (this.selectedNodes.length > 0) {
        var posPoint = this.selectedNodes[this.selectedNodes.length - 1].instances[this.selectedIndexes[0]].getWindowCoordinates();
        //console.log("pos=",pos,"posPoint=",posPoint);
        //var posPoint = new paper.Point(pos.x,pos.y);
        var cAngle = event.point.subtract(posPoint).angle;
        console.log("angle=" + cAngle);
        var rotate = cAngle - this.angle;
        this.angle = cAngle;
        console.log("diff=" + rotate);
        for (var i = 0; i < this.selectedNodes.length; i++) {
          this.selectedNodes[i].updateSelected(this.selectedIndexes[i], {
            angle: rotate
          });
        }
        this.trigger('rootUpdate');
        this.trigger('rootRender');

      }

    },

    //mouse move event
    mouseMove: function(event) {

    }



  });

  return RotateToolModel;

});