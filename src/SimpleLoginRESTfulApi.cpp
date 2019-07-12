/*
* SimpleLoginRESTfulApi.cpp
*
*  Created on: 2016. 8. 11.
*      Author: Mansoo Kim(mansoo.kim@icloud.com)
*/

#include "SimpleLoginRESTfulApi.h"

#include "json/value.h"
#include "json/reader.h"
#include "json/writer.h"

#include "md5/md5.h"

#include "Definitions.h"
#include "fake_device/fake_device.h"

SimpleLoginRESTfulApi::SimpleLoginRESTfulApi() {
    addAPI(std::string("/api/users/*"), std::bind(&SimpleLoginRESTfulApi::users, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/password"), std::bind(&SimpleLoginRESTfulApi::password, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/rx_tx_power"), std::bind(&SimpleLoginRESTfulApi::rx_tx_power, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/reboot"), std::bind(&SimpleLoginRESTfulApi::system_reboot, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/firmware_upgrade"), std::bind(&SimpleLoginRESTfulApi::firmware_upgrade, this, std::placeholders::_1, std::placeholders::_2));
}

bool SimpleLoginRESTfulApi::users(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse) {
    switch ((std::uint32_t)pRequest->get_method()) {
    case Luna::ccWebServerRequest::HttpMethod_Get:
    {
        //  I'll implement this method as soon as possible.
        std::string strUserID = pRequest->get_resource();

        if (strUserID == luna_getLoginID()) {
            Json::Value response_json_value;
            Json::StyledWriter json_writer;

            response_json_value["user"] = strUserID;
            response_json_value["password"] = BZF::md5(luna_getLoginPassword());

            std::string json_data = json_writer.write(response_json_value);

            pResponse->send_status(200, std::string("OK"));
            pResponse->send_content_type("application/javascript", json_data.length());
            pResponse->send_content(json_data);

            //  for test
            luna_initDeviceStatus();
        } else
            pResponse->send_status(404, std::string("not found."), true);

        break;
    }
    }

    return true;
}

bool SimpleLoginRESTfulApi::password(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse) {
    switch ((std::uint32_t)pRequest->get_method()) {
    case Luna::ccWebServerRequest::HttpMethod_Get:
    {
        Json::Value response_json_value;
        Json::StyledWriter json_writer;

        response_json_value["password"] = luna_getDevicePassword();

        std::string json_data = json_writer.write(response_json_value);

        pResponse->send_status(200, std::string("OK"));
        pResponse->send_content_type("application/javascript", json_data.length());
        pResponse->send_content(json_data);
        break;
    }

    case Luna::ccWebServerRequest::HttpMethod_Post:
    {
        Json::Reader    json_reader;
        Json::Value     root_value;

        std::string     json_data;

        json_data.reserve(1024);

        pRequest->get_content_body(json_data);

        if (!json_reader.parse(json_data, root_value)) {
            pResponse->send_status(400, std::string("400 Bad Request."), true);
            return false;
        }

        if (root_value["password"].isNull() == true) {
            pResponse->send_status(400, std::string("400 Bad Request."), true);

            return false;
        }

        if (root_value["password"].asString().length() == 0) {
            pResponse->send_status(400, std::string("400 Bad Request."), true);
            return false;
        }

        luna_setDevicePassword(root_value["password"].asString().c_str());

        pResponse->send_status(200, std::string("OK"), true);
        break;
    }
    }

    return true;
}

bool SimpleLoginRESTfulApi::rx_tx_power(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse) {
    switch ((std::uint32_t)pRequest->get_method()) {
    case Luna::ccWebServerRequest::HttpMethod_Get:
    {
        Json::Value response_json_value;
        Json::StyledWriter json_writer;

        response_json_value["rx_power"] = luna_getRxPower();
        response_json_value["tx_power"] = luna_getTxPower();

        std::string json_data = json_writer.write(response_json_value);

        pResponse->send_status(200, std::string("OK"));
        pResponse->send_content_type("application/javascript", json_data.length());
        pResponse->send_content(json_data);
        break;
    }
    }

    return true;
}

bool SimpleLoginRESTfulApi::system_reboot(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse) {
    switch ((std::uint32_t)pRequest->get_method()) {
    case Luna::ccWebServerRequest::HttpMethod_Get:
    {
        Json::Value response_json_value;
        Json::StyledWriter json_writer;

        switch (luna_getSystemRebootingStatus()) {
        case kSystemReady:
            response_json_value["status"] = "ready";
            break;

        case kSystemRebooting:
            response_json_value["status"] = "rebooting";
            break;
        }

        std::string json_data = json_writer.write(response_json_value);

        pResponse->send_status(200, std::string("OK"));
        pResponse->send_content_type("application/javascript", json_data.length());
        pResponse->send_content(json_data);
        break;
    }

    case Luna::ccWebServerRequest::HttpMethod_Post:
    {
        luna_startSystemRebooting();
        pResponse->send_status(200, std::string("OK"), true);
        break;
    }
    }

    return true;
}

bool SimpleLoginRESTfulApi::firmware_upgrade(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse) {
    switch ((std::uint32_t)pRequest->get_method()) {
    case Luna::ccWebServerRequest::HttpMethod_Get:
    {
        Json::Value response_json_value;
        Json::StyledWriter json_writer;

        switch (luna_getFirmwareUpgradeStatus()) {
        case kUpgradeReady:
            response_json_value["status"] = "ready";
            break;

        case kFirmwareWriting:
            response_json_value["status"] = "rebooting";
            break;

        case fUpgradeFinished:
            response_json_value["status"] = "finished";
            break;
        }

        std::string json_data = json_writer.write(response_json_value);

        pResponse->send_status(200, std::string("OK"));
        pResponse->send_content_type("application/javascript", json_data.length());
        pResponse->send_content(json_data);
        break;
    }

    case Luna::ccWebServerRequest::HttpMethod_Post:
    {
        if (luna_getFirmwareUpgradeStatus() != kUpgradeReady) {
            pResponse->send_status(406, std::string("Not Acceptable"), true);
            break;
        }

        if (luna_startFirmwareUpgrade("") == false)
            printf("luna_startFirmwareUpgrade() --> fail\n");

        pResponse->send_status(200, std::string("OK"), true);
        break;
    }

    case Luna::ccWebServerRequest::HttpMethod_Put:
        luna_initFirmwareUpgradeStatus();
        break;
    }

    return true;
}
