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

SimpleLoginRESTfulApi::SimpleLoginRESTfulApi()
{
    addAPI(std::string("/api/users/*"), std::bind(&SimpleLoginRESTfulApi::users, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/password"), std::bind(&SimpleLoginRESTfulApi::password, this, std::placeholders::_1, std::placeholders::_2));
    addAPI(std::string("/api/system/rx_tx_power"), std::bind(&SimpleLoginRESTfulApi::rx_tx_power, this, std::placeholders::_1, std::placeholders::_2));

    device_password_ = "password";
}

bool SimpleLoginRESTfulApi::users(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse)
{
    switch ((std::uint32_t)pRequest->getMethod())
    {
    case Luna::ccWebServerRequest::HttpMethod_Get:
    {
        //  I'll implement this method as soon as possible.
        std::string strUserID = pRequest->getResource();

        if (strUserID == "root")
        {
            Json::Value oResponseJsonValue;
            Json::StyledWriter oWriter;

            oResponseJsonValue["user"] = strUserID;
            oResponseJsonValue["password"] = BZF::md5("admin");

            std::string strJsonData = oWriter.write(oResponseJsonValue);

            pResponse->status(200, std::string("OK"));
            pResponse->contentType("application/javascript", strJsonData.length());
            pResponse->write(strJsonData);
        }
        else
            pResponse->status(404, std::string("not found."), true);
    }
    break;
    }

    return true;
}

bool SimpleLoginRESTfulApi::password(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse)
{
    switch ((std::uint32_t)pRequest->getMethod())
    {
    case Luna::ccWebServerRequest::HttpMethod_Get:
    {
        Json::Value oResponseJsonValue;
        Json::StyledWriter oWriter;

        oResponseJsonValue["password"] = device_password_;

        std::string strJsonData = oWriter.write(oResponseJsonValue);

        pResponse->status(200, std::string("OK"));
        pResponse->contentType("application/javascript", strJsonData.length());
        pResponse->write(strJsonData);
    }
    break;

    case Luna::ccWebServerRequest::HttpMethod_Post:
    {
        Json::Reader    oReader;
        Json::Value     oRootValue;

        std::string     strJsonData;

        strJsonData.reserve(1024);

        pRequest->getContentBody(strJsonData);

        if (!oReader.parse(strJsonData, oRootValue))
        {
            pResponse->status(400, std::string("400 Bad Request."), true);
            return false;
        }

        if (oRootValue["password"].isNull() == true)
        {
            pResponse->status(400, std::string("400 Bad Request."), true);

            return false;
        }

        device_password_ = oRootValue["password"].asString();

        if (device_password_.length() == 0)
        {
            pResponse->status(400, std::string("400 Bad Request."), true);
            return false;
        }

        pResponse->status(200, std::string("OK"), true);
    }
    break;
    }

    return true;
}

bool SimpleLoginRESTfulApi::rx_tx_power(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse)
{
    switch ((std::uint32_t)pRequest->getMethod())
    {
    case Luna::ccWebServerRequest::HttpMethod_Get:
    {
        Json::Value oResponseJsonValue;
        Json::StyledWriter oWriter;

        oResponseJsonValue["rx_power"] = "-17 dBm";
        oResponseJsonValue["tx_power"] = "-20 dBm";

        std::string strJsonData = oWriter.write(oResponseJsonValue);

        pResponse->status(200, std::string("OK"));
        pResponse->contentType("application/javascript", strJsonData.length());
        pResponse->write(strJsonData);
    }
    break;
    }

    return true;
}
