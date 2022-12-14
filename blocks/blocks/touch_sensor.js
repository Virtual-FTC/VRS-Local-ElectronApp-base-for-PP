/**
 * @license
 * Copyright 2016 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview FTC robot blocks related to touch sensor.
 * @author lizlooney@google.com (Liz Looney)
 */

// The following are generated dynamically in HardwareUtil.fetchJavaScriptForHardware():
// createTouchSensorDropdown
// The following are defined in vars.js:
// propertyColorSensors

Blockly.Blocks['touchSensor_getProperty'] = {
  init: function() {
    var PROPERTY_CHOICES = [
        ['IsPressed', 'IsPressed'],
    ];
    this.setOutput(true); // no type, for compatibility
    this.appendDummyInput()
        .appendField(createTouchSensorDropdown(), 'IDENTIFIER')
        .appendField('.')
        .appendField(new Blockly.FieldDropdown(PROPERTY_CHOICES), 'PROP');
    this.setColour(propertyColorSensors);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    var TOOLTIPS = [
        ['IsPressed', 'Returns true if the touch sensor is pressed.'],
    ];
    this.setTooltip(function() {
      var key = thisBlock.getFieldValue('PROP');
      for (var i = 0; i < TOOLTIPS.length; i++) {
        if (TOOLTIPS[i][0] == key) {
          return TOOLTIPS[i][1];
        }
      }
      return '';
    });
  }
};

Blockly.JavaScript['touchSensor_getProperty'] = function(block) {
  var identifier = block.getFieldValue('IDENTIFIER');
  var property = block.getFieldValue('PROP');
  var code = 'touchSensor.getProperty(' + identifier.substring(identifier.length - 1) + ', "' + property + '")';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.FtcJava['touchSensor_getProperty'] = function(block) {
  var identifier = Blockly.FtcJava.importDeclareAssign_(block, 'IDENTIFIER', 'TouchSensor');
  var property = block.getFieldValue('PROP');
  var code;
  switch (property) {
    case 'IsPressed':
      code = identifier + '.isPressed()';
      break;
    default:
      throw 'Unexpected property ' + property + ' (touchSensor_getProperty).';
  }
  return [code, Blockly.FtcJava.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['touchSensor_getProperty_Boolean'] = {
  init: function() {
    var PROPERTY_CHOICES = [
        ['IsPressed', 'IsPressed'],
    ];
    this.setOutput(true, 'Boolean');
    this.appendDummyInput()
        .appendField(createTouchSensorDropdown(), 'IDENTIFIER')
        .appendField('.')
        .appendField(new Blockly.FieldDropdown(PROPERTY_CHOICES), 'PROP');
    this.setColour(propertyColorSensors);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    var TOOLTIPS = [
        ['IsPressed', 'Returns true if the touch sensor is pressed.'],
    ];
    this.setTooltip(function() {
      var key = thisBlock.getFieldValue('PROP');
      for (var i = 0; i < TOOLTIPS.length; i++) {
        if (TOOLTIPS[i][0] == key) {
          return TOOLTIPS[i][1];
        }
      }
      return '';
    });
  }
};

Blockly.JavaScript['touchSensor_getProperty_Boolean'] =
    Blockly.JavaScript['touchSensor_getProperty'];

Blockly.FtcJava['touchSensor_getProperty_Boolean'] =
    Blockly.FtcJava['touchSensor_getProperty'];
