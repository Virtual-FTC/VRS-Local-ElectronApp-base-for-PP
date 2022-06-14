let OpMode = ""
const directions = {
    'frontLeft': 0,
    'frontRight': 1,
    'backLeft': 2,
    'backRight': 3,
    'ringCollection': 4,
    'ringLoader': 5,
    'ringShooter': 6,
    'wobbleActuator': 7
}

const removeWordsJAVA = [
    "DcMotor.class,", "ColorSensor.class,", "(Double)", ".doubleValue()", ".toString()", "Double.parseDouble", "(DistanceSensor)"
]

const replaceJSString = [
    [": ElapsedTime;", " = null;"]
    , [" : DcMotor;", " = null;"]    
    , [": number;", " = null;"]

    , ["{}", "{\n}"]
    
    , ['opModeIsActive', 'linearOpMode.opModeIsActive']
    , ['Range.clip(', 'range.clip(']
    , ["ColorSensor, ", ""]
    , ["JavaUtil.formatNumber(", "misc.formatNumber("]
]

const modeTypes = ["LinearOpMode", "OpMode"]
const colorData = {
    'bottomColorSensor': 0
}
const exteralFuncs = {
    "JavaUtil.randomInt":
        [
            `mathRandomInt`,
            `function mathRandomInt(a, b) {
        if (a > b) {
          // Swap a and b to ensure a is smaller.
          var c = a;
          a = b;
          b = c;
        }
        return Math.floor(Math.random() * (b - a + 1) + a);
      }
      `]
}

var mortorVars = {}
var colorVars = {}
var elapsedTimeVars = {}
var accelerateVars = {}



var convertedSource = ""
// const gamepadVars = ["gamepad1", "gamepad2", "gamepad3", "gamepad4"]

const gamepadValues = {
    "left_stick_x": 0,
    "left_stick_y": 1,
    "right_stick_x": 2,
    "right_stick_y": 3,
    "right_stick_button": 11
}



const checkBrackets = (str) => {
    const openBracket = (str.match(/{/g) || []).length;
    const closeBracket = (str.match(/}/g) || []).length;
    return openBracket - closeBracket
}


const getBracketContent = (str) => {
    let returnStr = ""
    let bracketCount = 0

    for (var i = 0; i < str.length; i++) {
        if (str[i] == "(") bracketCount++
        else if (str[i] == ")") bracketCount--
        if (bracketCount < 0) break
        returnStr += str[i]
    }

    return returnStr

}

const valueConverter = (str) => {
    if (str.includes(".isBusy(")) {
        let sides = str.split(".isBusy(");
        const varName = sides[0];
        return `motor.isBusy(${directions[varName]})`
    } else if (str.includes(".getTargetPosition(")) {
        let sides = str.split(".getTargetPosition(");
        const varName = sides[0];
        return `motor.getProperty(${directions[varName]}, 'TargetPosition')`
    } else if (str.includes(".getCurrentPosition(")) {
        let sides = str.split(".getCurrentPosition(");
        const varName = sides[0];
        return `motor.getProperty(${directions[varName]}, 'CurrentPosition')`
    } else if (str.includes(".blue()")) {
        let sides = str.split(".blue()");
        const varName = sides[0];
        return `colorSensor.getColor(${colorVars[varName]}, 'Blue')`

    } else if (str.includes(".red()")) {
        let sides = str.split(".red()");
        const varName = sides[0];
        return `colorSensor.getColor(${colorVars[varName]}, 'Red')`

    } else if (str.includes(".green()")) {
        let sides = str.split(".green()");
        const varName = sides[0];
        return `colorSensor.getColor(${colorVars[varName]}, 'Green')`

    } else if (str.includes("getRuntime(")) {
        return str.replaceAll('getRuntime(', "linearOpMode.getRuntime(");

    }else if (str.includes(".getDistance(")) {
        let sides = str.split(".getDistance(")
        let colorIndex = 0
        Object.keys(colorData).map((color) => {
            if (sides[0].includes(color)) colorIndex = color
        })
        let value = getBracketContent(sides[1])
        return `colorSensor.getDistance(${colorData[colorIndex]}, ${value})`;

    }else if(/gamepad(\d+).(\w+)_stick_(\w)/.test(str)){
        const gamepadV = /gamepad(\d+).(\w+)_stick_(\w)/.exec(str)
        const keyV = `${gamepadV[2]}_stick_${gamepadV[3]}`
        let returnStr = ""
        if(gamepadValues[keyV]<4)
            returnStr =  `gamepad.numberValue(${gamepadV[1]-1}, ${gamepadValues[keyV]}`
        else 
            returnStr =  `gamepad.boolValue(${gamepadV[1]-1}, ${gamepadValues[keyV]}, 'Both')`
        return returnStr

    }else if(str.includes(".getPower()")){
        const exeVars = /this.(\w+).getPower/.exec(str)
        let returnStr = str.replace("()", "")
        return returnStr.replaceAll(/this.(\w+).getPower/g, `motor.getProperty(${mortorVars[exeVars[1]]}, 'Power')`)

    }else if(str.includes("DistanceUnit.CM")){
        const exeVars = /DistanceUnit.(\w+)/g.exec(str)
        return str.replaceAll(`DistanceUnit.${exeVars[1]}`, `'${exeVars[1]}'`)
    }

    else if(/(\w+).toString\(\)/g.test(str)){
        let values = /(\w+).toString\(\)/g.exec(str)
        if(elapsedTimeVars[values[1]]){
            return str.replace(/(\w+).toString\(\)/g, `String(elapsedTime.toText(${values[1]}))`)
        }
    }

    else if(/(\w+).seconds\(\)/g.test(str)){
        let values = /(\w+).seconds\(\)/g.exec(str)
        if(elapsedTimeVars[values[1]]){
            return str.replace(/(\w+).seconds\(\)/g, `String(elapsedTime.get("Seconds", ${values[1]}))`)
        }
    }

    else if(/(\w+).reset\(\)/g.test(str)){
        let values = /(\w+).reset\(\)/g.exec(str)
        if(elapsedTimeVars[values[1]]){
            return str.replace(/(\w+).reset\(\)/g, `elapsedTime.reset(${values[1]})`)
        }
    }

    else if(/(\w+).toUnit\((\w+)\)/g.test(str)){
        let values = /(\w+).toUnit\((\w+)\)/g.exec(str)
        if(accelerateVars[values[1]]){
            return str.replace(/(\w+).toUnit\((\w+)\)/g, `acceleration.toDistanceUnit(${values[1]}, "${values[2]}")`)
        }
    }

    
    return str
}
const valueChecker = (str) => {
    if (str.includes("JavaUtil.inListGet(")) {
        let sides = str.split("JavaUtil.inListGet(")
        let bracks = 0
        let listValue = ''
        for (var i = 0; i < sides[1].length; i++) {
            if (sides[1][i] == "(") bracks++
            else if (sides[1][i] == ")") bracks--

            if (bracks < 0) break;
            else listValue += sides[1][i]
        }
        let listValueArr = listValue.split(", ")
        listValueArr = `${listValueArr[0]}[${listValueArr[2]}]`
        return str.replaceAll("JavaUtil.inListGet(" + listValue + ")", listValueArr)
    }
    var words = str.split(" ")
    if (words.length > 0) {
        for (var i = 0; i < words.length; i++)
            words[i] = valueConverter(words[i]);
        return words.join(" ")
    } else
        return str;
}
const customConvert = (str) => {
    let result = str;
    if (result.includes('hardwareMap.get')) {
        let hardmaps = /this.(\w+) = hardwareMap.get\(DcMotor, "(\w+)"\);/g.exec(result);
        const varName = hardmaps[1];
        const varValue = hardmaps[2];
        if (directions[varValue] != undefined)
            mortorVars[varName] = directions[varValue];
        else if (colorData[varValue] != undefined)
            colorVars[varName] = colorData[varValue];
        return "";
    }

    else if (str.includes("new ElapsedTime()")) {
        let values = /(\w+) = /.exec(str);
        elapsedTimeVars[values[1]] = true;
        return str.replace("new ElapsedTime()", "elapsedTime.create()");
    }

    else if (str.includes("new Acceleration()")) {
        let values = /this.(\w+) = /.exec(str);
        accelerateVars[values[1]] = true;
        return str.replace("new Acceleration()", "Acceleration.create()");
    }

    else if (result.includes('.setDirection')) {
        let hardmaps = /this.(\w+).setDirection\(DcMotorSimple.Direction.(\w+)\);/g.exec(result);
        const varName = hardmaps[1];
        const value = hardmaps[2];
        return `motor.setProperty([${mortorVars[varName]}], 'Direction', ['${value}']);`;
    }
    else if (str.includes('waitForStart()')) {
        return str.replace('waitForStart', 'await linearOpMode.waitForStart');
    }
    else if (str.includes('.setPower(')) {
        // let regStr = result.replaceAll(`(`, "OOO").replaceAll(`)`, "CCC");
        let matches = /this.(\w+).setPower\((.*)\);/g.exec(result);        
        const varName = matches[1];
        const value = valueChecker(matches[2]);
        return `motor.setProperty([${mortorVars[varName]}], 'Power', [${value?value:0}]);`;
    }
    else if (str.includes('setMode(')) {        
        // let regStr = result.replaceAll(`(`, "OOO").replaceAll(`)`, "CCC");
        let hardmaps = /this.(\w+).setMode\(DcMotor.RunMode.(\w+)\);/g.exec(str);
        const varName = hardmaps[1];
        const value = hardmaps[2];
        return `motor.setProperty([${mortorVars[varName]}], 'Mode', ['${value}']);`;
    }
    else if (str.includes('setTargetPosition(')) {
        // let regStr = result.replaceAll(`(`, "OOO").replaceAll(`)`, "CCC");
        let matches = /this.(\w+).setTargetPosition\((.*)\);/g.exec(str);        
        const varName = matches[1];
        const value = valueChecker(matches[2]);
        return `motor.setProperty([${mortorVars[varName]}], 'TargetPosition', [${value?value:0}]);`;
    }    
    else if (str.includes('setZeroPowerBehavior(')) {
        let regStr = result.replaceAll(`(`, "OOO").replaceAll(`)`, "CCC");
        let matches = /this.(\w+).setZeroPowerBehavior\(DcMotor.ZeroPowerBehavior.(\w+)\);/g.exec(regStr);
        const varName = matches[1];
        const value = matches[2];
        return `motor.setProperty([${mortorVars[varName]}], 'ZeroPowerBehavior', ['${value}']);`;
    }
    else if (str.includes('setTargetPositionTolerance(')) {
        // let regStr = result.replaceAll(`(`, "OOO").replaceAll(`)`, "CCC");
        let matches = /this.(\w+).setTargetPositionTolerance\((.*)\);/g.exec(str);
        const varName = matches[1];
        const value = valueChecker(matches[2]);
        return `motor.setProperty([${mortorVars[varName]}], 'TargetPositionTolerance', [${value?value:0}]);`;
    }
    else if (str.includes("if (")) {
        let sides = str.split("if (");
        const value = valueChecker(sides[1].split(") {")[0]);
        return `if (${value}) {` + sides[1].split(") {")[1];
    }
    else if (str.includes("JavaUtil.createListWith(")) {
        let sides = str.split("JavaUtil.createListWith(");
        const value = valueChecker(sides[1].split(");")[0]);
        return `${sides[0]}[${value}];`;
    }
    else if (str.includes("GoToPosition(")) {
        let sides = str.split("GoToPosition(");
        const value = valueChecker(sides[1].split(");")[0]);
        return `${sides[0]} GoToPosition(${value});`;
    }
    else if (str.includes("while (")) {
        let sides = str.split("while (");
        const value = valueChecker(sides[1].split(") {")[0]);
        return `while (${value}) {await linearOpMode.sleep(1);\n` + sides[1].split(") {")[1];
    }
    else if (str.includes("for (")) {
        let sides = str.split("for (");
        const value = valueChecker(sides[1].split(") {")[0]);
        return `for (${value}) {` + sides[1].split(") {")[1];

    } else if (str.includes("telemetry.addData(")) {
        let sides = str.split("telemetry.addData(")[1].split(");")[0]
        // .split(" ")
        let bracketCount = 0
        let s = 0
        for (s = 0; s < sides.length; s++) {
            if (sides[s] == '(') bracketCount++
            else if (sides[s] == ')') bracketCount--
            if (bracketCount == 0 && sides[s] == ',') break;
        }
        sides = [sides.substring(0, s), sides.substring(s + 2, sides.length)]
        let newVars = []
        sides.map(item => {
            newVars.push(valueChecker(item))
        })
        newVars = newVars.join(", ");
        return `telemetry.addData(${newVars});`
    }
    else if (str.includes('sleep')) {
        return "await linearOpMode.sleep(" + str.split("sleep(")[1];
    } else
        return valueChecker(str);
}
async function convert_2js(url, javaCode, callback) {
    var result = "";
    var jsString = ''
    var brackets = 0
    var funcBlocks = {}
    var funcValues = {}
    var funcName = ''
    var modeType = 0
    var lineTxt = ""
    let rawSource = ""

    try {
        // modeTypes.map((mode, i)=>{
        //     if(javaString.includes("extends " + mode)) modeType = i
        // })

        // var classString1 =  javaString.split("extends " + modeTypes[modeType])

        // var classString2 = classString1[0].split("@TeleOp(")

        // if(classString2.length == 1)classString2 = ['', classString2[0]]

        // var classString3 = classString2[1].split("public class ")

        // javaString = (classString2[0]==''?'':( classString2[0] + "@TeleOp(")) + (classString3[0] + "public class MainControlClass extends " + modeTypes[modeType]) +classString1[1]

        // removeWordsJAVA.map(word=>{
        //     firstJS = firstJS.replaceAll(word, "")
        // })
        // result = javaToJavascript(javaString);

        await axios({
            method: 'post',
            url,
            data: {
                javaCode
            }
        })
            .then(function (response) {
                result = response.data
                rawSource = response.data

            })

        replaceJSString.map(word => {
            result = result.replaceAll(word[0], word[1])
        })

        if(/export class (\w+) extends LinearOpMode\b/g.test(result)){
            OpMode = "LinearOpMode"
        }else if(/export class (\w+) extends OpMode\b/g.test(result)){
            OpMode = "OpMode"
        }else
            return "Parse Error"

        console.log(OpMode)
        result = result.split('\n');
        for (let i = 1; i < result.length; i++) {
            lineTxt = result[i].trim();
            brackets += checkBrackets(lineTxt);
            // var 
            if (brackets == 1 && !funcName) {
                const values = /(public)? (\w+)\((.*)\)(: void)? {/g.exec(lineTxt)
                funcName =   values[2];
                funcBlocks[funcName] = [];
                funcValues[funcName] = values[3];
            } else if (brackets > 0) {

                var jsLine = customConvert(lineTxt);
                if (jsLine != "") funcBlocks[funcName].push(jsLine);

            } else if (brackets == 0 && funcName) {
                if (funcName != 'constructor')
                    funcBlocks[funcName] = funcBlocks[funcName].join("\n");
                funcName = '';
            }
        }

        console.log("Vars : ", mortorVars, colorVars, funcBlocks, funcValues)
        // funcBlocks['runOpMode'] = funcBlocks['runOpMode'].join("\n")   
        if (typeof funcBlocks['constructor'] != 'function' && funcBlocks['constructor'])
            funcBlocks['constructor'].map(line => {
                const varValue = line.trim().split(" = ")
                if (mortorVars[varValue[0]] != undefined || colorVars[varValue[0]] != undefined) return false

                jsString += "var " + line + "\n"
            })
        Object.keys(funcBlocks).map(key => {
            if (key === 'constructor') return
            Object.keys(funcBlocks).map(key1 => {
                if (key == key1 || key1 === 'constructor') return
                funcBlocks[key1] = funcBlocks[key1].replaceAll((key + "("), ("await " + key + "("));
            })

            Object.keys(exteralFuncs).map(funct => {
                if (funcBlocks[key].includes(funct)) {
                    funcBlocks[key] = funcBlocks[key].replaceAll(funct, exteralFuncs[funct][0])
                    jsString += exteralFuncs[funct][1] + "\n"
                }
            })
        })

        Object.keys(funcBlocks).map(key => {
            if (key != "constructor")
                jsString += `async function ${key}(${funcValues[key]}) { 
                ${funcBlocks[key]}
            }\n`
        })

        if (OpMode == "LinearOpMode")
            jsString += `          
            await runOpMode();`
        else
            jsString += `  
            function runOpMode() {
                await init();
                while (!linearOpMode.isStarted())
                  await init_loop();
                await start();
                while (linearOpMode.opModeIsActive())
                  await loop();
                await stop();
              }
            
            await runOpMode();`


        jsString  = js_beautify(jsString)

    } catch (e) {
        console.log(lineTxt)
        console.log("parse error : ", e)
        callback("parse error", e)
    }

    callback(rawSource, jsString)

}
