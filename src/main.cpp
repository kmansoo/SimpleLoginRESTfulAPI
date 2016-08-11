
#include <memory>

#include "ccCore/ccCoreAPI.h"
#include "ccCore/ccString.h"

#include "ccNetwork/ccNetworkManager.h"

#include "ccWebServer/ccWebServerManager.h"

#include "ccMongooseServer/ccMongooseWebServerObjectFactory.h"

#include "SimpleLoginRESTfulApi.h"

int main(int argc, char* argv[])
{
    Luna::ccNetworkManager::getInstance().init();

    //  choose a Web Server : Abstract Factory Design Pattern
    Luna::ccWebServerManager::getInstance().attachFactory(std::make_shared<Luna::ccMongooseWebServerObjectFactory>());

    auto pWebApi = std::make_shared<SimpleLoginRESTfulApi>();

    std::string web_directory = ".";

    if (argc >= 2)
        web_directory = argv[1];

    Luna::ccWebServerManager::getInstance().createWebServer("Simple Login Web Server", "8000", web_directory);
    Luna::ccWebServerManager::getInstance().addRESTfulApi(pWebApi);

    Luna::ccWebServerManager::getInstance().start();

    while (1)
        Luna::sleep(100);
}
