# CMake Version
CMAKE_MINIMUM_REQUIRED (VERSION 2.8)

# Project Name
PROJECT(SimpleLoginRESTfulAPI)

# Configuration
# Set Build Directories
SET(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
SET(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
SET(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

include_directories(
	./ 
	./dependency/Luna/src/Library/ccCore/include
	./dependency/Luna/src/Library/ccNetwork/include
	./dependency/Luna/src/Library/ccWebServer/include
	./dependency/Luna/src/FossLibrary/ccJsonParser/include
	./dependency/Luna/src/ThirdPartyLibrary/ccMongooseServer/include
)

#
# To build with a release mode, cmake -DCMAKE_BUILD_TYPE=Release ..
#
if(NOT CMAKE_BUILD_TYPE) 
  set(CMAKE_BUILD_TYPE Debug)
endif(NOT CMAKE_BUILD_TYPE)

# Check OS and Processor Information 
#
SET(CMAKE_CXX_FLAGS "-std=c++11")
ADD_DEFINITIONS(-Wall -DCALIB_CFG_OS="${CMAKE_SYSTEM_NAME}" -DCALIB_CFG_CPU="${CMAKE_SYSTEM_PROCESSOR}")

link_directories(${CMAKE_LIBRARY_OUTPUT_DIRECTORY})

#
# Make Libraries
#
ADD_SUBDIRECTORY(dependency/Luna)

add_executable (SimpleLoginRESTfulAPI
    src/main.cpp
    src/SimpleLoginRESTfulApi.cpp
    src/fake_device/fake_device.cpp
    src/md5/md5.cpp
)

TARGET_LINK_LIBRARIES(SimpleLoginRESTfulAPI
	ccMongooseServer
	ccJsonParser
	ccWebServer
	ccNetwork
	ccCore
	pthread
)  # SimpleLoginRESTfulAPI now depends on ccCore ... and ccMongooseServer

