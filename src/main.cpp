
#include <memory>

#include "ccCore/ccCoreAPI.h"
#include "ccCore/ccString.h"

#include "ccNetwork/ccNetworkManager.h"

#include "ccWebServer/ccWebServerManager.h"
#include "ccWebServer/ccWebServerPageDirectory.h"
#include "ccWebServer/ccWebServerFileUploadPage.h"

#include "ccMongooseServer/ccMongooseWebServerObjectFactory.h"

#include "SimpleLoginRESTfulApi.h"

class FirmwareUploadPage : public Luna::ccWebServerFileUploadPage
{
public:
    FirmwareUploadPage() : ccWebServerFileUploadPage("/upload_firmware", "mskim.dat") {}
};

int main(int argc, char* argv[])
{
    Luna::ccNetworkManager::getInstance().init();

    //  choose a Web Server : Abstract Factory Design Pattern
    Luna::ccWebServerManager::getInstance().attachFactory(std::make_shared<Luna::ccMongooseWebServerObjectFactory>());

    auto pWebApi = std::make_shared<SimpleLoginRESTfulApi>();

    std::string web_directory_path = "./html";

    if (argc >= 2)
        web_directory_path = argv[1];

    auto pageDirecotry = std::make_shared<Luna::ccWebServerPageDirectory>();

    pageDirecotry->registerPage(std::make_shared<FirmwareUploadPage>());

    Luna::ccWebServerManager::getInstance().createWebServer("Simple Login Web Server", "8000", web_directory_path, pageDirecotry);
    Luna::ccWebServerManager::getInstance().addRESTfulApi(pWebApi);

    Luna::ccWebServerManager::getInstance().start();

    while (1)
        Luna::sleep(100);
}
