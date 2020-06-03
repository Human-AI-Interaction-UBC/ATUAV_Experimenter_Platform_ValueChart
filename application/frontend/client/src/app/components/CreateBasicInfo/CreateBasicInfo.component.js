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
exports.CreateBasicInfoComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const Observable_1 = require("rxjs/Observable");
const _ = require("lodash");
require("../../utilities/rxjs-operators");
// Import Application Classes:
const services_1 = require("../../services");
const services_2 = require("../../services");
const services_3 = require("../../services");
const services_4 = require("../../services");
const http_1 = require("../../http");
// Import Model Classes:
const model_1 = require("../../../model");
/*
    This component defines the UI controls for defining the basic info for a ValueChart (name, description, and password).
*/
let CreateBasicInfoComponent = /** @class */ (() => {
    let CreateBasicInfoComponent = class CreateBasicInfoComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(currentUserService, valueChartService, creationStepsService, valueChartHttp, validationService) {
            this.currentUserService = currentUserService;
            this.valueChartService = valueChartService;
            this.creationStepsService = creationStepsService;
            this.valueChartHttp = valueChartHttp;
            this.validationService = validationService;
            this.displayModal = false;
            // Chart type:
            this.ChartType = model_1.ChartType;
            this.nameChanged = () => {
                return this.originalName !== this.valueChart.getName();
            };
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        // ================================ Life-cycle Methods ====================================
        /*
            @returns {void}
            @description 	Initializes CreateBasicInfo. ngOnInit is only called ONCE by Angular.
                            Calling ngOnInit should be left to Angular. Do not call it manually.
        */
        ngOnInit() {
            this.creationStepsService.observables[this.creationStepsService.BASICS] = new Observable_1.Observable((subscriber) => {
                subscriber.next(this.validate());
                subscriber.complete();
            });
            this.creationStepsService.nameChanged = this.nameChanged;
            this.valueChart = this.valueChartService.getValueChart();
            this.type = this.valueChart.getType();
            this.validationTriggered = false;
            this.originalName = this.valueChart.getName();
            this.errorMessages = [];
            if (this.valueChart.password === undefined) {
                this.valueChart.password = '';
            }
        }
        // ================================ Validation Methods ====================================
        /*
            @returns {boolean}
            @description 	Checks validity of basic info of the chart.
        */
        validate() {
            // Update name and description of root Objective
            if (this.valueChart.getAllObjectives().length > 0) {
                let rootObjective = this.valueChart.getRootObjectives()[0];
                rootObjective.setName(this.valueChart.getName());
                rootObjective.setDescription(this.valueChart.getDescription());
            }
            this.validationTriggered = true;
            this.setErrorMessages();
            return this.errorMessages.length === 0;
        }
        /*
            @returns {boolean}
            @description 	Converts ObjectiveRow structure into ValueChart objective, then validates the objective structure of the ValueChart.
        */
        setErrorMessages() {
            this.errorMessages = this.validationService.validateBasicInfo(this.valueChart);
        }
        /*
            @returns {void}
            @description 	Resets error messages if validation has already been triggered.
                            (This is done whenever the user makes a change to the chart. This way, they get feedback while repairing errors.)
        */
        resetErrorMessages() {
            if (this.validationTriggered) {
                this.setErrorMessages();
            }
        }
        // ================================ Convert Chart Type ====================================
        confirmConvert() {
            let numUsers = this.valueChart.getUsers().length;
            if (numUsers > 1 || (numUsers === 1 && !this.valueChart.isMember(this.valueChart.getCreator()))) {
                this.displayModal = true;
            }
            else {
                this.convertToIndividual();
            }
        }
        convertToIndividual() {
            // Update the local chart to contain only the current user
            let newUsers = [];
            let currentUser = this.valueChart.getUser(this.currentUserService.getUsername());
            if (!_.isNil(currentUser)) {
                newUsers.push(currentUser);
            }
            this.valueChart.setUsers(newUsers);
            this.valueChart.setType(model_1.ChartType.Individual);
            // Clear the default score functions
            for (let obj of this.valueChart.getAllPrimitiveObjectives()) {
                obj.setDefaultScoreFunction(undefined);
            }
            // Manually remove the old users from the database to alert the event listeners
            this.valueChartHttp.updateUsers(this.valueChart._id, newUsers).subscribe();
        }
        resetType() {
            this.type = model_1.ChartType.Group;
        }
    };
    CreateBasicInfoComponent = __decorate([
        core_1.Component({
            selector: 'CreateBasicInfo',
            templateUrl: './CreateBasicInfo.template.html',
        }),
        __metadata("design:paramtypes", [services_3.CurrentUserService,
            services_1.ValueChartService,
            services_2.CreationStepsService,
            http_1.ValueChartHttp,
            services_4.ValidationService])
    ], CreateBasicInfoComponent);
    return CreateBasicInfoComponent;
})();
exports.CreateBasicInfoComponent = CreateBasicInfoComponent;
//# sourceMappingURL=CreateBasicInfo.component.js.map