/**
* ng-date-picker Module
*   ----------  Docs -----------
	*  <input ng-date-picker ng-model='date' date-picker-config="config">
	*   --> config
	*     -> outsideClose : close from outside dim bg click
	*	  -> minDate : min-date validation
	*	  -> maxDate : max date validation
	*	  -> mask : view format for date in input field
* 
*/
angular.module('ngDatePicker', [])

	.run(['$rootScope', function($rootScope) {
		console.log('runnong..')
		$rootScope.$dtpckr = null;
		$rootScope.$dtpckrEvents = {
			onClose: null
		}
		$rootScope.$dtpckrModalConfig = {
			outsideClose: true,
			minDate: null,
			maxDate: null
		}
		$rootScope.$dtpckrConfig = {}
	}])


	//config
	.directive('ngDatePickerModal', ['$compile', '$rootScope', '$timeout', 'ngDatePickerService', function($compile, $rootScope, $timeout, ngDatePickerService) {
		return {
			template: "<div></div>"
			,
			scope: {
				date: '&'
			},
			controller : function($scope, $element, $attrs, $transclude) {


				$scope.initVars = function() {
					$scope.typing = true;
					$scope.isMinDateInValid = false;
					$scope.isMaxDateInValid = false;
					$scope.isDateRangeValid = true;
					$scope.showErr = true;
					$scope.isErrDate = false;
					$scope.dateRanges = {
						min: $rootScope.$dtpckrConfig.minDate,
						max: $rootScope.$dtpckrConfig.maxDate
					}
					$scope.monthsA = ngDatePickerService.monthArray;
					$scope.dateObj = ( $rootScope.$dtpckr ? ( new Date($rootScope.$dtpckr) ) : ( new Date() ) );
					$scope.selected = {
						month: $scope.monthsA[($scope.dateObj.getMonth())],
						day: $scope.dateObj.getDate(),
						year: $scope.dateObj.getFullYear()
					}
					$scope.daysA = [];

					$scope.formDaysArray();
					$scope.checkDateRangeConfigValid();

				}

				$scope.formDaysArray = function(month, year) {
					$scope.daysA = [];
					var m_ = ($scope.monthsA.indexOf($scope.selected.month) + 1);
				    var l_ = (new Date($scope.selected.year, m_, 0).getDate());
				    for(var i=0;i<l_;i++) {
				    	$scope.daysA.push(i+1);
				    }

				    if(l_ < parseInt($scope.selected.day)) $scope.selected.day = l_;
				    else $scope.selected.day = $scope.selected.day;
				}


				// watch for real time validation of days array
				$scope.$watch('selected.month', function(n, o) {
					if(n) {
						$scope.formDaysArray();
						$scope.dateRangeValid();
						$scope.showErr = false;
					}
				})
				$scope.$watch('selected.year', function(n, o) {
					if(n) {
						$scope.formDaysArray();
						$scope.dateRangeValid();
						$scope.showErr = false;
					}
				})
				$scope.$watch('selected.day', function(n, o) {
					if(n) {
						$scope.formDaysArray();
						$scope.dateRangeValid();
						$scope.showErr = false;
					}
				})


				$scope.dateRangeValid = function() {
					$scope.isDateRangeValid = true;
					var d_t = (new Date($scope.selected.year, ($scope.monthsA.indexOf($scope.selected.month)), $scope.selected.day));
					if($rootScope.$dtpckrConfig.minDate)  {
						var c_d = $rootScope.$dtpckrConfig.minDate;
						valid = false;
						if(d_t.getFullYear() < c_d.getFullYear()) {
							valid = false;
						} else {
							valid = true;
							if(d_t.getFullYear() == c_d.getFullYear()) {
								if(d_t.getMonth() < c_d.getMonth()) {
									valid = false;
								}
								if(d_t.getMonth() == c_d.getMonth()) {
									if(d_t.getDate() < c_d.getDate()) {
										valid = false;
									} else {
										valid = true;
									}
								}
							} else {
								valid = true;
								if(d_t.getMonth() == c_d.getMonth()) {
									if(d_t.getDate() < c_d.getDate()) {
										valid = false;
									} else {
										valid = true;
									}
								}
							}
						}



						$scope.isMinDateInValid = !valid;
					}
					if($rootScope.$dtpckrConfig.maxDate) {
						var c_d = $rootScope.$dtpckrConfig.maxDate;
						valid = false;
						if(d_t.getFullYear() > c_d.getFullYear()) {
							valid = false;
						} else {
							valid = true;
							if(d_t.getFullYear() == c_d.getFullYear()) {
								if(d_t.getMonth() > c_d.getMonth()) {
									valid = false;
								}
								if(d_t.getMonth() == c_d.getMonth()) {
									if(d_t.getDate() > c_d.getDate()) {
										valid = false;
									} else {
										valid = true;
									}
								}
							} else {
								valid = true;
								if(d_t.getMonth() == c_d.getMonth()) {
									if(d_t.getDate() > c_d.getDate()) {
										valid = false;
									} else {
										valid = true;
									}
								}
							}
						}

						$scope.isMaxDateInValid = !valid;
					}
					if($scope.isMinDateInValid || $scope.isMaxDateInValid ) $scope.isDateRangeValid = false;
				}

				$scope.update = function() {
					$rootScope.$dtpckr = new Date($scope.selected.year, ($scope.monthsA.indexOf($scope.selected.month)), $scope.selected.day);
					var valid = $scope.isDate($rootScope.$dtpckr);
					if ( valid && $scope.isDateRangeValid) {
						$rootScope.$dtpckr = $rootScope.$dtpckr.toISOString();
						$rootScope.$dtpckrEvents.onClose(true);
					}
					else {
						$scope.showErr = true;
						$scope.isErrDate = true;
					  	// $rootScope.$dtpckrEvents.onClose(false);
					}
				}

				$scope.isDate = function(d) {
					if(!$scope.selected.year) return false;
					if ( Object.prototype.toString.call(d) === "[object Date]" ) {
					  if ( isNaN( d.getTime() ) ) {  // d.valueOf() could also work
					    return false;
					  }
					  else {
					    return true;
					  }
					}
					else {
					  return false;
					}
				}

				$scope.checkDateRangeConfigValid = function() {
					if(!($rootScope.$dtpckrConfig.minDate  &&  Object.prototype.toString.call($rootScope.$dtpckrConfig.minDate) === '[object Date]')) {
						if($rootScope.$dtpckrConfig.minDate)
							console.error('minDate is not date Object')
						$rootScope.$dtpckrConfig.minDate = null;
					}
					if(!($rootScope.$dtpckrConfig.maxDate  &&  Object.prototype.toString.call($rootScope.$dtpckrConfig.maxDate) === '[object Date]')) {
						if($rootScope.$dtpckrConfig.maxDate)
							console.error('maxDate is not date Object')
						$rootScope.$dtpckrConfig.maxDate = null;
					}
				}

				$scope.close = function(from_outside) {
					if(from_outside) {
						if($rootScope.$dtpckrConfig.outsideClose)
							$rootScope.$dtpckrEvents.onClose(false);
					} else {
						$rootScope.$dtpckrEvents.onClose(false);
					}
				}


				$scope.init = function() {
					var template = "  <div class='_date-picker'>"
					      + "<div class='back-drop' ng-click=\"close(true)\"></div>"
					      + "<div class='content'>"
					      + "<div class='title-bar'>Select Date <span class='_close' ng-click=\"close()\"><svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='64' version='1.1' height='64' viewBox='0 0 64 64' enable-background='new 0 0 64 64'> <g> <path fill='#1D1D1B' d='M28.941,31.786L0.613,60.114c-0.787,0.787-0.787,2.062,0,2.849c0.393,0.394,0.909,0.59,1.424,0.59 c0.516,0,1.031-0.196,1.424-0.59l28.541-28.541l28.541,28.541c0.394,0.394,0.909,0.59,1.424,0.59c0.515,0,1.031-0.196,1.424-0.59 c0.787-0.787,0.787-2.062,0-2.849L35.064,31.786L63.41,3.438c0.787-0.787,0.787-2.062,0-2.849c-0.787-0.786-2.062-0.786-2.848,0 L32.003,29.15L3.441,0.59c-0.787-0.786-2.061-0.786-2.848,0c-0.787,0.787-0.787,2.062,0,2.849L28.941,31.786z'></path> </g></svg></span></div>"
					      + "<div class='body'>"
					      + "<div class='fields'>"
					      + "<div class='_m'><select ng-model='selected.month'><option ng-repeat='m in monthsA track by $index' ng-value='m'>{{m}}</option></select></div>"
					      + "<div class='_d'><select ng-model='selected.day'><option ng-repeat='d in daysA track by $index' ng-value='d'>{{d}}</option></select></div>"
					      + "<div class='_y'><input ng-model='selected.year' maxlength='4' minlength='4'/></div>"
					      + "</div>"
					      + "<div class='_err' ng-if='showErr'>"
					      + "<div ng-if='isMinDateInValid'>Min Date Should be : {{dateRanges.min | date : 'MMM-dd-yyyy'}}</div>"
					      + "<div ng-if='isMaxDateInValid'>Max Date Should be : {{dateRanges.max}}</div>"
					      + "<div ng-if='isErrDate'>Date is invalid!</div>"
					      + "</div>"
					      + "</div>"
					      + "<div class='action'><button class='_close' ng-click=\"close()\">Close</button><button ng-click=\"update()\" class='_select'>Update</button></div>"
					      + "</div>"
					      + "</div>";

					$timeout(function(){
						$element.append($compile(template)($scope));
						$scope.initVars();
					}, 10);
				}

				//init
				$scope.initVars();
				$scope.init();

			
			},
			link: function($scope, iElm, iAttrs, controller) {
				console.log($rootScope.$dtpckr, iElm, $rootScope.$dtpckrConfig)
				$scope.v = 'dssdas';
				
			}
		};
	}])

	.service('ngDatePickerService', ['$rootScope', '$compile', function($rootScope, $compile){
		this.monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		this.open = function(date, config, close_callback) {
			$rootScope.$dtpckr = date;
			if(config) $rootScope.$dtpckrConfig = config;
			else $rootScope.$dtpckrConfig = $rootScope.$dtpckrModalConfig;
			if(document.querySelectorAll('[ng-date-picker-modal]').length > 0) return;
			$rootScope.$dtpckr = date;
			var mover = angular.element('<div ng-date-picker-modal>Hello</div>');
			var template = $compile("<div ng-date-picker-modal>Hello</div>")(angular.element(angular.element(document).find('body')).scope());
			angular.element(document).find('body').append(template);
			$rootScope.$dtpckrEvents.onClose = function(status) {
				console.log('clodedddddd callback')
				angular.element(document.querySelectorAll('[ng-date-picker-modal]')[0].remove());
				if(status)
					close_callback($rootScope.$dtpckr);
				else
					close_callback(false);
				$rootScope.$dtpckr = null;
			}
		}
	}])

	.directive('ngDatePicker', ['$compile', 'ngDatePickerService', '$filter', function($compile, ngDatePickerService, $filter){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			scope: {
				ngModel: '=',
				datePickerConfig: '='
			}, // {} = isolate, true = child, false/undefined = no change
			controller: function($scope, $element, $attrs, $transclude) {
				console.log($scope.ngModel)
				$scope.aa = function() {
					console.log('called')
				}
			},
			require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			// restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
			// template: '<div><ng-transclude></ng-transclude><div>Hello</div></div>',
			// templateUrl: '',
			// replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			link: function($scope, iElm, iAttrs, controller) {
				iElm.bind('click', function(e) {
					$scope.typing = false;
					ngDatePickerService.open($scope.ngModel, $scope.datePickerConfig, function(date) {
						$scope.typing = true;
						if(date) { 
							viewValue = "fsdfsd";
				     		controller.$viewValue = viewValue;
				     		$scope.ngModel = date;
				     		// controller.$viewValue = viewValue;
						}

					});
				});

			controller.$formatters.unshift(function (a) {
				var mask = ( $scope.datePickerConfig.mask ? $scope.datePickerConfig.mask : 'MMM-dd-yyyy');
                return $filter('date')(controller.$modelValue, mask);
            });

				

				iElm.bind('keydown', function(e) {
					if(!$scope.typing) e.preventDefault();
					return false;
				});
			}
		};
	}]);

