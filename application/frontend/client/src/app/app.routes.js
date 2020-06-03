"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-06-24 09:46:28
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-17 21:40:32
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTER = exports.APP_ROUTER_PROVIDERS = void 0;
const router_1 = require("@angular/router");
// Import Application Classes:
// Components:
const Register_component_1 = require("./components/Register/Register.component");
const Home_component_1 = require("./components/Home/Home.component");
const Account_component_1 = require("./components/Account/Account.component");
const ValueChartViewer_component_1 = require("./components/ValueChartViewer/ValueChartViewer.component");
const ScoreFunctionViewer_component_1 = require("./components/ScoreFunctionViewer/ScoreFunctionViewer.component");
const CreateValueChart_component_1 = require("./components/CreateValueChart/CreateValueChart.component");
const CreateAlternatives_component_1 = require("./components/CreateAlternatives/CreateAlternatives.component");
const CreateBasicInfo_component_1 = require("./components/CreateBasicInfo/CreateBasicInfo.component");
const CreateObjectives_component_1 = require("./components/CreateObjectives/CreateObjectives.component");
const CreateScoreFunctions_component_1 = require("./components/CreateScoreFunctions/CreateScoreFunctions.component");
const CreateWeights_component_1 = require("./components/CreateWeights/CreateWeights.component");
// Services:
const ValueChart_http_1 = require("./http/ValueChart.http");
const User_http_1 = require("./http/User.http");
const Host_service_1 = require("./services/Host.service");
const CurrentUser_service_1 = require("./services/CurrentUser.service");
const ValueChart_service_1 = require("./services/ValueChart.service");
const Auth_guard_1 = require("./guards/Auth.guard");
const Join_guard_1 = require("./guards/Join.guard");
const User_guard_1 = require("./guards/User.guard");
const Creation_guard_1 = require("./guards/Creation.guard");
const UpdateValueChart_service_1 = require("./services/UpdateValueChart.service");
const Validation_service_1 = require("./services/Validation.service");
const UserNotification_service_1 = require("./services/UserNotification.service");
const CreationSteps_service_1 = require("./services/CreationSteps.service");
/*
    This is the route configuration for the main application router. This is where components are assigned to url paths.
    Angular will use these assignments to determine what component to display when the application is loaded,
    or when it detects a change the client's url. The canActivate field on each path allows us to register a
    class that will be responsible for determining if the application is allowed to navigate to the path.
    The AuthGuard class is used to prevent users from navigating away from the 'register' path without
    signing in (i.e authenticating themselves). The JoinGuard is used to load a ValueChart for a user that
    is joining an existing ValueChart via a url. It will only block navigation if the invitation url used is not valid.
    Note that the path '/register' is the default path that the client will redirect users to if no path match is found. This is
    accomplished via the '**' (wildcard) path.

    Note that all Creation related routes are declared and handled in Create.routes.ts, which is the router for the CreateModule.

    It is important to realize that Angular's routing is font-end only, and is begins after a client has been sent
    the application's index.html file. This is why the back-end is set up to redirect all requests resulting in a 404 status
    to send the index.html instead of an error. A user's request may not be a 404 at all; it may be intended for the front-end router.
*/
const routes = [
    { path: 'register', component: Register_component_1.RegisterComponent },
    { path: 'join/ValueCharts/:ValueChart', component: Register_component_1.RegisterComponent, canActivate: [Join_guard_1.JoinGuard] },
    { path: 'home', component: Home_component_1.HomeComponent, canActivate: [Auth_guard_1.AuthGuard] },
    { path: 'myAccount', component: Account_component_1.AccountComponent, canActivate: [Auth_guard_1.AuthGuard] },
    { path: 'ValueCharts/:ValueChart/:ChartType', component: ValueChartViewer_component_1.ValueChartViewerComponent, canActivate: [Auth_guard_1.AuthGuard], canDeactivate: [User_guard_1.UserGuard] },
    { path: 'scoreFunction/:ViewType', component: ScoreFunctionViewer_component_1.ScoreFunctionViewerComponent },
    {
        path: 'create/:purpose',
        component: CreateValueChart_component_1.CreateValueChartComponent,
        canActivate: [Auth_guard_1.AuthGuard],
        canDeactivate: [Creation_guard_1.CreationGuard],
        children: [
            { path: 'BasicInfo', component: CreateBasicInfo_component_1.CreateBasicInfoComponent, canActivate: [Creation_guard_1.CreationGuard] },
            { path: 'Objectives', component: CreateObjectives_component_1.CreateObjectivesComponent, canActivate: [Creation_guard_1.CreationGuard] },
            { path: 'Alternatives', component: CreateAlternatives_component_1.CreateAlternativesComponent, canActivate: [Creation_guard_1.CreationGuard] },
            { path: 'ScoreFunctions', component: CreateScoreFunctions_component_1.CreateScoreFunctionsComponent, canActivate: [Creation_guard_1.CreationGuard], canDeactivate: [User_guard_1.UserGuard] },
            { path: 'Weights', component: CreateWeights_component_1.CreateWeightsComponent, canActivate: [Creation_guard_1.CreationGuard], canDeactivate: [User_guard_1.UserGuard] }
        ]
    },
    // Setup default URL as /register.
    { path: '**', redirectTo: '/register' }
];
// Export the providers necessary for the router to be used in the AppModule. Any class that must be provided for the routes to work should 
// be included here. Note that this does not include components, which do not require providers.
exports.APP_ROUTER_PROVIDERS = [
    [Auth_guard_1.AuthGuard, Join_guard_1.JoinGuard, User_guard_1.UserGuard, Creation_guard_1.CreationGuard, Host_service_1.HostService, User_http_1.UserHttp, ValueChart_http_1.ValueChartHttp, CurrentUser_service_1.CurrentUserService, ValueChart_service_1.ValueChartService, CreationSteps_service_1.CreationStepsService, UpdateValueChart_service_1.UpdateValueChartService, Validation_service_1.ValidationService, UserNotification_service_1.UserNotificationService]
];
// Export the router itself. This is registered as the applications router in the AppModule.
exports.ROUTER = router_1.RouterModule.forRoot(routes);
//# sourceMappingURL=app.routes.js.map