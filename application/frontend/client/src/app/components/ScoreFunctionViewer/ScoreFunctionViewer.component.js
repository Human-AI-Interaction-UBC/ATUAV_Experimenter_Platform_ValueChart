"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-07-12 16:46:23
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-19 12:12:13
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
exports.ScoreFunctionViewerComponent = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
// Import Libraries:
const d3 = require("d3");
const ValueChartVis_1 = require("../../../ValueChartVis");
const ValueChartVis_2 = require("../../../ValueChartVis");
const types_1 = require("../../../types");
/*
    This component implements the expanded score function plot page. The expanded score function plot page is a pop-up window that opens when a
    user double clicks on an embedded score function plot in a ValueChart visualization (although this only happens if the interaction is enabled).
    The ScoreFunctionViewerComponent displays multi-user score function plots in a larger size than is possible within a ValueChart visualization using
    the ScoreFunctionDirective class. It also has a score distribution graph made up of box plots that is created by the ScoreDistributionChartRenderer.

    This component has several features that are different from other components in the application because it is ONLY displayed in a pop-up window.
    Firstly, all data services and ValueChart data are obtained through a reference to the opening window rather than through angular. This is because the
    pop-up window is actually a completely new Angular application, and its data services are not initialized. ScoreFunctionViewerComponent also uses the
    reference to the opening window to trigger change detection in the main application. This allows any changes made to the expanded score function plot
    to be immediately reflected in the main ValueChart visualization.
*/
let ScoreFunctionViewerComponent = /** @class */ (() => {
    let ScoreFunctionViewerComponent = class ScoreFunctionViewerComponent {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            This constructor will be called automatically when Angular constructs an instance of this class prior to dependency injection.
        */
        constructor(router, route) {
            this.router = router;
            this.route = route;
            this.services = {};
            this.ChartOrientation = types_1.ChartOrientation;
        }
        // ========================================================================================
        // 									Methods
        // ========================================================================================
        // ================================ Life-cycle Methods ====================================
        /*
            @returns {void}
            @description 	Initializes the ScoreFunctionViewer. ngOnInit is only called ONCE by Angular. This function is thus used for one-time initialized only.
                            Calling ngOnInit should be left to Angular. Do not call it manually. All initialization logic for the component should be put in this
                            method rather than in the constructor.
        */
        ngOnInit() {
            this.sub = this.route.params.subscribe(params => this.viewType = params['ViewType']);
            this.scoreFunctionPlotContainer = d3.select('.expanded-score-function');
            this.scoreDistributionChartContainer = d3.select('.score-distribution-plot');
            if (window) {
                this.opener = window.opener;
                this.scoreFunctions = window.opener.scoreFunctions;
                this.colors = window.opener.colors;
                this.objectiveToDisplay = window.opener.objectiveToPlot;
                this.chartUndoRedoService = window.opener.chartUndoRedoService;
                this.rendererScoreFunctionUtility = new ValueChartVis_2.RendererScoreFunctionUtility();
                this.enableInteraction = (window.opener.enableInteraction && !this.objectiveToDisplay.getDefaultScoreFunction().immutable);
                this.individual = window.opener.individual;
            }
            this.services.chartUndoRedoService = this.chartUndoRedoService;
            this.previousViewType = this.viewType;
            this.initDistributionPlot();
            this.configureDisplay();
        }
        ngDoCheck() {
            if (this.viewType !== this.previousViewType) {
                this.previousViewType = this.viewType;
                this.configureDisplay();
            }
        }
        ngOnDestroy() {
            // Remove the ScoreFunction viewer form the parent window's list of children.
            this.opener.childWindows.scoreFunctionViewer = null;
            this.sub.unsubscribe(); // Un-subscribe from the url parameters before the component is destroyed to prevent a memory leak.
        }
        // ================================ Other Methods ====================================
        initDistributionPlot() {
            this.scoreDistributionChartRenderer = new ValueChartVis_1.ScoreDistributionChartRenderer(this.rendererScoreFunctionUtility);
            this.scoreDistributionChartRenderer.createScoreDistributionChart(this.scoreDistributionChartContainer, this.objectiveToDisplay, this.scoreFunctions);
            this.scoreDistributionChartRenderer.renderScoreDistributionChart(375, 300, types_1.ChartOrientation.Vertical);
        }
        configureDisplay() {
            if (this.viewType === 'plot') {
                this.scoreFunctionPlotContainer.attr('display', 'block');
                this.scoreDistributionChartContainer.attr('display', 'none');
            }
            else if (this.viewType == 'distribution') {
                this.scoreFunctionPlotContainer.attr('display', 'none');
                this.scoreDistributionChartContainer.attr('display', 'block');
            }
        }
    };
    ScoreFunctionViewerComponent = __decorate([
        core_1.Component({
            selector: 'ScoreFunctionViewer',
            templateUrl: './ScoreFunctionViewer.template.html',
        }),
        __metadata("design:paramtypes", [router_1.Router,
            router_1.ActivatedRoute])
    ], ScoreFunctionViewerComponent);
    return ScoreFunctionViewerComponent;
})();
exports.ScoreFunctionViewerComponent = ScoreFunctionViewerComponent;
//# sourceMappingURL=ScoreFunctionViewer.component.js.map