"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2017-05-15 10:25:17
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-19 13:13:49
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
exports.DetailBoxComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
// Import Libraries:
const d3 = require("d3");
// Import Application Classes:
const ValueChartVis_1 = require("../../../ValueChartVis");
const http_1 = require("../../http");
const services_1 = require("../../services");
const services_2 = require("../../services");
const services_3 = require("../../services");
const services_4 = require("../../services");
const services_5 = require("../../services");
const ValueChartVis_2 = require("../../../ValueChartVis");
// Import Model Classes:
const model_1 = require("../../../model");
// Import Types:
const types_1 = require("../../../types");
/*
    The DetailBox component implements a UI widget for displaying a ValueChart's basic details, alternatives, and user list.
    It also implement several important interactions and management options for a ValueChart. These are:
        - Deleting, hiding, and reordering users.
        - Viewing alternative details.
        - Viewing a ValueCharts's basic details and generating invitation links.
    This component is currently only used by the ValueChartViewer.
*/
let DetailBoxComponent = /** @class */ (() => {
    let DetailBoxComponent = class DetailBoxComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        constructor(currentUserService, userNotificationService, valueChartHttp, hostService, valueChartService, valueChartViewerService) {
            this.currentUserService = currentUserService;
            this.userNotificationService = userNotificationService;
            this.valueChartHttp = valueChartHttp;
            this.hostService = hostService;
            this.valueChartService = valueChartService;
            this.valueChartViewerService = valueChartViewerService;
            this.displayModal = false;
            this.DETAIL_BOX_CHART_TAB = 'chart';
            this.DETAIL_BOX_ALTERNATIVES_TAB = 'alternatives';
            this.DETAIL_BOX_USERS_TAB = 'users';
            this.ChartOrientation = types_1.ChartOrientation;
            // An anonymous function that links the alternative labels created by the ObjectiveChartRenderer to the Chart Detail box.
            // This requires interacting with the DOM since the ValueChart visualization is abstracted away from the main application
            // by the ValueChartDirective.
            this.linkAlternativeLabelsToDetailBox = () => {
                this.chartElement.selectAll('.' + ValueChartVis_1.ObjectiveChartDefinitions.ALTERNATIVE_LABEL)
                    .classed('alternative-link', true);
                this.chartElement.selectAll('.' + ValueChartVis_1.ObjectiveChartDefinitions.ALTERNATIVE_LABEL).on('click', (d) => {
                    this.expandAlternative(d);
                });
            };
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        ngOnInit() {
            this.detailBoxCurrentTab = this.DETAIL_BOX_CHART_TAB;
            this.detailBoxAlternativeTab = 'Alternatives';
            this.alternativeObjectives = [];
            this.alternativeObjectiveValues = [];
        }
        set renderEventsService(renderEventsService) {
            if (renderEventsService)
                this.linkAlternativeLabelsToDetailBox();
        }
        expandAlternative(alternative) {
            this.detailBoxAlternativeTab = alternative.getName();
            this.detailBoxCurrentTab = this.DETAIL_BOX_ALTERNATIVES_TAB;
            this.valueChart.getAllPrimitiveObjectives().forEach((objective, index) => {
                this.alternativeObjectives[index] = objective.getName();
                this.alternativeObjectiveValues[index] = alternative.getObjectiveValue(objective.getId());
            });
        }
        collapseAlternative() {
            this.detailBoxAlternativeTab = 'Alternatives';
        }
        setUserColor(user, color) {
            user.color = color;
        }
        changeDisplayedUsers(user, eventObject) {
            if (eventObject.target.checked) {
                this.valueChartViewerService.addUserToDisplay(user);
            }
            else {
                this.valueChartViewerService.removeUserToDisplay(user.getUsername());
            }
        }
        displayRemoveUser(user) {
            this.userToRemove = user;
            this.actionFunction = this.removeUser.bind(this, this.userToRemove);
            this.displayModal = true;
        }
        /*
            @returns {void}
            @description 	Removes a user from the existing ValueChart, and updates the ValueChart's resource on the database.
        */
        removeUser(userToDelete) {
            this.valueChartHttp.deleteUser(this.valueChart._id, userToDelete.getUsername())
                .subscribe(username => {
                if (!this.hostService.hostWebSocket) { // Handle the deleted user manually.
                    var userIndex = this.valueChart.getUsers().findIndex((user) => {
                        return user.getUsername() === userToDelete.getUsername();
                    });
                    // Delete the user from the ValueChart
                    this.valueChart.getUsers().splice(userIndex, 1);
                    this.userNotificationService.displayInfo([userToDelete.getUsername() + ' has left the ValueChart']);
                }
                // The Host connection is active, so let it handle notifications about the deleted user.
            }, err => {
                this.userNotificationService.displayErrors([userToDelete.getUsername() + ' could not be deleted']);
            });
        }
        moveUserUp(user, currentIndex) {
            let users = this.valueChartService.getValueChart().getUsers();
            if (currentIndex - 1 == -1)
                return;
            let temp = users[currentIndex - 1];
            users[currentIndex - 1] = user;
            users[currentIndex] = temp;
            this.valueChartViewerService.sortUsersToDisplay();
        }
        moveUserDown(user, currentIndex) {
            let users = this.valueChartService.getValueChart().getUsers();
            if (currentIndex + 1 == users.length)
                return;
            let temp = users[currentIndex + 1];
            users[currentIndex + 1] = user;
            users[currentIndex] = temp;
            this.valueChartViewerService.sortUsersToDisplay();
        }
        getValueChartUrl() {
            return document.location.origin + '/join/ValueCharts/' + this.valueChart.getFName() + '?password=' + this.valueChart.password + '&purpose=newUser';
        }
        setUserChangesAccepted(eventObject) {
            this.valueChartService.getStatus().lockedByCreator = !eventObject.target.checked;
            this.valueChartHttp.setValueChartStatus(this.valueChartService.getStatus()).subscribe((status) => { });
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", model_1.ValueChart)
    ], DetailBoxComponent.prototype, "valueChart", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DetailBoxComponent.prototype, "chartElement", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], DetailBoxComponent.prototype, "enableManagement", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DetailBoxComponent.prototype, "viewConfig", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], DetailBoxComponent.prototype, "showUsers", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], DetailBoxComponent.prototype, "width", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], DetailBoxComponent.prototype, "height", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", ValueChartVis_2.RenderEventsService),
        __metadata("design:paramtypes", [ValueChartVis_2.RenderEventsService])
    ], DetailBoxComponent.prototype, "renderEventsService", null);
    DetailBoxComponent = __decorate([
        core_1.Component({
            selector: 'DetailBox',
            templateUrl: './DetailBox.template.html',
            providers: []
        }),
        __metadata("design:paramtypes", [services_4.CurrentUserService,
            services_2.UserNotificationService,
            http_1.ValueChartHttp,
            services_1.HostService,
            services_5.ValueChartService,
            services_3.ValueChartViewerService])
    ], DetailBoxComponent);
    return DetailBoxComponent;
})();
exports.DetailBoxComponent = DetailBoxComponent;
//# sourceMappingURL=DetailBox.component.js.map