(function () {
    'use strict';

    angular
        .module('app')
        .controller('SystemController', SystemController);

    var waitingDialog = waitingDialog || (function ($) {
        'use strict';

        // Creating modal dialog's DOM
        var $dialog = $(
            '<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
            '<div class="modal-dialog modal-m">' +
            '<div class="modal-content">' +
            '<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
            '<div class="modal-body">' +
            '<div class="progress progress-striped active" style="margin-bottom:0;"><div class="progress-bar" style="width: 100%"></div></div>' +
            '</div>' +
            '</div></div></div>');

        return {
            /**
             * Opens our dialog
             * @param message Custom message
             * @param options Custom options:
             * 				  options.dialogSize - bootstrap postfix for dialog size, e.g. "sm", "m";
             * 				  options.progressType - bootstrap postfix for progress bar type, e.g. "success", "warning".
             */
            show: function (message, options) {
                // Assigning defaults
                if (typeof options === 'undefined') {
                    options = {};
                }
                if (typeof message === 'undefined') {
                    message = 'Loading';
                }
                var settings = $.extend({
                    dialogSize: 'm',
                    progressType: '',
                    onHide: null // This callback runs after the dialog was hidden
                }, options);

                // Configuring dialog
                $dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
                $dialog.find('.progress-bar').attr('class', 'progress-bar');
                if (settings.progressType) {
                    $dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
                }
                $dialog.find('h3').text(message);
                // Adding callbacks
                if (typeof settings.onHide === 'function') {
                    $dialog.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
                        settings.onHide.call($dialog);
                    });
                }
                // Opening dialog
                $dialog.modal();
            },
            /**
             * Closes dialog
             */
            hide: function () {
                $dialog.modal('hide');
            }
        };

    })(jQuery);

    SystemController.$inject = ['$rootScope', 'AuthenticationService', '$http', '$timeout', '$interval', 'ModalService'];
    function SystemController($rootScope, AuthenticationService, $http, $timeout, $interval, ModalService) {

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

            $http.get('/api/system/password')
                .success(function(data, status, headers, config) {
                    if (status == 200) {
                        vm.password = data['password'];

                        showStatusMessageWithBackcolor(
                            "Succeeded to get the password!",
                            "white",
                            "rgb(146, 208, 80)");
                    }
                    else
                        handleError("Couldn't get the password! : " + status);
                })
                .error(function(data, status, header, config) {
                    handleError("Couldn't get the password! : " + status);

                    showStatusMessageWithTextcolor(
                        "There are some problem in the device, so 'Get Password' request is rejected.",
                        '#FF0000');
                });

        }

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

                        showStatusMessage(
                            "Succeeded to set the password!",
                            "white",
                            "rgb(146, 208, 80)");
                    }
                    else
                        handleError("Couldn't set the password! : " + status);
                })
                .error(function(data, status, header, config) {
                    handleError("Couldn't set the password! : " + status);

                    showStatusMessageWithTextcolor(
                        "There are some problem in the device, so 'Set Password' request is rejected.",
                        '#FF0000');
                });

        }

        function retrieve_rx_tx_power() {
            $http.get('/api/system/rx_tx_power')
                .success(function(data, status, headers, config) {
                    vm.rx_power = data['rx_power'];
                    vm.tx_power = data['tx_power'];

                    showStatusMessageWithBackcolor(
                        "Succeeded to retrieve Rx/Tx Power!",
                        "white",
                        "rgb(146, 208, 80)");
                })
                .error(function(data, status, header, config) {
                    handleError("Couldn't retrieve Rx/Tx Power!");

                    showStatusMessageWithTextcolor(
                        "There are some problem in the device, so 'Retrieve Rx/Tx Power' request is rejected.",
                        '#FF0000');
                });
        }

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
        }

        function reboot_system() {
            var api_name = '/api/system/reboot';

            $http.get(api_name)
                .success(function(data, status, headers, config) {
                    if (data['status'] != 'ready')
                    {
                        showStatusMessageWithBackcolor(
                            "Now, the device is going to prepare rebootring, so please retry again after rebooting the device.",
                            "white",
                            "rgb(255, 102, 102)"
                        );

                        return;
                    }

                })
                .error(function(data, status, header, config) {
                    showStatusMessageWithBackcolor(
                        "There are some errors in the device. Please check your device and retry again later.",
                        "white",
                        "rgb(255, 102, 102)"
                    );

                    return;
                });

            $http.post(api_name)
                .success(function(data, status, headers, config) {
                    if (status == 200) {
                        vm.isRebooting = true;

                        waitingDialog.show("Please wait while rebooting...");

                        var check_system = $interval(function() {

                            $http.get(api_name)
                                .success(function(data, status, headers, config) {
                                    if (data['status'] == 'ready')
                                    {
                                        $interval.cancel(check_system);

                                        vm.isRebooting = false;

                                        waitingDialog.hide();

                                        showStatusMessageWithBackcolor(
                                            "Now, this device was rebooted!",
                                            "white",
                                            "rgb(146, 208, 80)");
                                    }

                                })
                                .error(function(data, status, header, config) {
                                });
                        }, 500);
                    }
                    else {
                        vm.isRebooting = false;

                        waitingDialog.hide();

                        showStatusMessageWithTextcolor(
                            "There are some problem in the device, so 'Reboot System' request is rejected.",
                            '#FF0000');
                    }
                })
                .error(function(data, status, header, config) {
                    vm.isRebooting = false;

                    waitingDialog.hide();

                    showStatusMessageWithTextcolor(
                        "There are some problem in the device, so the 'Reboot System' request is rejected.",
                        '#FF0000');
                });
        }

        // private functions
        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            showStatusMessageWithBackcolor(error, '#FFFFFF', 'rgb(255, 102, 102)');

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

        function showStatusMessageWithTextcolor(message, textColor) {
            showStatusMessage(message, textColor, $('#rx_power').css('background-color'), true);
        }

        function showStatusMessageWithBackcolor(message, textColor, backColor) {
            showStatusMessage(message, textColor, backColor, true);
        }

        function showStatusMessage(message, textColor, backColor, clearMessageAfter5Secs) {
            vm.status = message;
            $('#status').css('color' , textColor);
            $('#status').css('background-color', backColor);

            if (clearMessageAfter5Secs == true) {
                clearTimeout(5000);
                $timeout(resetStatusControl, 5000);
            }
        }

        function resetStatusControl() {
            vm.status = "";
            $('#status').css('color' , $('#rx_power').css('color'));
            $('#status').css('background-color', $('#rx_power').css('background-color'));
        }
    }

})();
