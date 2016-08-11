(function () {
    'use strict';

    angular
        .module('app')
        .controller('SystemController', SystemController);

    SystemController.$inject = ['$location', 'AuthenticationService', '$timeout', '$http'];
    function SystemController($location, AuthenticationService, $timeout, $http) {
        var vm = this;

        vm.get_password = get_password;
        vm.set_password = set_password;
        vm.retrieve_rx_tx_power = retrieve_rx_tx_power;
        vm.upgrade_firmware = upgrade_firmware;
        vm.reboot_system = reboot_system;

        vm.password = "";
        vm.rx_power = "-";
        vm.tx_power = "-";
        vm.status = "";
        vm.isRebooting = false;

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
    }

})();
