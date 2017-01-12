(function () {
    'use strict';

    angular
        .module('journeys')
        .controller('journeysCtrl', journeysCtrl);

    journeysCtrl.$inject = ['journeysService'];

    function journeysCtrl (journeysService) {
        var vm = this;
        vm.showSpinner = true;
        vm.data1 = {
            'nodes': [{
                'name': 'Cardiologist'
            }, {
                'name': 'Decile = 1'
            }, {
                'name': 'Decile = 2'
            }, {
                'name': 'Decile = 3'
            }, {
                'name': 'Decile = 4'
            }, {
                'name': 'Decile = 5'
            }, {
                'name': 'Decile = 6'
            }, {
                'name': 'Decile = 7'
            }, {
                'name': 'Decile = 8'
            }, {
                'name': 'Decile = 9'
            }, {
                'name': 'Decile = 10'
            }],
            'links': [{
                'source': 0,
                'target': 1,
                'value': 5
            }, {
                'source': 0,
                'target': 2,
                'value': 8
            }, {
                'source': 0,
                'target': 3,
                'value': 14
            }, {
                'source': 0,
                'target': 4,
                'value': 15
            }, {
                'source': 0,
                'target': 5,
                'value': 29
            }, {
                'source': 0,
                'target': 6,
                'value': 36
            }, {
                'source': 0,
                'target': 7,
                'value': 44
            }, {
                'source': 0,
                'target': 8,
                'value': 25
            }, {
                'source': 0,
                'target': 9,
                'value': 14
            }, {
                'source': 0,
                'target': 10,
                'value': 3
            }]
        };

        vm.addedFilter = 0;
        vm.jDetailsObjInit = this.jDetailsObj = {
            active: getRandomInt(5, 30),
            complete: getRandomInt(25, 80),
            success: getRandomInt(35, 90),
            opened: getRandomInt(15, 80),
            unsubscribed: getRandomInt(5, 20),
            bounced: getRandomInt(5, 30)
        };

        vm.filters = {
            filter1: {
                key: 'journey-state',
                value: ''
            },
            filter2: {
                key: 'specialty',
                value: 'cardiologist'
            },
            filter3: {
                key: 'segmentation',
                value: 'Decile'
            },
            filter4: {
                key: 'age',
                value: ''
            },
            outcome1: {
                key: 'predicted',
                value: ''
            },
            outcome2: {
                key: 'predicted',
                value: ''
            }
        };

        vm.diagram = {};

        vm.journeys = function () {
            return journeysService.getJourneys()
        };

        init();
        
        function init () {
            journeysService.fetchJourneys()
                .finally(function () {
                    vm.showSpinner = false;
                })
        }

        function getRandomInt (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

})();