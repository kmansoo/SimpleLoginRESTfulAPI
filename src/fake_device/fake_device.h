#ifndef __FAKE_DEVVICE_H__
#define __FAKE_DEVVICE_H__

void        luna_initDeviceStatus();

const char* luna_getLoginID();
const char* luna_getLoginPassword();

const char* luna_getDevicePassword();
void        luna_setDevicePassword(const char* new_password);

const char* luna_getRxPower();
const char* luna_getTxPower();

//
//  functions for firmware upagrade
//

void        luna_initFirmwareUpgradeStatus();

//  return value:
//      0: ready
//      1: writing a firmware to flash 
//      2: finished writing a firmwre.
int         luna_getFirmwareUpgradeStatus();

bool        luna_startFirmwareUpgrade(const char* file_path);


//
//  functions for system rebooting
//

//  return value:
//      0: ready
//      1: rebooting
int         luna_getSystemRebootingStatus();

bool        luna_startSystemRebooting();

#endif
