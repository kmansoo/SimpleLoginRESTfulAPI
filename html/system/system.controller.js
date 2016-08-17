(function () {
    'use strict';

    /*
    angular
        .module('app')
        .controller('SystemController', SystemController);

     SystemController.$inject = ['$location', 'AuthenticationService', '$timeout', '$http', 'Upload', 'ModalService'];
     function SystemController($location, AuthenticationService, $timeout, $http, Upload, ModalService) {

    */

    var app = angular.module('app');

    app.controller('SystemController', SystemController);
    SystemController.$inject = ['$location', '$rootScope', 'AuthenticationService', '$timeout', 'ModalService'];
    function SystemController($location, $rootScope, AuthenticationService, $timeout, ModalService) {

        var vm = this;

        vm.get_password = get_password;
        vm.set_password = set_password;
        vm.retrieve_rx_tx_power = retrieve_rx_tx_power;
        vm.upgrade_firmware = upgrade_firmware;
        vm.reboot_system = reboot_system;
        vm.upload_file = upload_file;

        vm.password = "";
        vm.rx_power = "-";
        vm.tx_power = "-";
        vm.status = "";
        vm.isRebooting = false;
        vm.firmware_filename = "TTT";

        (function initController() {
            // reset login status
            AuthenticationService.ClearCredentials();

        })();

        function get_password() {

            $http.get('api/system/password')
                .success(function(data, status, headers, config) {
                    if (status == 200) {
                        vm.password = data['password'];

                        vm.status = "Succeeded to get the password!";

                        $('#status').css('background-color', '#00FF00'); // change the background color
                        $('#status').css('color', '#000000'); // change the background color

                        clearTimeout(5000);
                        $timeout(resetStatusControl, 5000);
                    }
                    else
                        handleError("Couldn't get the password! : " + status);
                })
                .error(function(data, status, header, config) {
                    handleError("Couldn't get the password! : " + status)
                });

        };

        function set_password() {

            var newPassword = {
                'password': vm.password
            };

            var config = {
                headers : {
                    'Content-Type': 'application/javascript'
                }
            }

            $http.post('api/system/password', newPassword, config)
                .success(function(data, status, headers, config) {
                    if (status == 200) {
                        vm.status = "Succeeded to set the password!";

                        $('#status').css('background-color', '#00FF00'); // change the background color
                        $('#status').css('color', '#000000'); // change the background color

                        clearTimeout(5000);
                        $timeout(resetStatusControl, 5000);
                    }
                    else
                        handleError("Couldn't set the password! : " + status);
                })
                .error(function(data, status, header, config) {
                    handleError("Couldn't set the password! : " + status);
                });

        };

        function retrieve_rx_tx_power() {
            $http.get('api/system/rx_tx_power')
                .success(function(data, status, headers, config) {
                    vm.rx_power = data['rx_power'];
                    vm.tx_power = data['tx_power'];

                    vm.status = "Succeeded to retrieve Rx/Tx Power!";

                    $('#status').css('background-color' , '#00FF00'); // change the background color
                    $('#status').css('color' , '#000000'); // change the background color

                    clearTimeout(5000);
                    $timeout(resetStatusControl, 5000);
                })
                .error(function(data, status, header, config) {
                    handleError("Couldn't retrieve Rx/Tx Power!")
                });
        };

        function upload_and_upgrade_firmware() {

            $rootScope.system_controller = vm;

            ModalService.showModal({
                controller: 'FileUploadController',
                templateUrl: '/system/file_upload.html',
                controllerAs: 'vm'
            }).then(function(modal) {
                modal.element.modal();

                modal.close.then(function(result) {
                    console.log("You said " + result);
                    //  message = "You said " + result;
                });
            });

        };

        function upgrade_firmware() {

            upload_and_upgrade_firmware();

            /*
            if (!vm.upload_file) {
                console.log("Um, couldn't find the fileinput element.");
            }
            else if (!vm.upload_file.files) {
                console.log("This browser doesn't seem to support the `files` property of file inputs.");
            }
            else if (!vm.upload_file.files[0]) {
                console.log("Please select a file before clicking 'Load'");
            }
            else {
                var selected_file = vm.upload_file.files[0];
                console.log("File " + selected_file.name + " is " + selected_file.size + " bytes in size");

                Upload.upload({
                    url: '/upload_firmware',
                    data: {file: selected_file}
                }).then(function (resp) {
                    console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            }
            */
        };

        function reboot_system() {
            vm.isRebooting = true;
            vm.status = "Now, this device is going to reboot!";

            $('#status').css('background-color' , 'rgb(192, 192, 192)'); // change the background color
            $('#status').css('color' , '#000000'); // change the background color
        };

        function resetStatusControl() {
            vm.status = "";
            $('#status').css('background-color', $('#rx_power').css('background-color'));
            $('#status').css('color', $('#rx_power').css('color'));
        };

        // private functions
        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            vm.status = error;

            $('#status').css('background-color' , '#FF0000'); // change the background color
            $('#status').css('color' , '#FFFFFF'); // change the background color

            clearTimeout(5000);
            $timeout(resetStatusControl, 5000); // 3000ms(3초)가 경과하면 resetStatusControl() 함수를 실행합니다.

            return function () {
                return { success: false, message: error };
            };
        }

        function getUploadFilename() {
            if (!vm.upload_file) {
                return "";
            }
            else if (!vm.upload_file.files) {
                return "";
            }
            else if (!vm.upload_file.files[0]) {
                return "";
            }

            return vm.upload_file.files[0].name;
        }
    }

    app.controller('FileUploadController', FileUploadController);
    FileUploadController.$inject = ['$location', '$rootScope', '$element', 'close', 'Upload'];
    function FileUploadController($location, $rootScope, $element, close, Upload) {

        var vm = this;

        vm.filename = "";

        (function initController() {
            // reset login status
            if (!$rootScope.system_controller.upload_file) {
                console.log("Um, couldn't find the fileinput element.");
            }
            else if (!$rootScope.system_controller.upload_file.files) {
                console.log("This browser doesn't seem to support the `files` property of file inputs.");
            }
            else if (!$rootScope.system_controller.upload_file.files[0]) {
                console.log("Please select a file before clicking 'Load'");
            }
            else {
                var selected_file = $rootScope.system_controller.upload_file.files[0];

                vm.filename = selected_file.name;

                console.log("File " + selected_file.name + " is " + selected_file.size + " bytes in size");

                Upload.upload({
                    url: '/upload_firmware',
                    data: {file: selected_file}
                }).then(function (resp) {
                    console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            }
        })();

        function close() {
            //  $element.close("TTTT", 500); // close, but give 500ms for bootstrap to animate
        }

        function cancel() {
            //  Manually hide the modal.
            $element.modal('hide');

            close(result, 500); // close, but give 500ms for bootstrap to animate
        }
    };

})();
