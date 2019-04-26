var Turtle2D = function (settings) {
    var $canvas = $("#" + settings.canvasId);
    var instruction = settings.instruction;
    var productionsString = settings.productionsString;
    var numberOfIterations = settings.numberOfIterations;
    var instructionData = [];
    var drawID;
    var instructionIndex = 0;
    var color;
    var changeLine = [];
    var changeMethod = [];

    this.stop = function () {
        if (drawID != null) {
            window.clearInterval(drawID);
            drawID = null;
        }
    };

    this.setInstruction = function (newInstruction) {
        instruction = newInstruction;
    };

    this.changeColor = function (newColor) {
        color = newColor;
    };

    this.drawWithProperLength = function (turtleX, turtleY, turtleAngle, angle, lineLength, turtleColor) {
        var oldDistance = this.distanceSum;
        this.countValues(turtleX, turtleY, turtleAngle, angle, lineLength, turtleColor);
        var newLineLength = lineLength * oldDistance / this.distanceSum;
        this.drawInstantly(turtleX, turtleY, turtleAngle, angle, newLineLength, turtleColor);
        return newLineLength;
    };

    this.draw = function (turtleX, turtleY, turtleAngle, angle, lineLength, turtleColor) {
        instructionIndex = 0;
        var theta = angle;
        var x = turtleX;
        var y = turtleY;
        var alfa = turtleAngle;
        var thickness = 3;
        color = turtleColor;
        $canvas.removeLayers();
        $canvas.drawLayers();
        instructionData = [];

        var changeLineIndex = 0;

        var remembered = [];
        var rememberedImportant = [];

        if (drawID != null) {
            window.clearInterval(drawID);
            drawID = null;
        }

        drawID = window.setInterval(function () {
            if (instructionIndex >= instruction.length) {
                window.clearInterval(drawID);
                drawID = null;
                return;
            }

            instructionData[instructionIndex] = {x: x, y: y, alfa: alfa};
            switch (instruction[instructionIndex]) {
                case 'F':
                    var s2 = lineLength;
                    var thickness2 = thickness;
                    var color2 = color;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        var guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        var splitted = guts.split(",");
                        splitted.trimAll();
                        s2 = splitted[0];
                        if (splitted.length > 1) {
                            thickness2 = splitted[1];
                        }

                        if (splitted.length > 4) {
                            color2 = "rgb(" + splitted[2] + "," + splitted[3] + "," + splitted[4] + ")";
                        }
                    }

                    var x1 = x, y1 = y;
                    x += s2 * Math.cos(alfa);
                    y += s2 * Math.sin(alfa);
                    var x2 = x, y2 = y;

                    $canvas.drawLine({
                        layer: true,
                        draggable: true,
                        groups: ['lines'],
                        dragGroups: ['lines'],
                        name: 'line' + instructionIndex,
                        strokeStyle: color2,
                        strokeWidth: thickness2,
                        fillStyle: color2,
                        x1: x1, y1: y1,
                        x2: x2, y2: y2,
                        data: {number: instructionIndex},
                        click: function (layer) {
                            var sliceBegin = Math.max(0, layer.data.number - 1);
                            var sliceEnd = Math.min(instruction.length, layer.data.number + 1);
                            var oldInstruction = instruction;
                            instruction = instruction.slice(sliceBegin, sliceEnd);
                            var lindenmayer = new LindenmayerParser();
                            instruction = lindenmayer.generate(instruction, productionsString, 1);
                            var instr1 = oldInstruction.substring(0, sliceBegin);
                            var instr2 = oldInstruction.substring(sliceBegin, sliceEnd);
                            var instr3 = oldInstruction.substring(sliceEnd, oldInstruction.length);
                            instr2 = instr2.replace(/F/g, "f");
                            instruction = instr1 + "{" + instr2 + instr3 + "}" + instruction;
                            changeLine.push(oldInstruction.length + 1);
                            changeLine.push(instruction.length - 1);
                            changeMethod.push('-');
                            changeMethod.push('+');

                            draw(turtleX, turtleY, turtleAngle, angle, lineLength, turtleColor);
                        }
                    });

                    break;
                case 'f':
                    s2 = lineLength;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        splitted = guts.split(",");
                        splitted.trimAll();
                        s2 = splitted[0];
                    }

                    x += s2 * Math.cos(alfa);
                    y += s2 * Math.sin(alfa);
                    break;
                case 'O':
                    var s2 = lineLength;
                    var thickness2 = thickness;
                    var color2 = color;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        var guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        var splitted = guts.split(",");
                        splitted.trimAll();
                        s2 = splitted[0];
                        if (splitted.length > 1) {
                            thickness2 = splitted[1];
                        }

                        if (splitted.length > 4) {
                            color2 = "rgb(" + splitted[2] + "," + splitted[3] + "," + splitted[4] + ")";
                        }
                    }

                    $canvas.drawEllipse({
                        layer: true,
                        draggable: true,
                        groups: ['lines'],
                        dragGroups: ['lines'],
                        name: 'line' + instructionIndex,
                        strokeStyle: color2,
                        strokeWidth: thickness2,
                        fillStyle: color2,
                        x: x, y: y,
                        width: s2, height: s2,
                        data: {number: instructionIndex},
                        click: function (layer) {
                            var sliceBegin = Math.max(0, layer.data.number - instruction.length / 2);
                            var sliceEnd = Math.min(instruction.length, layer.data.number + instruction.length / 2);
                            instruction = instruction.slice(sliceBegin, sliceEnd);

                            draw(turtleX, turtleY, turtleAngle, angle, lineLength * 2, turtleColor);
                        }
                    });
                    break;
                case '-':
                    var theta2 = theta;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        splitted = guts.split(",");
                        splitted.trimAll();
                        theta2 = parseFloat(splitted[0]);
                    }

                    alfa = (alfa - theta2) % (2 * Math.PI);
                    break;
                case '+':
                    theta2 = theta;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        splitted = guts.split(",");
                        splitted.trimAll();
                        theta2 = parseFloat(splitted[0]);
                    }

                    alfa = (alfa + theta2) % (2 * Math.PI);
                    break;
                case '[':
                    var tmp = [x, y, alfa];
                    remembered.push(tmp);
                    break;
                case ']':
                    var last = remembered.pop();
                    if (last != null) {
                        x = last[0];
                        y = last[1];
                        alfa = last[2];
                    }

                    break;
                case '{':
                    var tmp = [x, y, alfa];
                    rememberedImportant.push(tmp);
                    break;
                case '}':
                    var last = rememberedImportant.pop();
                    if (last != null) {
                        x = last[0];
                        y = last[1];
                        alfa = last[2];
                    }

                    break;
                default:
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                    }
                    break;
            }

            if (changeLineIndex < changeLine.length && changeLine[changeLineIndex] == instructionIndex) {
                if (changeMethod[changeLineIndex] == '-') {
                    lineLength /= 3;
                }
                else {
                    lineLength *= 3;
                }

                ++changeLineIndex;
            }

            ++instructionIndex;
        }, 1);
    };

    this.drawInstantly = function (turtleX, turtleY, turtleAngle, angle, lineLength, turtleColor) {
        var theta = angle;
        var x = turtleX;
        var y = turtleY;
        var alfa = turtleAngle;
        var thickness = 3;
        color = turtleColor;
        $canvas.removeLayers();
        $canvas.drawLayers();
        instructionData = [];

        var changeLineIndex = 0;

        var remembered = [];
        var rememberedImportant = [];

        if (drawID != null) {
            window.clearInterval(drawID);
            drawID = null;
        }

        for (var instructionIndex = 0; instructionIndex < instruction.length; ++instructionIndex) {
            instructionData[instructionIndex] = {x: x, y: y, alfa: alfa};
            switch (instruction[instructionIndex]) {
                case 'F':
                    var s2 = lineLength;
                    var thickness2 = thickness;
                    var color2 = color;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        var guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        var splitted = guts.split(",");
                        splitted.trimAll();
                        s2 = splitted[0];
                        if (splitted.length > 1) {
                            thickness2 = splitted[1];
                        }

                        if (splitted.length > 4) {
                            color2 = "rgb(" + splitted[2] + "," + splitted[3] + "," + splitted[4] + ")";
                        }
                    }

                    var x1 = x, y1 = y;
                    x += s2 * Math.cos(alfa);
                    y += s2 * Math.sin(alfa);
                    var x2 = x, y2 = y;

                    $canvas.drawLine({
                        layer: true,
                        draggable: true,
                        groups: ['lines'],
                        dragGroups: ['lines'],
                        name: 'line' + instructionIndex,
                        strokeStyle: color2,
                        strokeWidth: thickness2,
                        fillStyle: color2,
                        x1: x1, y1: y1,
                        x2: x2, y2: y2,
                        data: {number: instructionIndex},
                        click: function (layer) {
                            var sliceBegin = Math.max(0, layer.data.number - 1);
                            var sliceEnd = Math.min(instruction.length, layer.data.number + 1);
                            var oldInstruction = instruction;
                            instruction = instruction.slice(sliceBegin, sliceEnd);
                            var lindenmayer = new LindenmayerParser();
                            instruction = lindenmayer.generate(instruction, productionsString, 1);
                            var instr1 = oldInstruction.substring(0, sliceBegin);
                            var instr2 = oldInstruction.substring(sliceBegin, sliceEnd);
                            var instr3 = oldInstruction.substring(sliceEnd, oldInstruction.length);
                            instr2 = instr2.replace(/F/g, "f");
                            instruction = instr1 + "{" + instr2 + instr3 + "}" + instruction;
                            changeLine.push(oldInstruction.length + 1);
                            changeLine.push(instruction.length - 1);
                            changeMethod.push('-');
                            changeMethod.push('+');
                            drawInstantly(turtleX, turtleY, turtleAngle, angle, lineLength, turtleColor);
                        }
                    });

                    break;
                case 'f':
                    s2 = lineLength;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        splitted = guts.split(",");
                        splitted.trimAll();
                        s2 = splitted[0];
                    }

                    x += s2 * Math.cos(alfa);
                    y += s2 * Math.sin(alfa);
                    break;
                case 'O':
                    var s2 = lineLength;
                    var thickness2 = thickness;
                    var color2 = color;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        var guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        var splitted = guts.split(",");
                        splitted.trimAll();
                        s2 = splitted[0];
                        if (splitted.length > 1) {
                            thickness2 = splitted[1];
                        }

                        if (splitted.length > 4) {
                            color2 = "rgb(" + splitted[2] + "," + splitted[3] + "," + splitted[4] + ")";
                        }
                    }

                    $canvas.drawEllipse({
                        layer: true,
                        draggable: true,
                        groups: ['lines'],
                        dragGroups: ['lines'],
                        name: 'line' + instructionIndex,
                        strokeStyle: color2,
                        strokeWidth: thickness2,
                        fillStyle: color2,
                        x: x, y: y,
                        width: s2, height: s2,
                        data: {number: instructionIndex},
                        click: function (layer) {
                            var sliceBegin = Math.max(0, layer.data.number - instruction.length / 2);
                            var sliceEnd = Math.min(instruction.length, layer.data.number + instruction.length / 2);
                            instruction = instruction.slice(sliceBegin, sliceEnd);
                            draw(turtleX, turtleY, turtleAngle, angle, lineLength * 2, turtleColor);
                        }
                    });
                    break;
                case '-':
                    var theta2 = theta;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        splitted = guts.split(",");
                        splitted.trimAll();
                        theta2 = parseFloat(splitted[0]);
                    }

                    alfa = (alfa - theta2) % (2 * Math.PI);
                    break;
                case '+':
                    theta2 = theta;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        splitted = guts.split(",");
                        splitted.trimAll();
                        theta2 = parseFloat(splitted[0]);
                    }

                    alfa = (alfa + theta2) % (2 * Math.PI);
                    break;
                case '[':
                    var tmp = [x, y, alfa];
                    remembered.push(tmp);
                    break;
                case ']':
                    var last = remembered.pop();
                    if (last != null) {
                        x = last[0];
                        y = last[1];
                        alfa = last[2];
                    }

                    break;
                case '{': // store current coordinates
                    var tmp = [x, y, alfa];
                    rememberedImportant.push(tmp);
                    break;
                case '}':
                    var last = rememberedImportant.pop();
                    if (last != null) {
                        x = last[0];
                        y = last[1];
                        alfa = last[2];
                    }

                    break;
                default:
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                    }
                    break;
            }

            if (changeLineIndex < changeLine.length && changeLine[changeLineIndex] == instructionIndex) {
                if (changeMethod[changeLineIndex] == '-') {
                    lineLength /= 3;
                }
                else {
                    lineLength *= 3;
                }

                ++changeLineIndex;
            }
        }
    };

    this.distanceSum = 0;

    this.countValues = function (turtleX, turtleY, turtleAngle, angle, lineLength, turtleColor) {
        var theta = angle;
        var x = turtleX;
        var y = turtleY;
        var alfa = turtleAngle;
        var thickness = 3;
        color = turtleColor;
        $canvas.removeLayers();
        $canvas.drawLayers();
        instructionData = [];

        var changeLineIndex = 0;

        var remembered = [];
        var rememberedImportant = [];

        this.distanceSum = 0;

        for (var instructionIndex = 0; instructionIndex < instruction.length; ++instructionIndex) {
            instructionData[instructionIndex] = {x: x, y: y, alfa: alfa};
            switch (instruction[instructionIndex]) {
                case 'F':
                    var s2 = lineLength;
                    var thickness2 = thickness;
                    var color2 = color;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        var guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        var splitted = guts.split(",");
                        splitted.trimAll();
                        s2 = splitted[0];
                        if (splitted.length > 1) {
                            thickness2 = splitted[1];
                        }

                        if (splitted.length > 4) {
                            color2 = "rgb(" + splitted[2] + "," + splitted[3] + "," + splitted[4] + ")";
                        }
                    }

                    var x1 = x, y1 = y;
                    x += s2 * Math.cos(alfa);
                    y += s2 * Math.sin(alfa);

                    this.distanceSum += parseInt(s2);
                    break;
                case 'f':
                    s2 = lineLength;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        splitted = guts.split(",");
                        splitted.trimAll();
                        s2 = splitted[0];
                    }

                    var x1 = x, y1 = y;
                    x += s2 * Math.cos(alfa);
                    y += s2 * Math.sin(alfa);

                    this.distanceSum += parseInt(s2);

                    break;
                case 'O':
                    var s2 = lineLength;
                    var thickness2 = thickness;
                    var color2 = color;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        var guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        var splitted = guts.split(",");
                        splitted.trimAll();
                        s2 = splitted[0];
                        if (splitted.length > 1) {
                            thickness2 = splitted[1];
                        }

                        if (splitted.length > 4) {
                            color2 = "rgb(" + splitted[2] + "," + splitted[3] + "," + splitted[4] + ")";
                        }
                    }

                    break;
                case '-':
                    var theta2 = theta;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        splitted = guts.split(",");
                        splitted.trimAll();
                        theta2 = parseFloat(splitted[0]);
                    }

                    alfa = (alfa - theta2) % (2 * Math.PI);
                    break;
                case '+':
                    theta2 = theta;
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                        splitted = guts.split(",");
                        splitted.trimAll();
                        theta2 = parseFloat(splitted[0]);
                    }

                    alfa = (alfa + theta2) % (2 * Math.PI);
                    break;
                case '[':
                    var tmp = [x, y, alfa];
                    remembered.push(tmp);
                    break;
                case ']':
                    var last = remembered.pop();
                    if (last != null) {
                        x = last[0];
                        y = last[1];
                        alfa = last[2];
                    }

                    break;
                case '{':
                    var tmp = [x, y, alfa];
                    rememberedImportant.push(tmp);
                    break;
                case '}':
                    var last = rememberedImportant.pop();
                    if (last != null) {
                        x = last[0];
                        y = last[1];
                        alfa = last[2];
                    }

                    break;
                default:
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                    }
                    break;
            }

            if (changeLineIndex < changeLine.length && changeLine[changeLineIndex] == instructionIndex) {
                if (changeMethod[changeLineIndex] == '-') {
                    lineLength /= 3;
                }
                else {
                    lineLength *= 3;
                }

                ++changeLineIndex;
            }
        }
    };

    var countPointsDistance = function (x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    };

    var draw = this.draw;

    var drawInstantly = this.drawInstantly;
};