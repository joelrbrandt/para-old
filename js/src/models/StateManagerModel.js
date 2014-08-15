/*StateManagerModel.js
 *model that manages all base shapes*/

define([
  'jquery',
  'underscore',
  'backbone',
  'models/data/GeometryNode',
  'models/data/PathNode',

  'models/tools/ToolCollection',
  'models/tools/PenToolModel',
  'models/tools/PolyToolModel',
  'models/tools/SelectToolModel',
  'models/behaviors/BehaviorManagerModel',

  'models/PaperManager',


  'filesaver'



], function($, _, Backbone, GeometryNode, PathNode, ToolCollection, PenToolModel, PolyToolModel, SelectToolModel, BehaviorManagerModel, PaperManager, FileSaver) {
  var rootNode,
    currentNode,
    toolCollection,
    penTool,
    polyTool,
    selectTool,
    paper,
    mousePos;

    var undoLimit =15;



  var StateManagerModel = Backbone.Model.extend({

    defaults: {
      'state': 'selectTool',
    },

    initialize: function(event_bus) {
      //console.log(new FileSaver());
      paper = PaperManager.getPaperInstance();
      penTool = new PenToolModel({
        id: 'penTool'
      });
      selectTool = new SelectToolModel({
        id: 'selectTool'
      });
      selectTool.event_bus = event_bus;
      polyTool = new PolyToolModel({
        id: 'polyTool'
      });
      this.modified = false;

      this.event_bus = event_bus;

      toolCollection = new ToolCollection([penTool, selectTool, polyTool]);
      this.listenTo(toolCollection, 'nodeAdded', this.nodeAdded);
      this.listenTo(toolCollection, 'nodeSelected', this.nodeSelected);
      this.listenTo(toolCollection, 'setSelection', this.setSelection);
      this.listenTo(toolCollection, 'setCurrentNode', this.setCurrentNode);
      this.listenTo(toolCollection, 'moveUpNode', this.moveUpNode);
      this.listenTo(toolCollection, 'moveDownNode', this.moveDownNode);

      this.listenTo(toolCollection, 'optionClick', this.openMenu);
      this.listenTo(toolCollection, 'rootRender', this.rootRender);
      this.listenTo(toolCollection, 'rootUpdate', this.rootUpdate);

      this.listenTo(toolCollection, 'currentRender', this.currentRender);
     

      this.listenTo(event_bus, 'nodeAdded', this.nodeAdded);

      this.listenTo(event_bus, 'rootRender', this.rootRender);
      //this.listenTo(event_bus, 'currentRender', this.currentRender);


      this.listenTo(event_bus, 'moveDownNode', this.moveDownNode);

      rootNode = new GeometryNode();
      rootNode.type = 'root';
      currentNode = rootNode;
      this.rootRender();
     localStorage.clear();

    },

    setState: function(state) {
      toolCollection.get(this.get('state')).reset();

      this.set('state', state);


    },

    //returns currently selected object as JSON object. If nothing is selected, returns the root object
    getSelected: function() {
      ////console.log('attempting to get selected'+rootNode.getChildAt(0));
      //currentNode = rootNode.getChildAt(0);
      return currentNode.toJSON();

    },

    resetTools: function() {
      toolCollection.get(this.get('state')).reset();

    },

    //callback triggered when tool adds new node
    nodeAdded: function(node) {
      //console.log('node added: '+ node.type);
      currentNode.addChildNode(node);
      toolCollection.get(this.get('state')).currentNode = node;

    },

    moveUpNode: function() {
      this.setCurrentNode(currentNode);
      //console.log('current node type='+currentNode.type);
      this.rootRender();
    },

    //moves down based on path
    moveDownNode: function(path) {
      var children = currentNode.children;
      for (var i = 0; i < children.length; i++) {
        if (children[i].containsPath(path) && children[i].type != 'path') {
          currentNode = children[i];
          toolCollection.get(this.get('state')).currentNode = children[i];
        }
      }
      //console.log('current node type='+currentNode.type);
      this.rootRender();
    },

    /* sets correct selection based on currentNode
     * determines value by finding the hierarchical level of the current node
     * and using that level as an index to slice the render signature of the currently selected path
     * sends this as the starting value for selecting other relevant paths based on the current node
     */
    setSelection: function(path) {

      var index = currentNode.getLevelInTree(rootNode, 0);
      if (path.data.renderSignature[index] !== null) {
        var value = path.data.renderSignature.slice(0, index + 1);
        value = value.join();

        currentNode.selectByValue(index, value, path, currentNode);

      }

    },

    rootRender: function() {
      //console.log('called root render');

      rootNode.clearObjects();
      rootNode.render(null, currentNode);

      // var numChildren = paper.project.activeLayer.children.length;
      this.trigger('renderComplete');
      // console.log('total number of children='+numChildren);
      // console.log( paper.project.activeLayer.children);
    },

    rootUpdate: function() {
      //console.log('called root render');
      this.modified = true;
      this.trigger('disableSave',!this.modified);

      rootNode.update([{}]);

    },
    currentRender: function() {
      //console.log('called current render');
      currentNode.clearObjects();
      currentNode.render(null, currentNode);
    },
    //callback triggered when tool navigates to specific node in tree;
    setCurrentNode: function(node) {

      if (node.getParentNode() !== null) {
        //console.log('current node is set in state to:' +node.getParentNode().type);
        currentNode = node.getParentNode();
      } else {
        //console.log('current node is set in state to:' +currentNode.type);



      }
    },

    //callback triggered when select tool selects shape
    nodeSelected: function(selected) {
      this.determineSelectionPoint(selected);

    },

    /*recursively follows parent hierarchy upwards to find correct selection point 
     * when selected node is found, it is assigned as the currently selected
     * node in the selected tool.
     * TODO: make this assignment less janky.
     */
    determineSelectionPoint: function(selected) {
      //console.log('determining selection point');
      if (selected.nodeParent) {
        if (selected.nodeParent == currentNode) {
          toolCollection.get(this.get('state')).currentNode = currentNode;
          if (toolCollection.get(this.get('state')).selectedNodes.indexOf(selected) == -1) {
            toolCollection.get(this.get('state')).selectedNodes.push(selected);

            this.event_bus.trigger('nodeSelected', selected);

          }
          return;
        }
        if (selected == rootNode) {
          return;
        } else {
          this.determineSelectionPoint(selected.nodeParent);
        }
      }
    },


    /* Called by select tool on Shift-click
     * pulls up the properties menu for the selected node
     */
    openMenu: function(node) {
      this.event_bus.trigger('openMenu', node);
    },

    //triggered by paper tool on a mouse down event
    toolMouseDown: function(event, pan) {
      if (!pan) {
        var selectedTool = toolCollection.get(this.get('state'));
        selectedTool.mouseDown(event);
        if(this.get('state')==='penTool'){
          this.modified = true;
          this.trigger('disableSave',!this.modified);
        }
      }


    },

    toolMouseUp: function(event, pan) {
      if (!pan) {
        var selectedTool = toolCollection.get(this.get('state'));
        selectedTool.mouseUp(event);
      }

    },


    toolMouseDrag: function(event, pan) {
      if (!pan) {
        var selectedTool = toolCollection.get(this.get('state'));
        selectedTool.mouseDrag(event);
      }

    },

    canvasMouseDrag: function(delta, pan) {
      if (pan) {
        var inverseDelta = new paper.Point(-delta.x / paper.view.zoom, -delta.y / paper.view.zoom);
        paper.view.scrollBy(inverseDelta);
        event.preventDefault();
      }
    },

    changeZoom: function(oldZoom, delta, c, p) {
      var newZoom = this.calcZoom(oldZoom, delta);
      var beta = oldZoom / newZoom;
      var pc = p.subtract(c);
      var a = p.subtract(pc.multiply(beta)).subtract(c);
      return {
        z: newZoom,
        o: a
      };
    },

    calcZoom: function(oldZoom, delta) {
      var factor = 1.05;
      if (delta < 0) {
        return oldZoom * factor;
      }
      if (delta > 0) {
        return oldZoom / factor;
      }
    },



    toolMouseMove: function(event, pan) {
      if (!pan) {
        var selectedTool = toolCollection.get(this.get('state'));
        selectedTool.mouseMove(event);
      }


    },

    canvasMouseWheel: function(event, pan) {
            console.log(  event.originalEvent.wheelDelta);

      if (pan) {
        var delta = event.originalEvent.wheelDelta; //paper.view.center
        var mousePos = new paper.Point(event.offsetX, event.offsetY);

        var viewPosition = paper.view.viewToProject(mousePos);
        var data = this.changeZoom(paper.view.zoom, delta, paper.view.center, viewPosition);
        paper.view.zoom = data.z;
        paper.view.center = paper.view.center.add(data.o);
        event.preventDefault();
        paper.view.draw();
      }
      else{
        var update = 1;
        if( event.originalEvent.wheelDelta<0){
          update = -1;
        }
        this.updateCopyNum(update);
      }



    },

    canvasDblclick: function(event) {
      var selectedTool = toolCollection.get(this.get('state'));
      selectedTool.dblClick(event);

    },

    //called when escape key is pressed in canvas
    escapeEvent: function() {

    },

    saveFile: function(id,filename) {
      console.log('id='+id);
      if (this.modified){
        id = this.save(filename);
         console.log('id='+id);
     }
     console.log('id='+id);
      var data = localStorage[id];
      var blob = new Blob([data], {
        type: 'text/plain;charset=utf-8'
      });
      var fileSaver = new FileSaver(blob, filename);
      return id;
    },

    save: function(filename) {

      var id = Date.now();
      console.log('saving with name:' + id);
      var data = JSON.stringify(rootNode.exportJSON());

      this.saveToLocal(id,data);

      console.log(localStorage[id]);
      this.trigger('localSaveComplete', id);
      console.log('completed saving');
      this.modified = false;
      this.trigger('disableSave',!this.modified);
      return id;
    },

    saveToLocal: function(id, data) {
      var saved = false;
      console.log(localStorage.length);
      while (localStorage.length>undoLimit-1) {
       // try {
         
        //} catch (e) {
            var arr = [];
          for (var key in localStorage) {
            if (localStorage.hasOwnProperty(key) && !isNaN(key)) {
              arr.push(key);
            }
          }

          arr.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          console.log('array=');
          console.log(arr);
          this.trigger('removeItem',arr[0]);
          localStorage.removeItem(arr[0]);

        //}
      }
       localStorage.setItem(id, data);
        saved = true;
    },


    loadLocal: function(filename) {
      console.log('loading with name:' + filename);

      var data = localStorage[filename];
      console.log(data);
      this.load(JSON.parse(data));
    },

    export: function(filename) {

      var data = paper.project.exportSVG({
        asString: true
      });
      var blob = new Blob([data], {
        type: 'image/svg+xml'
      });
      var fileSaver = new FileSaver(blob, filename);
    },

    load: function(loadObj) {
      console.log(loadObj);
      rootNode.deleteChildren();
      var children = loadObj.children;
      this.parseJSON(rootNode, children);
      if(rootNode.children.length>0){ 
        this.setCurrentNode(rootNode.children[0]);
      }
      this.rootUpdate();
      this.rootRender();
      paper.view.draw();  
      this.modified = false;
      this.trigger('disableSave',!this.modified);
    },

    loadFile: function(file) {
      var reader = new FileReader();
      reader.parent = this;
      reader.onload = (function(theFile) {
        
        return function(e) {
          this.parent.load(JSON.parse(e.target.result));
          var id = this.parent.save(theFile.name);
          this.parent.trigger('loadComplete',id, theFile.name);
        };
      })(file);
      reader.readAsText(file);
    },

    parseJSON: function(currentNode, data) {
      for (var i = 0; i < data.length; i++) {
        var type = data[i].type;
        var node;
        switch (type) {
          case 'path':
            node = new PathNode(data[i]);
            break;
          default:
            node = new GeometryNode(data[i]);
            break;
        }
        node.type = type;
        node.name = data[i].name;
        currentNode.addChildNode(node);
        for (var j = 0; j < data[i].behaviors.length; j++) {
          var behavior = data[i].behaviors[j];
          this.event_bus.trigger('newBehavior', [node], behavior.name, behavior);
        }

        if (data[i].children.length > 0) {
          this.parseJSON(node, data[i].children);
        }


      }
    },

    updateStroke: function(width) {
      if (selectTool.selectedNodes.length > 0) {
        for (var i = 0; i < selectTool.selectedNodes.length; i++) {
          selectTool.selectedNodes[i].updateSelected([{
            strokeWidth: Number(width)
          }]);
        }
      }
      currentNode.update([{}]);
      this.rootRender();
      paper.view.draw();
    },

    updateColor: function(color, type) {
      console.log('update color');
      if (selectTool.selectedNodes.length > 0) {

        var update;
        if (type == 'stroke') {
          update = [{
            strokeColor: color
          }];
        } else {
          update = [{
            fillColor: color
          }];

        }
        for (var i = 0; i < selectTool.selectedNodes.length; i++) {

          selectTool.selectedNodes[i].updateSelected(update);
        }
      }
      currentNode.update([{}]);
      this.rootRender();
      paper.view.draw();
    },

    updateCopyNum: function(number){
      if (selectTool.selectedNodes.length > 0) {

        for (var i = 0; i < selectTool.selectedNodes.length; i++) {

          selectTool.selectedNodes[i].incrementCopyNum(number);
        }
      }
      currentNode.update([{}]);
      this.rootRender();
      paper.view.draw();
    },

    deleteObject: function() {
      if (selectTool.selectedNodes.length > 0) {
        for (var i = 0; i < selectTool.selectedNodes.length; i++) {
          selectTool.selectedNodes[i].deleteNode();
        }
      }
      currentNode.update([{}]);
      this.rootRender();
      paper.view.draw();
    },

  });

  return StateManagerModel;

});