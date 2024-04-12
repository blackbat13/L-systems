import * as THREE from '../vendor/three.module.min.js';

let Turtle3D = function (settings) {
    let scene;
    let camera;
    let renderer;
    let instructionData;
    let drawColor;
    let linesOnScene;
    let remembered;
    let rememberedImportant;
    let canvasWidth;
    let canvasHeight;
    let instruction = settings != null ? settings.instruction : "";
    let productionsString = settings != null ? settings.productionsString : "";
    let numberOfIterations = settings != null ? settings.numberOfIterations : 0;
    let isRandomColor;
    let overallLight;

    this.setSettings = function (settings) {
        instruction = settings.instruction;
        productionsString = settings.productionsString;
        numberOfIterations = settings.numberOfIterations;
    };

    this.initialize = function () {
        setBeginningValues();
        prepareScene();
        render();
    };

    function setBeginningValues() {
        linesOnScene = [];
        drawColor = "#ffffff";
        instructionData = [];
        remembered = [];
        rememberedImportant = [];
        canvasWidth = 2000;
        canvasHeight = 1000;
        isRandomColor = false;
    }

    function prepareScene() {
        createScene();
        createCamera();
        createRenderer();
        addLights();
    }

    function createScene() {
        scene = new THREE.Scene();
    }

    function createCamera() {
        var VIEW_ANGLE = 75, ASPECT = canvasWidth / canvasHeight, NEAR = 0.1, FAR = 10000;
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.position.z = 25;
    }

    function createRenderer() {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(canvasWidth, canvasHeight);
        document.body.appendChild(renderer.domElement);
    }

    function addLights() {
        var frontLight = new THREE.DirectionalLight(0xffffff, 1);
        frontLight.position.set(0, 0, 5);
        scene.add(frontLight);

        var backLight = new THREE.DirectionalLight(0xffffff, 1);
        backLight.position.set(0, 0, -5);
        scene.add(backLight);

        overallLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);

        var upLight = new THREE.DirectionalLight(0xffffff, 1);
        upLight.position.set(0, 5, 0);
        scene.add(upLight);

        var downLight = new THREE.DirectionalLight(0xffffff, 1);
        downLight.position.set(0, -5, 0);
        scene.add(downLight);
    }

    this.clearScene = function () {
        for (var i = 0; i < linesOnScene.length; ++i) {
            scene.remove(linesOnScene[i]);
        }

        linesOnScene = [];
    };

    this.setInstruction = function (newInstruction) {
        instruction = newInstruction;
    };

    this.changeColor = function (newColor) {
        drawColor = newColor;
    };

    this.colorRandomization = function (is) {
        if (is) {
            isRandomColor = true;
        } else {
            isRandomColor = false;
        }
    };

    this.turnLight = function(on) {
        if(on) {
            scene.add(overallLight);
            for (var i = 0; i < linesOnScene.length; ++i) {
                linesOnScene[i].material.needsUpdate = true;
            }
        } else {
            scene.remove(overallLight);
        }
    };

    function co(lor) {
        return (lor +=
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)])
        && (lor.length == 6) ? lor : co(lor);
    }

    this.draw = function (turtleX, turtleY, turtleZ, turtleOrientation, angle, lineLength, turtleColor, lineThickness) {
        var theta = angle;
        var position = [turtleX, turtleY, turtleZ];
        var thickness = lineThickness;
        var orientation = turtleOrientation;
        drawColor = turtleColor;
        var luminance = 0;
        var forwardOccurencesCount = (instruction.match(/F/g) || []).length;
        var luminanceStep = 0.8 / forwardOccurencesCount;
        for (var instructionIndex = 0; instructionIndex < instruction.length; ++instructionIndex) {
            switch (instruction[instructionIndex]) {
                case 'F':
                    luminance -= luminanceStep;
                    var s2 = lineLength;
                    var thickness2 = thickness;
                    var color2 = isRandomColor ? "#" + co('') : drawColor; //ColorLuminance(drawColor, luminance);
                    var tmp = getParametersAndIndex(instructionIndex);
                    instructionIndex = tmp.index;
                    if (tmp.parameters != null) {
                        s2 = tmp.parameters[0];
                        if (tmp.parameters.length > 1) {
                            thickness2 = tmp.parameters[1];
                        }

                        if (tmp.parameters.length > 4) {
                            color2 = "rgb(" + tmp.parameters[2] + "," + tmp.parameters[3] + "," + tmp.parameters[4] + ")";
                        }
                    }

                    var lastPosition = position.slice(0);
                    position = countForwardPosition(position, s2, orientation);

                    drawLine(new THREE.Vector3(lastPosition[0], lastPosition[1], lastPosition[2]), new THREE.Vector3(position[0], position[1], position[2]), color2, thickness2);
                    break;
                case 'f':
                    s2 = lineLength;
                    var tmp = getParametersAndIndex(instructionIndex);
                    instructionIndex = tmp.index;
                    if (tmp.parameters != null) {
                        s2 = tmp.parameters[0];
                    }

                    position = countForwardPosition(position, s2, orientation);
                    break;
                case '-':
                    var theta2 = theta;
                    var tmp = getParametersAndIndex(instructionIndex);
                    instructionIndex = tmp.index;
                    if (tmp.parameters != null) {
                        theta2 = tmp.parameters[0];
                    }

                    theta2 = -theta2;
                    var rotation = [[Math.cos(theta2), Math.sin(theta2), 0], [-Math.sin(theta2), Math.cos(theta2), 0], [0, 0, 1]];
                    orientation = multiplyMatrix(rotation, orientation);
                    break;
                case '+':
                    theta2 = theta;
                    var tmp = getParametersAndIndex(instructionIndex);
                    instructionIndex = tmp.index;
                    if (tmp.parameters != null) {
                        theta2 = tmp.parameters[0];
                    }

                    var rotation = [[Math.cos(theta2), Math.sin(theta2), 0], [-Math.sin(theta2), Math.cos(theta2), 0], [0, 0, 1]];
                    orientation = multiplyMatrix(rotation, orientation);
                    break;
                case '^':
                    theta2 = theta;
                    var tmp = getParametersAndIndex(instructionIndex);
                    instructionIndex = tmp.index;
                    if (tmp.parameters != null) {
                        theta2 = tmp.parameters[0];
                    }

                    var rotation = [[Math.cos(theta2), 0, Math.sin(theta2)], [0, 1, 0], [-Math.sin(theta2), 0, Math.cos(theta2)]];
                    orientation = multiplyMatrix(rotation, orientation);
                    break;
                case '&':
                    theta2 = theta;
                    var tmp = getParametersAndIndex(instructionIndex);
                    instructionIndex = tmp.index;
                    if (tmp.parameters != null) {
                        theta2 = tmp.parameters[0];
                    }

                    theta2 = -theta2;
                    var rotation = [[Math.cos(theta2), 0, Math.sin(theta2)], [0, 1, 0], [-Math.sin(theta2), 0, Math.cos(theta2)]];
                    orientation = multiplyMatrix(rotation, orientation);
                    break;
                case '/':
                    theta2 = theta;
                    var tmp = getParametersAndIndex(instructionIndex);
                    instructionIndex = tmp.index;
                    if (tmp.parameters != null) {
                        theta2 = tmp.parameters[0];
                    }

                    var rotation = [[1, 0, 0], [0, Math.cos(theta2), Math.sin(theta2)], [0, -Math.sin(theta2), Math.cos(theta2)]];
                    orientation = multiplyMatrix(rotation, orientation);
                    break;
                case '\\':
                    theta2 = theta;
                    var tmp = getParametersAndIndex(instructionIndex);
                    instructionIndex = tmp.index;
                    if (tmp.parameters != null) {
                        theta2 = tmp.parameters[0];
                    }

                    theta2 = -theta2;
                    var rotation = [[1, 0, 0], [0, Math.cos(theta2), Math.sin(theta2)], [0, -Math.sin(theta2), Math.cos(theta2)]];
                    orientation = multiplyMatrix(rotation, orientation);
                    break;
                case 'O':
                    var radius = 0.5;
                    var tmp = getParametersAndIndex(instructionIndex);
                    instructionIndex = tmp.index;
                    if (tmp.parameters != null) {
                        radius = tmp.parameters[0];
                    }

                    drawSphere(radius, new THREE.Vector3(position[0], position[1], position[2]));
                    break;
                case '[':
                    var tmp = {position: position.slice(0), orientation: orientation.slice(0), luminance: luminance};
                    remembered.push(tmp);
                    break;
                case ']':
                    var last = remembered.pop();
                    if (last != null) {
                        position = last.position.slice(0);
                        orientation = last.orientation.slice(0);
                        luminance = last.luminance;
                    }

                    break;
                case '{':
                    var tmp = {position: position.slice(0), orientation: orientation.slice(0), luminance: luminance};
                    rememberedImportant.push(tmp);
                    break;
                case '}':
                    var last = rememberedImportant.pop();
                    if (last != null) {
                        position = last.position.slice(0);
                        orientation = last.orientation.slice(0);
                        luminance = last.luminance;
                    }

                    break;
                default:
                    if (instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(') {
                        guts = LindenmayerParser.getGuts(instruction, instructionIndex + 1);
                        instructionIndex += guts.length + 2;
                    }
                    break;

            }
        }
    };

    function countForwardPosition(position, length, orientation) {
        position[0] += length * orientation[0][0];
        position[1] += length * orientation[0][1];
        position[2] += length * orientation[0][2];

        return position;
    }

    function drawLine(begin, end, color, thickness) {
        var path = new THREE.LineCurve3(begin, end);
        var geometry = new THREE.TubeGeometry(
            path,  //path
            2,    //segments
            thickness,     //radius
            8,     //radiusSegments
            false  //is closed
        );

        var material = new THREE.MeshLambertMaterial({color: color, shading: THREE.SmoothShading});
        var line = new THREE.Mesh(geometry, material);
        scene.add(line);
        linesOnScene.push(line);
    }

    function drawSphere(radius, position) {
        var color2 = isRandomColor ? "#" + co('') : drawColor;
        var geometry = new THREE.SphereGeometry(radius);
        var material = new THREE.MeshLambertMaterial({color: color2, shading: THREE.SmoothShading});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = position.x;
        sphere.position.y = position.y;
        sphere.position.z = position.z;
        scene.add(sphere);
        linesOnScene.push(sphere);
    }

    function getParametersAndIndex(index) {
        if (index + 1 < instruction.length && instruction[index + 1] == '(') {
            var guts = LindenmayerParser.getGuts(instruction, index + 1);
            index += guts.length + 2;
            var splitted = guts.split(",");
            splitted.trimAll();
            return {parameters: splitted, index: index};
        }

        return {parameters: null, index: index};
    }

    this.drawForest = function (turtleX, turtleY, turtleZ, turtleOrientation, angle, lineLength, turtleColor, lineThickness) {
        for (var x = -15; x <= 15; x += 5) {
            for (var z = -15; z <= 15; z += 5) {
                draw(x, turtleY, z, turtleOrientation, angle, lineLength, turtleColor, lineThickness);
            }
        }
    };

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    var multiplyMatrix = function (matrix1, matrix2) {
        var result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

        for (var i = 0; i < 3; ++i) {
            for (var j = 0; j < 3; ++j) {
                result[i][j] = matrix1[i][0] * matrix2[0][j] + matrix1[i][1] * matrix2[1][j] + matrix1[i][2] * matrix2[2][j];
            }
        }

        return result;
    };

    $(document).keydown(function (event) {
        var keyCode = event.keyCode;
        switch (keyCode) {
            case KeyCodes.MINUS:
                camera.position.z -= 1;
                break;
            case KeyCodes.PLUS:
                camera.position.z += 1;
                break;
            case KeyCodes.Q:
                scene.rotation.y -= 0.1;
                break;
            case KeyCodes.E:
                scene.rotation.y += 0.1;
                break;
            case KeyCodes.A:
                scene.rotation.z -= 0.1;
                break;
            case KeyCodes.D:
                scene.rotation.z += 0.1;
                break;
            case KeyCodes.W:
                scene.rotation.x += 0.1;
                break;
            case KeyCodes.S:
                scene.rotation.x -= 0.1;
                break;
            case KeyCodes.UP:
                camera.position.y += 1;
                return false;
            case KeyCodes.DOWN:
                camera.position.y -= 1;
                return false;
            case KeyCodes.LEFT:
                camera.position.x -= 1;
                return false;
            case KeyCodes.RIGHT:
                camera.position.x += 1;
                return false;
        }
    });

    var draw = this.draw;
};

export default Turtle3D;