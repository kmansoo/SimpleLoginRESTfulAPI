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

        function upgrade_firmware() {

            $rootScope.system_controller = vm;

            ModalService.showModal({
                controller: 'FileUploadController',
                templateUrl: 'system/file.upload.html',
                controllerAs: 'vm'
            }).then(function(modal) {
                modal.element.modal();

                modal.close.then(function(result) {
                    console.log("You said " + result);
                    //  message = "You said " + result;
                });
            });

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
    FileUploadController.$inject = ['$location', '$rootScope', '$element', '$timeout', 'close', 'Upload'];
    function FileUploadController($location, $rootScope, $element, $timeout, close, Upload) {

        var vm = this;

        vm.filename = "";

        vm.title = 'Firmware Upload'

        vm.status_info = '';
        vm.status_show = false;

        vm.button_title = "Stop";

        vm.pb_type = 'success';
        vm.pb_value= 0;

        vm.status_style = {"color":"black"};

        (function initController() {

            $timeout(fileUpload, 100);

        })();

        function fileUpload() {
            vm.status_show = false;

            // reset login status
            if (!$rootScope.system_controller.upload_file) {
                vm.status_info = "Um, couldn't find the upload file(s).";
                vm.status_show = true;

                console.log(vm.status_info);

                vm.status_style = {"color":"red"}; // change the text color
            }
            else if (!$rootScope.system_controller.upload_file.files) {
                vm.status_info = "This browser doesn't seem to support the `files` property of file inputs.";
                vm.status_show = true;

                console.log(vm.status_info);

                vm.status_style = {"color":"red"}; // change the text color
            }
            else if (!$rootScope.system_controller.upload_file.files[0]) {
                vm.status_info = "Please select a file before clicking 'Select'";
                vm.status_show = true;

                console.log(vm.status_info);

                vm.status_style = {"color":"red"}; // change the text color
            }
            else {
                var selected_file = $rootScope.system_controller.upload_file.files[0];

                vm.filename = selected_file.name;
                vm.button_title = "Stop";

                console.log("File " + selected_file.name + " is " + selected_file.size + " bytes in size");

                Upload.upload({
                    url: '/upload_firmware',
                    data: {file: selected_file}
                }).then(function (resp) {
                    vm.button_title = "Close";

                    vm.status_info = 'The file uploaded successfully.';
                    vm.status_show = true;

                    vm.status_style = {"color":"blue"}; // change the text color

                    console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                }, function (resp) {
                    vm.status_info = 'There are some errors in the device. Please check your device and retry again later.';
                    vm.status_show = true;

                    vm.button_title = "OK";
                    vm.pb_type = 'danger';

                    //$('#upload_status').css('background-color' , '#FF0000'); // change the background color
                    vm.status_style = {"color":'red'}; // change the text color

                    console.log('Error status: ' + resp.status);

                }, function (evt) {
                    var progressPercentage = 0.0;

                    if (evt.total > 0)
                        progressPercentage = parseInt(100.0 * evt.loaded / evt.total);

                    vm.pb_value = progressPercentage;

                    console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            }
        }

        function close() {
            if (vm.pb_value == 100)
            {
            }

            $element.modal('hide');
            close(result, 500); // close, but give 500ms for bootstrap to animate

            //  $element.close("TTTT", 500); // close, but give 500ms for bootstrap to animate
        }
    };

})();
