"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2017-05-10 22:24:20
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-18 10:40:05
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
exports.RendererService = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const types_1 = require("../../types");
let RendererService = /** @class */ (() => {
    let RendererService = class RendererService {
        // ========================================================================================
        // 									Fields
        // ========================================================================================
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. Unfortunately we are forced to assign handlers to the Undo/Redo services event emitters in this
                            method.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor() { }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @param viewOrientation - the viewOrientation of the desired transform.
            @param coordinateOneAmount - the amount of translation in the coordinateOne direction. Note what direction this is depends on the orientation.
            @param coordinateTwoAmount - the amount of translation in the coordinateTwo direction. Note what direction this is depends on the orientation.
            @returns a correctly formatted translate string for a transform attribute.
            @description	Generate the correct translation for a transform attribute of an SVG element depending on the current ValueChart orientation.
                            This method allows transformations to be generated properly while using the coordinateOne and coordinateTwo fields instead of
                            directly using x and y.
        */
        generateTransformTranslation(viewOrientation, coordinateOneAmount, coordinateTwoAmount) {
            if (viewOrientation === types_1.ChartOrientation.Vertical) {
                return 'translate(' + coordinateOneAmount + ',' + coordinateTwoAmount + ')';
            }
            else {
                return 'translate(' + coordinateTwoAmount + ',' + coordinateOneAmount + ')';
            }
        }
        /*
            @param previousTransform - the transformation that is to be incremented by deltaCoordinateOne and deltaCoordinateTwo.
            @param deltaCoordinateOne - the amount to increase the translation in the coordinateOne direction.
            @param deltaCoordinateTwo - the amount to increase the translation in the coordinateTwo direction.
            @returns a correctly formatted and incremented translate string for a transform attribute.
            @description	Properly increment an existing transformation by deltaCoordinateOne and deltaCoordinateTwo while taking into account the current
                            orientation of the ValueChart.
        */
        incrementTransform(viewConfig, previousTransform, deltaCoordinateOne, deltaCoordinateTwo) {
            var xTransform;
            var yTransform;
            if (previousTransform) {
                var commaIndex = previousTransform.indexOf(',');
                // Pull the current transform coordinates form the string. + is a quick operation that converts them into numbers.
                xTransform = +previousTransform.substring(previousTransform.indexOf('(') + 1, commaIndex);
                yTransform = +previousTransform.substring(commaIndex + 1, previousTransform.indexOf(')'));
            }
            else {
                xTransform = 0;
                yTransform = 0;
            }
            if (viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) {
                return 'translate(' + (xTransform + deltaCoordinateOne) + ',' + (yTransform + deltaCoordinateTwo) + ')';
            }
            else {
                return 'translate(' + (xTransform + deltaCoordinateTwo) + ',' + (yTransform + deltaCoordinateOne) + ')';
            }
        }
    };
    RendererService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], RendererService);
    return RendererService;
})();
exports.RendererService = RendererService;
//# sourceMappingURL=Renderer.service.js.map