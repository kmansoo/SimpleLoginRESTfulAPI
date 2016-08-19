/*
* SimpleLoginRESTfulApi.cpp
*
*  Created on: 2016. 8. 11.
*      Author: Mansoo Kim(mansoo.kim@icloud.com)
*/

#include "SimpleLoginRESTfulApi.h"

#include "ccJsonParser/json/value.h"
#include "ccJsonParser/json/reader.h"
#include "ccJsonParser/json/writer.h"

#include "md5/md5.h"

#include "Definitions.h"
#include "fake_device/fake_device.h"

SimpleLoginRESTfulApi::SimpleLoginRESTfulApi()
{
    addAPI(std::string("/api/users/*"), std::bind(&SimpleLoginRESTfulApi::users, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/password"), std::bind(&SimpleLoginRESTfulApi::password, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/rx_tx_power"), std::bind(&SimpleLoginRESTfulApi::rx_tx_power, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/reboot"), std::bind(&SimpleLoginRESTfulApi::system_reboot, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/firmware_upgrade"), std::bind(&SimpleLoginRESTfulApi::firmware_upgrade, this, std::placeholders::_1, std::placeholders::_2));
}

bool SimpleLoginRESTfulApi::users(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse)
{
    switch ((std::uint32_t)pRequest->getMethod()) {
    case Luna::ccWebServerRequest::HttpMethod_Get: {
        //  I'll implement this method as soon as possible.
        std::string strUserID = pRequest->getResource();

        if (strUserID == luna_getLoginID()) {
            Json::Value oResponseJsonValue;
            Json::StyledWriter oWriter;

            oResponseJsonValue["user"] = strUserID;
            oResponseJsonValue["password"] = BZF::md5(luna_getLoginPassword());

            std::string strJsonData = oWriter.write(oResponseJsonValue);

            pResponse->status(200, std::string("OK"));
            pResponse->contentType("application/javascript", strJsonData.length());
            pResponse->write(strJsonData);

            //  for test
            luna_initDeviceStatus();
        }
        else
            pResponse->status(404, std::string("not found."), true);

        break;
    }
    }

    return true;
}

bool SimpleLoginRESTfulApi::password(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse)
{
    switch ((std::uint32_t)pRequest->getMethod()) {
    case Luna::ccWebServerRequest::HttpMethod_Get: {
        Json::Value oResponseJsonValue;
        Json::StyledWriter oWriter;

        oResponseJsonValue["password"] = luna_getDevicePassword();

        std::string strJsonData = oWriter.write(oResponseJsonValue);

        pResponse->status(200, std::string("OK"));
        pResponse->contentType("application/javascript", strJsonData.length());
        pResponse->write(strJsonData);
        break;
    }

    case Luna::ccWebServerRequest::HttpMethod_Post: {
        Json::Reader    oReader;
        Json::Value     oRootValue;

        std::string     strJsonData;

        strJsonData.reserve(1024);

        pRequest->getContentBody(strJsonData);

        if (!oReader.parse(strJsonData, oRootValue)) {
            pResponse->status(400, std::string("400 Bad Request."), true);
            return false;
        }

        if (oRootValue["password"].isNull() == true) {
            pResponse->status(400, std::string("400 Bad Request."), true);

            return false;
        }

        if (oRootValue["password"].asString().length() == 0) {
            pResponse->status(400, std::string("400 Bad Request."), true);
            return false;
        }

        luna_setDevicePassword(oRootValue["password"].asString().c_str());

        pResponse->status(200, std::string("OK"), true);
        break;
    }
    }

    return true;
}

bool SimpleLoginRESTfulApi::rx_tx_power(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse)
{
    switch ((std::uint32_t)pRequest->getMethod()) {
    case Luna::ccWebServerRequest::HttpMethod_Get: {
        Json::Value oResponseJsonValue;
        Json::StyledWriter oWriter;

        oResponseJsonValue["rx_power"] = luna_getRxPower();
        oResponseJsonValue["tx_power"] = luna_getTxPower();

        std::string strJsonData = oWriter.write(oResponseJsonValue);

        pResponse->status(200, std::string("OK"));
        pResponse->contentType("application/javascript", strJsonData.length());
        pResponse->write(strJsonData);
        break;
    }
    }

    return true;
}

bool SimpleLoginRESTfulApi::system_reboot(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse)
{
    switch ((std::uint32_t)pRequest->getMethod()) {
    case Luna::ccWebServerRequest::HttpMethod_Get: {
        Json::Value oResponseJsonValue;
        Json::StyledWriter oWriter;

        switch (luna_getSystemRebootingStatus()) {
        case kSystemReady:            
            oResponseJsonValue["status"] = "ready";
            break;

        case kSystemRebooting:            
            oResponseJsonValue["status"] = "rebooting";
            break;            
        }
        
        std::string strJsonData = oWriter.write(oResponseJsonValue);

        pResponse->status(200, std::string("OK"));
        pResponse->contentType("application/javascript", strJsonData.length());
        pResponse->write(strJsonData);
        break;
    }

    case Luna::ccWebServerRequest::HttpMethod_Post: {
        luna_startSystemRebooting();
        pResponse->status(200, std::string("OK"), true);
        break;
    }
    }

    return true;
}


bool SimpleLoginRESTfulApi::firmware_upgrade(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse)
{
    switch ((std::uint32_t)pRequest->getMethod()) {
    case Luna::ccWebServerRequest::HttpMethod_Get: {
        Json::Value oResponseJsonValue;
        Json::StyledWriter oWriter;

        switch (luna_getFirmwareUpgradeStatus()) {
        case kUpgradeReady:
            oResponseJsonValue["status"] = "ready";
            break;

        case kFirmwareWriting:            
            oResponseJsonValue["status"] = "rebooting";
            break;

        case fUpgradeFinished:            
            oResponseJsonValue["status"] = "finished";
            break;        
        }
        
        std::string strJsonData = oWriter.write(oResponseJsonValue);

        pResponse->status(200, std::string("OK"));
        pResponse->contentType("application/javascript", strJsonData.length());
        pResponse->write(strJsonData);
        break;
    }

    case Luna::ccWebServerRequest::HttpMethod_Post: {
        if (luna_getFirmwareUpgradeStatus() != kUpgradeReady)
        {
            pResponse->status(406, std::string("Not Acceptable"), true);
            break;
        }

        if (luna_startFirmwareUpgrade("") == false)
            printf("luna_startFirmwareUpgrade() --> fail\n");
            
        pResponse->status(200, std::string("OK"), true);
        break;
    }

    case Luna::ccWebServerRequest::HttpMethod_Put:
        luna_initFirmwareUpgradeStatus();
        break;
    }

    return true;
}
