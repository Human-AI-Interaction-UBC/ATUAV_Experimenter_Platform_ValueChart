"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2017-07-17 21:38:08
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-18 10:50:38
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
exports.UserGuard = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const router_2 = require("@angular/router");
require("../utilities/rxjs-operators");
// Import Libraries:
const _ = require("lodash");
const services_1 = require("../services");
const services_2 = require("../services");
// Import Types
const types_1 = require("../../types");
const types_2 = require("../../types");
/*
    UserGuard is an Angular service that is used to control navigation away from and to the '/ValueCharts/:ValueChart/:ChartType' route
    and the /create/:purpose/ScoreFunctions + /create/:purpose/Weights routes when the purpose of editing preferences.
    Essentially, the main function of this guard is to prevent users from navigating away from the create workflow
    or the ValueChartViewer when they have unsaved preferences.
*/
let UserGuard = /** @class */ (() => {
    let UserGuard = class UserGuard {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        constructor(router, currentUserService, valueChartService) {
            this.router = router;
            this.currentUserService = currentUserService;
            this.valueChartService = valueChartService;
            // Record the navigation destination from the NavigationState event.
            this.router
                .events
                .filter(e => e instanceof router_1.NavigationStart)
                .subscribe((e) => this.destination = e.url);
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        getUserRecord() {
            return this.userRecord;
        }
        setUserRecord(user) {
            this.userRecord = user;
        }
        /*
            @returns {boolean} - Whether navigation away from the deactivated route (always '/ValueCharts/:ValueChart/:ChartType') will be permitted or not.
            @description 	Used by the Angular router to determine whether the current user will be permitted to navigate away from the ValueChart Viewer
                            based on a user's interaction with a modal window.
                            This method should NEVER be called manually. Leave routing, and calling of the canDeactivate, etc. classes
                            to the Angular 2 router.
        */
        canDeactivate(component, route, state) {
            let currentUser = this.valueChartService.getValueChart().getUser(this.currentUserService.getUsername());
            let role = parseInt(route.queryParams['role']);
            let createPurpose = parseInt(route.params['purpose']);
            // The user is always allowed to navigate away when they are not a member of the ValueChart, if they are only viewing the ValueChart, or if they are returning to the viewer or the create workflow.
            if (!currentUser ||
                role === types_1.UserRole.Viewer ||
                role === types_1.UserRole.Owner ||
                !this.destination ||
                this.destination.indexOf('ValueCharts/') !== -1 ||
                this.destination.indexOf('create/') !== -1 ||
                createPurpose === types_2.CreatePurpose.EditValueChart || createPurpose === types_2.CreatePurpose.NewValueChart || createPurpose === types_2.CreatePurpose.NewUser) {
                return true;
            }
            else if (!_.isEqual(currentUser, this.userRecord)) {
                let navigate = window.confirm('You have unsaved changes to your preferences. Are you sure that you want to leave?');
                if (navigate) {
                    this.userRecord = null;
                }
                return navigate;
            }
            else {
                this.userRecord = null;
                return true;
            }
        }
    };
    UserGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_2.Router,
            services_2.CurrentUserService,
            services_1.ValueChartService])
    ], UserGuard);
    return UserGuard;
})();
exports.UserGuard = UserGuard;
//# sourceMappingURL=User.guard.js.map