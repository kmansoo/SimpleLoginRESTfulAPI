#include <string>
#include <chrono>
#include <thread>

#include "ccCore/ccSingletonT.h"

#include "fake_device.h"

#include "../Definitions.h"

class FakeDeviceManager {
public:
    FakeDeviceManager() {
        // init member variables
        firmware_upgrade_thread_ = nullptr;
        system_reboot_thread_ = nullptr;

        login_user_id_ = "root";
        login_user_password_ = "admin";

        device_password_ = "password";

        firmware_upgrade_status_ = kUpgradeReady;
        system_rebootinge_status_ = kSystemReady;
    }

    ~FakeDeviceManager() {
        destroyFirmwareUpgradeThread();
        destroySystemRebootThread();
    }

public:
    void    destroyFirmwareUpgradeThread() {
        if (firmware_upgrade_thread_ == nullptr)
            return;

        firmware_upgrade_thread_->join();
        delete firmware_upgrade_thread_;

        firmware_upgrade_thread_ = nullptr;
    }

    void    destroySystemRebootThread() {
        if (system_reboot_thread_ == nullptr)
            return;

        system_reboot_thread_->join();
        delete system_reboot_thread_;

        system_reboot_thread_ = nullptr;
    }

public:
    std::string     login_user_id_;;
    std::string     login_user_password_;;

    std::string     device_password_;;

    SystemStatus   system_rebootinge_status_;;
    FirmwareUpgradeStatus   firmware_upgrade_status_;;

    std::thread*    system_reboot_thread_;
    std::thread*    firmware_upgrade_thread_;
};


void  luna_initDeviceStatus() {
    Luna::ccSingletonT<FakeDeviceManager>::instance().firmware_upgrade_status_ = kUpgradeReady;
    Luna::ccSingletonT<FakeDeviceManager>::instance().system_rebootinge_status_ = kSystemReady;
}

//  return value:
//      1: success
//      0: fail 

const char* luna_getLoginID() {
    return Luna::ccSingletonT<FakeDeviceManager>::instance().login_user_id_.c_str();
}

const char* luna_getLoginPassword() {
    return Luna::ccSingletonT<FakeDeviceManager>::instance().login_user_password_.c_str();
}


const char* luna_getDevicePassword() {
    return Luna::ccSingletonT<FakeDeviceManager>::instance().device_password_.c_str();
}

void luna_setDevicePassword(const char* new_password) {
    Luna::ccSingletonT<FakeDeviceManager>::instance().device_password_ = new_password;
}

const char* luna_getRxPower() {
    return "-17 dBm";
}

const char* luna_getTxPower() {
    return "-20 dBm";
}

//
//  functions for firmware upagrade
//

void luna_initFirmwareUpgradeStatus() {
    Luna::ccSingletonT<FakeDeviceManager>::instance().firmware_upgrade_status_ = kUpgradeReady;
}

//  return value:
//      0: ready
//      1: writing a firmware to flash 
//      2: finished writing a firmwre.
//     -1: there are some errors
int luna_getFirmwareUpgradeStatus() {
    return Luna::ccSingletonT<FakeDeviceManager>::instance().firmware_upgrade_status_;
}

bool luna_startFirmwareUpgrade(const char* file_path) {
    if (Luna::ccSingletonT<FakeDeviceManager>::instance().firmware_upgrade_status_ == kFirmwareWriting)
        return false;

    Luna::ccSingletonT<FakeDeviceManager>::instance().destroyFirmwareUpgradeThread();

    Luna::ccSingletonT<FakeDeviceManager>::instance().firmware_upgrade_thread_ = new std::thread([]() {
        Luna::ccSingletonT<FakeDeviceManager>::instance().firmware_upgrade_status_ = kFirmwareWriting;

        std::this_thread::sleep_for(std::chrono::seconds(5));

        Luna::ccSingletonT<FakeDeviceManager>::instance().firmware_upgrade_status_ = fUpgradeFinished;
    });

    return true;
}

//
//  functions for system rebooting
//

//  return value:
//      0: ready
//      1: rebooting
//     -1: there are some errors
int luna_getSystemRebootingStatus() {
    return Luna::ccSingletonT<FakeDeviceManager>::instance().system_rebootinge_status_;
}

bool luna_startSystemRebooting() {
    if (Luna::ccSingletonT<FakeDeviceManager>::instance().system_rebootinge_status_ == kSystemRebooting)
        return false;

    Luna::ccSingletonT<FakeDeviceManager>::instance().destroySystemRebootThread();

    Luna::ccSingletonT<FakeDeviceManager>::instance().system_reboot_thread_ = new std::thread([]() {
        Luna::ccSingletonT<FakeDeviceManager>::instance().system_rebootinge_status_ = kSystemRebooting;

        std::this_thread::sleep_for(std::chrono::seconds(5));

        Luna::ccSingletonT<FakeDeviceManager>::instance().system_rebootinge_status_ = kSystemReady;
    });

    return true;
}
