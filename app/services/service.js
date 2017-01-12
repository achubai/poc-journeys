(function () {
    'use strict';

    angular.module('journeys.services')
        .factory('journeysService', journeysService);

    journeysService.$inject = ['$q', 'journeysRepository', '$timeout'];

    function journeysService ($q, journeysRepository) {
        var journeysList = null;
        var journey = null;

        function fetchJourneys () {
            var deferred = $q.defer();

            journeysRepository.fetchJourneys()
                .then(function (result) {

                    journeysList = result;

                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error)
                });

            return deferred.promise;
        }

        function fetchJourney (id) {
            var deferred = $q.defer();

            journeysRepository.fetchJourney(id)
                .then(function (result) {

                    journey = result;
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error)
                });

            return deferred.promise;
        }

        function fetchJourneysMembers (id) {
            var deferred = $q.defer();

            journeysRepository.fetchJourneysMembers(id)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error)
                });

            return deferred.promise;
        }

        function getJourneys () {
            return journeysList;
        }

        function getJourney () {
            return journey;
        }

        return {
            fetchJourneys: fetchJourneys,
            fetchJourney: fetchJourney,
            getJourneys: getJourneys,
            getJourney: getJourney,
            fetchJourneysMembers: fetchJourneysMembers
        }
    }
})();