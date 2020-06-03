"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-03 10:00:29
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 17:18:14
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
exports.ValueChartViewerComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const _ = require("lodash");
const Observable_1 = require("rxjs/Observable");
require("../../utilities/rxjs-operators");
const services_1 = require("../../services");
const services_2 = require("../../services");
const services_3 = require("../../services");
const services_4 = require("../../services");
const services_5 = require("../../services");
const services_6 = require("../../services");
const services_7 = require("../../services");
const guards_1 = require("../../guards");
const http_1 = require("../../http");
// Import Model Classes:
const model_1 = require("../../../model");
const types_1 = require("../../../types");
const types_2 = require("../../../types");
/*
    This class is responsible for displaying a ValueChart visualization. It uses the ValueChartDirective to create and render a ValueChart, and
    provides itself the UI elements and logic needed for the visualization's controls.

    The visualization controls provided by ValueChartViewer are of three basic types: interaction toggles, view option toggles, and hosting controls.
    Interaction toggles allow users to control what interactions provided by the ValueChartDirective are enabled by modifying
    the values of the inputs to the directive. View option toggles change the display of the ValueChart visualization by similarly modifying the inputs
    to the ValueChartDirective. The class also provides controls for hosting a ValueChart and submitting preferences to it. Hosting controls
    allow the user to either host the current ValueChart, or, if they have joined an existing ValueChart, submit their preferences to the server.
*/
let ValueChartViewerComponent = /** @class */ (() => {
    let ValueChartViewerComponent = class ValueChartViewerComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(valueChartService, valueChartViewerService, currentUserService, userGuard, router, route, valueChartHttp, hostService, validationService, userNotificationService, updateValueChartService) {
            this.valueChartService = valueChartService;
            this.valueChartViewerService = valueChartViewerService;
            this.currentUserService = currentUserService;
            this.userGuard = userGuard;
            this.router = router;
            this.route = route;
            this.valueChartHttp = valueChartHttp;
            this.hostService = hostService;
            this.validationService = validationService;
            this.userNotificationService = userNotificationService;
            this.updateValueChartService = updateValueChartService;
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            this.ChartType = model_1.ChartType;
            this.UserRole = types_1.UserRole;
            this._ = _;
            this.chartName = "";
            this.validationMessage = '';
            // ValueChart Configuration:
            this.viewConfig = {};
            this.interactionConfig = {};
            this.reducedInformation = false;
            this.currentUserScoreFunctionChange = (message) => {
                if (message.type === this.undoRedoService.SCORE_FUNCTION_CHANGE)
                    this.valueChartViewerService.getActiveValueChart().getUser(this.currentUserService.getUsername()).getScoreFunctionMap().setObjectiveScoreFunction(message.data.objectiveId, message.data.scoreFunction);
            };
            this.currentUserWeightMapChange = (message) => {
                if (message.type === this.undoRedoService.WEIGHT_MAP_CHANGE)
                    this.valueChartViewerService.getActiveValueChart().getUser(this.currentUserService.getUsername()).setWeightMap(message.data);
            };
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        // ================================ Life-cycle Methods ====================================
        /*
            @returns {void}
            @description 	Initializes the ValueChartViewer. ngOnInit is only called ONCE by Angular. This function is thus used for one-time initialized only.
                            Calling ngOnInit should be left to Angular. Do not call it manually. All initialization logic for this component should be put in this
                            method rather than in the constructor. Be aware that Angular will NOT call ngOnInit again if the a user navigates to the ValueChartViewer
                            from the ValueChartViewer as the component is reused instead of being created again.
        */
        ngOnInit() {
            this.routeSubscription = Observable_1.Observable.zip(this.route.params, this.route.queryParams, (params, queryParams) => ({ params: params, queryParams: queryParams }))
                .subscribe(urlParameters => {
                // Retrieve the ValueChart type from the URL route parameters. 			
                let type = Number.parseInt(urlParameters.params['ChartType']);
                // Retrieve the ValueChart type from the URL route parameters. 			
                let role = Number.parseInt(urlParameters.queryParams['role']);
                // Retrieve the ValueChart name from the URL route parameters.
                let fname = urlParameters.params['ValueChart'];
                // Retrieve the ValueChart password from the URL query parameters.
                let password = urlParameters.queryParams['password'];
                this.valueChartViewerService.setUserRole(role);
                // Is this chart being loaded for the first time?
                if (this.chartName !== fname) {
                    // If the ValueChart in the ValueChartService is not defined,
                    // then fetch the ValueChart from the server using the URL parameters.
                    if (!this.valueChartService.valueChartIsDefined()) {
                        this.valueChartHttp.getValueChartByName(fname, password)
                            .subscribe(valueChart => {
                            this.valueChartService.setValueChart(valueChart);
                            this.initializeViewer(type);
                            this.chartName = fname;
                        });
                    }
                    else {
                        this.initializeViewer(type);
                        this.chartName = fname;
                    }
                }
            });
            // Subscribe to the route parameters so that the type of ValueChart being viewed changes when the parameters change.
            this.route.params.subscribe(params => { if (!(this.chartName === ""))
                this.setValueChartTypeToView(params['ChartType'], this.valueChartService.getValueChart().getUser(this.currentUserService.getUsername())); });
            // Initialize automatic resizing of the ValueChart when the window is resized.
            this.resizeValueChart();
            $(window).resize((eventObjective) => {
                this.resizeValueChart();
            });
        }
        /*
            @returns {void}
            @description 	Destroys the ValueChartViewer. ngOnDestroy is only called ONCE by Angular when the user navigates to a route which
                            requires that a different component is displayed in the router-outlet.
        */
        ngOnDestroy() {
            if (this.hostService.hostWebSocket) {
                this.hostService.endCurrentHosting();
            }
            // Destroy the ValueChart manually to prevent memory leaks.
            $('ValueChart').remove();
        }
        // ================================ Setup Methods ====================================
        /*
            @param type - The type of the ValueChart to display.
            @returns {void}
            @description	Initializes the ValueChartViewer to display a ValueChart for the first time. This saves a copy of the user to
                            userGuard (which is used to determine if the user has made changes to their preferences), initializes
                            the valueChartViewerService's usersToDisplay and invalidUsers lists, prints error messages to current user,
                            and hosts the current ValueChart.
        */
        initializeViewer(type) {
            let valueChart = this.valueChartService.getValueChart();
            let currentUser = valueChart.getUser(this.currentUserService.getUsername());
            // Save the initial user object for change detection.
            if (!this.userGuard.getUserRecord()) {
                this.userGuard.setUserRecord(_.cloneDeep(currentUser));
            }
            let invalidUsers = this.validationService.getInvalidUsers(valueChart);
            this.valueChartViewerService.initializeUsers(valueChart.getUsers(), invalidUsers);
            if (invalidUsers.length > 0 && this.valueChartViewerService.getUserRole() !== types_1.UserRole.UnsavedParticipant) {
                let errorMessages = this.validationService.validateUsers(valueChart);
                this.validationMessage = "The following users' preferences are invalid. They have been hidden from the chart:\n\n" + errorMessages.join('\n\n');
            }
            if (this.valueChartService.getStatus().chartId !== valueChart._id) // If the status document is not associated with this ValueChart, fetch the correct one.
                this.valueChartHttp.getValueChartStatus(valueChart._id).subscribe(status => this.valueChartService.setStatus(status));
            this.setValueChartTypeToView(type, currentUser);
            this.valueChartViewerService.setSavedValueChartStructure(_.cloneDeep(this.valueChartService.getValueChart().getValueChartStructure()));
            this.hostValueChart();
        }
        /*
            @param type - The type of the ValueChart to display.
            @param currentUser - The user object from the ValueChart that is being viewed that is associated with the current user.
            @returns {void}
            @description	Changes the type of ValueChart displayed by the ValueChartViewer to be the given type.
                            If the type is individual and the current ValueChart is a group chart, then a new ValueChart
                            containing ONLY the current user is created and displayed. If the type is group, then the ValueChart
                            from the ValueChartService is displayed. Note that this assumes that the "baseValueChart" from the
                            ValueChartService is a group ValueChart.
        */
        setValueChartTypeToView(type, currentUser) {
            if (type == model_1.ChartType.Individual) {
                let individualChart = this.valueChartViewerService.generateIndividualChart();
                this.valueChartViewerService.setActiveValueChart(individualChart);
                // There is no hiding/showing users in an individual chart, so set the usersToDisplay to be the user in the ValueChart.
                this.usersToDisplay = this.valueChartViewerService.getActiveValueChart().getUsers();
            }
            else {
                let baseValueChart = this.valueChartService.getValueChart();
                this.valueChartViewerService.setActiveValueChart(baseValueChart);
                if (currentUser) {
                    let errors = this.validationService.validateUser(baseValueChart, currentUser);
                    this.valueChartViewerService.updateInvalidUser(currentUser, errors);
                }
                // Group ValueCharts have hiding/showing users, so set the usersToDisplay to be the array in valueChartViewerService,
                // which is connected to the user details box.
                this.usersToDisplay = this.valueChartViewerService.getUsersToDisplay();
            }
            // Change the URL parameters to reflect the type of ValueChart being viewed.
            this.router.navigate(['ValueCharts', this.valueChartViewerService.getActiveValueChart().getFName(), type], { queryParamsHandling: "merge" });
        }
        // ================================ Event Handlers for Component/Directive Outputs ====================================
        /*
            @param viewConfig - the new view configuration for the ValueChartDirective.
            @returns {void}
            @description Sets the view configuration field as a response to an event emitted by the ViewOptionsComponent.
                         This updates the view configuration of the ValueChartDirective automatically via Angular's binding system.
        */
        updateView(viewConfig) {
            this.viewConfig = viewConfig;
        }
        /*
            @param interactionConfig - the new interaction configuration for the ValueChartDirective.
            @returns {void}
            @description Sets the interaction configuration field as a response to an event emitted by the InteractionOptionsComponent.
                         This updates the interaction configuration of the ValueChartDirective automatically via Angular's binding system.
        */
        updateInteractions(interactionConfig) {
            this.interactionConfig = interactionConfig;
        }
        updateReducedInfo(reducedInformation) {
            this.reducedInformation = reducedInformation;
        }
        /*
            @param undoRedoService - the UndoRedoService instantiated by the ValueChartDirective and used by the directive's ecosystem.
            @returns {void}
            @description Sets the current undoRedoService to be instance used by the ValueChartDirective and its ecosystem. This allows
                         the ValueChartViewer and other components to use the "proper" instance of the UndoRedoService using the same dependency
                         injection provider as the ValueChartDirective. The goal here is decoupling the ValueChartDirective from the ValueChartViewerService.
        */
        updateUndoRedo(undoRedoService) {
            this.undoRedoService = undoRedoService;
            undoRedoService.undoRedoSubject.subscribe(this.currentUserScoreFunctionChange);
            undoRedoService.undoRedoSubject.subscribe(this.currentUserWeightMapChange);
        }
        /*
            @param chartElement - the base SVG element of that the ValueChartDirective uses to render the ValueChart visualization.
            @returns {void}
            @description Sets the chartElement field to be the base element emitted by the ValueChartDirective. This allows
                         the ValueChartViewer to have access to the visualization's parent element without directing interacting with the DOM.
        */
        updateChartElement(chartElement) {
            this.chartElement = chartElement;
        }
        /*
            @param renderEvents - the RenderEventsService instance used by the ValueChartDirective to signal when rendering has completed.
            @returns {void}
            @description Sets the renderEventsService field to be the service instance used by the ValueChartDirective ecosystem.
                         This allows the ValueChartDirective to listen to render events without having the same service provider as the
                         ValueChartDirective.
        */
        updateRenderEvents(renderEvents) {
            this.renderEvents = renderEvents;
        }
        /*
            @returns {void}
            @description 	Resizes the ValueChart depending on the dimensions of the window. Changing valueChartWidth and ValueChartHeight
                            triggers re-rendering of the ValueChart via the ValueChartDirective.
        */
        resizeValueChart() {
            this.valueChartWidth = (window.innerWidth * 0.95) * 1.5;
            this.valueChartHeight = (window.innerHeight * 0.75) * 1.5 - 50;
        }
        // ================================ Helper Methods for Determining Permissions ====================================
        /*
            @returns {boolean}
            @description 	Whether or not the current user may interactively change the scores and weights.
        */
        canInteract() {
            return this.valueChartViewerService.isParticipant() && this.valueChartViewerService.getActiveValueChart().isIndividual();
        }
        /*
          @returns {boolean}
          @description	Helper function to determine whether or not the current user has access to the "View Group Chart" button.
                        A user can view the Group Chart when: 	1) there is a group chart to view;
                                                                2) they have submitted their preferences to the Group Chart;
        */
        canViewGroupChart() {
            return this.valueChartViewerService.isParticipant()
                && (this.valueChartViewerService.getUserRole() !== types_1.UserRole.UnsavedParticipant)
                && (this.valueChartService.getValueChart().getType() === model_1.ChartType.Group)
                && this.valueChartViewerService.userIsMember(this.currentUserService.getUsername());
        }
        /*
          @returns {boolean}
          @description	Helper function to determine whether or not the current user has access to the "Save" button.
                        This is almost the same as canInteract; it is different in that ValueChart owners that are not members
                        are allowed to save changes to the order of alternatives and objectives.
        */
        canSave() {
            return this.valueChartViewerService.isParticipant() || this.valueChartViewerService.getUserRole() == types_1.UserRole.Owner;
        }
        /*
          @returns {boolean}
          @description	Helper function to determine whether or not the "Save" button is enabled.
                        True if the current user has made changes to their preferences, or if the chart owner has made changes to the structure.
        */
        saveEnabled() {
            if (this.valueChartViewerService.isOwner() && !_.isEqual(this.valueChartViewerService.getSavedValueChartStructure(), this.valueChartService.getValueChart().getValueChartStructure())) {
                return true;
            }
            return !_.isEqual(_.omit(this.userGuard.getUserRecord(), ['id']), _.omit(this.valueChartService.getValueChart().getUser(this.currentUserService.getUsername()), ['id']));
        }
        /*
          @returns {void}
          @description   Rescales all ScoreFunctions so that the worst and best outcomes have scores of 0 and 1 respectively.
        */
        rescaleScoreFunctions() {
            let currentUser = this.valueChartViewerService.getActiveValueChart().getUser(this.currentUserService.getUsername());
            let rescaled = false;
            for (let objId of this.valueChartViewerService.getActiveValueChart().getAllPrimitiveObjectives().map(obj => obj.getId())) {
                let scoreFunction = currentUser.getScoreFunctionMap().getObjectiveScoreFunction(objId);
                if (scoreFunction.rescale()) {
                    rescaled = true;
                }
            }
            if (rescaled) {
                this.userNotificationService.displayWarnings(["Score functions rescaled so that scores range from 0 to 1."]);
            }
        }
        /*
          @returns {void}
          @description   Navigate to the Create workflow to edit the current user's preferences. Note that this should only be called
                         if the current user is a member of the ValueChart being viewed.
        */
        editPreferences() {
            if (this.valueChartService.getValueChart().getMutableObjectives().length > 0) {
                this.router.navigate(['create', types_2.CreatePurpose.EditUser, 'ScoreFunctions'], { queryParams: { role: this.valueChartViewerService.getUserRole() } });
            }
            else {
                this.router.navigate(['create', types_2.CreatePurpose.EditUser, 'Weights'], { queryParams: { role: this.valueChartViewerService.getUserRole() } });
            }
        }
        /*
          @returns {void}
          @description   Navigate to the Create workflow to edit the current ValueChart. Note that this should only be called
                         if the current user is the owner of the ValueChart being viewed.
        */
        editValueChart() {
            this.router.navigate(['create', types_2.CreatePurpose.EditValueChart, 'BasicInfo'], { queryParams: { role: this.valueChartViewerService.getUserRole() } });
        }
        // ================================ Hosting/Joining/Saving a ValueChart ====================================
        /*
            @returns {void}
            @description 	Hosts the current ValueChart, causing the server to send messages to the client whenever a user joins/modifies/leaves
                            the current ValueChart. These messages are handled automatically by the HostService and ValueChartDirective's change detection.
                            This method should NEVER be called by a user that is joining an existing ValueChart.
        */
        hostValueChart() {
            this.hostService.hostGroupValueChart(this.valueChartViewerService.getActiveValueChart()._id);
        }
        /*
            @returns {void}
            @description 	Save the current user's changes to the ValueChart.
                            If the current user is the ValueChart owner, this method will also save the ValueChart structure.
        */
        save() {
            let userRole = this.valueChartViewerService.getUserRole();
            if (this.valueChartViewerService.isParticipant() &&
                !_.isEqual(this.userGuard.getUserRecord(), this.valueChartService.getValueChart().getUser(this.currentUserService.getUsername())))
                this.submitPreferences();
            if (userRole == types_1.UserRole.Owner || userRole == types_1.UserRole.OwnerAndParticipant) {
                // Update the ValueChart.
                this.valueChartHttp.updateValueChartStructure(this.valueChartService.getValueChart()).subscribe((result) => { this.valueChartViewerService.setSavedValueChartStructure(_.cloneDeep(result.getValueChartStructure())); }, (error) => {
                    // Handle any errors here.
                    this.userNotificationService.displayWarnings(['Saving Failed.']);
                });
            }
        }
        /*
            @returns {void}
            @description 	Submits the current user's preferences to the copy of the ValueChart on the database. Anyone hosting the ValueChart will
                            be automatically notified of the submission. This method can be used to join a ValueChart for the first time or to update
                            previously submitted preferences that have changed. This method should ONLY be called when by a user that is joining an existing
                            ValueChart.
        */
        submitPreferences() {
            var currentUser = this.valueChartViewerService.getActiveValueChart().getUser(this.currentUserService.getUsername());
            let errors = this.validationService.validateUser(this.valueChartService.getValueChart(), currentUser);
            if (errors.length > 0) {
                this.userNotificationService.displayWarnings(['Saving failed. Your preferences are not valid.']);
                this.userNotificationService.displayErrors(errors);
            }
            else {
                this.rescaleScoreFunctions();
                this.valueChartViewerService.initUserColors(this.valueChartService.getValueChart());
                // The ValueChart ID should always be defined at this point since we are joining an EXISTING chart
                // that has been retrieved from the server.
                this.valueChartHttp.updateUser(this.valueChartViewerService.getActiveValueChart()._id, currentUser)
                    .subscribe(
                // User added/updated!
                (user) => {
                    this.userNotificationService.displaySuccesses(['Save successful']);
                    // Save the updated user object for change detection.
                    this.userGuard.setUserRecord(_.cloneDeep(currentUser));
                    if (this.valueChartViewerService.getUserRole() === types_1.UserRole.UnsavedParticipant) {
                        let newRole = (this.valueChartViewerService.userIsCreator(this.currentUserService.getUsername())) ? types_1.UserRole.OwnerAndParticipant : types_1.UserRole.Participant;
                        let type = this.valueChartViewerService.getActiveValueChart().getType();
                        this.valueChartViewerService.setUserRole(newRole);
                        // Update the URL parameters to reflect the new user role.
                        this.router.navigate(['ValueCharts', this.valueChartViewerService.getActiveValueChart().getFName(), type], { queryParamsHandling: "merge", queryParams: { role: newRole } });
                    }
                }, 
                // Handle Server Errors
                (error) => {
                    if (error === '403 - Forbidden')
                        this.userNotificationService.displayWarnings(['Saving failed. The Host has disabled changes.']);
                    else
                        this.userNotificationService.displayErrors(['Saving failed. There was an error saving your preferences.']);
                });
            }
        }
        // ================================ Undo/Redo ====================================
        undoChartChange() {
            this.undoRedoService.undo(this.valueChartViewerService.getActiveValueChart());
        }
        redoChartChange() {
            this.undoRedoService.redo(this.valueChartViewerService.getActiveValueChart());
        }
    };
    ValueChartViewerComponent = __decorate([
        core_1.Component({
            selector: 'ValueChartViewer',
            templateUrl: './ValueChartViewer.template.html',
            providers: [services_3.ValueChartViewerService]
        }),
        __metadata("design:paramtypes", [services_1.ValueChartService,
            services_3.ValueChartViewerService,
            services_2.CurrentUserService,
            guards_1.UserGuard,
            router_1.Router,
            router_1.ActivatedRoute,
            http_1.ValueChartHttp,
            services_4.HostService,
            services_5.ValidationService,
            services_7.UserNotificationService,
            services_6.UpdateValueChartService])
    ], ValueChartViewerComponent);
    return ValueChartViewerComponent;
})();
exports.ValueChartViewerComponent = ValueChartViewerComponent;
//# sourceMappingURL=ValueChartViewer.component.js.map