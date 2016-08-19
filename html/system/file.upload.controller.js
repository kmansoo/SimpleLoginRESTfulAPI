/**
 * Created by kmansoo on 2016. 8. 19..
 */

(function () {
    'use strict';

     angular
     .module('app')
     .controller('FileUploadController', FileUploadController);

    FileUploadController.$inject = ['$location', '$rootScope', '$element', '$http', '$timeout', '$interval', 'close', 'Upload'];
    function FileUploadController($location, $rootScope, $element, $http, $timeout, $interval, close, Upload) {

        var vm = this;

        vm.filename = "";

        vm.title = 'Firmware Upload';

        vm.status_info = '';
        vm.status_show = false;

        vm.button_title = "Stop";

        vm.pb_type = 'success';
        vm.pb_value= 0;

        vm.upgrade_firmware_status = false;

        vm.status_style = {"color":"black"};

        (function initController() {

            $timeout(fileUpload, 100);

        })();

        function fileUpload() {
            vm.status_show = false;

            // reset login status
            if (!$rootScope.system_controller.upload_file) {

                showStatusMessage("Um, couldn't find the upload file(s).", "red");

            }
            else if (!$rootScope.system_controller.upload_file.files) {
                showStatusMessage("This browser doesn't seem to support the `files` property of file inputs", "red");
            }
            else if (!$rootScope.system_controller.upload_file.files[0]) {
                showStatusMessage("Please select a file before clicking 'Select'.", "red");
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
                    vm.upgrade_firmware_status = true;

                    showStatusMessageEx(
                        "The file uploaded successfully, and the device is going to upgrade to the new firmware.\nPlease wait while upgrading..",
                        "white",
                        "rgb(0, 176, 240)"
                    );

                    console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);

                    //  start firmware upgrade
                    $timeout(firmwareUpgrade(), 200);

                }, function (resp) {

                    showStatusMessageEx(
                        "There are some errors in the device. Please check your device and retry again later.",
                        "white",
                        "rgb(255, 102, 102)"
                    );

                    vm.button_title = "OK";
                    vm.pb_type = 'danger';

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

        function firmwareUpgrade()
        {
            var api_name = '/api/system/firmware_upgrade';

            $http.get(api_name)
                .success(function(data, status, headers, config) {
                    if (data['status'] != 'ready')
                    {
                        showStatusMessageEx(
                            "Now, the new firmware is upgrading, so please retry again after rebooting the device.",
                            "white",
                            "rgb(255, 102, 102)"
                        );

                        vm.button_title = "OK";
                        vm.upgrade_firmware_status = false;

                        return;
                    }

                })
                .error(function(data, status, header, config) {
                    showStatusMessageEx(
                        "There are some errors in the device. Please check your device and retry again later.",
                        "white",
                        "rgb(255, 102, 102)"
                    );

                    vm.button_title = "OK";
                    vm.upgrade_firmware_status = false;

                    return;
                });

            $http.post(api_name)
                .success(function(data, status, headers, config) {
                    if (status == 200) {

                        var check_system = $interval(function() {

                            $http.get(api_name)
                                .success(function(data, status, headers, config) {
                                    if (data['status'] == 'finished')
                                    {
                                        $interval.cancel(check_system);

                                        $http.put(api_name)
                                            .success(function(data, status, headers, config) {
                                            })
                                            .error(function(data, status, header, config) {
                                            });

                                        showStatusMessageEx(
                                            "Now, this device finished to upgrade to the new firmware!",
                                            "white",
                                            "rgb(146, 208, 80)"
                                        );

                                        vm.button_title = "OK";
                                        vm.upgrade_firmware_status = false;
                                    }

                                })
                                .error(function(data, status, header, config) {
                                    $interval.cancel(check_system);

                                    showStatusMessageEx(
                                        "There are some errors in the device. Please check your device and retry again later.",
                                        "white",
                                        "rgb(255, 102, 102)"
                                    );

                                    vm.button_title = "OK";
                                    vm.upgrade_firmware_status = false;
                                });
                        }, 500);
                    }
                    else {
                        showStatusMessageEx(
                            "There are some errors in the device. Please check your device and retry again later.",
                            "white",
                            "rgb(255, 102, 102)"
                        );

                        vm.button_title = "OK";
                        vm.upgrade_firmware_status = false;
                    }
                })
                .error(function(data, status, header, config) {
                    showStatusMessageEx(
                        "There are some errors in the device. Please check your device and retry again later.",
                        "white",
                        "rgb(255, 102, 102)"
                    );

                    vm.button_title = "OK";
                    vm.upgrade_firmware_status = false;
                });
        }

        function showStatusMessage(message, textColor) {

            vm.status_info = message;
            vm.status_show = true;

            vm.status_style = {"color": textColor}; // change the text color
        }

        function showStatusMessageEx(message, textColor, backColor) {

            vm.status_info = message;
            vm.status_show = true;

            vm.status_style = {
                "color": textColor,
                "background-color": backColor
            }; // change the text color
        }

        function closeDialog() {
            $element.modal('hide');
            close(result, 500); // close, but give 500ms for bootstrap to animate
        }
    }
})();
