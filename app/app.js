(function () {
    'use strict';
    var app = angular.module('journeys', [
        'ui.router',
        'ui.bootstrap',
        'journeys.repositories',
        'journeys.services',
        'journeys.components'
    ]);

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('journeys', {
                url: '/journeys',
                template: '<ui-view></ui-view>',
                redirectTo: 'journeys.list'
            })
            .state('journeys.list', {
                url: '/',
                templateUrl: 'journeys.html',
                controller: 'journeysCtrl',
                controllerAs: 'vm'
            })
            .state('journeys.item', {
                url: '/view/:id',
                templateUrl: 'journey.html',
                controller: 'journeyCtrl',
                controllerAs: 'vm'
            })
            .state('journeys.item.email', {
                url: '/email/:email_id',
                onEnter: ['$state', '$stateParams', '$uibModal',
                    function ($state, $stateParams, $uibModal) {
                        $uibModal.open({
                            component: 'emailForm',
                            size: 'journey-email-template'
                        }).result.finally(function () {
                            $state.go('^');
                        })
                    }
                ]
            });

        $urlRouterProvider.otherwise('/journeys');

    }]);

    angular.module('journeys.repositories', []);
    angular.module('journeys.services', []);
    angular.module('journeys.components', []);
})();
