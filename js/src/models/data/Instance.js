/*Instance.js
 * used to store references of a shape object
 *
 */

define([
	'underscore',
	'jquery',
	'backbone',
	'models/PaperManager'
], function(_, $,Backbone, PaperManager) {
 var paper = PaperManager.getPaperInstance();

	var Instance = Backbone.Model.extend({

		 constructor: function() {
			this.visible= true;
			this.scale= 1;
			this.closed = false;
			this.width = 0;
			this.height = 0;
			this.position= {
				x: 0,
				y: 0
			};
			this.midpoint = {
				x: 0,
				y: 0
			};
			this.rotation = {
				angle:0,x:0,y:0
			};
			this.anchor= false;
			this.drawAnchor=false;
			this.selected= false;
			this.copy= false;
			this.strokeColor = 'black';
			this.fillColor = 'white';
			this.strokeWidth = 1;
			//index of instance that was used to create this instance (for instances created upon render)
			this.instanceParentIndex = 0;
			this.index = null;
			//array that contains the path of inheritance from a render;
			this.renderSignature = [];
			this.dimensions={x1:0,y1:0,x2:0,y2:0};
			Backbone.Model.apply(this, arguments);
			this.matrix = new paper.Matrix();
					 },
		reset: function() {
			//console.log("reset instance");
			this.visible= true;
			this.scale= 1;
			this.position= {
				x: 0,
				y: 0
			};
			this.rotation= {
				angle:0,x:0,y:0
			};
			this.midpoint = {
				x: 0,
				y: 0
			};
			this.width = 0;
			this.height = 0;
			this.anchor= false;
			this.selected= false;
			this.closed = false;
			this.instanceParentIndex = 0;
			this.index = null;

			
		},

		exportJSON: function(){
			console.log(this.renderSignature);
			this.set({
				closed:this.closed,
				position:this.position,
				visible:this.visible,
				scale:this.scale,
				rotation: this.rotation,
				renderSignature:JSON.stringify(this.renderSignature),
				index: this.index,
				strokeWidth: this.strokeWidth,
				fillColor: this.fillColor,
				strokeColor: this.strokeColor

			});
			return this.toJSON();
		},


		//only called on a update function- 
		//sets instances' properties to that of the data
		update: function(data){
			//console.log("calling update on instance: "+this.index+","+this.nodeParent.name);
			if(data.position){
				//console.log('prior position =');
				//console.log(this.position);

				this.position.x=data.position.x;
				this.position.y=data.position.y;
				//console.log('updated position=');
				//console.log(this.position);
			}
			if(data.width){
				this.width=data.width;
			}
			if(data.height){
				this.height = data.height;
			}
			if(data.scale){
				this.scale=data.scale;
			
			}
			if(data.rotation){
				//console.log("updating rotation");
				this.rotation.angle=data.rotation.angle;
				if(data.rotation.x){
					this.rotation.x = data.rotation.x;
				}
				else{
					this.rotation.x = this.midpoint.x;
	
				}
				if(data.rotation.y){
					this.rotation.y = data.rotation.y;
				}
				else{
					this.rotation.y = this.midpoint.y;
	
				}
			}
			if(data.strokeWidth){
				this.strokeWidth =data.strokeWidth;
			}
			if(data.strokeColor){
				this.strokeColor= data.strokeColor;
			}
			if(data.fillColor){
				this.fillColor = data.fillColor;
			}
			if(data.closed){
				this.closed = data.closed;
			}
			this.midpoint.x = this.position.x+this.width/2;
			this.midpoint.y = this.position.y+this.height/2;
			




		},

		increment: function(data){
			//console.log("calling update on instance: "+this.index+","+this.nodeParent.name);
			if(data.position){
				//console.log('prior position =');
				//console.log(this.position);

				this.position.x+=data.position.x;
				this.position.y+=data.position.y;
				//console.log('updated position=');
				//console.log(this.position);
			}
			if(data.scale){
				this.scale*=data.scale;
			
			}
			if(data.rotation){
				//console.log("updating rotation");
				this.rotation+=data.rotation;
			}
			if(data.strokeWidth){
				this.strokeWidth =data.strokeWidth;
			}
			if(data.strokeColor){
				this.strokeColor= data.strokeColor;
				console.log("stroke ="+this.strokeColor);
			}
			if(data.fillColor){
				
				this.fillColor = data.fillColor;
			}
			this.midpoint.x = this.position.x+this.width/2;
			this.midpoint.y = this.position.y+this.height/2;




		},

	

		/*only called on a render function-
		propagates the instances' properties with that of the data*/
		compile: function(data) {
			//console.log("update called with data:");
			//cloconsole.log(data);
			//if(this.nodeParent){
				//console.log("calling render on instance: "+this.index+","+this.nodeParent.name);
			//}
			this.matrix.reset();
			
			if(data.matrix){
				this.matrix.concatenate(data.matrix);
			}
			/*if(data.position){
				//console.log('prior position =');
				//console.log(this.position);

			
				
				this.matrix = this.matrix.translate(new paper.Point(this.position.x+data.position.x,this.position.y+data.position.y));

				//console.log('updated position=');
				//console.log(this.position);
			}
			else{*/
			
				this.matrix = this.matrix.rotate(this.rotation.angle,this.rotation.x,this.rotation.y);
				this.matrix = this.matrix.translate(new paper.Point(this.position.x,this.position.y));

			//}

			if(data.scale){
				this.scale*=data.scale;
			
			}
			
			if(data.selected){
				this.selected = data.selected;
			}
			/*if(data.strokeWidth){
				this.strokeWidth =data.strokeWidth;
			}
			if(data.strokeColor){
				this.strokeColor= data.strokeColor;
			}
			if(data.fillColor){
				this.fillColor = data.fillColor;
			}*/



		},

		clone: function(){
			var newInstance = new Instance();
			newInstance.position = {x:0,y:0};
			newInstance.position.x = this.position.x;
			newInstance.position.y = this.position.y;
			newInstance.scale = this.scale;
			newInstance.rotation.angle = this.rotation.angle;
			newInstance.rotation.x = this.rotation.x;
			newInstance.rotation.x = this.rotation.y;
			newInstance.midpoint.x = this.midpoint.x;
			newInstance.midpoint.y = this.midpoint.y;
			newInstance.width = this.width;
			newInstance.height = this.height;
			newInstance.anchor = this.anchor;
			newInstance.selected = this.selected;
			newInstance.visible = true;
			newInstance.strokeWidth = this.strokeWidth;
			newInstance.strokeColor = this.strokeColor;
			newInstance.fillColor = this.fillColor;
			newInstance.matrix = this.matrix.clone();
			newInstance.index = this.index
			newInstance.instanceParentIndex = this.instanceParentIndex;
			newInstance.renderSignature= this.renderSignature.slice();

			return newInstance;

		}
	});

	return Instance;



});