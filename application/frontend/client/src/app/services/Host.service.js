"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-08-02 12:13:00
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-08-16 14:46:12
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
exports.HostService = void 0;
const core_1 = require("@angular/core");
// Import Libraries:
const _ = require("lodash");
const Subject_1 = require("rxjs/Subject");
require("../utilities/rxjs-operators");
// Import Application Classes:
const UserNotification_service_1 = require("./UserNotification.service");
const CurrentUser_service_1 = require("./CurrentUser.service");
const ValueChart_service_1 = require("./ValueChart.service");
const Validation_service_1 = require("./Validation.service");
const UpdateValueChart_service_1 = require("./UpdateValueChart.service");
const utilities_1 = require("../utilities");
/*
    This class contains all the methods require to host a ValueChart. A hosted ValueChart is a ValueChart
    that other users, on different clients, can join and submit their preferences to. A hosted ValueChart
    is automatically updated whenever a user joins, leaves, or changes their preferences. It is also updated
    when the ValueChart's owner changes structural aspects of the ValueChart (eg. alternatives, objectives or basic details).

    This class can open and maintain a websocket connection with the server that is used to send and
    receive messages about the state of a hosted ValueChart and its users. All the functionality for
    sending these messages and handling messages from the server is located in this class.
*/
let HostService = /** @class */ (() => {
    let HostService = class HostService {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(userNotificationService, currentUserService, valueChartService, updateValueChartService, validationService) {
            this.userNotificationService = userNotificationService;
            this.currentUserService = currentUserService;
            this.valueChartService = valueChartService;
            this.updateValueChartService = updateValueChartService;
            this.validationService = validationService;
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            this.hostUrl = 'host'; // The base URL of the host websocket on the server.
            // This is the message handler for the host websocket. 
            this.hostMessageHandler = (msg) => {
                var hostMessage = JSON.parse(msg.data); // Messages are always stringified JSON that must be parsed.
                // Handle the message depending on its type. 
                switch (hostMessage.type) {
                    // The server is notifying the client that initialization has been completed on the server-side.
                    case 4 /* ConnectionInit */:
                        break;
                    // A new user has joined the hosted ValueChart. 
                    case 0 /* UserAdded */:
                        let newUser = this.valueChartParser.parseUser(hostMessage.data, this.valueChartService.getValueChart().getObjectiveNameToIdMap());
                        if (newUser.getUsername() === this.currentUserService.getUsername())
                            return;
                        this.valueChartService.getValueChart().setUser(newUser);
                        this.userAddedSubject.next(newUser);
                        break;
                    // An existing user has resubmitted their preferences.
                    case 1 /* UserChanged */:
                        let updatedUser = this.valueChartParser.parseUser(hostMessage.data, this.valueChartService.getValueChart().getObjectiveNameToIdMap());
                        if (updatedUser.getUsername() === this.currentUserService.getUsername())
                            return;
                        this.valueChartService.getValueChart().setUser(updatedUser);
                        this.userChangedSubject.next(updatedUser);
                        break;
                    // A user has been deleted from the ValueChart.
                    case 2 /* UserRemoved */:
                        let userToDelete = hostMessage.data;
                        let userIndex = this.valueChartService.getValueChart().getUsers().findIndex((user) => {
                            return user.getUsername() === userToDelete;
                        });
                        this.valueChartService.getValueChart().getUsers().splice(userIndex, 1);
                        this.userRemovedSubject.next(userToDelete);
                        break;
                    // The ValueChart's owner has changed its structure (i.e. the basic details, the alternatives, or the objectives)
                    case 3 /* StructureChanged */:
                        let newStructure = this.valueChartParser.parseValueChart(hostMessage.data);
                        newStructure.setUsers(this.valueChartService.getValueChart().getUsers());
                        newStructure.setType(this.valueChartService.getValueChart().getType());
                        // Update the ValueChart if the structure has been changed by the owner and there are no errors in the new structure.
                        if (this.validationService.validateStructure(newStructure).length === 0 && !_.isEqual(newStructure, this.valueChartService.getValueChart())) {
                            let changes = this.updateValueChartService.getValueChartChanges(this.valueChartService.getValueChart(), newStructure);
                            // Notify other users of the changes.
                            if (this.currentUserService.getUsername() !== this.valueChartService.getValueChart().getCreator())
                                this.userNotificationService.displayInfo(changes);
                            // Update the user's preferences.
                            let warnings = [];
                            this.valueChartService.getValueChart().getUsers().forEach((user) => {
                                let userWarnings = this.updateValueChartService.cleanUpUserPreferences(this.valueChartService.getValueChart(), user);
                                // Print Warnings ONLY for the current user.
                                if (user.getUsername() === this.currentUserService.getUsername())
                                    warnings = userWarnings;
                            });
                            this.userNotificationService.displayWarnings(warnings);
                            this.structureChangedSubject.next(this.valueChartService.getValueChart());
                        }
                        break;
                    default:
                    // A keep connection message was sent by server. These messages a are hack used to keep the websocket open.
                    // It seems that the websocket will silently close if messages are continuously being exchanged between the server and client.
                    // To keep the socket open the serve sends a KeepConnection message every five seconds and the client replies to each one
                    // with another KeepConnection message. These messages carry not data. They only serve to keep the socket open.
                    case 5 /* KeepConnection */:
                        this.hostWebSocket.send(JSON.stringify({ type: 5 /* KeepConnection */, data: 'Keep connection Open' }));
                        break;
                }
            };
            this.valueChartParser = new utilities_1.JsonValueChartParser();
            this.userAddedSubject = new Subject_1.Subject();
            this.userChangedSubject = new Subject_1.Subject();
            this.userRemovedSubject = new Subject_1.Subject();
            this.structureChangedSubject = new Subject_1.Subject();
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @param chartId - The Id of the ValueChart that is to be hosted. This MUST be the id returned by the server after creating a ValueChart resource (see ValueChartHttp).
            @returns {WebSocket} - The websocket that is being used to send and receive messages from the server about the hosted ValueChart.
            @description 	Initiates hosting a ValueChart by opening a websocket connection with the server. The hosted ValueChart will
                            dynamically update as users submit their preferences.
        */
        hostGroupValueChart(chartId) {
            // Open the websocket connection. Note websockets use the ws protocol rather than http(s).
            this.hostWebSocket = new WebSocket('ws://' + window.location.host + '/' + this.hostUrl + '/' + chartId);
            // onmessage is a function that will be called whenever the client receives a message from the server. 
            // The hostMessageHandler is our handler for all messages from the server.
            this.hostWebSocket.onmessage = this.hostMessageHandler;
            return this.hostWebSocket;
        }
        /*
            @returns {void}
            @description 	Stops hosting a ValueChart by closing the websocket connection. The server will cleanup the resources associated
                            with the websocket.
        */
        endCurrentHosting() {
            if (!this.hostWebSocket)
                return;
            // Close the websocket. The parameter 1000 indicates that the socket was closed due to normal operation (as opposed to an error).
            this.hostWebSocket.close(1000);
            this.hostWebSocket = null;
        }
    };
    HostService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [UserNotification_service_1.UserNotificationService,
            CurrentUser_service_1.CurrentUserService,
            ValueChart_service_1.ValueChartService,
            UpdateValueChart_service_1.UpdateValueChartService,
            Validation_service_1.ValidationService])
    ], HostService);
    return HostService;
})();
exports.HostService = HostService;
//# sourceMappingURL=Host.service.js.map