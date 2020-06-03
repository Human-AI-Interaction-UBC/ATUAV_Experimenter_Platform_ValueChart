"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-21 13:40:52
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-06-01 15:13:32
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartUndoRedoService = void 0;
// Import Application Classes:
const core_1 = require("@angular/core");
const _ = require("lodash");
const Subject_1 = require("rxjs/Subject");
// Import Type Definitions:
const types_1 = require("../../types");
const types_2 = require("../../types");
const types_3 = require("../../types");
/*
    This class implements change tracking for implementing undo/redo functionality for individual ValueCharts. ChartUndoRedoService
    does NOT handle the changes caused by undoing or redoing. Instead, it tracks the changes in state caused by these actions, and informs
    any subscribing classes of these state changes through RxJS subjects. It is the responsibility of the subscribers
    to properly update the ValueChart's state. Similarly, it is the responsibility of any classes that are going to change the ValueChart's
    state to inform this class of those changes BEFORE they happen.
    
    ChartUndoRedoService utilizes four different stacks to keep track of user driven changes. Two of the stacks, undoChangeTypes and
    undoStateRecords, are used to track changes in the undo "direction" and the other two, redoChangeTypes and redoStateRecords
    are used to track changes in the redo "direction". The ___ChangeType stacks record the type of change that the user made, while
    the ___StateRecords stacks provide storage for whatever state preceded the changes. Values popped off the ___ChangeType stacks
    determine what type of event is emitted by the class when undo/redo actions occur, and values popped off the ___StateRecords
    stacks are passed to subscribing classes as event data.
*/
let ChartUndoRedoService = /** @class */ (() => {
    let ChartUndoRedoService = class ChartUndoRedoService {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. Unfortunately we are forced to setup the Undo/Redo event emitters here.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor() {
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            this.SCORE_FUNCTION_CHANGE = 'scoreFunctionChange';
            this.WEIGHT_MAP_CHANGE = 'weightMapChange';
            this.ALTERNATIVE_ORDER_CHANGE = 'alternativeOrderChange';
            this.OBJECTIVES_CHANGE = 'objectivesChange';
            this.undoChangeTypes = [];
            this.redoChangeTypes = [];
            this.undoStateRecords = [];
            this.redoStateRecords = [];
            // Create a new Subject that will be used to dispatch undo/redo messages to any listening services.
            this.undoRedoSubject = new Subject_1.Subject();
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        clearRedo() {
            this.redoChangeTypes = [];
            this.redoStateRecords = [];
        }
        clearUndo() {
            this.undoChangeTypes = [];
            this.undoStateRecords = [];
        }
        resetUndoRedo() {
            this.clearUndo();
            this.clearRedo();
        }
        getNewestRecord() {
            return this.undoStateRecords[this.undoStateRecords.length - 1];
        }
        deleteNewestRecord() {
            this.undoChangeTypes.pop();
            this.undoStateRecords.pop();
        }
        saveScoreFunctionRecord(scoreFunction, objective) {
            var scoreFunctionRecord = new types_2.ScoreFunctionRecord(objective.getId(), scoreFunction);
            // The change is exactly the same as the last recorded state, so do nothing.
            if (_.isEqual(this.undoStateRecords[this.undoStateRecords.length - 1], scoreFunctionRecord))
                return;
            // A new change as been made, so we should clear the redo stack.
            this.clearRedo();
            // Record the type of change has been made.
            this.undoChangeTypes.push(this.SCORE_FUNCTION_CHANGE);
            // Save the copy that was just created, along with the name of the objective that it maps to.
            this.undoStateRecords.push(scoreFunctionRecord);
        }
        saveWeightMapRecord(weightMap) {
            var weightMapRecord = weightMap.getMemento();
            // The change is exactly the same as the last recorded state, so do nothing.
            if (_.isEqual(this.undoStateRecords[this.undoStateRecords.length - 1], weightMapRecord))
                return;
            // A new change as been made, so we should clear the redo stack.
            this.clearRedo();
            // Record the type of change that has been made.
            this.undoChangeTypes.push(this.WEIGHT_MAP_CHANGE);
            // Save the copy that was just created.
            this.undoStateRecords.push(weightMapRecord);
        }
        saveAlternativesRecord(alternatives) {
            var alternativesRecord = new types_1.AlternativesRecord(alternatives);
            // The change is exactly the same as the last recorded state, so do nothing.
            if (_.isEqual(this.undoStateRecords[this.undoStateRecords.length - 1], alternativesRecord))
                return;
            // A new change as been made, so we should clear the redo stack.
            this.clearRedo();
            this.undoChangeTypes.push(this.ALTERNATIVE_ORDER_CHANGE);
            this.undoStateRecords.push(alternativesRecord);
        }
        saveObjectivesRecord(objectives) {
            var objectivesRecord = new types_3.ObjectivesRecord(objectives);
            // The change is exactly the same as the last recorded state, so do nothing.
            if (_.isEqual(this.undoStateRecords[this.undoStateRecords.length - 1], objectivesRecord))
                return;
            // A new change as been made, so we should clear the redo stack.
            this.clearRedo();
            this.undoChangeTypes.push(this.OBJECTIVES_CHANGE);
            this.undoStateRecords.push(objectivesRecord);
        }
        canUndo() {
            return this.undoChangeTypes.length !== 0;
        }
        canRedo() {
            return this.redoChangeTypes.length !== 0;
        }
        undo(valueChart) {
            if (!this.canUndo())
                return;
            var changeType = this.undoChangeTypes.pop();
            this.redoChangeTypes.push(changeType);
            var stateRecord = this.undoStateRecords.pop();
            this[changeType](stateRecord, valueChart, this.redoStateRecords);
            if (window.childWindows.scoreFunctionViewer)
                window.childWindows.scoreFunctionViewer.angularAppRef.tick();
        }
        redo(valueChart) {
            if (!this.canRedo())
                return;
            var changeType = this.redoChangeTypes.pop();
            this.undoChangeTypes.push(changeType);
            var stateRecord = this.redoStateRecords.pop();
            this[changeType](stateRecord, valueChart, this.undoStateRecords);
            if (window.childWindows.scoreFunctionViewer)
                window.childWindows.scoreFunctionViewer.angularAppRef.tick();
        }
        scoreFunctionChange(scoreFunctionRecord, valueChart, stateRecords) {
            if (!valueChart.getUsers()[0])
                return;
            var currentScoreFunction = valueChart.getUsers()[0].getScoreFunctionMap().getObjectiveScoreFunction(scoreFunctionRecord.objectiveId);
            stateRecords.push(new types_2.ScoreFunctionRecord(scoreFunctionRecord.objectiveId, currentScoreFunction));
            // Dispatch the ScoreFunctionChange event, notifying any listeners and passing the scoreFunctionRecord as a parameter.
            this.undoRedoSubject.next({ type: this.SCORE_FUNCTION_CHANGE, data: scoreFunctionRecord });
        }
        weightMapChange(weightMapRecord, valueChart, stateRecords) {
            if (!valueChart.getUsers()[0])
                return;
            var currentWeightMap = valueChart.getUsers()[0].getWeightMap();
            stateRecords.push(currentWeightMap);
            this.undoRedoSubject.next({ type: this.WEIGHT_MAP_CHANGE, data: weightMapRecord });
        }
        alternativeOrderChange(alternativeOrderRecord, valueChart, stateRecords) {
            var alternatives = valueChart.getAlternatives();
            stateRecords.push(new types_1.AlternativesRecord(alternatives));
            this.undoRedoSubject.next({ type: this.ALTERNATIVE_ORDER_CHANGE, data: alternativeOrderRecord });
        }
        objectivesChange(objectivesRecord, valueChart, stateRecords) {
            var currentObjectives = valueChart.getRootObjectives();
            stateRecords.push(new types_3.ObjectivesRecord(currentObjectives));
            this.undoRedoSubject.next({ type: this.OBJECTIVES_CHANGE, data: objectivesRecord });
        }
    };
    ChartUndoRedoService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], ChartUndoRedoService);
    return ChartUndoRedoService;
})();
exports.ChartUndoRedoService = ChartUndoRedoService;
//# sourceMappingURL=ChartUndoRedo.service.js.map