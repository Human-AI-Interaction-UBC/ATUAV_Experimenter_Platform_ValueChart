"use strict";
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
exports.CreateValueChartComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const Subject_1 = require("rxjs/Subject");
require("../../utilities/rxjs-operators");
const _ = require("lodash");
// Import Application Classes:
const services_1 = require("../../services");
const services_2 = require("../../services");
const services_3 = require("../../services");
const services_4 = require("../../services");
const services_5 = require("../../services");
const services_6 = require("../../services");
const http_1 = require("../../http");
// Import Model Classes:
const model_1 = require("../../../model");
const types_1 = require("../../../types");
/*
    This component handles the workflow to create new value charts, edit value charts, and add new users to charts.
    It supplies navigation buttons that allow the user to progress through the stages.

    Each substep of the create workflow is handled by a separate child component. Clicking navigation buttons triggers
    validation in the current substep's component.

*/
let CreateValueChartComponent = /** @class */ (() => {
    let CreateValueChartComponent = class CreateValueChartComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(router, currentUserService, valueChartService, creationStepsService, route, hostService, valueChartHttp, validationService, userNotificationService) {
            this.router = router;
            this.currentUserService = currentUserService;
            this.valueChartService = valueChartService;
            this.creationStepsService = creationStepsService;
            this.route = route;
            this.hostService = hostService;
            this.valueChartHttp = valueChartHttp;
            this.validationService = validationService;
            this.userNotificationService = userNotificationService;
            this.window = window;
            this.navigationResponse = new Subject_1.Subject();
            this.loading = true;
            this.lockedByCreator = false; // Records whether or not the chart is locked by its creator
        }
        // ========================================================================================
        // 									definMethods
        // ========================================================================================
        // ================================ Life-cycle Methods ====================================
        /*
            @returns {void}
            @description 	Initializes CreateValueChart. ngOnInit is only called ONCE by Angular.
                            Calling ngOnInit should be left to Angular. Do not call it manually.
        */
        ngOnInit() {
            this.creationStepsService.step = window.location.pathname.split('/').slice(-1)[0];
            this.creationStepsService.setAutoSaveEnabled(false);
            this.creationStepsService.visitedScoreFunctions = [];
            this.sub = this.route.params.subscribe(params => {
                this.creationStepsService.setCreationPurpose(parseInt(params['purpose']));
                if (this.creationStepsService.getCreationPurpose() === types_1.CreatePurpose.NewValueChart) {
                    this.creationStepsService.setAutoSaveEnabled(true);
                }
                else if (this.creationStepsService.getCreationPurpose() === types_1.CreatePurpose.EditValueChart) {
                    this.creationStepsService.setAutoSaveEnabled(true);
                    this.valueChartHttp.getValueChartStatus(this.valueChartService.getValueChart()._id).subscribe((status) => {
                        this.lockedByCreator = status.lockedByCreator;
                        status.lockedBySystem = true; // prevent changes to users while chart is being edited
                        this.valueChartHttp.setValueChartStatus(status).subscribe((newStatus) => { this.valueChartService.setStatus(newStatus); });
                    });
                }
                else {
                    this.hostService.hostGroupValueChart(this.valueChartService.getValueChart()._id);
                }
                this.creationStepsService.valueChartCopy = _.cloneDeep(this.valueChartService.getValueChart());
                this.loading = false;
            });
        }
        /*
            @returns {void}
            @description 	Destroys CreateValueChart. ngOnDestroy is only called ONCE by Angular when the user navigates to a route which
                            requires that a different component is displayed in the router-outlet.
        */
        ngOnDestroy() {
            // Un-subscribe from the url parameters before the component is destroyed to prevent a memory leak.
            this.sub.unsubscribe();
            this.hostService.endCurrentHosting();
            if (this.creationStepsService.getAutoSaveEnabled()) {
                // Check validity of chart structure and current user's preferences. Prevent changes to users if not valid.
                let lockedBySystem = (this.validationService.validateStructure(this.valueChartService.getValueChart()).length > 0
                    || (this.valueChartService.getValueChart().isMember(this.currentUserService.getUsername()) && this.validationService.validateUser(this.valueChartService.getValueChart(), this.valueChartService.getValueChart().getUser(this.currentUserService.getUsername())).length > 0));
                let status = {};
                status.lockedByCreator = this.lockedByCreator;
                status.lockedBySystem = lockedBySystem;
                status.chartId = this.valueChartService.getValueChart()._id;
                this.valueChartService.setStatus(status);
                this.valueChartHttp.setValueChartStatus(status).subscribe((newStatus) => { status = newStatus; });
                this.creationStepsService.autoSaveValueChart(false);
            }
        }
        /*
            @returns {boolean}
            @description 	Do not show previous button if:
                            (1) on the first step OR
                            (2) the user is joining the chart or editing preferences AND
                                (a) on the Preferences step OR
                                (b) there are no mutable objectives (in this case, there is only one step - Priorities)
        */
        hidePreviousButton() {
            return (this.creationStepsService.step === this.creationStepsService.BASICS
                || ((this.creationStepsService.getCreationPurpose() === types_1.CreatePurpose.NewUser || this.creationStepsService.getCreationPurpose() === types_1.CreatePurpose.EditUser)
                    && (this.creationStepsService.step === this.creationStepsService.PREFERENCES || this.valueChartService.getValueChart().getMutableObjectives().length === 0)));
        }
        /*
            @returns {boolean}
            @description 	Enable the View Chart button if:
                            (1) the purpose is editChart or editPreferences
                            (2) on the last step (Priorities)
                            (3) on the Alternatives step and this is a group chart (allowing creator to skip joining)
        */
        enableViewChartButton() {
            return (this.creationStepsService.getCreationPurpose() === types_1.CreatePurpose.EditValueChart || this.creationStepsService.getCreationPurpose() === types_1.CreatePurpose.EditUser
                || this.creationStepsService.step === this.creationStepsService.PRIORITIES
                || (this.creationStepsService.step === this.creationStepsService.ALTERNATIVES && this.valueChartService.getValueChart().getType() === model_1.ChartType.Group));
        }
        /*
            @returns {string}
            @description 	 Return text for 'Next' button.
        */
        nextButtonText() {
            if (this.creationStepsService.step === this.creationStepsService.BASICS) {
                return "Define Objectives >>";
            }
            else if (this.creationStepsService.step === this.creationStepsService.OBJECTIVES) {
                return "Define Alteratives >>";
            }
            else if (this.creationStepsService.step === this.creationStepsService.ALTERNATIVES) {
                if (this.valueChartService.getValueChart().isIndividual() || this.valueChartService.getValueChart().isMember(this.currentUserService.getUsername())) {
                    return "Define Score Functions >>";
                }
                else {
                    return 'Join Chart >>';
                }
            }
            else {
                return "Define Weights >>";
            }
        }
        /*
            @returns {string}
            @description 	 Return text for 'Previous' button.
        */
        previousButtonText() {
            if (this.creationStepsService.step === this.creationStepsService.OBJECTIVES) {
                return "<< Define Chart Basics";
            }
            else if (this.creationStepsService.step === this.creationStepsService.ALTERNATIVES) {
                return "<< Define Objectives";
            }
            else if (this.creationStepsService.step === this.creationStepsService.PREFERENCES) {
                return "<< Define Alternatives";
            }
            else {
                return "<< Define Score Functions";
            }
        }
        /*
            @returns {Observable<boolean>}
            @description	This method is called whenever the user attempts to navigate away from the CreateValueChart component
                            via the "Home" button, "ValueCharts" main bar button, or any of the browser navigation controls.
                            It asks the user if they want to save or discard the value chart, or cancel navigation.
                            The response is returned as an observable boolean.
        */
        openNavigationModal() {
            $('#navigation-warning-modal').modal('show');
            this.navigationResponse = new Subject_1.Subject();
            return this.navigationResponse;
        }
        /*
            @returns {void}
            @description	This method handles the user's response to the navigation confirmation modal.
                            Navigation proceeds if the user elected to discard the chart or save the chart.
                            If this.autoSaveEnabled is set to true, the chart will be saved when ngDestroy is called.
        */
        handleNavigationReponse(keepValueChart, navigate) {
            if (navigate && keepValueChart && this.creationStepsService.step === this.creationStepsService.BASICS &&
                this.creationStepsService.nameChanged()) {
                this.navigateAndSaveIfNameAvailable();
            }
            else {
                if (!keepValueChart) {
                    this.creationStepsService.setAutoSaveEnabled(false);
                    if (this.valueChartService.getValueChart()._id) {
                        this.creationStepsService.deleteValueChart(this.valueChartService.getValueChart());
                    }
                }
                this.navigationResponse.next(navigate);
                $('#navigation-warning-modal').modal('hide');
            }
        }
        /*
            @returns {void}
            @description 	If on step BASICS and the name has been changed, then we need to check if the name is available before proceeding.
                            This can't be done along with the rest of validation because it requires an asynchronous call.
                            Everything from here until navigation needs to be wrapped in this call; otherwise it may proceed before the call has finished.
                            
        */
        navigateAndSaveIfNameAvailable() {
            this.valueChartHttp.isNameAvailable(this.valueChartService.getValueChart().getName()).subscribe(available => {
                if (available) {
                    this.navigationResponse.next(true);
                }
                else {
                    this.userNotificationService.displayErrors([this.creationStepsService.NAME_TAKEN]);
                    this.navigationResponse.next(false);
                }
                $('#navigation-warning-modal').modal('hide');
            });
        }
    };
    CreateValueChartComponent = __decorate([
        core_1.Component({
            selector: 'createValueChart',
            templateUrl: './CreateValueChart.template.html',
            providers: []
        }),
        __metadata("design:paramtypes", [router_1.Router,
            services_3.CurrentUserService,
            services_2.ValueChartService,
            services_1.CreationStepsService,
            router_1.ActivatedRoute,
            services_6.HostService,
            http_1.ValueChartHttp,
            services_4.ValidationService,
            services_5.UserNotificationService])
    ], CreateValueChartComponent);
    return CreateValueChartComponent;
})();
exports.CreateValueChartComponent = CreateValueChartComponent;
//# sourceMappingURL=CreateValueChart.component.js.map