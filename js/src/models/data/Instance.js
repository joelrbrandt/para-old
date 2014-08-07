/*Instance.js
 * used to store references of a shape object
 *
 */

define([
	'underscore',
	'jquery',
	'backbone',
	'models/PaperManager'
], function(_, $, Backbone, PaperManager) {
	var paper = PaperManager.getPaperInstance();

	var Instance = Backbone.Model.extend({

		constructor: function() {
			this.counter = 0;
			this.visible = true;
			this.scale = 1;
			this.closed = false;
			
			this.width = 0;
			this.height = 0;
			this.origin = {
				x: 0,
				y: 0
			};

			this.matrix = new paper.Matrix();
			this.rotation=0;
			
			this.anchor = false;
			this.drawAnchor = false;
			this.selected = false;
			this.copy = false;
			this.strokeColor = 'black';
			this.fillColor = 'white';
			this.strokeWidth = 1;
			//index of instance that was used to create this instance (for instances created upon render)
			this.instanceParentIndex = 0;
			this.index = null;
			//array that contains the path of inheritance from a render;
			this.renderSignature = [];
			Backbone.Model.apply(this, arguments);
		},
		reset: function() {
			//console.log("reset instance");
			this.visible = true;
			this.scale = 1;
			this.origin = {
				x: 0,
				y: 0
			};

			this.matrix = new paper.Matrix();
			this.width = 0;
			this.height = 0;
			this.anchor = false;
			this.selected = false;
			this.closed = false;
			this.instanceParentIndex = 0;
			this.index = null;


		},

		exportJSON: function() {
			console.log(this.renderSignature);
			this.set({
				closed: this.closed,
				origin: this.origin,
				matrix: this.matrix.toJSON(),
				visible: this.visible,
				scale: this.scale,
				rotation: this.rotation,
				renderSignature: JSON.stringify(this.renderSignature),
				index: this.index,
				strokeWidth: this.strokeWidth,
				fillColor: this.fillColor,
				strokeColor: this.strokeColor

			});
			return this.toJSON();
		},


		//only called on a update function- 
		//passes a object of vectors
		update: function(data) {

			


			if (data.position) {
				console.log("updating data position");
				console.log(data.position);
				
				this.origin.x+= data.position.x;
				this.origin.y+= data.position.y;
				console.log(this.matrix); 
			}
			
			

			if (data.scale) {
				this.matrix = this.matrix.scale(data.scale,this.origin);
			}

			if (data.rotation) {
				this.rotation = data.rotation.angle;
			}
			
			if(data.origin){
				this.origin.x=data.origin.x;
				this.origin.y=data.origin.y;
			}
			
			

			
			if (data.width) {
				this.width = data.width;
			}
			if (data.height) {
				this.height = data.height;
			}
			
			
			if (data.strokeWidth) {
				this.strokeWidth = data.strokeWidth;
			}
			if (data.strokeColor) {
				this.strokeColor = data.strokeColor;
			}
			if (data.fillColor) {
				this.fillColor = data.fillColor;
			}
			if (data.closed) {
				this.closed = data.closed;
			}
		



		},

		/*increment: function(data) {
			//console.log("calling update on instance: "+this.index+","+this.nodeParent.name);
			if (data.position) {
				//console.log('prior position =');
				//console.log(this.position);

				
				//console.log('updated position=');
				//console.log(this.position);
			}
			if (data.scale) {
				

			}
			if (data.rotation) {
				//console.log("updating rotation");
			
			}
			if (data.strokeWidth) {
				this.strokeWidth = data.strokeWidth;
			}
			if (data.strokeColor) {
				this.strokeColor = data.strokeColor;
				console.log("stroke =" + this.strokeColor);
			}
			if (data.fillColor) {

				this.fillColor = data.fillColor;
			}
		


		},*/



		/*propagates the instances' properties with that of the data*/
		compile: function(data) {
			
				var origin = new paper.Point(this.origin.x, this.origin.y);		
			if (data.matrix) {
				this.matrix = this.matrix.concatenate(data.matrix);
				origin = origin.transform(data.matrix);

			}
		this.matrix = this.matrix.translate(this.origin.x,this.origin.y);
		this.matrix = this.matrix.rotate(this.rotation);
		
		
			if (data.selected) {
				this.selected = data.selected;
			}



			
			//var rotationOrigin = origin.transform(this.matrix);

		


			if (this.nodeParent.type !== 'root') {

				console.log('adding origin');
				var originC;
				if (this.counter === 0) {
					originC = new paper.Path.Circle(origin, 5);
					originC.fillColor = 'purple';
				} else if (this.counter === 1) {
					originC = new paper.Path.Circle(origin, 3);
					originC.fillColor = 'pink';
				}

				this.nodeParent.scaffolds.push(originC);
			}

			
			this.counter++;
			if (this.counter > 1) {
				this.counter = 0;
			}

		},

		clone: function() {
			var newInstance = new Instance();
			newInstance.width = this.width;
			newInstance.height = this.height;
			newInstance.anchor = this.anchor;
			newInstance.selected = this.selected;
			newInstance.visible = true;
			newInstance.strokeWidth = this.strokeWidth;
			newInstance.strokeColor = this.strokeColor;
			newInstance.fillColor = this.fillColor;
			newInstance.matrix = this.matrix.clone();
			console.log("cloned matrix =");
			newInstance.rotation = this.rotation;
			newInstance.origin.x=this.origin.x;
			newInstance.origin.y=this.origin.y;
			newInstance.index = this.index;
			newInstance.instanceParentIndex = this.instanceParentIndex;
			newInstance.renderSignature = this.renderSignature.slice();
			newInstance.nodeParent = this.nodeParent;
				console.log(newInstance.matrix);
			return newInstance;

		}
	});

	return Instance;



});