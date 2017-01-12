(function () {
    'use strict';

    var members = '[ {  "title" : "Physician",  "sfId" : "a040Y000001BnojQAC",  "referenceId" : "0030Y000008MirjQAC",  "mcJourneyId" : "51521fdf-da7c-4bce-9881-0b356b1ee16e",  "lastName" : "Cummings",  "firstName" : "Alexys",  "email" : "joshuah.jacobs@hotmail.com",  "dataExtensionId" : "b7dfb478-d1b6-e611-80cc-1402ec721edd",  "accountName" : "Western State Hospital"}, {  "title" : "Nurse",  "sfId" : "a040Y000001BnoUQAS",  "referenceId" : "0030Y000008MitAQAS",  "mcJourneyId" : "51521fdf-da7c-4bce-9881-0b356b1ee16e",  "lastName" : "Kuhlman",  "firstName" : "Al",  "email" : "philip.sipes@yahoo.com",  "dataExtensionId" : "b7dfb478-d1b6-e611-80cc-1402ec721edd",  "accountName" : "Northstar Hospital"}, {  "title" : "Nurse",  "sfId" : "a040Y000001BnLXQA0",  "referenceId" : "0030Y000008MixNQAS",  "mcJourneyId" : "51521fdf-da7c-4bce-9881-0b356b1ee16e",  "lastName" : "Langosh",  "firstName" : "Samson",  "email" : "efrain.ebert@gmail.com",  "dataExtensionId" : "b7dfb478-d1b6-e611-80cc-1402ec721edd",  "accountName" : "Hospital for Special Care"}, {  "title" : "Physician",  "sfId" : "a040Y000001BnokQAC",  "referenceId" : "0030Y000008Miw5QAC",  "mcJourneyId" : "51521fdf-da7c-4bce-9881-0b356b1ee16e",  "lastName" : "MacGyver",  "firstName" : "Alison",  "email" : "ibrahim.heathcote@gmail.com",  "dataExtensionId" : "b7dfb478-d1b6-e611-80cc-1402ec721edd",  "accountName" : "Albany Medical Center"}, {  "title" : "Physician",  "sfId" : "a040Y000001Bno5QAC",  "referenceId" : "0030Y000008MmAQQA0",  "mcJourneyId" : "51521fdf-da7c-4bce-9881-0b356b1ee16e",  "lastName" : "Walles",  "firstName" : "Miranda",  "email" : "nwalles@stomax.com",  "dataExtensionId" : "b7dfb478-d1b6-e611-80cc-1402ec721edd",  "accountName" : null} ]';

    angular
        .module('journeys.repositories')
        .factory('journeysRepository', journeysRepository);

    journeysRepository.$inject = ['$q'];

    function journeysRepository ($q) {

        function fetchJourneys () {
            var deferred = $q.defer();

            JourneysController.getJourneys(
                function(result, event){
                    //Success
                    if (event.status) {
                        //result is JSON str that represents list of all journeys
                        deferred.resolve(JSON.parse(result));
                        //Error
                    } else {
                        //event.message contains error msg
                        deferred.reject(event.message);
                    }
                },
                {escape: false}
            );

            return deferred.promise;
        }

        function fetchJourney (journeyId) {
            var deferred = $q.defer();

            JourneysController.getJourneyByMCId(
                journeyId,
                function(result, event){

                    //Success
                    if (event.status) {
                        //result is JSON str that represents single journey
                        deferred.resolve(JSON.parse(result));

                        //Error
                    } else {
                        //event.message contains error msg
                        deferred.reject(event.message);
                    }
                },
                {escape: false}
            );

            return deferred.promise;
        }

        function fetchJourneysMembers () {
            return $q.resolve(JSON.parse(members))
        }

        return {
            fetchJourneys: fetchJourneys,
            fetchJourney: fetchJourney,
            fetchJourneysMembers: fetchJourneysMembers
        }
    }
})();