/**********************************************************************
 * Angular Application
 **********************************************************************/
var skillsdb = angular.module('skillsdb', ['ngResource', 'xeditable', 'ui.bootstrap','ngTagsInput','ngToast'])
    .config(['ngToastProvider', function(ngToast) {
    ngToast.configure({
       horizontalPosition: 'center'
    });
  }]) // end of config()
    .run(function ($rootScope, $http, editableOptions, ngToast) {
        $rootScope.message = '';
        editableOptions.theme = 'bs3';
        // Logout function is available in any pages
        $rootScope.logout = function () {
            $rootScope.message = 'Logged out.';
            $http.post('/logout');
        };
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
    ],
    "SKILLS": [
        {value: 0, skill: 'Java'},
        {value: 1, skill: 'C++'},
        {value: 2, skill: 'C#'},
        {value: 3, skill: 'Android'},
        {value: 4, skill: 'MySQL'}
    ],
    "TECHNOLOGIES": [
        {value: 0, technology: 'Machine Learning'},
        {value: 1, technology: 'Data Warehousing'},
        {value: 2, technology: 'Web'},
        {value: 3, technology: 'Server Admin'}
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
                window.location.href = "/profile";
                //$http.get('/profile');
            })
            .error(function () {
                // Error: authentication failed
                $rootScope.message = 'Authentication failed.';
                $location.get('/login');
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


/**********************************************************************
* Projects controller
**********************************************************************/
skillsdb.controller('ProjectsCtrl', function ($scope, $modal, $log) {
    $scope.showProjectForm = function () {
    $scope.items = ['item1', 'item2', 'item3'];
    var modalInstance = $modal.open({
      templateUrl: 'partials/projectPopUp',
      controller: 'ProjectFormCtrl'
    });
  };
});


skillsdb.controller('ProjectFormCtrl', function ($http, $scope, $modalInstance, ngToast, tags) {
        
      $scope.project = {};
      
      $scope.loadSkills = function(query) {
         return tags.loadSkills(query);
      };
      $scope.loadTechnologies = function(query) {
         return tags.loadTechnologies(query);
      };
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
      $scope.saveProject = function() {
          $http.post('/project/', {
                projectname: $scope.project.projectname
            })
            .success(function () {
                console.log("PROJECT SAVED");
                var msg = ngToast.create({
                  content: 'Project Saved'
                });
               
                $modalInstance.dismiss('saved');
            })
            .error(function () {
                 console.log("PROJECT ERROR");
            });
      };
});

/**********************************************************************
* Custom Directives
**********************************************************************/
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
/**********************************************************************
* Custom Services
**********************************************************************/
skillsdb.service('tags', function($q, FIELD_CONSTANTS) {
  this.loadSkills = function(query) {
    // TODO: DUPLICATE MATCHING ALGORITHM
    // Create utility class that matches
    var deferred = $q.defer();
      var results = [];
      for (var i = 0; i < FIELD_CONSTANTS.SKILLS.length; i++) {
        if (FIELD_CONSTANTS.SKILLS[i].skill.indexOf(query) == 0) {
          results.push(FIELD_CONSTANTS.SKILLS[i]);
        }
      }
    deferred.resolve(results);
    return deferred.promise;
  };
    
  this.loadTechnologies = function(query) {
    // TODO: DUPLICATE MATCHING ALGORITHM
    // Create utility class that matches
    var deferred = $q.defer();
      var results = [];
      for (var i = 0; i < FIELD_CONSTANTS.TECHNOLOGIES.length; i++) {
        if (FIELD_CONSTANTS.TECHNOLOGIES[i].technology.indexOf(query) == 0) {
          results.push(FIELD_CONSTANTS.TECHNOLOGIES[i]);
        }
      }
    deferred.resolve(results);
    return deferred.promise;
  };
    
});



