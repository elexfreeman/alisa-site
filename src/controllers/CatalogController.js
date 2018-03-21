export default class CatalogController  {
    constructor($scope, $http) {
        this.name = 'World';
        console.log('CatalogController');

        $scope.name = 'asdasdadasd';


        $http.get("welcome.htm")
            .then(function(response) {
                console.log(response);
            });

    }

    changeName() {
        this.name = 'angular-tips';
    }
}