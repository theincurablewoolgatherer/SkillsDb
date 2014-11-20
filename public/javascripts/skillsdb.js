/**********************************************************************
 * Angular Application
 **********************************************************************/
var skillsdb = angular.module('skillsdb', ['ngResource', 'xeditable', 'ui.bootstrap', 'ngTagsInput', 'ngAnimate', 'ngToast'])
  .config(['ngToastProvider', function(ngToast) {
    ngToast.configure({
      horizontalPosition: 'center'
    });
  }])
  .run(function($rootScope, $http, editableOptions, ngToast) {
    $rootScope.message = '';
    editableOptions.theme = 'bs3';

    // Logout function is available in any pages
    $rootScope.logout = function() {
      $rootScope.message = 'Logged out.';
      $http.post('/logout');
    };   
  });
/**********************************************************************
 * Constants
 **********************************************************************/
  skillsdb.constant('FIELD_CONSTANTS', {
  "DEPARTMENTS": [{
      text: 'Advance Solutions Lab'
    }, {
      text: 'Mobile Solutions Lab'
    }],
  "RANKS": [{
      value: 0,
      rank: 'S3'
    }, {
      value: 1,
      rank: 'S4'
    }, {
      value: 2,
      rank: 'S5'
    }, {
      value: 3,
      rank: 'S6'
    }, ],
  "POSITIONS": [{
      value: 0,
      position: 'Engineer'
    }, {
      value: 1,
      position: 'Lead Engineer'
    }, {
      value: 2,
      position: 'Senior Engineer'
    }, {
      value: 3,
      position: 'Principal Engineer'
    }, ],
  "SKILLS": [{
      value: 0,
      skill: 'Java'
    }, {
      value: 1,
      skill: 'C++'
    }, {
      value: 2,
      skill: 'C#'
    }, {
      value: 3,
      skill: 'Android'
    }, {
      value: 4,
      skill: 'MySQL'
    }],
  "TECHNOLOGIES": [{
      value: 0,
      technology: 'Machine Learning'
    }, {
      value: 1,
      technology: 'Data Warehousing'
    }, {
      value: 2,
      technology: 'Web'
    }, {
      value: 3,
      technology: 'Server Admin'
    }]
  });

/**********************************************************************
 * Login controller
 **********************************************************************/
  skillsdb.controller('LoginCtrl', function($scope, $rootScope, $http, $location) {
    // $scope.user is binded to the login form template: login.jade
    $scope.user = {};

    // $scope.isLoginValid is used in the login form as a boolean flag to either show/hide a login error message
    $scope.isLoginValid = true;

    // Holds the appropriate error message to show
    $scope.err = '';

    // This function is called when the login button was pressed
    $scope.login = function() {
        if (!$scope.user.username || !$scope.user.password) {
          // Username / Password was left blank by the user
          $scope.isLoginValid = false;
          $scope.err = "Username/Password required!";
          return;
        }

        // Attempt to authenticate the user
        $http.post('/login', {
          username: $scope.user.username,
          password: $scope.user.password,
        })
        .success(function(user) {
                  // No error: authentication OK
                  $scope.isLoginValid = true;
                  $rootScope.message = 'Authentication successful!';

                  // Change the URL to the profile page of the logged on user
                  window.location.href = "/profile";
                })
        .error(function() {
                  // Error: authentication failed
                  $scope.err = "Incorrect Username/Password";
                  $rootScope.message = 'Authentication failed.';
                  $scope.isLoginValid = false;
        });
    };
  });
/**********************************************************************
 * Profile controller
 **********************************************************************/
  skillsdb.controller('ProfileCtrl', function($scope, $rootScope, $http, FIELD_CONSTANTS, ngToast) {
    // Constants used in dropdown fields
    $scope.departments = FIELD_CONSTANTS.DEPARTMENTS;
    $scope.ranks = FIELD_CONSTANTS.RANKS;
    $scope.positions = FIELD_CONSTANTS.POSITIONS;

    // User object that represents the owner of the profile being viewed
    $scope.profileOwner = {};

    // User object that represents the currently logged on user that is viewing the profile page
    $scope.profileViewer = {};

    // Set to true if page_owner == page_viewer
    $scope.isViewingOwnProfile = false;

    // Contains the top skills of the page_owner
    $scope.topskills = [];

    $scope.rankId = 0;

    // Retrieve the details of the profile_viewer
    $http.get('/loggedin').success(function(profileViewer) {
      $scope.profileViewer = profileViewer;
    });

    // Initialize the details of the page_owner
    $scope.setOwner = function(profileOwnerUsername) {
      $http.get('/api/profile/'+profileOwnerUsername).success(function(response){
        $scope.isViewingOwnProfile = profileOwnerUsername == $scope.profileViewer.username;

        $scope.profileOwner = response.profile;
        if (!response.profile.firstname) {
          $scope.profileOwner.firstname = "Your";
        }
        if (!response.profile.lastname) {
          $scope.profileOwner.lastname = "Name";
        }
        if (!response.profile.department) {
          $scope.profileOwner.department = "department";
        }
        if (!response.profile.rank) {
          $scope.profileOwner.rank = "S#";
        }
        if (!response.profile.position) {
          $scope.profileOwner.position = "position";
        }
        $scope.loadTopSkills($scope.profileOwner);
      });
    };

    // Retrieves the details of the pageOwner using the username stored in "profileOwnerUsername" from the ng-init 
    // which came from Express' controller method
    $scope.$watch('profileOwnerUsername', function () {
        $scope.setOwner($scope.profileOwnerUsername);
    });

    // Profile Save function
    $scope.save = function() {
      // Do nothing if the pageOwner is not the pageViewer
      if(!$scope.isViewingOwnProfile){
        return;
      }

      $http.put('/api/profile', $scope.profileOwner).success(function(profileOwner) {
        var msg = ngToast.create({
          content: 'Your profile info has been saved'
        });
      });
    };

    // Save Rank
    $scope.saveRank = function() {
      // Do nothing if the pageOwner is not the pageViewer
      if(!$scope.isViewingOwnProfile){
        return;
      }

      $scope.profileOwner.position = $scope.positions[$scope.rankId].position;
      $scope.profileOwner.rank = $scope.ranks[$scope.rankId].rank;
      $scope.save();
    };

    // Get top skills
    $scope.loadTopSkills = function(profileOwner) {
      $http.get('/api/profile/skills/of/' + profileOwner.username)
        .success(function(skills) {
          $scope.topskills = skills
        })
        .error(function(err) {
          console.log("error loading skills");
        });
    };

    // This listens for the broadcast "reloadTopSkills" emitted by other controllers.
    $rootScope.$on("reloadTopSkills", function(event, args) {
      $scope.loadTopSkills($scope.profileOwner);
    });
  });


/**********************************************************************
 * Projects controller
 **********************************************************************/
skillsdb.controller('ProjectsCtrl', function($rootScope, $scope, $modal, $log, $http) {
  // User object that represents the owner of the profile being viewed
  $scope.profileOwner = {};

  // User object that represents the currently logged on user that is viewing the profile page
  $scope.profileViewer = {};

  // Set to true if page_owner == page_viewer
  $scope.isViewingOwnProfile = false;

  // List of projects of the profileOwner
  $scope.projects = [];
  
  // Retrieve the details of the profile_viewer
  $http.get('/loggedin')
    .success(function(profileViewer) {
      $scope.profileViewer = profileViewer;
    })
    .error(function(err) {
      console.log("Error loading profileViewer");
    });

  // Retrieves the details of the pageOwner using the username stored in "profileOwnerUsername" from the ng-init 
  // which came from Express' controller method
  $scope.$watch('profileOwnerUsername', function () {
      $http.get('/api/profile/'+$scope.profileOwnerUsername)
        .success(function(response){
          $scope.isViewingOwnProfile = $scope.profileOwnerUsername == $scope.profileViewer.username;
          $scope.profileOwner = response.profile;
          $scope.loadProjects();
        })
        .error(function(err) {
          console.log("Error loading profileOwner");
        });
  });

  $scope.showProjectForm = function() {
    var modalInstance = $modal.open({
      templateUrl: 'partials/projectPopUp',
      controller: 'ProjectFormCtrl',
      windowClass: 'project-modal',
      resolve: {
        project: function() {
          return {};
        }
      }
    });
  };


  $scope.deleteProject = function(project) {
    // Do nothing if the pageOwner is not the pageViewer
    if(!$scope.isViewingOwnProfile){
      return;
    }

    var modalInstance = $modal.open({
      templateUrl: 'partials/confirmationPopup',
      controller: 'ProjectDeleteCtrl',
      windowClass: 'modal',
      size: 'sm',
      resolve: {
        project: function() {
          return project;
        }
      }
    });
  };

  $scope.editProject = function(project) {
    // Do nothing if the pageOwner is not the pageViewer
    if(!$scope.isViewingOwnProfile){
      return;
    }

    var modalInstance = $modal.open({
      templateUrl: 'partials/projectPopUp',
      controller: 'ProjectFormCtrl',
      windowClass: 'project-modal',
      resolve: {
        project: function() {
          return project;
        }
      }
    });
  };

  $scope.loadProjects = function() {
    $http.get('/api/project/list/of/' + $scope.profileOwner.username).success(function(projects) {
      $scope.projects = projects
    }).error(function(err) {
      console.log("Error loading projects");
    });
  };

  $rootScope.$on("reloadProjects", function(event, args) {
    $scope.loadProjects();
  });

});

skillsdb.controller('ProjectDeleteCtrl', function($http, $rootScope, $scope, $modalInstance, ngToast, project) {
  $scope.project = project;
  $scope.ok = function() {
    $http.post('/api/project/delete', $scope.project)
        .success(function() {
          var msg = ngToast.create({
            content: 'Project Deleted!'
          });
          $modalInstance.dismiss('deleted');
          $rootScope.$broadcast("reloadProjects");
          $rootScope.$broadcast("reloadTopSkills");

        })
        .error(function() {
          console.log("PROJECT ERROR");
        });
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
});

skillsdb.controller('ProjectFormCtrl', function($http, $rootScope, $scope, $modalInstance, ngToast, tags, project) {
  $scope.project = project;

  $scope.loadSkills = function(query) {
    return tags.loadSkills(query);
  };
  $scope.loadTechnologies = function(query) {
    return tags.loadTechnologies(query);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.saveProject = function() {
        // Validate skills
        if ($scope.project.skills.length < 1) {
          var msg = ngToast.create({
            content: 'You must provide at least one skill for this project! ',
            class: 'danger'
          });
          return;
        }
        // Validate technologies
        if ($scope.project.technologies.length < 1) {
          var msg = ngToast.create({
            content: 'You must provide at least one technology used for this project! ',
            class: 'danger'
          });
          return;
        }
         console.log(" PROJ"+JSON.stringify($scope.project));
        if($scope.project._id){
          //Update project
          $http.put('/api/project/', $scope.project)
          .success(function() {
            var msg = ngToast.create({
              content: 'Project Updated'
            });
            $modalInstance.dismiss('saved');
            $rootScope.$broadcast("reloadProjects");
            $rootScope.$broadcast("reloadTopSkills");
          })
          .error(function() {
            console.log("Error updating project");
          });
        }else{
          // Create new project
          $http.post('/api/project/', $scope.project)
          .success(function() {
            var msg = ngToast.create({
              content: 'Project Added'
            });
            $modalInstance.dismiss('saved');
            $rootScope.$broadcast("reloadProjects");
            $rootScope.$broadcast("reloadTopSkills");
          })
          .error(function() {
            console.log("Error saving project");
          });
      }
};

    // Code below is for date picker
    $scope.open1 = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened1 = true;
    };
    $scope.open2 = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened2 = true;
    };
  });

/**********************************************************************
 * Custom Directives
 **********************************************************************/
 skillsdb.directive('showonhoverparent',
  function() {
    return {
      link: function(scope, element, attrs) {
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
/**********************************************************************
 * Custom Filters
 **********************************************************************/
 skillsdb.filter("leftpad", function() {
  return function(number) {
    if (number !== null && number !== undefined) {
      var str = "" + number;
      while (str.length < 2) str = "0" + str;
      return str;
    }
  };
});

 skillsdb.filter("milliSecondsToDays", function() {
  return function(ms) {
    if (ms !== null && ms !== undefined) {
      day = Math.round((ms / 8.64e+7) * 100) / 100;
      dayString = " day";
      if (day > 1) {
        dayString = " days";
      }
      return "" + day + dayString;
    }
  };
});