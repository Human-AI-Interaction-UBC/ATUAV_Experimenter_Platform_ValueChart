"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-25 14:41:41
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 14:46:42
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
exports.ws = exports.RootComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const core_2 = require("@angular/core");
// Import Application Classes:
const services_1 = require("../../services");
const services_2 = require("../../services");
const services_3 = require("../../services");
const http_1 = require("../../http");
const http_2 = require("../../http");
const services_4 = require("../../services");
const utilities_1 = require("../../utilities");
const services_5 = require("../../services");
// Import Model Classes:
const model_1 = require("../../../model");
// Import Utility Classes:
const Formatter = require("../../utilities/Formatter");
// Import Types
const types_1 = require("../../../types");
const types_2 = require("../../../types");
/*
    The root component is the base component of the application. It is the only component that is always displayed
    and its template contains the router-outlet directive. The router-outlet directive is the where the Angular router
    places whatever component should be displayed based upon the current url path. Its template is also where the
    HTML for the application's navigation bar is defined. This is why the component's class body contains several methods
    that relate the navigation bar functionality, such as logging out.

    The root component is also an important location for registering providers. Any angular services that are intended
    to be singletons across the application should be placed in the root components list of providers. The root component
    is only ever initialized once by the application, which in turn means that the classes in the providers list will only
    ever be created once.
*/
let RootComponent = /** @class */ (() => {
    let RootComponent = class RootComponent {
        // on the client side using object URLs.
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            Any initialization that needs to be done should be placed in the ngOnInit method.
                            This constructor should NOT be called manually. There is never any reason to manually create a component class;
                            component classes should always be created by Angular so that the template can be parsed and two-way binding can be
                            initialized. Angular will automatically handle the construction of this class whenever it's selector is used.
        */
        constructor(router, currentUserService, xmlValueChartEncoder, valueChartParser, userHttp, valueChartHttp, valueChartService, userNotificationService, validationService, applicationRef) {
            this.router = router;
            this.currentUserService = currentUserService;
            this.xmlValueChartEncoder = xmlValueChartEncoder;
            this.valueChartParser = valueChartParser;
            this.userHttp = userHttp;
            this.valueChartHttp = valueChartHttp;
            this.valueChartService = valueChartService;
            this.userNotificationService = userNotificationService;
            this.validationService = validationService;
            this.applicationRef = applicationRef;
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            // The current chart type. Either 'normal' or 'average'. This is used to keep track of what type of ValueChart the 
            // ValueChartViewer is currently displaying. 'normal' is the default value.
            this.chartType = 'normal';
            // Upload validation fields:
            this.displayValidationModal = false;
            this.displayModal = false;
            // The current chart type. Either 'Score Distributions' or 'User Scores'. This is used to keep track of the view 
            // that the ScoreFuntionViewer is currently displaying. 'normal' is the default value.
            this.switchScoreFunctionViewText = 'Score Distributions';
            this.isJoining = false; // boolean toggle indicating whether user clicked to join or view an existing chart 
            // this is needed so we can use the same credentials modal in both cases
            this.window = window;
            this.modalActionEnabled = false;
            this.modalActionFunction = () => { };
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @returns {void}
            @description 	Initializes the RootComponent. Any initialization logic that is required for the component to run properly should
                            be placed in this method. ngOnInit is called by Angular AFTER the first change detection cycle (i.e. ngDoCheck is called once).
                            ngOnInit is only called ONCE by Angular. This function is thus used for one-time initialized only. Calling ngOnInit should be left
                            to Angular. Do NOT call it manually.
        */
        ngOnInit() {
            // Attach this Angular application reference to the window object.
            // This is to make it accessible to any additional windows that are created
            // by this window. This is specifically used by the ScoreFunctionViewerComponent.
            window.angularAppRef = this.applicationRef;
            window.childWindows = {}; // Initialize a map to used as storage for references to an windows created by this window.
            this.downloadLink = document.querySelector('#download-user-weights');
        }
        /*
            @returns {void} -
            @description 	Logs the current user out by making a call to the logout endpoint. This endpoint deletes the current user's
                            session. This method then redirects the application to the register page no matter what the current URL path is.
                            This is because users must be authenticated (or temporary) to view pages other than register.
                            Note that this method should only called when a user is logged in. It may throw errors if no user is logged in,
                            or if the user is a temporary user.
        */
        logout() {
            if (this.currentUserService.isLoggedIn()) {
                this.userHttp.logout()
                    .subscribe(logoutResult => {
                    this.currentUserService.setLoggedIn(false);
                    this.currentUserService.setUsername(undefined);
                    window.destination = '/register';
                    this.router.navigate(['/register']);
                });
            }
            else {
                this.currentUserService.setUsername(undefined);
                window.destination = '/register';
                this.router.navigate(['/register']);
            }
        }
        /*
            @returns {void} -
            @description 	Changes the url path in order to cause the ScoreFunctionViewer to display either the Score Function Plot,
                            or the Score Distribution Chart. Which one is displayed depends on the current state of the ScoreFucntionViewer.
                            This method will show the Score Function Plot if the score Distribution Chart is currently displayed,
                            and vice versa. This method should only be called when the current route is 'scoreFunction', as it will cause
                            navigation to that url path.
        */
        switchScoreFunctionView() {
            if (this.router.url.indexOf('distribution') === -1) {
                this.router.navigate(['scoreFunction', 'distribution']);
                this.switchScoreFunctionViewText = 'User Scores';
            }
            else {
                this.router.navigate(['scoreFunction', 'plot']);
                this.switchScoreFunctionViewText = 'Score Distributions';
            }
        }
        createValueChart() {
            var valueChart = new model_1.ValueChart('', '', this.currentUserService.getUsername());
            valueChart.setType(model_1.ChartType.Individual);
            this.valueChartService.setValueChart(valueChart);
            this.router.navigate(['create', types_2.CreatePurpose.NewValueChart, 'BasicInfo'], { queryParams: { role: types_1.UserRole.Owner } });
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
            // Close open dropdowns.
            $('.dropdown.open .dropdown-toggle').dropdown('toggle');
        }
        /*
            @param chartName - The name of the ValueChart to join. This is NOT the _id field set by the server, but rather the user defined name.
            @param chartPassword - The password of the ValueChart to join.
            @returns {void}
            @description 	Called when credentials modal is closed.
                            Delegates to joinValueChart or viewValueChart based on which button was clicked.
        */
        handleModalInputs(chartName, chartPassword) {
            if (this.isJoining) {
                this.joinValueChart(chartName, chartPassword);
            }
            else {
                this.viewValueChart(chartName, chartPassword);
            }
        }
        exportUserWeights() {
            var valueChart = this.valueChartService.getValueChart();
            var weightsObjectUrl = this.convertUserWeightsIntoObjectURL(valueChart);
            this.downloadLink.setAttribute('href', weightsObjectUrl); // Set the download link on the <a> element to be the URL created for the CSV string.
            $(this.downloadLink).click(); // Click the <a> element to programmatically begin the download.
        }
        convertUserWeightsIntoObjectURL(valueChart) {
            if (valueChart === undefined)
                return;
            // Obtain a CSV string for the user defined weights in the given ValueChart. 
            var weightString = this.xmlValueChartEncoder.encodeUserWeights(valueChart);
            // Convert the string into a blob. We must do this before we can create a download URL for the CSV string.
            var weightsBlob = new Blob([weightString], { type: 'text/xml' });
            // Create and return a unique download URL for the CSV string.
            return URL.createObjectURL(weightsBlob);
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
        getValueChartName() {
            if (this.valueChartService.valueChartIsDefined()) {
                return this.valueChartService.getValueChart().getFName() + 'UserWeights.csv';
            }
            else {
                return '';
            }
        }
        /*
            @param chartName - The name of the ValueChart to join. This is NOT the _id field set by the server, but rather the user defined name.
            @param chartPassword - The password of the ValueChart to join.
            @returns {void}
            @description 	Retrieves the structure of the ValueChart that matches the given credentials and directs the user into the creation workflow
                            so that they may define their preferences. Notifies the user using a banner warning if no ValueChart exists with the given
                            name and password.
        */
        joinValueChart(chartName, chartPassword) {
            this.valueChartHttp.getValueChart(Formatter.nameToID(chartName), chartPassword)
                .subscribe((valueChart) => {
                $('#chart-credentials-modal').modal('hide');
                if (this.validateChartForJoining(valueChart)) {
                    this.valueChartService.setValueChart(valueChart);
                    let role = valueChart.isMember(this.currentUserService.getUsername()) ? types_1.UserRole.Participant : types_1.UserRole.UnsavedParticipant;
                    if (this.valueChartService.getValueChart().getMutableObjectives().length > 0) {
                        this.router.navigate(['create', types_2.CreatePurpose.NewUser, 'ScoreFunctions'], { queryParams: { role: role } });
                    }
                    else {
                        this.router.navigate(['create', types_2.CreatePurpose.NewUser, 'Weights'], { queryParams: { role: role } });
                    }
                }
            }, 
            // Handle Server Errors (like not finding the ValueChart)
            (error) => {
                if (error === '404 - Not Found')
                    this.invalidCredentials = true; // Notify the user that the credentials they input are invalid.
            });
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
    };
    RootComponent = __decorate([
        core_1.Component({
            selector: 'root',
            templateUrl: './Root.template.html',
            providers: [
                services_1.XMLValueChartParserService,
                utilities_1.XmlValueChartEncoder
            ]
        }),
        __metadata("design:paramtypes", [router_1.Router,
            services_2.CurrentUserService,
            utilities_1.XmlValueChartEncoder,
            services_1.XMLValueChartParserService,
            http_1.UserHttp,
            http_2.ValueChartHttp,
            services_3.ValueChartService,
            services_5.UserNotificationService,
            services_4.ValidationService,
            core_2.ApplicationRef])
    ], RootComponent);
    return RootComponent;
})();
exports.RootComponent = RootComponent;
exports.ws = new WebSocket("ws://localhost:8888/websocket");
exports.ws.onopen = function () {
};
exports.ws.onmessage = function (evt) {
    console.log("received some message");
    var obj = JSON.parse(evt.data);
    console.log(obj);
    if (obj.remove) {
        // handle removal
    }
    else if (obj.deliver) {
        // handle delivery
        console.log("handling delivery");
        handleDelivery(obj);
    }
};
function handleDelivery(obj) {
    console.log("Received a deliver call");
    alert(JSON.stringify(obj));
}
//# sourceMappingURL=Root.component.js.map