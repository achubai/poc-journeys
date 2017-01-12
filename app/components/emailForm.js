(function () {
    'use strict';

    angular.module('journeys.components')
        .component('emailForm', {
            templateUrl: 'emailForm.html',
            controller: emailForm,
            bindings: {
                close: '&'
            }
        });

    function emailForm () {

    }
})();