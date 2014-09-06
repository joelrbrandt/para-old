/* behavior functionality mixin */
define([
    'underscore',
    'models/data/Condition'
  ],

  function(_) {

    var BehaviorUpdates = function() {
      //checks to see if behavior type has been added to this instance
      this.containsBehaviorType = function(type) {
        var indexes = [];
        for (var i = 0; i < this.behaviors.length; i++) {
          if (this.behaviors[i].behavior.type === type) {

            indexes.push(i);
          }
        }
        if (indexes.length > 0) {
          return indexes;
        }
        return false;

      };

      this.getBehaviorsWithMethod = function(methodName) {
        return _.filter(this.behaviors, function(behavior) {
          var found = $.inArray(methodName, behavior.methods);
          return found !== -1;
        });
      };

      //returns first behavior that matches name
      this.getBehaviorByName = function(name) {
        for (var i = 0; i < this.behaviors.length; i++) {
          if (this.behaviors[i].behavior.name === name) {
            return this.behaviors[i].behavior;
          }
        }
        return null;
      };

      this.getBehaviorByType = function(type) {
        return _.filter(this.behaviors, function(behavior) {
          return behavior.behavior.type === type;
        });
      };

      //checks by name to see if behavior type has been added to this instance
      this.containsBehaviorName = function(name) {
        var indexes = [];
        for (var i = 0; i < this.behaviors.length; i++) {
          if (this.behaviors[i].behavior.name === name) {
            indexes.push(i);
          }
        }
        if (indexes.length > 0) {
          return indexes;
        }
        return false;


      };


      this.addBehavior = function(behavior, datatype, index) {
        behavior.setDatatype(datatype);
        if (index) {
          if (index === 'last') {
            this.behaviors.push({
              behavior: behavior
            });
          } else {
            this.behaviors.splice(index, 0, {
              behavior: behavior
            });

          }
        } else {
          this.behaviors.push({
            behavior: behavior
          });
        }
      };

      this.removeBehavior = function(name) {

        var toRemove = _.filter(this.behaviors, function(behavior) {
          return behavior.behavior.name === name;
        });
        //console.log(toRemove);
        this.behaviors = _.filter(this.behaviors, function(behavior) {
          return behavior.behavior.name !== name;
        });

        for (var i = 0; i < toRemove.length; i++) {
          //TODO: fix this hack- will remove user defined rotation
          if (toRemove[i].behavior.type === 'distribution') {
            toRemove[i].behavior.distributionReset();
          }
          var methods = toRemove[i].methods;

        }
      };

      this.methodOverriden = function(methodName) {
        for (var i = 0; i < this.originalMethods.length; i++) {
          if (this.originalMethods[i].name === methodName) {
            return true;
          }
        }
        return false;
      };

      this.getOriginal = function(methodName) {
        for (var i = 0; i < this.originalMethods.length; i++) {
          if (this.originalMethods[i].name === methodName) {
            return this.originalMethods[i].method.clone();
          }
        }
        return null;
      };



      this.before = function(extraBehavior) {
        return function(original) {
          return function() {
            extraBehavior.apply(this, arguments);
            return original.apply(this, arguments);
          };
        };
      };



      this.addConstraint = function(constraint) {};

      this.addCondition = function(propA, operator, targetB, propB) {
        var condition = new Condition(propA, operator, targetB, propB);
        this.conditions.push(condition);
      };

      this.checkConditions = function(instance) {
        for (var i = 0; i < this.conditions.length; i++) {
          if (!this.conditions[i].evaluate(instance)) {
            return false;
          }
        }
        return true;
      };

      this.checkConstraints = function(constraint, instance) {

      };

    };
    return BehaviorUpdates;
  });