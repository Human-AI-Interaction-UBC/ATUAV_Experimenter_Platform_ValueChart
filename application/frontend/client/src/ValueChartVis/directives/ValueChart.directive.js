"use strict";
/*
* @Author: aaronpmishkin
* @Date:   2016-05-25 14:41:41
* @Last Modified by:   aaronpmishkin
* @Last Modified time: 2017-07-18 10:40:50
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
exports.ValueChartDirective = void 0;
// Import Angular Classes:
const core_1 = require("@angular/core");
const core_2 = require("@angular/core");
const core_3 = require("@angular/core");
// Import Libraries:
const d3 = require("d3");
const Subject_1 = require("rxjs/Subject");
require("../../app/utilities/rxjs-operators");
// Import Application Classes:
const services_1 = require("../services");
const renderers_1 = require("../renderers");
const utilities_1 = require("../utilities");
const interactions_1 = require("../interactions");
// Import Model Classes:
const model_1 = require("../../model");
const types_1 = require("../../types");
let ValueChartDirective = /** @class */ (() => {
    let ValueChartDirective = class ValueChartDirective {
        // ========================================================================================
        // 									Constructor
        // ========================================================================================
        /*
            @returns {void}
            @description 	Used for Angular's dependency injection ONLY. It should not be used to do any initialization of the class.
                            Any initialization that needs to be done should be placed in the ngOnInit method.
                            This constructor should NOT be called manually. Angular will automatically handle the construction of this directive when it is used.
        */
        constructor(
        // Angular Resources:
        elementRef, 
        // Services:
        renderEventsService, chartUndoRedoService, rendererService, changeDetectionService, 
        // Renderers:
        objectiveChartRenderer, summaryChartRenderer, labelRenderer, 
        // Utilities:
        rendererDataUtility, rendererConfigUtility) {
            this.elementRef = elementRef;
            this.renderEventsService = renderEventsService;
            this.chartUndoRedoService = chartUndoRedoService;
            this.rendererService = rendererService;
            this.changeDetectionService = changeDetectionService;
            this.objectiveChartRenderer = objectiveChartRenderer;
            this.summaryChartRenderer = summaryChartRenderer;
            this.labelRenderer = labelRenderer;
            this.rendererDataUtility = rendererDataUtility;
            this.rendererConfigUtility = rendererConfigUtility;
            this.viewConfig = {}; // Configuration options for view settings;
            this.interactionConfig = {}; // Configuration options for user interactions.
            this.reducedInformation = true;
            // Chart Outputs:
            this.chartElement = new core_3.EventEmitter(); // Output the parent SVG element of the visualization so that external modules may interact with it.
            this.undoRedo = new core_3.EventEmitter(); // Output the ChartUndoRedoService so that external modules may interface with it.
            this.renderEvents = new core_3.EventEmitter(); // Output the renderEventsService so that external modules may listen to render events.
            this.CHART_COMPONENT_RATIO = 0.47; // This ratio is used to determine the default size of the ValueChart components. e.x. componentHeight = ValueChartHeight * CHART_COMPONENT_RATIO. 
            this.renderRequired = { value: false }; // A flag set by Renderer or Interaction instances to indicate that the visualization should be re-rendered.
            /*
                @returns {void}
                @description	Initializes the interaction and view configurations for the first time by dispatching messages to the renderers.
                                Note that this should only be called when all three renderers have completed initialization - thus the
                                check to see if rendersCompleted is greater than or equal to 3.
        
            */
            this.rendersCompleted = (rendersCompleted) => {
                if (rendersCompleted >= 3) {
                    this.waitForRenderers.unsubscribe();
                    this.interactionSubject.next(this.interactionConfig);
                    this.viewConfigSubject.next(this.viewConfig);
                    // Unsubscribe and set initialization to be complete.
                    this.isInitialized = true;
                }
            };
        }
        // ========================================================================================
        //								Initialization Methods
        // ========================================================================================
        /*
            @returns {void}
            @description 	Initializes the ValueChartDirective. ngOnInit is called by Angular AFTER the first change detection cycle (i.e. ngDoCheck is called once)
                            and after the input variables are initialized. ngOnInit is only called ONCE by Angular. This function is thus used for one-time initialized only.
                            Calling ngOnInit should be left to Angular. Do not call it manually.
        */
        ngOnInit() {
            // Emit the ChartUndoRedoService and RenderEventsService instances to the parent of the ValueChartDirective.
            this.undoRedo.emit(this.chartUndoRedoService);
            this.renderEvents.emit(this.renderEventsService);
            // Configure ValueChart size.
            this.calculateDefaultComponentSize();
            // Initialize Change Detection:
            this.changeDetectionService.startChangeDetection(this.valueChart, this.width, this.height, this.viewConfig, this.interactionConfig, this.reducedInformation, this.usersToDisplay);
            this.valueChartSubject = new Subject_1.Subject();
            this.interactionSubject = new Subject_1.Subject();
            this.viewConfigSubject = new Subject_1.Subject();
            // Create the Visual Elements of the ValueChart.
            this.createValueChart();
        }
        /*
            @returns {void}
            @description	Calculates the default size of ValueChart components (labels, summary chart, objective chart) depending on the input width
                            and height of the ValueChart.
        */
        calculateDefaultComponentSize() {
            this.defaultChartComponentWidth = (this.width * this.CHART_COMPONENT_RATIO);
            this.defaultChartComponentHeight = (this.height * this.CHART_COMPONENT_RATIO);
        }
        /*
            @returns {void}
            @description	Set the size of the base element of the Visualization. This is mostly used to toggle scaling the
                            objective summary charts to either fit inside the current window, or scroll outside of the window
                            depending on the view configuration option "scaleAlternatives".
    
                            Note: This method is reasonable hacky. In the case where alternatives are not scaled, it uses the bounding box
                            of the already rendered summary/objective charts and label area to determine how big the base element should be.
                            Obtaining the bounding box is a slow procedure and requires the browser to perform a layout calculation.
                            It is currently done this way because there is no simple procedure for computing the correct size of the base element
                            due to the effects of the viewBox attribute.
        */
        setViewportSize() {
            this.el.attr('width', '95%');
            this.el.attr('height', '75%');
            if (!this.viewConfig.scaleAlternatives) {
                let currentViewport = this.el.node().getBoundingClientRect();
                if (this.viewConfig.viewOrientation === types_1.ChartOrientation.Vertical) {
                    let width = this.el.select('.label-root-container').node().getBoundingClientRect().width + 10;
                    width += this.el.select('.alternative-box').node().getBoundingClientRect().width * this.valueChart.getAlternatives().length;
                    if (width > currentViewport.width)
                        this.el.attr('width', width);
                }
                else {
                    let height = this.el.select('.label-root-container').node().getBoundingClientRect().height + 10;
                    height += this.el.select('.alternative-box').node().getBoundingClientRect().height * this.valueChart.getAlternatives().length;
                    if (height > currentViewport.height)
                        this.el.attr('height', height);
                }
            }
        }
        /*
            @returns {void}
            @description	Creates the ValueChart for the first time. It creates the SVG element that will contain the ValueChart, and then uses
                            the renderer classes to create and render each component of the ValueChart.
    
        */
        createValueChart() {
            // Create the SVG base element, and set it to fit to the input width and height:
            this.el = d3.select(this.elementRef.nativeElement).append('svg')
                .classed('ValueChart svg-content-valuechart', true)
                .attr('viewBox', '0 -15' + ' ' + this.width + ' ' + this.height)
                .attr('preserveAspectRatio', 'xMinYMin meet');
            this.el.attr('width', '95%');
            this.el.attr('height', '75%');
            // Emit the base element of the visualization to the parent of the ValueChartDirective.
            this.chartElement.emit(this.el);
            // The code below this point initializes the Rendering pipeline:
            // Create an additional subject. This will be used to single-cast (rather than multi-cast) 
            // renderer updates to the renderers. Single-casting is used to improve performance.
            var rendererUpdates = new Subject_1.Subject();
            // Attach the base information to RendererUpdates using a map. Note that maps are called every time a new RendererUpdate message is sent.
            this.valueChartSubject.map((u) => {
                u.el = this.el;
                u.height = this.defaultChartComponentHeight;
                u.width = this.defaultChartComponentWidth;
                u.viewConfig = this.viewConfig;
                u.interactionConfig = this.interactionConfig;
                u.renderRequired = this.renderRequired;
                u.reducedInformation = this.reducedInformation;
                return u;
            }).map(this.rendererDataUtility.produceMaximumWeightMap) // Attach the maximumWeightMap to the RendererUpdate using a map.
                .map(this.rendererDataUtility.produceRowData) // Attach the rowData to the RendererUpdate using a map.
                .map(this.rendererDataUtility.produceLabelData) // Attach the lableData to the RendererUpdate using a map.
                .subscribe(rendererUpdates); // Subscribe the rendererUpdates subject to the valueChartSubject
            // so that the above map functions are called ONLY once per message.
            // This is the single-casting mentioned above.
            // Attach the SummaryChart configuration to the RendererUpdate messages using a map and then subscript the SummaryChartRenderer to the messages.
            rendererUpdates
                .map(this.rendererConfigUtility.produceSummaryChartConfig)
                .map(this.rendererConfigUtility.produceRendererConfig)
                .subscribe(this.summaryChartRenderer.valueChartChanged);
            // Attach the ObjectiveChart configuration to the RendererUpdate messages using a map and then subscript the ObjectiveChartRenderer to the messages.
            rendererUpdates
                .map(this.rendererConfigUtility.produceObjectiveChartConfig)
                .map(this.rendererConfigUtility.produceRendererConfig)
                .subscribe(this.objectiveChartRenderer.valueChartChanged);
            // Attach the Label configuration to the RendererUpdate messages using a map and then subscript the LabelRenderer to the messages.
            rendererUpdates
                .map(this.rendererConfigUtility.produceLabelConfig)
                .map(this.rendererConfigUtility.produceRendererConfig)
                .subscribe(this.labelRenderer.valueChartChanged);
            // Subscribe the renderers to the interactionConfig and viewConfig subjects.
            this.interactionSubject.subscribe(this.summaryChartRenderer.interactionsChanged);
            this.interactionSubject.subscribe(this.objectiveChartRenderer.interactionsChanged);
            this.interactionSubject.subscribe(this.labelRenderer.interactionsChanged);
            this.viewConfigSubject.subscribe(this.summaryChartRenderer.viewConfigChanged);
            this.viewConfigSubject.subscribe(this.objectiveChartRenderer.viewConfigChanged);
            this.viewConfigSubject.subscribe(this.labelRenderer.viewConfigChanged);
            // Attach a listener to wait until the renderers have completed rendering for the first time.
            this.waitForRenderers = this.renderEventsService.rendersCompleted.subscribe(this.rendersCompleted);
            this.valueChartSubject.next({ valueChart: this.valueChart, usersToDisplay: this.usersToDisplay });
        }
        // ========================================================================================
        // 								Change Detection Methods:
        // ========================================================================================
        /*
            @returns {void}s
            @description	Detects and handles any changes to the directive's inputs (data, and view + interactions). This method is called by Angular whenever it detects that a change to this directive's inputs
                            MAY have occurred. The method utilizes the ChangeDetectionService to perform deep change detection on the Directive's inputs. We are implementing our own change detection because
                            Angular's change detection (provided by the ngOnChanges method) is by reference. Note that when a a class implements DoCheck, ngOnChanges is never called, even if
                            the class also implements OnChanges. This means that changes must be both detected, and handled in ngDoCheck.
        */
        ngDoCheck() {
            // DO NOT proceed with change detection if the directive has not yet been initialized.
            if (this.isInitialized === undefined)
                return;
            // Detect structural Changes. These are changes that require the SVG structure of the visualization to be updated and include:
            // 		- adding or removing users from usersToDisplay.
            // 		- adding or removing alternatives from the input ValueChart.
            //		- adding or removing objectives	from the input ValueChart.
            // Note that this method sets the "structuralUpdate" flag to be true.
            if (this.changeDetectionService.detectStructuralChanges(this.valueChart, this.usersToDisplay)) {
                this.valueChartSubject.next({ valueChart: this.valueChart, usersToDisplay: this.usersToDisplay, structuralUpdate: true });
            }
            // Detect changes to the ValueChart that require re-rendering of the visualization (but not structural changes). These include:
            //		- changing the preferences of a user in usersToDisplay (i.e. changes to their weightmap, scorefunctions, etc).
            //		- a change in the ValueChart type (ie. from Individual to Group or Group to Individual)
            //		- a change in the rendering orientation.
            // 		- a change in alternative scaling (i.e. from fitting to the window size to fixed size)
            // 		- a change in whether or not score functions are displayed.
            if (this.changeDetectionService.detectChanges(this.valueChart, this.viewConfig, this.interactionConfig, this.reducedInformation, this.renderRequired.value)) {
                this.renderRequired.value = false;
                this.valueChartSubject.next({ valueChart: this.valueChart, usersToDisplay: this.usersToDisplay, structuralUpdate: false });
            }
            // Detect changes to the ValueChart that require resizing the base element of the visualization.
            //		- a change to the input width or height.
            //		- a change in alternative scaling.
            if (this.changeDetectionService.detectWidthHeightChanges(this.width, this.height, this.viewConfig)) {
                this.el.attr('viewBox', '0 -10' + ' ' + this.width + ' ' + this.height);
                this.calculateDefaultComponentSize();
                this.setViewportSize();
                this.valueChartSubject.next({ valueChart: this.valueChart, usersToDisplay: this.usersToDisplay });
                this.interactionSubject.next(this.interactionConfig);
            }
            // Detect changes to the viewConfig object.
            if (this.changeDetectionService.detectViewConfigChanges(this.viewConfig))
                this.viewConfigSubject.next(this.viewConfig);
            // Detect changes to the interactionConfig object.
            if (this.changeDetectionService.detectInteractionConfigChanges(this.interactionConfig))
                this.interactionSubject.next(this.interactionConfig);
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", model_1.ValueChart)
    ], ValueChartDirective.prototype, "valueChart", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], ValueChartDirective.prototype, "usersToDisplay", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], ValueChartDirective.prototype, "width", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], ValueChartDirective.prototype, "height", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ValueChartDirective.prototype, "viewConfig", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ValueChartDirective.prototype, "interactionConfig", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ValueChartDirective.prototype, "reducedInformation", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_3.EventEmitter)
    ], ValueChartDirective.prototype, "chartElement", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_3.EventEmitter)
    ], ValueChartDirective.prototype, "undoRedo", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_3.EventEmitter)
    ], ValueChartDirective.prototype, "renderEvents", void 0);
    ValueChartDirective = __decorate([
        core_1.Directive({
            selector: 'ValueChart',
            providers: [
                // Services:
                services_1.ChangeDetectionService,
                services_1.RenderEventsService,
                services_1.ChartUndoRedoService,
                services_1.RendererService,
                // Utilities:
                utilities_1.RendererScoreFunctionUtility,
                utilities_1.RendererDataUtility,
                utilities_1.RendererConfigUtility,
                // Renderers:
                renderers_1.ObjectiveChartRenderer,
                renderers_1.SummaryChartRenderer,
                renderers_1.LabelRenderer,
                // Interactions:
                interactions_1.ReorderObjectivesInteraction,
                interactions_1.ResizeWeightsInteraction,
                interactions_1.SortAlternativesInteraction,
                interactions_1.SetObjectiveColorsInteraction,
                interactions_1.ExpandScoreFunctionInteraction,
            ]
        }),
        __metadata("design:paramtypes", [core_2.ElementRef,
            services_1.RenderEventsService,
            services_1.ChartUndoRedoService,
            services_1.RendererService,
            services_1.ChangeDetectionService,
            renderers_1.ObjectiveChartRenderer,
            renderers_1.SummaryChartRenderer,
            renderers_1.LabelRenderer,
            utilities_1.RendererDataUtility,
            utilities_1.RendererConfigUtility])
    ], ValueChartDirective);
    return ValueChartDirective;
})();
exports.ValueChartDirective = ValueChartDirective;
//# sourceMappingURL=ValueChart.directive.js.map