var LindenmayerParser = function () {
    var functionsDescriptions = [];
    var functionsConditions = [];
    var productions = [];
    var instruction;
    var numberOfIterations;
    var productionSeparationSymbol = ';';
    var productionDescriptionSymbol = '->';
    var productionConditionSymbol = ':';

    this.generate = function (beginningInstruction, productionsString, noIterations) {
        instruction = beginningInstruction;
        numberOfIterations = noIterations;
        clearProductions();
        processProductionsString(productionsString);
        generateInstruction(numberOfIterations);

        return instruction;
    };

    var clearProductions = function () {
        productions = [];
        functionsDescriptions = [];
        functionsConditions = [];
    };

    var processProductionsString = function (productionsString) {
        var splitted = productionsString.split(productionSeparationSymbol);
        for (var i = 0; i < splitted.length; ++i) {
            splitted[i] = splitted[i].trim();
            addProduction(splitted[i]);
        }
    };

    var addProduction = function (productionString) {
        var splitted = productionString.split(productionDescriptionSymbol);
        var productionSymbol = splitted[0][0];
        describeFunction(splitted[0]);
        getFunctionCondition(splitted[0]);
        var productionFormula = splitted[1];
        productions[productionSymbol] == null ? productions[productionSymbol] = [productionFormula] : productions[productionSymbol].push(productionFormula);
    };

    var describeFunction = function (functionString) {
        if (functionString.length <= 1 || functionsDescriptions[functionString[0]] != null) {
            return;
        }

        var beginning = functionString.indexOf('(');
        var ending = functionString.lastIndexOf(')');
        var parametersString = functionString.slice(beginning + 1, ending);
        var parameters = parametersString.split(',');
        parameters.trimAll();
        functionsDescriptions[functionString[0]] = parameters;
    };

    var getFunctionCondition = function (functionString) {
        if (functionsConditions[functionString[0]] == null) {
            functionsConditions[functionString[0]] = [];
        }

        var splitted = functionString.split(productionConditionSymbol);
        if (splitted.length == 1) {
            functionsConditions[functionString[0]].push(null);
            return;
        }

        var condition = splitted[1];
        condition = condition.trim();
        functionsConditions[functionString[0]].push(condition);
    };

    var generateInstruction = function (n) {
        for (var i = 0; i < n; ++i) {
            var newInstruction = "";
            for (var j = 0; j < instruction.length; ++j) {
                if (productions[instruction[j]] != null) {
                    var ind = Math.floor(Math.random() * productions[instruction[j]].length);
                    if (instructionElementHasParameters(j)) {
                        var guts = getGuts(instruction, j + 1);
                        var productionSymbol = instruction[j];
                        var availableIndexes = [];
                        for (var k = 0; k < functionsConditions[productionSymbol].length; ++k) {
                            if (testCondition(productionSymbol, guts, functionsConditions[productionSymbol][k]) == true) {
                                availableIndexes.push(k);
                                break;
                            }
                        }

                        ind = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
                        var production = productions[productionSymbol][ind];
                        newInstruction += evaluate(guts, productionSymbol, production);
                        j += guts.length + 2;
                        continue;
                    }

                    newInstruction += productions[instruction[j]][ind];
                } else {
                    newInstruction += instruction[j];
                }
            }

            instruction = newInstruction;
        }
    };

    var instructionElementHasParameters = function (instructionIndex) {
        return instructionIndex + 1 < instruction.length && instruction[instructionIndex + 1] == '(';
    };

    var getGuts = function (str, j) {
        var leftSide = 1;
        var beginning = j;
        while (leftSide != 0) {
            ++j;
            if (str[j] == '(') {
                ++leftSide;
            }
            else if (str[j] == ')') {
                --leftSide;
            }
        }

        return str.slice(beginning + 1, j);
    };

    var testCondition = function (functionSymbol, guts, condition) {
        if (condition == null) {
            return true;
        }

        var values = guts.split(",");
        var toEval = "";
        for (var i = 0; i < functionsDescriptions[functionSymbol].length; ++i) {
            toEval += "var " + functionsDescriptions[functionSymbol][i] + " = " + values[i] + ";";
        }

        eval(toEval);
        return eval(condition);
    };


    var evaluate = function (guts, productionSymbol, production) {
        var values = guts.split(",");
        values.trimAll();
        for (var i = 0; i < functionsDescriptions[productionSymbol].length; ++i) {
            production = replace(production, functionsDescriptions[productionSymbol][i], values[i]);
        }

        i = 0;
        while (i < production.length) {
            if (production[i] == "(") {
                var innerGuts = getGuts(production, i);
                var splitted = innerGuts.split(",");
                splitted.trimAll();
                for (var j = 0; j < splitted.length; ++j) {
                    var evaluated = eval(splitted[j]);
                    production = production.replace(splitted[j], evaluated);
                }
                innerGuts = getGuts(production, i);
                i += innerGuts.length + 2;
            } else {
                ++i;
            }
        }

        return production;
    };

    var replace = function (production, fnd, replacer) {
        var expr = new RegExp("[^a-zA-Z0-9]" + fnd + "[^a-zA-Z0-9]");
        var ind;
        while ((ind = production.search(expr)) != -1) {
            ++ind;
            var left = production.slice(0, ind);
            var right = production.slice(ind);
            if (production[ind - 1] != "(") {
                right = right.replace(fnd, "(" + replacer + ")");
            } else {
                right = right.replace(fnd, replacer);
            }
            production = left.concat(right);
        }

        return production;
    };
};

LindenmayerParser.getGuts = function (str, j) {
    var leftSide = 1;
    var beginning = j;
    while (leftSide != 0) {
        ++j;
        if (str[j] == '(') {
            ++leftSide;
        }
        else if (str[j] == ')') {
            --leftSide;
        }
    }

    return str.slice(beginning + 1, j);
};

Array.prototype.trimAll = function () {
    for (var i = 0; i < this.length; ++i) {
        this[i] = this[i].trim();
    }
};