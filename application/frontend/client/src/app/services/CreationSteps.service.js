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
exports.CreationStepsService = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
require("../utilities/rxjs-operators");
// Import Libraries: 
const _ = require("lodash");
// ImportApplication Classes:
const ValueChart_service_1 = require("./ValueChart.service");
const CurrentUser_service_1 = require("./CurrentUser.service");
const Validation_service_1 = require("./Validation.service");
const UserNotification_service_1 = require("./UserNotification.service");
const http_1 = require("../http");
// Import Types
const types_1 = require("../../types");
const model_1 = require("../../model");
/*
    This class defines the names and orders of steps in the Creation workflow and the transitions between them.
*/
let CreationStepsService = /** @class */ (() => {
    let CreationStepsService = class CreationStepsService {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(router, valueChartService, currentUserService, validationService, userNotificationService, valueChartHttp) {
            this.router = router;
            this.valueChartService = valueChartService;
            this.currentUserService = currentUserService;
            this.validationService = validationService;
            this.userNotificationService = userNotificationService;
            this.valueChartHttp = valueChartHttp;
            // ========================================================================================
            //                   Fields
            // ========================================================================================
            this.BASICS = 'BasicInfo';
            this.OBJECTIVES = 'Objectives';
            this.ALTERNATIVES = 'Alternatives';
            this.PREFERENCES = 'ScoreFunctions';
            this.PRIORITIES = 'Weights';
            this.nextStep = {}; // Map from step to next step.
            this.previousStep = {}; // Map from step to previous step.
            this.observables = {}; // A collection of Observable objects for each step.
            this.step = ""; // The current step that CreateValueChart is on.
            this.displayValidationModal = false;
            this.NAME_TAKEN = "That name is already taken. Please choose another.";
            // List of visited score functions. Used to keep track of which score functions have been inspected between steps.
            this.visitedScoreFunctions = [];
            // ================================ Database Access Methods ====================================
            /*
                @param createStatusDocument - whether or not to create a new status document if saving the chart for the first time.
                @returns {void}
                @description	Update valueChart in database. valueChart_.id is the id assigned by the database.
            */
            this.autoSaveValueChart = (createStatusDocument = true) => {
                let valueChart = this.valueChartService.getValueChart();
                if (this.autoSaveEnabled) {
                    if (!valueChart._id) {
                        // Save the ValueChart for the first time.
                        this.saveValueChartToDatabase(createStatusDocument);
                    }
                    else if (!_.isEqual(valueChart, this.valueChartCopy)) {
                        // Update the ValueChart.
                        this.valueChartHttp.updateValueChart(valueChart).subscribe((result) => { this.userNotificationService.displaySuccesses(['ValueChart auto-saved']); }, (error) => {
                            // Handle any errors here.
                            this.userNotificationService.displayWarnings(['Auto-saving failed']);
                        });
                    }
                    this.valueChartCopy = _.cloneDeep(valueChart);
                }
            };
            this.nextStep[this.BASICS] = this.OBJECTIVES;
            this.nextStep[this.OBJECTIVES] = this.ALTERNATIVES;
            this.nextStep[this.ALTERNATIVES] = this.PREFERENCES;
            this.nextStep[this.PREFERENCES] = this.PRIORITIES;
            this.nextStep[this.PRIORITIES] = this.PRIORITIES;
            this.previousStep[this.BASICS] = this.BASICS;
            this.previousStep[this.OBJECTIVES] = this.BASICS;
            this.previousStep[this.ALTERNATIVES] = this.OBJECTIVES;
            this.previousStep[this.PREFERENCES] = this.ALTERNATIVES;
            this.previousStep[this.PRIORITIES] = this.PREFERENCES;
        }
        // ========================================================================================
        //                   Methods
        // ========================================================================================
        getCreationPurpose() {
            return this.purpose;
        }
        setCreationPurpose(purpose) {
            this.purpose = purpose;
        }
        getAutoSaveEnabled() {
            return this.autoSaveEnabled;
        }
        setAutoSaveEnabled(autoSaveEnabled) {
            this.autoSaveEnabled = autoSaveEnabled;
        }
        // ================================ Navigation Methods ====================================
        /*
            @returns string
            @description 	Returns the previous step.
        */
        getPreviousStep(currentStep) {
            if (currentStep === this.PRIORITIES && this.valueChartService.getValueChart().getMutableObjectives().length === 0) {
                return this.ALTERNATIVES;
            }
            return this.previousStep[currentStep];
        }
        /*
            @returns string
            @description 	Returns the next step.
        */
        getNextStep(currentStep) {
            if (currentStep === this.ALTERNATIVES && this.valueChartService.getValueChart().getMutableObjectives().length === 0) {
                return this.PRIORITIES;
            }
            return this.nextStep[currentStep];
        }
        /*
            @returns boolean
            @description 	Prepares to navigate to previous step.
                            Returns whether or not navigation may proceed (for now, always true).
        */
        previous() {
            this.autoSaveValueChart();
            this.step = this.getPreviousStep(this.step);
            return true;
        }
        /*
            @returns boolean
            @description 	Prepares to navigate to the next step.
                            Returns whether or not navigation may proceed.
                            (True if validation of the current step passes and the chart name is not already taken.)
        */
        next() {
            if (this.validate()) {
                if (this.step === this.BASICS && this.nameChanged()) {
                    return new Promise((resolve) => {
                        this.isNameAvailable().subscribe((available) => {
                            if (available) {
                                this.autoSaveValueChart();
                                this.step = this.getNextStep(this.step);
                            }
                            else {
                                this.userNotificationService.displayErrors([this.NAME_TAKEN]);
                            }
                            resolve(available);
                        });
                    });
                }
                else {
                    this.autoSaveValueChart();
                    this.step = this.getNextStep(this.step);
                    return true;
                }
            }
            else {
                this.userNotificationService.displayErrors(["There were problems with your submission. Please fix them to proceed."]);
                return false;
            }
        }
        /*
            @returns {void}
            @description 	Prepares to navigate to the ValueChartViewer.
                            Proceeds if validation passes and the chart name is not already taken.
        */
        viewChart() {
            if (this.validateForViewing()) {
                if (this.step === this.BASICS && this.nameChanged()) {
                    this.isNameAvailable().subscribe((available) => {
                        if (available) {
                            this.navigateToViewer();
                        }
                        else {
                            this.userNotificationService.displayErrors([this.NAME_TAKEN]);
                        }
                    });
                }
                else {
                    this.navigateToViewer();
                }
            }
        }
        /*
            @returns {void}
            @description 	Navigates to ValueChartViewer.
        */
        navigateToViewer() {
            window.onpopstate = () => { };
            let chartType = this.valueChartService.getValueChart().isMember(this.currentUserService.getUsername()) ? model_1.ChartType.Individual : model_1.ChartType.Group;
            if (this.valueChartService.getValueChart().isMember(this.currentUserService.getUsername()) && this.valueChartService.getValueChart().getCreator() === this.currentUserService.getUsername()) {
                this.router.navigate(['ValueCharts', this.valueChartService.getValueChart().getFName(), chartType], { queryParams: { password: this.valueChartService.getValueChart().password, role: types_1.UserRole.OwnerAndParticipant } });
            }
            else {
                this.router.navigate(['ValueCharts', this.valueChartService.getValueChart().getFName(), chartType], { queryParams: { password: this.valueChartService.getValueChart().password }, queryParamsHandling: 'merge' });
            }
        }
        // ================================ Validation Methods ====================================
        /*
            @returns {boolean}
            @description 	Subscribes to the Observable for step's component, which triggers validation in that component.
                            Returns true iff validation passes.
        */
        validate() {
            let valid;
            this.observables[this.step].subscribe(isValid => {
                valid = isValid;
            });
            return valid;
        }
        /*
            @returns {boolean}
            @description 	Validates the current step, the chart structure, and the current user's preferences.
                            Returns true iff all validation passes.
        */
        validateForViewing() {
            let errorMessages = [];
            if (this.validate()) {
                // Catch validation errors introduced at other steps.
                // (Include structural errors and errors in current user's preferences.)
                let errorMessages = this.validationService.validateStructure(this.valueChartService.getValueChart());
                if (this.valueChartService.getValueChart().isMember(this.currentUserService.getUsername())) {
                    errorMessages = errorMessages.concat(this.validationService.validateUser(this.valueChartService.getValueChart(), this.valueChartService.getValueChart().getUser(this.currentUserService.getUsername())));
                }
                if (errorMessages.length > 0) {
                    this.validationMessage = "Cannot view chart. Please fix the following errors to proceed:\n\n" + errorMessages.join("\n\n");
                    this.displayValidationModal = true;
                    return false;
                }
            }
            else {
                this.userNotificationService.displayErrors(["There were problems with your submission. Please fix them to proceed."]);
                return false;
            }
            return true;
        }
        /*
            @param createStatusDocument - whether or not to create a new status document along with the chart.
            @returns {void}
            @description	Create a new ValueChart in the database. Set valueChart._id to the id assigned by the database.
        */
        saveValueChartToDatabase(createStatusDocument) {
            this.valueChartHttp.createValueChart(this.valueChartService.getValueChart())
                .subscribe((valueChart) => {
                // Set the id of the ValueChart.
                this.valueChartService.getValueChart()._id = valueChart._id;
                this.userNotificationService.displaySuccesses(['ValueChart auto-saved']);
                if (createStatusDocument) {
                    let status = {};
                    status.lockedByCreator = false;
                    status.lockedBySystem = true; // prevent changes to users while chart is being created
                    status.chartId = this.valueChartService.getValueChart()._id;
                    this.valueChartHttp.setValueChartStatus(status).subscribe((newStatus) => { status = newStatus; });
                }
            }, 
            // Handle Server Errors
            (error) => {
                this.userNotificationService.displayWarnings(['Auto-saving failed']);
            });
        }
        /*
            @returns {void}
            @description	Remove valueChart from database. valueChart_.id is the id assigned by the database.
        */
        deleteValueChart(valueChart) {
            if (valueChart._id) {
                this.valueChartHttp.deleteValueChart(valueChart._id)
                    .subscribe(status => { this.userNotificationService.displaySuccesses(['ValueChart deleted']); });
            }
        }
        isNameAvailable() {
            return this.valueChartHttp.isNameAvailable(this.valueChartService.getValueChart().getFName());
        }
    };
    CreationStepsService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.Router,
            ValueChart_service_1.ValueChartService,
            CurrentUser_service_1.CurrentUserService,
            Validation_service_1.ValidationService,
            UserNotification_service_1.UserNotificationService,
            http_1.ValueChartHttp])
    ], CreationStepsService);
    return CreationStepsService;
})();
exports.CreationStepsService = CreationStepsService;
//# sourceMappingURL=CreationSteps.service.js.map