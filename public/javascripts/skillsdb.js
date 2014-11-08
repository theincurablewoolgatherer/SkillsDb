/**********************************************************************
 * Angular Application
 **********************************************************************/
var skillsdb = angular.module('skillsdb', ['ngResource', 'xeditable'])
    .config(function ($routeProvider, $locationProvider, $httpProvider) {
        //================================================
        // Check if the user is connected
        //================================================
        var checkLoggedin = function ($q, $timeout, $http, $location, $rootScope) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function (user) {

                if (user !== '0') {
                    // Authenticated
                    $timeout(deferred.resolve, 0);
                } else {
                    // Not Authenticated
                    $rootScope.message = 'You need to log in.';
                    $timeout(function () {
                        deferred.reject();
                    }, 0);
                    $location.url('/login');
                }
            });

            return deferred.promise;
        };
        //================================================

        //================================================
        // Add an interceptor for AJAX errors
        //================================================
        $httpProvider.responseInterceptors.push(function ($q, $location) {
            return function (promise) {
                return promise.then(
                    // Success: just return the response
                    function (response) {
                        return response;
                    },
                    // Error: check the error status to get only the 401
                    function (response) {
                        if (response.status === 401)
                            $location.url('/login');
                        return $q.reject(response);
                    }
                );
            }
        });
        //================================================

        //================================================
        // Define all the routes
        //================================================
        $routeProvider
        // .when('/', {
        //   templateUrl: '/partials/main'
        // })
        .when('/', {
            templateUrl: '/partials/profile',
            controller: 'ProfileCtrl',
            resolve: {
                loggedin: checkLoggedin
            }
        })
            .when('/profile', {
                templateUrl: '/partials/profile',
                controller: 'ProfileCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/login', {
                templateUrl: '/partials/login',
                controller: 'LoginCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
        //================================================

    }) // end of config()
    .run(function ($rootScope, $http, editableOptions) {
        $rootScope.message = '';
        editableOptions.theme = 'bs3';

        // Logout function is available in any pages
        $rootScope.logout = function () {
            $rootScope.message = 'Logged out.';
            $http.post('/logout');
        };
    }).directive('showProjectModal', function (){
        return {
            link: function (scope, element, attrs) {
                function showModal() {
                    var modalDomElement = angular.element('#projectModal');
                    var ctrl = element.controller();
                    
                    element.modal('show');
                }
                element.bind('click', showModal);
            }
        }
    });
/**********************************************************************
* Constants
**********************************************************************/
skillsdb.constant('FIELD_CONSTANTS', {
    "DEPARTMENTS": [
        {text: 'Advance Solutions Lab'},
        {text: 'Mobile Solutions Lab'}
    ],
    "RANKS": [
        {value: 0, rank: 'S3'},
        {value: 1, rank: 'S4'},
        {value: 2, rank: 'S5'},
        {value: 3, rank: 'S6'},
    ],
    "POSITIONS": [
        {value: 0, position: 'Engineer'},
        {value: 1, position: 'Lead Engineer'},
        {value: 2, position: 'Senior Engineer'},
        {value: 3, position: 'Principal Engineer'},
    ]
});

/**********************************************************************
* Login controller
**********************************************************************/
skillsdb.controller('LoginCtrl', function ($scope, $rootScope, $http, $location) {
    // This object will be filled by the form
    $scope.user = {};

    // Register the login() function
    $scope.login = function () {
        $http.post('/login', {
            username: $scope.user.username,
            password: $scope.user.password,
        })
            .success(function (user) {
                // No error: authentication OK
                $rootScope.message = 'Authentication successful!';
                $location.url('/profile');
            })
            .error(function () {
                // Error: authentication failed
                $rootScope.message = 'Authentication failed.';
                $location.url('/login');
            });
    };
});

/**********************************************************************
* Profile controller
**********************************************************************/
skillsdb.controller('ProfileCtrl', function($scope, $http, FIELD_CONSTANTS) {
    
  $scope.departments = FIELD_CONSTANTS.DEPARTMENTS;
  $scope.ranks = FIELD_CONSTANTS.RANKS;
  $scope.positions = FIELD_CONSTANTS.POSITIONS;
  $scope.rankId = 0;
  // Get currently logged User's info
  $http.get('/loggedin').success(function(user){
      $scope.user = user;
      
      if(!user.firstname){
        $scope.user.firstname = "Your";
      }
      if(!user.lastname){
        $scope.user.lastname = "Name";
      }
      if(!user.department){
        $scope.user.department = "department";
      }
      if(!user.rank){
        $scope.user.rank = "S#";
      }
      if(!user.position){
        $scope.user.position = "position";
      }
  });
    
  // Profile Save function
  $scope.save = function(){
    $http.put('/profile/'+$scope.user._id, $scope.user);
  };
  // Save Rank
  $scope.saveRank = function(){
    $scope.user.position = $scope.positions[$scope.rankId].position;
    $scope.user.rank = $scope.ranks[$scope.rankId].rank;
    $scope.save();
  };
});

skillsdb.directive('showonhoverparent',
   function() {
      return {
         link : function(scope, element, attrs) {
            element.parent().bind('mouseenter', function() {
                element.show();
            });
            element.parent().bind('mouseleave', function() {
                 element.hide();
            });
       }
   };
});