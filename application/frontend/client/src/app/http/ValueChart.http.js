"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-07-26 18:27:55
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
exports.ValueChartHttp = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const http_1 = require("@angular/http");
const http_2 = require("@angular/http");
const Observable_1 = require("rxjs/Observable");
require("../utilities/rxjs-operators");
// IMport Application Classes: 
const utilities_1 = require("../utilities");
/*
    This class contains methods used to interact with ValueChart resources stored by the server.
    It should be used anytime the client needs to retrieve, alter or delete ValueCharts, users within
    a ValueChart, the structure of a ValueChart, or the ValueChart's status object. Note that the
    observables return by the methods of this class MUST be subscribed to for those methods' http
    requests to be made. Read more about observables here: https://github.com/Reactive-Extensions/RxJS.

    The methods in this class are used to access the endpoints defined in ValueChart.routes.ts
    and ValueChartUsers.routes.ts.
*/
let ValueChartHttp = /** @class */ (() => {
    let ValueChartHttp = class ValueChartHttp {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(http) {
            this.http = http;
            // ========================================================================================
            // 									Fields
            // ========================================================================================
            this.valueChartsUrl = 'ValueCharts/'; // The base URL of ValueChart resources on the server.
            // Helper Functions: 
            // This method returns a server response object with making any changes. It should be sued when the response is only a string.
            this.extractBody = (res) => {
                return res;
            };
            // This method extracts JSON data from a server response and returns it. It should be used when the response is known to be JSON.
            this.extractData = (res) => {
                let body = res.json();
                return body.data || {}; // Return the body of the response, or an empty object if it is undefined.
            };
            // This method extracts a ValueChart object from the server response. The ValueChart does not need to be complete.
            this.extractValueChartData = (res) => {
                let body = res.json();
                return this.valueChartParser.parseValueChart(body.data);
            };
            // This method extracts a user object from the server response. The user object does not need to be complete.
            this.extractUserData = (res) => {
                let body = res.json();
                return this.valueChartParser.parseUser(body.data);
            };
            // This method extracts a list of user objects from the server response. The user objects do not need to be complete.
            this.extractUsersData = (res) => {
                let body = res.json();
                let users = [];
                for (var i = 0; i < body.data.length; i++) {
                    users.push(this.valueChartParser.parseUser(body.data[i]));
                }
                return users;
            };
            // This method extracts errors from the server response.
            this.handleError = (error, caught) => {
                let errMsg = (error.message) ? error.message :
                    error.status ? `${error.status} - ${error.statusText}` : 'Server error';
                return Observable_1.Observable.throw(errMsg);
            };
            this.valueChartParser = new utilities_1.JsonValueChartParser();
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        /*
            @param valueChart - The ValueChart to be created on the server.
            @returns {Observable<ValueChart>} - An observable of the ValueChart that was created.
            @description 	Creates a new ValueChart resource on the server. The created resource is
                            is a JSON version of the supplied ValueChart, and can be accessed using
                            the getValueChart method of this class and the new resource's id. The id can be obtained
                            from the _id field of the observable ValueChart that is returned by this method.
        */
        createValueChart(valueChart) {
            if (!valueChart._id)
                valueChart._id = undefined;
            let body = JSON.stringify(valueChart);
            let headers = new http_2.Headers({ 'Content-Type': 'application/json' });
            let options = new http_2.RequestOptions({ headers: headers });
            return this.http.post(this.valueChartsUrl, body, options)
                .map(this.extractValueChartData)
                .catch(this.handleError);
        }
        /*
            @param valueChart - The ValueChart on the server that is to be updated.
            @returns {Observable<ValueChart>} - An observable of the ValueChart that was updated.
            @description 	Updates an existing ValueChart resource on the server. The updated resource is is a JSON version
                            of the supplied ValueChart, and can be accessed using the getValueChart method of this class
                            and the resource's id. The id can be obtained from the _id field of the observable
                            ValueChart that is returned by this method. This method should NOT be used to create a
                            ValueChart resource for the first time. Use createValueChart for this purpose.
        */
        updateValueChart(valueChart) {
            let body = JSON.stringify(valueChart);
            let headers = new http_2.Headers({ 'Content-Type': 'application/json' });
            let options = new http_2.RequestOptions({ headers: headers });
            return this.http.put(this.valueChartsUrl + valueChart._id, body, options)
                .map(((this.extractValueChartData)))
                .catch(this.handleError);
        }
        /*
            @param fname - The ValueChart name (formatted) whose availability is to be checked.
            @returns {Observable<boolean>} - An observable of a boolean value. If the boolean is true, the name is available;
            @description 	Determines whether or not the give ValueChart name is available by querying the server to see
                            if a ValueChart resource with that name already exists. Note that duplicate names are not permitted for ValueCharts.
        */
        isNameAvailable(fname) {
            return this.http.get(this.valueChartsUrl + fname + '/id')
                .map((body) => { return !body; })
                .catch((error, caught) => {
                return Observable_1.Observable.of(true);
            });
        }
        /*
            @param chartId - The id of the ValueChart resource to be retrieved. This id is provided by the server upon creating/updating a ValueChart resource.
            @param password - The password of the ValueChart to be retrieved. The client must have the correct password to be allowed to retrieve the ValueChart.
            @returns {Observable<boolean>} - An observable of the ValueChart that was requested.
            @description 	Queries the server to retrieve a copy of the ValueChart resource with the given id and password. This will fail
                            to return the desired ValueChart if the id, and password are not correct.
        */
        getValueChart(chartId, password) {
            return this.http.get(this.valueChartsUrl + chartId + '?password=' + password)
                .map(this.extractValueChartData)
                .catch(this.handleError);
        }
        /*
            @param fname - The name of the ValueChart (formatted) whose structure is to be retrieved. This is NOT the id provided by the server, but rather the user assigned name.
            @param password - The password for the ValueChart whose structure is to be retrieved.
            @returns {Observable<ValueChart>} - An observable of a ValueChart object with an empty array for the users list.
            @description 	Queries the server to retrieve a copy of the ValueChart resource with the given name and password. This will fail
                            to return the desired ValueChart if the name and password are not correct.
        */
        getValueChartByName(fname, password) {
            return this.http.get(this.valueChartsUrl + fname + '?password=' + password)
                .map(this.extractValueChartData)
                .catch(this.handleError);
        }
        /*
            @param chartId - The id of the ValueChart resource to be deleted. This id is provided by the server upon creating/updating a ValueChart resource.
            @returns {Observable<any>} - An observable of either a string if the deletion was successful, or a JSON object with an error if it was not.
            @description 	Queries the server to delete the ValueChart resource with the given id.
        */
        deleteValueChart(chartId) {
            return this.http.delete(this.valueChartsUrl + chartId)
                .map(this.extractBody)
                .catch(this.handleError);
        }
        /*
            @param fname - The name of the ValueChart (formatted) whose structure is to be retrieved. This is NOT the id provided by the server, but rather the user assigned name.
            @param password - The password for the ValueChart whose structure is to be retrieved.
            @returns {Observable<ValueChart>} - An observable of a ValueChart object with an empty array for the users list.
            @description 	Queries the server to retrieve the structure of the ValueChart resource with the given name and password.
                            Structure means that the retrieved ValueChart only has Objectives, and Alternatives. It has NO users.
        */
        getValueChartStructure(fname, password) {
            return this.http.get(this.valueChartsUrl + fname + '/structure?password=' + password)
                .map(this.extractValueChartData)
                .catch(this.handleError);
        }
        /*
            @param chartId - The id of the ValueChart whose structure is to be updated. This id is provided by the server upon creating/updating a ValueChart resource.
            @param valueChart - The valueChart object whose structure will replace the resource on the server. valueChart may have users. They will be ignored by the server.
            @returns {Observable<ValueChart>} - An observable of a ValueChart object with an empty array for the users list.
            @description 	Queries the server to set the structure of the ValueChart resource with the given id and password.
        */
        updateValueChartStructure(valueChart) {
            let body = JSON.stringify(valueChart);
            let headers = new http_2.Headers({ 'Content-Type': 'application/json' });
            let options = new http_2.RequestOptions({ headers: headers });
            return this.http.put(this.valueChartsUrl + valueChart.getFName() + '/structure', body, options)
                .map(this.extractValueChartData)
                .catch(this.handleError);
        }
        /*
            @param status - the new status object for the ValueChart.
            @returns {Observable<ValueChart>} - An observable of the ValueChart status that was set.
            @description 	Sets the status of an existing ValueChart. The status controls whether or
                            not users are allowed to submit preferences, if the ValueChart is considered
                            complete, etc. Note that the ValueChart does not have to exist to create
                            a status object, but it will not be meaningful without a corresponding ValueChart.
                            This method is idempotent and can be used both to create a ValueChart status
                            for the first time and to update an existing ValueChart status.
        */
        setValueChartStatus(status) {
            let body = JSON.stringify(status);
            let headers = new http_2.Headers({ 'Content-Type': 'application/json' });
            let options = new http_2.RequestOptions({ headers: headers });
            return this.http.put(this.valueChartsUrl + status.chartId + '/status', body, options)
                .map(this.extractData)
                .catch(this.handleError);
        }
        /*
            @returns {Observable<ValueChart>} - An observable of the ValueChart status for the ValueChart
                                                with the given database ID.
            @description 	Retrieves the status of the ValueChart with the given database ID.
        */
        getValueChartStatus(chartId) {
            return this.http.get(this.valueChartsUrl + chartId + '/status')
                .map(this.extractData)
                .catch(this.handleError);
        }
        /*
            @returns {Observable<ValueChart>} - An observable of a message confirming the successful deletion of the status document.
            @description 	Deletes the status of the ValueChart with the given database ID.
                            Note that this method is idempotent.
        */
        deleteValueChartStatus(chartId) {
            return this.http.delete(this.valueChartsUrl + chartId + '/status')
                .map(this.extractBody)
                .catch(this.handleError);
        }
        /*
            @param chartId - The id of the ValueChart resource to add replace the user list of. This id is provided by the server upon creating/updating a ValueChart resource.
            @returns {Observable<User[]>} - An observable of the user list that was updated.
            @description 	Replaces the user list of a ValueChart resource on the server.
        */
        updateUsers(chartId, users) {
            let body = JSON.stringify(users);
            let headers = new http_2.Headers({ 'Content-Type': 'application/json' });
            let options = new http_2.RequestOptions({ headers: headers });
            return this.http.put(this.valueChartsUrl + chartId + '/users', body, options)
                .map(((this.extractUsersData)))
                .catch(this.handleError);
        }
        /*
            @param chartId - The id of the ValueChart resource that has the user to be updated. This id is provided by the server upon creating/updating a ValueChart resource.
            @param user - The user object that is going to replace the ValueChart's user resource with the same username.
            @returns {Observable<User>} - An observable of a User resource that was updated on the server. Should be identical to the user parameter.
            @description 	Updates an existing ValueChart user resource on the server. This method will create a new resource if the user
                            to be updated does not exist.
        */
        updateUser(chartId, user) {
            let body = JSON.stringify(user);
            let headers = new http_2.Headers({ 'Content-Type': 'application/json' });
            let options = new http_2.RequestOptions({ headers: headers });
            return this.http.put(this.valueChartsUrl + chartId + '/users/' + user.getUsername(), body, options)
                .map(this.extractUserData)
                .catch(this.handleError);
        }
        /*
            @param chartId - The id of the ValueChart resource that has the user to be deleted. This id is provided by the server upon creating/updating a ValueChart resource.
            @param username - The username of the user to be deleted.
            @returns {Observable<User>} - An observable of the User resource that was deleted from the server.
            @description 	Deletes an existing ValueChart user resource from the server.
        */
        deleteUser(chartId, username) {
            return this.http.delete(this.valueChartsUrl + chartId + '/users/' + username)
                .map(this.extractBody)
                .catch(this.handleError);
        }
    };
    ValueChartHttp = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], ValueChartHttp);
    return ValueChartHttp;
})();
exports.ValueChartHttp = ValueChartHttp;
//# sourceMappingURL=ValueChart.http.js.map