
window.JourneysController = {};

JourneysController.getJourneys = function (call) {
    return call(JSON.stringify(journeys), {status: 200, message: 'ok'})
};

JourneysController.getJourneyByMCId = function (id, call) {
    return call(JSON.stringify(journey), {status: 200, message: id})
};

var journeys = [{"id":"2aea045f-7789-48c4-b108-b239ae22c2f8","name":"HCPs Demo Journey","description":"HCPs Demo Journey","version":1,"createdDate":"2016-11-23","modifiedDate":"2016-11-23","eventDefinitionId":"1a2d7de0-8bec-40d5-a7af-453d09f8b465","dataExtensionId":"32cfbd6f-1fb6-e611-80cc-1402ec721edd","status":"Draft","sfId":"a030Y0000017oX0QAI","activities":[]},{"id":"51521fdf-da7c-4bce-9881-0b356b1ee16e","name":"New Products","description":"Here is description for New Products Jourbey","version":1,"createdDate":"2016-12-05","modifiedDate":"2016-12-05","eventDefinitionId":"5ec119d8-9733-4754-8cfb-b9d7ba36a602","dataExtensionId":"b7dfb478-d1b6-e611-80cc-1402ec721edd","status":"Draft","sfId":"a030Y00000182oXQAQ","activities":[]}];
var journey = {"id":"51521fdf-da7c-4bce-9881-0b356b1ee16e","name":"January Pharma Conference","description":"Visual illustration of interaction across customer lifecycle to engage customers at their moments of influence with product-related cross-channel communication workflows","version":1,"createdDate":"2016-12-05T06:20:42.69","modifiedDate":"2016-12-06T03:56:38.25","eventDefinitionId":"5ec119d8-9733-4754-8cfb-b9d7ba36a602","status":"Draft","sfId":"a030Y00000182oXQAQ","entryPointName":"NewProducts","trigger":{"id":"8b566f84-2b0d-4973-8e77-a6c1892c487f","name":"NewProducts","description":"","first-activity":"EMAILV2-1"},"activities":[{"id":"4f09740d-ee3a-4351-9a23-6be53dd569f2","key":"EMAILV2-1","name":"Contact Email","type":"EMAILV2","description":"","emailId":"88","outcomes":[{"key":"3b3d33c2-fc73-4371-bca2-888ae7939c8e","next":"WAIT-1","when":false}],"criterias":[]},{"id":"71138d5d-5e2c-4122-a084-57cf459d2e45","key":"WAIT-1","name":"","type":"WAIT","description":"","waitDuration":"5","waitUnit":"WEEKS","outcomes":[{"key":"6b7db6a9-b4a9-42af-862d-53355dae5540","next":"EXIT-1","when":false}],"criterias":[]},{"key":"EXIT-1","name":"Exit","type":"EXIT","outcomes":[],"criterias":[]}]};
