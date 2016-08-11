# CMake Version
CMAKE_MINIMUM_REQUIRED (VERSION 2.8)

# Project Name
PROJECT(SimpleLoginRESTfulAPI)

# Configuration
include_directories(
	./ 
	./dependency/Luna/Library 
	./dependency/Luna/FossLibrary
	./dependency/Luna/ThirdPartyLibrary
	./dependency/Luna/ProductLibrary)

add_executable (SimpleLoginRESTfulAPI
    src/main.cpp
    src/SimpleLoginRESTfulApi.cpp
)

TARGET_LINK_LIBRARIES(SimpleLoginRESTfulAPI
	ccMongooseServer
	ccWebsocketClient
	ccJsonParser
	ccWebServer
	ccCore
	pthread
)  # SimpleLoginRESTfulAPI now depends on ccCore ... and ccMongooseServer

add_custom_command(
	TARGET SimpleLoginRESTfulAPI POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E -R copy
    	${CMAKE_CURRENT_SOURCE_DIR}/html
        ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/
)
