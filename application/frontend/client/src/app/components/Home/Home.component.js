"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-25 14:41:41
* @Last Modified by:   tylerjamesmalloy
* @Last Modified time: 2017-09-13 14:31:22
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
exports.HomeComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
// Import Application Classes:
const services_1 = require("../../services");
const services_2 = require("../../services");
const services_3 = require("../../services");
const http_1 = require("../../http");
const http_2 = require("../../http");
const services_4 = require("../../services");
const services_5 = require("../../services");
// Import Utility Classes:
const Formatter = require("../../utilities/Formatter");
// Import Types
const types_1 = require("../../../types");
const types_2 = require("../../../types");
// Import Sample Data:
const DemoValueCharts_1 = require("../../../../data/DemoValueCharts");
/*
    This component implements the home page. The home page is the central page of the ValueCharts application and is where users
    are directed after logging in. It has links to the My ValueCharts page, and the creation workflow, and also allows users to upload
    XML ValueCharts, and join pre-existing ValueCharts. HomeComponent also users to open demo ValueCharts from a
    table of pre-made individual and group charts. This is a temporary a feature that will be removed in later releases.
*/
let HomeComponent = /** @class */ (() => {
    let HomeComponent = class HomeComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(router, valueChartParser, currentUserService, valueChartService, valueChartHttp, validationService, userNotificationService, userHttp) {
            this.router = router;
            this.valueChartParser = valueChartParser;
            this.currentUserService = currentUserService;
            this.valueChartService = valueChartService;
            this.valueChartHttp = valueChartHttp;
            this.validationService = validationService;
            this.userNotificationService = userNotificationService;
            this.userHttp = userHttp;
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            this.UserRole = types_1.UserRole;
            this.CreatePurpose = types_2.CreatePurpose;
            this.demoValueCharts = [{ xmlString: DemoValueCharts_1.singleHotel, name: 'Hotel Selection Problem', type: 'Individual' }, { xmlString: DemoValueCharts_1.groupHotel, name: 'Hotel Selection Problem', type: 'Group' }, { xmlString: DemoValueCharts_1.waterManagement, name: 'Runoff Management', type: 'Individual' }];
            this.isJoining = false; // boolean toggle indicating whether user clicked to join or view an existing chart 
            // this is needed so we can use the same credentials modal in both cases
            // Upload validation fields:
            this.displayValidationModal = false;
            // Member of is defined as having a user in the 'users' field of the ValueChart with a username that matches the current user's username.	
            this.displayModal = false;
            this.modalActionEnabled = false;
            this.modalActionFunction = () => { };
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @returns {void}
            @description 	Initializes the ValueChartViewer. ngOnInit is only called ONCE by Angular. This function is thus used for one-time initialized only.
                            Calling ngOnInit should be left to Angular. Do not call it manually. All initialization logic for the component should be put in this
                            method rather than in the constructor.
        */
        ngOnInit() {
            //	Retrieve summary objects for all of the ValueCharts created by the current user.
            if (this.currentUserService.isLoggedIn()) {
                this.userHttp.getOwnedValueCharts(this.currentUserService.getUsername())
                    .subscribe(valueChartOwnerships => {
                    this.valueChartOwnerships = valueChartOwnerships;
                    if (!this.valueChartService.valueChartIsDefined())
                        return;
                    let valueChart = this.valueChartService.getValueChart();
                    let status = this.valueChartService.getStatus();
                    // Update the summary with local (possibly more up-to-date) information.
                    this.valueChartOwnerships.forEach((chartSummary) => {
                        if (chartSummary._id === valueChart._id) {
                            chartSummary.name = valueChart.getName();
                            chartSummary.password = valueChart.password;
                            chartSummary.numUsers = valueChart.getUsers().length;
                        }
                        if (chartSummary._id === status.chartId) {
                            chartSummary.lockedBySystem = status.lockedBySystem;
                            chartSummary.lockedByCreator = status.lockedByCreator;
                        }
                    });
                });
                //	Retrieve summary objects for all of the ValueCharts the current user is a member of.
                this.userHttp.getJoinedValueCharts(this.currentUserService.getUsername())
                    .subscribe(valueChartMemberships => {
                    this.valueChartMemberships = valueChartMemberships;
                });
            }
        }
        openValueChart(chartId, password) {
            password = password || '';
            this.valueChartHttp.getValueChart(chartId, password)
                .subscribe(valueChart => {
                // Validate chart structure before proceeding.
                // (This is a sanity check to catch any as any errors brought on by changes in validation since saving to the database.)
                let errorMessages = this.validationService.validateStructure(valueChart);
                if (errorMessages.length > 0) {
                    this.modalTitle = 'Validation Error';
                    this.modalBody = "Cannot view chart. Please fix the following problems:\n\n" + errorMessages.join('\n\n');
                    this.modalActionEnabled = false;
                    this.displayModal = true;
                }
                else {
                    this.valueChartService.setValueChart(valueChart);
                    let role;
                    if (valueChart.getCreator() === this.currentUserService.getUsername()) {
                        role = valueChart.isMember(this.currentUserService.getUsername()) ? types_1.UserRole.OwnerAndParticipant : types_1.UserRole.Owner;
                    }
                    else {
                        role = types_1.UserRole.Participant;
                    }
                    this.router.navigate(['ValueCharts', valueChart.getFName(), valueChart.getType()], { queryParams: { password: valueChart.password, role: role } });
                }
            });
        }
        editValueChart(chartId, password) {
            password = password || '';
            this.valueChartHttp.getValueChart(chartId, password)
                .subscribe(valueChart => {
                this.valueChartService.setValueChart(valueChart);
                this.router.navigate(['create', types_2.CreatePurpose.EditValueChart, 'BasicInfo'], { queryParams: { role: types_1.UserRole.Owner } });
            });
        }
        editPreferences(chartId, chartName, password) {
            this.valueChartHttp.getValueChart(Formatter.nameToID(chartName), password)
                .subscribe(valueChart => {
                // Validate chart structure before proceeding.
                // (This is a sanity check to catch any as any errors brought on by changes in validation since saving to the database.)
                if (this.validationService.validateStructure(valueChart).length > 0) {
                    this.modalTitle = 'Validation Error';
                    this.modalBody = "Cannot edit preferences. There are problems with this chart that can only be fixed by the owner.";
                    this.modalActionEnabled = false;
                    this.displayModal = true;
                }
                else {
                    this.valueChartService.setValueChart(valueChart);
                    if (this.valueChartService.getValueChart().getMutableObjectives().length > 0) {
                        this.router.navigate(['create', types_2.CreatePurpose.EditUser, 'ScoreFunctions'], { queryParams: { role: types_1.UserRole.Participant } });
                    }
                    else {
                        this.router.navigate(['create', types_2.CreatePurpose.EditUser, 'Weights'], { queryParams: { role: types_1.UserRole.Participant } });
                    }
                }
            });
        }
        displayLeaveChart(chartId, chartPassword) {
            this.setValueChart(chartId, chartPassword);
            this.modalTitle = 'Leave ValueChart';
            this.modalBody = 'Are you sure you want to leave this ValueChart?';
            this.modalActionEnabled = true;
            this.modalActionFunction = this.leaveValueChart.bind(this, chartId);
            this.displayModal = true;
        }
        leaveValueChart(chartId) {
            this.valueChartHttp.deleteUser(chartId, this.currentUserService.getUsername())
                .subscribe(username => {
                let index = this.valueChartMemberships.findIndex((valueChartSummary) => {
                    return valueChartSummary._id === chartId;
                });
                this.valueChartMemberships.splice(index, 1);
            });
        }
        displayDeleteChart(chartId, chartPassword) {
            this.setValueChart(chartId, chartPassword);
            this.modalTitle = 'Delete ValueChart';
            this.modalBody = 'Are you sure you want to permanently delete this ValueChart?';
            this.modalActionEnabled = true;
            this.modalActionFunction = this.deleteValueChart.bind(this, chartId);
            this.displayModal = true;
        }
        deleteValueChart(chartId) {
            this.valueChartHttp.deleteValueChart(chartId)
                .subscribe(status => {
                let index = this.valueChartOwnerships.findIndex((valueChartSummary) => {
                    return valueChartSummary._id === chartId;
                });
                this.valueChartOwnerships.splice(index, 1);
                index = this.valueChartMemberships.findIndex((valueChartSummary) => {
                    return valueChartSummary._id === chartId;
                });
                this.valueChartMemberships.splice(index, 1);
            });
            this.valueChartHttp.deleteValueChartStatus(this.valueChartService.getValueChart()._id).subscribe((status) => {
            });
        }
        setValueChart(chartId, password) {
            this.valueChartHttp.getValueChart(chartId, password)
                .subscribe(valueChart => {
                this.valueChartService.setValueChart(valueChart);
            });
        }
        getValueChartName() {
            if (this.valueChartService.valueChartIsDefined()) {
                return this.valueChartService.getValueChart().getFName() + 'UserWeights.csv';
            }
            else {
                return '';
            }
        }
        getStatusText(valueChartSummary) {
            if (valueChartSummary.lockedBySystem) {
                return 'Incomplete';
            }
            else {
                return 'Complete';
            }
        }
        getChangesPermittedText(valueChartSummary) {
            if (!valueChartSummary.lockedByCreator && !valueChartSummary.lockedBySystem) {
                return 'Allowed';
            }
            else {
                return 'Prevented';
            }
        }
        /*
            @returns {string}
            @description 	Title for the credentials modal.
        */
        getModalTitle() {
            if (this.isJoining) {
                return "Join Existing Chart";
            }
            else {
                return "View Existing Chart";
            }
        }
        /*
            @param chartName - The name of the ValueChart to view. This is NOT the _id field set by the server, but rather the user defined name.
            @param chartPassword - The password of the ValueChart to join.
            @returns {void}
            @description 	Retrieves the ValueChart that matches the given credentials and directs the user to the ValueChartViewerComponent to view it.
                            Notifies the user using a banner warning if no ValueChart exists with the given name and password.
        */
        viewValueChart(chartName, chartPassword) {
            this.valueChartHttp.getValueChartByName(Formatter.nameToID(chartName), chartPassword)
                .subscribe((valueChart) => {
                $('#chart-credentials-modal').modal('hide');
                if (this.validateChartForViewing(valueChart)) {
                    this.valueChartService.setValueChart(valueChart);
                    this.router.navigate(['ValueCharts', valueChart.getFName(), valueChart.getType()], { queryParams: { password: valueChart.password, role: types_1.UserRole.Viewer } });
                }
            }, 
            // Handle Server Errors (like not finding the ValueChart)
            (error) => {
                if (error === '404 - Not Found')
                    this.invalidCredentials = true; // Notify the user that the credentials they input are invalid.
            });
        }
        /*
            @param demoChart - A demonstration chart to view.
            @returns {void}
            @description 	Opens a demonstration ValueChart and directs the user to the ValueChartViewerComponent to view it.
                            This method will be removed when demonstration charts are removed from the home page.
        */
        selectDemoValueChart(demoChart) {
            let valueChart = this.valueChartParser.parseValueChart(demoChart.xmlString);
            this.valueChartService.setValueChart(valueChart);
            this.router.navigate(['ValueCharts', valueChart.getFName(), valueChart.getType()], { queryParams: { password: valueChart.password, role: types_1.UserRole.Viewer } });
        }
        /*
            @param event - A file upload event fired by the XML ValueChart file upload.
            @returns {void}
            @description 	Parses an uploaded XML ValueChart using the XMLValueChartParserService, and then navigates
                            to the ValueChartViewer to view it. This is called whenever the file input to the File Upload on
                            this page changes.
        */
        uploadValueChart(event) {
            var xmlFile = event.target.files[0]; // Retrieve the uploaded file from the File Input element. It will always be at index 0.
            var reader = new FileReader();
            // Define the event handler for when file reading completes:
            reader.onload = (fileReaderEvent) => {
                if (event.isTrusted) {
                    var xmlString = fileReaderEvent.target.result; // Retrieve the file contents string from the file reader.
                    let valueChart = this.valueChartParser.parseValueChart(xmlString);
                    valueChart.setCreator(this.currentUserService.getUsername()); // Set the current user as the owner.
                    valueChart.setName(''); // Erase the ValueChart's name. The owner must give it a new one.
                    this.valueChartService.setValueChart(valueChart);
                    this.router.navigate(['create', types_2.CreatePurpose.NewValueChart, 'BasicInfo'], { queryParams: { role: types_1.UserRole.Owner } });
                }
            };
            // Read the file as a text string. This should be fine because ONLY XML files should be uploaded.
            reader.readAsText(xmlFile);
            // Reset upload file so that user can try the same file again after fixing it.
            document.getElementsByName("file-to-upload")[0].value = null;
        }
        /*
            @returns {boolean}
            @description 	Validates chart structure prior to viewing and gives the creator an opportunity to fix errors.
                            Returns true iff there were no validation errors.
        */
        validateChartForViewing(valueChart) {
            let structuralErrors = this.validationService.validateStructure(valueChart);
            if (structuralErrors.length > 0) {
                if (valueChart.getCreator() !== this.currentUserService.getUsername()) {
                    this.userNotificationService.displayErrors(["Cannot join chart. There are problems with this chart that can only be fixed by its creator."]);
                }
                else {
                    this.validationMessage = "There are problems with this chart: \n\n" + structuralErrors.join('\n\n') + "\n\nWould you like to fix them now?";
                    this.displayValidationModal = true;
                }
                return false;
            }
            return true;
        }
        /*
            @returns {boolean}
            @description 	Validates chart structure prior to joining.
                            Returns true if it is ok for the current user to join.
        */
        validateChartForJoining(valueChart) {
            if (valueChart.isIndividual()) {
                this.userNotificationService.displayErrors(["The chart you are trying to join is single-user only."]);
                return false;
            }
            else if (valueChart.getCreator() === this.currentUserService.getUsername()) {
                this.userNotificationService.displayErrors(["You cannot join a chart that you own."]);
                return false;
            }
            else if (this.validationService.validateStructure(valueChart).length > 0) {
                this.userNotificationService.displayErrors(["Cannot join chart. There are problems with this chart that can only be fixed by the owner."]);
                return false;
            }
            return true;
        }
        /*
            @returns {void}
            @description 	Called in response to click of "Yes" button in validation error modal.
        */
        fixChart() {
            this.router.navigate(['create', types_2.CreatePurpose.EditValueChart, 'BasicInfo'], { queryParams: { role: types_1.UserRole.Owner } });
        }
    };
    HomeComponent = __decorate([
        core_1.Component({
            selector: 'home',
            templateUrl: './Home.template.html',
        }),
        __metadata("design:paramtypes", [router_1.Router,
            services_1.XMLValueChartParserService,
            services_2.CurrentUserService,
            services_3.ValueChartService,
            http_2.ValueChartHttp,
            services_4.ValidationService,
            services_5.UserNotificationService,
            http_1.UserHttp])
    ], HomeComponent);
    return HomeComponent;
})();
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=Home.component.js.map