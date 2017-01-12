(function () {
    'use strict';

    angular.module('journeys.components')
        .component('graph', {
            templateUrl: 'graph.html',
            controller: graphCtrl,
            bindings: {
                journey: '<'
            }
        });

    graphCtrl.$inject = ['$state', '$scope'];

    function graphCtrl($state, $scope) {
        var ctrl = this;

        ctrl.$state = $state;
        ctrl.$onInit = $onInit;


        $scope.$watch(function () {
            return ctrl.journey;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                successFetchJourney(newVal);
            }
        });

        function $onInit() {
            ctrl.htmlContainer = document.getElementById('graphContainer');
            ctrl.filterId = 'dropShadow';
            ctrl.blockStyle = {
                'start': 'ims_start',
                'end': 'ims_end',
                'condition': 'ims_condition',
                'email': 'ims_mail',
                'rest': 'ims_rest',
                'wait': 'ims_wait'
            };
            ctrl.customJourneyId = 'ef07e90b-1759-4967-9db2-52168c604600';

            // Rewrite mxGraph core methods
            rewriteCore();
        }

        function successFetchJourney(data) {
            ctrl.data = data;
            ctrl.useLayout = true;

            if (data.id) {

                // Hardcoded id
                if (data.id === ctrl.customJourneyId) {
                    ctrl.useLayout = false;
                    ctrl.useCustomCoordinates = true;
                }

                graph();
                addFilter();
            }
        }

        function getCoordinates() {
            if (ctrl.htmlContainer && ctrl.htmlContainer.offsetParent && ctrl.htmlContainer.offsetParent.offsetWidth > 1200) {
                return deviceCoordinates.desktop;
            } else {
                return deviceCoordinates.ipad;
            }
        }

        function graph() {
            var parent,
                graph,
                layout,
                lineStyle,
                data = ctrl.data,
                coordinates = getCoordinates();

            // Checks if the browser is supported
            if (!mxClient.isBrowserSupported()) {
                // Displays an error message if the browser is not supported.
                mxUtils.error('Browser is not supported!', 200, false);
                return false;
            }

            graph = new mxGraph(ctrl.htmlContainer);
            layout = new mxHierarchicalLayout(graph);
            lineStyle = [
                'edgeStyle=orthogonalEdgeStyle',
                'verticalAlign=bottomRight',
                'targetPerimeterSpacing=7',
                'labelBackgroundColor=white',
                'fontColor=#555',
                'fontSize=11',
                'strokeColor=#555',
                'rounded=true'
            ].join(';');

            // Configure layout
            layout.edgeStyle = 4;
            layout.intraCellSpacing = 70;
            layout.interRankCellSpacing = 48;

            // Configure graph
            graph.maximumGraphBounds = new mxRectangle(0, 0, 1200, 1200);

            // Resizes the container but never make it bigger than the background
            graph.minimumContainerSize = new mxRectangle(0, 0, 100, 100);
            graph.setResizeContainer(true);
            graph.setEnabled(false);
            configureStylesheet(graph);

            // Add onClick listener for graph
            addGraphOnClickListener(ctrl, graph);

            // Add onChange listener for graph
            addGraphOnChangeListener(graph);

            parent = graph.getDefaultParent();

            // Adds cells to the model in a single step
            graph.getModel().beginUpdate();

            try {
                var edges = [],
                    // Create first element
                    startActivity = {
                        type: 'TRIGGER_START',
                        key: 'TRIGGER_START',
                        description: data.trigger.name,
                        outcomes: [
                            {
                                next: data.trigger['first-activity'],
                                label: ''
                            }
                        ]
                    },
                    activities = data.activities && data.activities.length ? data.activities : null;

                if (activities) {
                    // Add first element to activities
                    activities.unshift(startActivity);

                    _.forEach(activities, function (activity) {
                        var x = 0,
                            y = 0,
                            vertex = null;

                        if (ctrl.useCustomCoordinates) {
                            x = coordinates[activity.key].x;
                            y = coordinates[activity.key].y;
                        }

                        switch (activity.type) {
                            case 'EMAIL': // Deprecated
                            case 'EMAILV2':
                            case 'DATAEXTENSIONUPDATE':
                                vertex = graph.insertVertex(
                                    parent,
                                    activity.key,
                                    activity.name,
                                    x, y, 250, 50,
                                    ctrl.blockStyle.email
                                );
                                break;
                            case 'REST':
                                vertex = graph.insertVertex(
                                    parent,
                                    activity.key,
                                    activity.name ? activity.name : 'Send Notification',
                                    x, y, 250, 50,
                                    ctrl.blockStyle.rest
                                );
                                break;
                            case 'WAIT':
                                vertex = graph.insertVertex(
                                    parent, activity.key,
                                    getDurationLabel(activity.waitUnit, activity.waitDuration),
                                    x, y, 250, 50,
                                    ctrl.blockStyle.wait
                                );
                                break;
                            case 'MULTICRITERIADECISION': // Deprecated
                            case 'ENGAGEMENTSPLIT': // Deprecated
                            case 'ENGAGEMENTDECISION':
                            case 'MULTYCRITERIADECISION':
                                vertex = graph.insertVertex(
                                    parent,
                                    activity.key,
                                    activity.name,
                                    x, y, 150, 150,
                                    ctrl.blockStyle.condition
                                );
                                break;
                            case 'TRIGGER_START':
                                vertex = graph.insertVertex(
                                    parent,
                                    activity.key,
                                    'Start',
                                    x, y, 100, 60,
                                    ctrl.blockStyle.start
                                );
                                break;
                            case 'EXIT':
                                vertex = graph.insertVertex(
                                    parent,
                                    activity.key,
                                    'END',
                                    x, y, 80, 70,
                                    ctrl.blockStyle.end
                                );
                                break;
                            default:
                        }

                        // Add email id to vertex
                        if (activity.emailId) {
                            vertex.emailId = activity.emailId;
                        }

                        updateCellSize(vertex, graph);

                        // Add formatted edges
                        if (activity.outcomes && activity.outcomes.length) {
                            _.forEach(activity.outcomes, function (outcome) {
                                var label = outcome.label;

                                if (vertex.style === ctrl.blockStyle.condition) {
                                    if (outcome.label) {
                                        label = outcome.label;
                                    } else {
                                        label = outcome.when ? 'Yes' : 'No';
                                    }
                                }

                                edges.push({
                                    source: graph.getModel().getCell(activity.key),
                                    target: outcome.next,
                                    label: label
                                });
                            }, this);
                        }
                    }, this);

                    insertEdges(edges, parent, graph, lineStyle);
                }

                if (ctrl.useLayout) {
                    layout.execute(parent);
                }
            } finally {
                // Updates the display
                graph.getModel().endUpdate();
            }
        }

        function getDurationLabel(unit, duration) {
            var label = '';
            var unitLabel = {
                'MINUTES': 'minute',
                'HOURS': 'hour',
                'DAYS': 'day',
                'WEEKS': 'week',
                'MONTHS': 'month'
            };

            if (unitLabel[unit] && duration) {
                if (duration > 1) {
                    unitLabel[unit] += 's';
                }

                label = ['Duration', duration, unitLabel[unit]].join(' ');
            }

            return label;
        }

        function addGraphOnClickListener(scope, graph) {
            graph.addListener(mxEvent.CLICK, function (sender, eventObject) {
                if (eventObject && eventObject.properties) {
                    if (eventObject.properties.cell && eventObject.properties.cell.style === scope.blockStyle.email) {
                        var emailId = eventObject.properties.cell.emailId,
                            mobileClickCounter = 0;

                        if (emailId) {
                            scope.$state.go('journeys.item.email', {
                                'email_id': emailId
                            });
                        }
                    }
                }
            });
        }

        function addGraphOnChangeListener(graph) {
            graph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
                if (graph.getSelectionCell()) {
                    var result = [],
                        vertices = graph.getChildVertices(graph.getDefaultParent());

                    vertices.forEach(function (item) {
                        result.push(["'", item.id, "'", ': ', '{', 'x: ', item.getGeometry().x, ', ', 'y: ', item.getGeometry().y, '}'].join(''));
                    });

                    // console.log(result.join(',\n'));
                }
            });
        }

        function configureStylesheet(graph) {
            var defaultFontSize = 15;
            var defaultOverflow = 'hidden';
            var style = [];

            // Set default values
            mxConstants.DEFAULT_FONTFAMILY = '';
            mxConstants.SHADOWCOLOR = '#333';
            mxConstants.SHADOW_OPACITY = 0.2;
            mxConstants.SHADOW_OFFSET_X = 10;
            mxConstants.SHADOW_OFFSET_Y = 10;

            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
            style[mxConstants.STYLE_FONTSIZE] = 26;
            style[mxConstants.STYLE_FONTSTYLE] = '0';
            style[mxConstants.STYLE_SPACING] = '0';
            style[mxConstants.STYLE_STROKECOLOR] = 'none';
            style[mxConstants.STYLE_FILLCOLOR] = 'none';
            style[mxConstants.STYLE_FONTCOLOR] = '#297dfd';
            style[mxConstants.STYLE_OVERFLOW] = defaultOverflow;
            graph.getStylesheet().putCellStyle(ctrl.blockStyle.start, style);

            style = [];
            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
            style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
            style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
            style[mxConstants.STYLE_SPACING_LEFT] = 70;
            style[mxConstants.STYLE_SPACING_RIGHT] = 15;
            style[mxConstants.STYLE_STROKECOLOR] = '#25b4ff';
            style[mxConstants.STYLE_FILLCOLOR] = '#25b4ff';
            style[mxConstants.STYLE_FONTCOLOR] = '#fff';
            style[mxConstants.STYLE_FONTSIZE] = defaultFontSize;
            style[mxConstants.STYLE_FONTSTYLE] = '0';
            style[mxConstants.STYLE_IMAGE] = window.mxClient_Path + 'mxClient/images/Email.png';
            style[mxConstants.STYLE_IMAGE_WIDTH] = '30';
            style[mxConstants.STYLE_IMAGE_HEIGHT] = '30';
            style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_LEFT;
            style[mxConstants.STYLE_SPACING] = 15;
            style[mxConstants.STYLE_SHADOW] = 1;
            style[mxConstants.STYLE_OVERFLOW] = defaultOverflow;
            graph.getStylesheet().putCellStyle(ctrl.blockStyle.email, style);

            style = mxUtils.clone(style);
            graph.getStylesheet().putCellStyle(ctrl.blockStyle.rest, style);

            style = mxUtils.clone(style);
            style[mxConstants.STYLE_STROKECOLOR] = '#718b96';
            style[mxConstants.STYLE_FILLCOLOR] = '#718b96';
            style[mxConstants.STYLE_FONTCOLOR] = '#fff';
            style[mxConstants.STYLE_IMAGE] = window.mxClient_Path + 'mxClient/images/Wait.png';
            style[mxConstants.STYLE_SHADOW] = 1;
            style[mxConstants.STYLE_OVERFLOW] = defaultOverflow;
            graph.getStylesheet().putCellStyle(ctrl.blockStyle.wait, style);

            style = [];
            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
            style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
            style[mxConstants.STYLE_FONTCOLOR] = '#fff';
            style[mxConstants.STYLE_STROKECOLOR] = '#718b96';
            style[mxConstants.STYLE_FILLCOLOR] = '#718b96';
            style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
            style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
            style[mxConstants.STYLE_FONTSIZE] = defaultFontSize;
            style[mxConstants.STYLE_SHADOW] = 1;
            style[mxConstants.STYLE_OVERFLOW] = defaultOverflow;
            graph.getStylesheet().putCellStyle(ctrl.blockStyle.condition, style);

            style = [];
            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_HEXAGON;
            style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
            style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
            style[mxConstants.STYLE_FONTSIZE] = defaultFontSize;
            style[mxConstants.STYLE_STROKECOLOR] = '#f75040';
            style[mxConstants.STYLE_FILLCOLOR] = '#f75040';
            style[mxConstants.STYLE_FONTCOLOR] = '#fff';
            style[mxConstants.STYLE_FONTSTYLE] = '0';
            style[mxConstants.STYLE_SHADOW] = 1;
            style[mxConstants.STYLE_OVERFLOW] = defaultOverflow;
            graph.getStylesheet().putCellStyle(ctrl.blockStyle.end, style);
        }


        function rewriteCore() {
            // Rewrite createShadow
            mxSvgCanvas2D.prototype.createShadow = function (node) {
                var shadow = node.cloneNode(true),
                    s = this.state;

                // Firefox uses transparent for no fill in ellipses
                if (shadow.getAttribute('fill') !== 'none' && (!mxClient.IS_FF || shadow.getAttribute('fill') !== 'transparent')) {
                    shadow.setAttribute('fill', s.shadowColor);
                }

                if (shadow.getAttribute('stroke') !== 'none') {
                    shadow.setAttribute('stroke', s.shadowColor);
                }

                shadow.setAttribute('transform', 'translate(' + this.format(s.shadowDx * s.scale) + ',' + this.format(s.shadowDy * s.scale) + ')' + (s.transform || ''));
                shadow.setAttribute('opacity', s.shadowAlpha);
                shadow.setAttribute('filter', 'url(#dropShadow)');

                return shadow;
            };
        }

        function addFilter() {
            var svg = ctrl.htmlContainer.getElementsByTagName('svg');

            if (svg && svg.length > 0) {
                svg[svg.length - 1].insertAdjacentHTML('afterbegin', [
                    '<filter id="', ctrl.filterId, '">',
                    '<feGaussianBlur in="SourceGraphic" stdDeviation="6" />',
                    '</filter>'
                ].join(''));
            }

        }

        function updateCellSize(vertex, graph) {
            var geometry;
            var minWidthRhoumbus = 150;
            var minWidthHexagon = 80;

            if (vertex) {
                graph.updateCellSize(vertex);

                // Fix geomerty for Rhombus after apply update cell size
                geometry = vertex.getGeometry();

                switch (vertex.style) {
                    case ctrl.blockStyle.condition:
                        geometry.width = geometry.width < minWidthRhoumbus
                            ? minWidthRhoumbus : geometry.width + 20;

                        geometry.height = geometry.width;
                        break;
                    case ctrl.blockStyle.end:
                        geometry.width = geometry.width < minWidthHexagon
                            ? minWidthHexagon : geometry.width;

                        geometry.height = geometry.width - geometry.width * 0.13;
                        break;
                    case ctrl.blockStyle.wait:
                    case ctrl.blockStyle.email:
                    case ctrl.blockStyle.rest:
                        geometry.width = 250;
                        geometry.height = 70;
                        break;
                    default:
                }

                vertex.setGeometry(geometry);
            }
        }

        function getNearExit(source) {
            var minDistance = null,
                nearExit = null;

            _.forEach(getExitCoordinates(), function (item, key) {
                var diffX,
                    diffY,
                    result;

                // Calculate distance between 2 points
                diffX = Math.abs(item.x - source.getGeometry().x);
                diffY = Math.abs(item.y - source.getGeometry().y);
                result = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));

                if (minDistance === null) {
                    minDistance = result;
                    nearExit = key;
                } else if (result < minDistance) {
                    minDistance = result;
                    nearExit = key;
                }
            });

            return nearExit;
        }

        function getExitCoordinates() {
            var exitBlocks = {};

            _.forEach(getCoordinates(), function (item, key) {
                if (key.indexOf('EXIT') > -1) {
                    exitBlocks[key] = item;
                }
            });

            return exitBlocks;
        }

        function insertEdges(edges, parent, graph, lineStyle) {
            if (edges && edges.length && parent) {
                _.forEach(edges, function (edge) {
                    edge.target = graph.getModel().getCell(edge.target);

                    // Rewrite edge for EXIT block
                    if (ctrl.useCustomCoordinates && edge.target.id.indexOf('EXIT') > -1) {

                        var nearExit = getNearExit(edge.source);

                        if (nearExit) {
                            edge.target = graph.getModel().getCell(nearExit);
                        }
                    }

                    graph.insertEdge(parent, null, edge.label, edge.source, edge.target, lineStyle);
                }, ctrl);
            }
        }
    }

    var deviceCoordinates = {
        'ipad': {
            'TRIGGER_START': {x: 105, y: 0},
            'EMAILV2-1': {x: 10, y: 90},
            'WAIT-4': {x: 0.30208333333337123, y: 480},
            'REST-2': {x: 10.065958023071289, y: 870},
            'ENGAGEMENTDECISION-1': {x: 340, y: 120},
            'WAIT-8': {x: 560.328125, y: 700},
            'EMAILV2-5': {x: 10, y: 760},
            'WAIT-3': {x: 560, y: 200},
            'EMAILV2-2': {x: 560, y: 90},
            'WAIT-7': {x: 300, y: 940},
            'WAIT-9': {x: 10, y: 990},
            'REST-1': {x: 560, y: 590},
            'ENGAGEMENTDECISION-3': {x: 340.30208333333337, y: 710},
            'ENGAGEMENTDECISION-2': {x: 340.3020833333333, y: 480},
            'WAIT-1': {x: 10, y: 200},
            'WAIT-2': {x: 300, y: 370},
            'EMAILV2-4': {x: 560.3020833333334, y: 480},
            'EMAILV2-3': {x: 0, y: 370},
            'EXIT-3': {x: 645, y: 820.2},
            'EXIT-2': {x: 645, y: 310},
            'EXIT-1': {x: 385, y: 1060.4},
            'EXIT-4': {x: 95, y: 1110}
        },
        'desktop': {
            'TRIGGER_START': {x: 105, y: 0},
            'EMAILV2-1': {x: 10, y: 90},
            'WAIT-4': {x: 0.30208333333337123, y: 480},
            'REST-2': {x: 10.065958023071289, y: 870},
            'ENGAGEMENTDECISION-1': {x: 340, y: 120},
            'WAIT-8': {x: 560.328125, y: 700},
            'EMAILV2-5': {x: 10, y: 760},
            'WAIT-3': {x: 560, y: 200},
            'EMAILV2-2': {x: 560, y: 90},
            'WAIT-7': {x: 300, y: 940},
            'WAIT-9': {x: 10, y: 990},
            'REST-1': {x: 560, y: 590},
            'ENGAGEMENTDECISION-3': {x: 340.30208333333337, y: 710},
            'ENGAGEMENTDECISION-2': {x: 340.3020833333333, y: 480},
            'WAIT-1': {x: 10, y: 200},
            'WAIT-2': {x: 300, y: 370},
            'EMAILV2-4': {x: 560.3020833333334, y: 480},
            'EMAILV2-3': {x: 0, y: 370},
            'EXIT-3': {x: 645, y: 820.2},
            'EXIT-2': {x: 645, y: 310},
            'EXIT-1': {x: 385, y: 1060.4},
            'EXIT-4': {x: 95, y: 1110}
        }
    }

})();