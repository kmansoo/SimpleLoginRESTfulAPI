#ifndef __LUNA_SIMPLE_LOGIN_RESTFUL_API_H__
#define __LUNA_SIMPLE_LOGIN_RESTFUL_API_H__

/*
* SimpleLoginRESTfulApi.h
*
*  Created on: 2016. 8. 11.
*      Author: Mansoo Kim(mansoo.kim@icloud.com)
*/

#include "ccWebServer/ccRESTfulApi.h"


class SimpleLoginRESTfulApi :
    public Luna::ccRESTfulApi
{
public:
    SimpleLoginRESTfulApi();

protected:
    bool users(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse);
    bool password(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse);
    bool rx_tx_power(std::shared_ptr<Luna::ccWebServerRequest> pRequest, std::shared_ptr<Luna::ccWebServerResponse> pResponse);

protected:
    std::string device_password_;
};

#endif // !__LUNA_SIMPLE_LOGIN_RESTFUL_API_H__
