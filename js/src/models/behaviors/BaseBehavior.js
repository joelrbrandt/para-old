/*BaseBehavior.js
base class for all behaviors */

define([
		'toolbox'

	],

	function(Toolbox) {

		var BaseBehavior = Toolbox.Base.extend({
			conditions: [],
			name: 'base',
			type: 'none',


			events: {

			},

			//sets parameters for behavior
			setParams: function(data){

			},

			//called when node is assigned the behavior
			setup: function(data){

			},

			//called when node is updated
			update: function(){

			},

			/*adds a condition string. Strings should be formatted as code:
			 * instance.position.x < 100 & instance.position.y <100;
			 *
			 */
			addCondition: function(condition_string) {
				this.conditions.push(condition_string);
			},

			checkConditions: function(instance) {
				console.log('total num of conditions=' + this.conditions.length);
				for (var i = 0; i < this.conditions.length; i++) {
					if (!this.checkCondition(this.conditions[i], instance)) {
						return false;
					}
				}
				return true;
			},

			checkCondition: function(condition, instance) {
				console.log('condition=' + condition);
				console.log('evaluating=');
				//console.log(eval(condition));
				var result = eval(condition);
				console.log('evaluating='+result);
				return result;
			}

		});

		return BaseBehavior;
	});