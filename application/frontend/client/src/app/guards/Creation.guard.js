"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-08-19 21:37:29
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-19 12:39:20
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
exports.CreationGuard = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const router_2 = require("@angular/router");
const Observable_1 = require("rxjs/Observable");
require("../utilities/rxjs-operators");
const services_1 = require("../services");
// Import Types
const types_1 = require("../../types");
/*
    CreationGuard is an Angular service that is used to control navigation away from and to the '/create/:purpose/:stage' route
    in the case where the purpose is creating a ValueChart. This is distinct from the user guard. This class is used to
    determine if a user wants to discard to save a new ValueChart when leaving the create workflow. In comparison, the user guard
    is used to warn users that unsaved preferences changes will be lost due to navigation when leaving the create workflow or the viewer.
*/
let CreationGuard = /** @class */ (() => {
    let CreationGuard = class CreationGuard {
        constructor(router, creationStepsService) {
            this.router = router;
            this.creationStepsService = creationStepsService;
            // Record the navigation source from the NavigationState event.
            this.router
                .events
                .filter(e => e instanceof router_1.NavigationEnd)
                .subscribe((e) => this.source = e.url);
            // Record the navigation destination from the NavigationState event.
            this.router
                .events
                .filter(e => e instanceof router_1.NavigationStart)
                .subscribe((e) => this.destination = e.url);
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @returns {boolean} - Whether navigation away from the deactivated route (always '/create/:purpose') will be permitted or not.
            @description 	Used by the Angular router to determine whether the current user will be permitted to navigate away from the creation workflow
                            based on a user's interaction with a modal window.
                            This method should NEVER be called manually. Leave routing, and calling of the canActivate, canDeactivate, etc. classes
                            to the Angular 2 router.
        */
        canDeactivate(component, route, state) {
            let purpose = parseInt(route.params['purpose']);
            // Immediately allow navigation away from component if:
            //	(1) The CreatePurpose is not NewValueChart;
            //	(2) the destination is the ValueChartViewer;
            if (this.destination.indexOf('ValueCharts/') !== -1 // We are going to the ValueChart Viewer
                || purpose !== types_1.CreatePurpose.NewValueChart) { // We were not creating a new ValueChart
                return Observable_1.Observable.from([true]);
            }
            else {
                // Otherwise, open the navigation model and ask the user for instructions.
                return component.openNavigationModal();
            }
        }
        /*
            @returns {boolean} - Whether navigation to activated route (always '/create/:purpose/:step') will be permitted or not.
            @description 	Used by the Angular router to determine whether the current user will be permitted to navigate within the creation workflow.
                            This method should NEVER be called manually. Leave routing, and calling of the canActivate, canDeactivate, etc. classes
                            to the Angular 2 router.
        */
        canActivate(route, state) {
            // Allow navigation if we are coming into the component from outside of the creation workflow.
            if (window.location.pathname.indexOf('/create/') === -1 || (this.source !== undefined && this.source.indexOf('/create/') === -1)) {
                return true;
            }
            else {
                let previousStep = this.creationStepsService.getPreviousStep(this.creationStepsService.step);
                let nextStep = this.creationStepsService.getNextStep(this.creationStepsService.step);
                // Navigating to previous step
                if (this.destination !== undefined && this.destination.indexOf(previousStep) !== -1) {
                    return this.creationStepsService.previous();
                }
                // Navigating to next step
                else if (this.destination !== undefined && this.destination.indexOf(nextStep) !== -1) {
                    return this.creationStepsService.next();
                }
                // Invalid route, cancel. The create workflow is not designed to allow users to skip over steps.
                // (This might happen if the user selects a link from browsing history.
                //  Return to this later - we should show page not found or something to that effect.)
                else {
                    history.forward();
                    return false;
                }
            }
        }
    };
    CreationGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_2.Router,
            services_1.CreationStepsService])
    ], CreationGuard);
    return CreationGuard;
})();
exports.CreationGuard = CreationGuard;
//# sourceMappingURL=Creation.guard.js.map