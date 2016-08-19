#ifndef __LUNA_SIMPLE_LOGIN_RESTFUL_API_DEFINITIONS_H__
#define __LUNA_SIMPLE_LOGIN_RESTFUL_API_DEFINITIONS_H__

enum SystemStatus {
    kSystemReady,
    kSystemRebooting,
};

enum FirmwareUpgradeStatus {
    kUpgradeReady,
    kFirmwareWriting,
    fUpgradeFinished,
};

#endif