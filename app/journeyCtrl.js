(function () {
    'use strict';

    angular
        .module('journeys')
        .controller('journeyCtrl', journeyCtrl);

    journeyCtrl.$inject = ['$state', 'journeysService'];

    function journeyCtrl($state, journeysService) {
        var vm = this;

        vm.id = $state.params.id;
        vm.journeyMembers = false;
        vm.journey = {
            sfId: null,
            showDescription: false
        };

        init();

        function init () {
            journeysService.fetchJourney(vm.id)
                .then(function (result) {
                    vm.journey = result;

                    if (vm.journey.sfId) {
                        fetchJourneysMembers(vm.journey.sfId);
                    } else {
                        vm.journeyMembers = {};
                    }

                    vm.journey.showDescription = true;
                })
        }

        function fetchJourneysMembers (id) {
            journeysService.fetchJourneysMembers(id)
                .then(function (data) {
                    vm.journeyMembers = data;
                });
        }
    }
})();