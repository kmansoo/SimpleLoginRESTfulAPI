# SimpleLoginRESTfulAPI
This project aims to show how to use login, logout and system configuration using RESTful API with Luna, AngularJS and Bootstrap.

# How to build
## Win32
You can find and use a solution file for visual studio 2005 like './msvs/2005/SimpleLoginRESTfulAPI.sin'.

## macOS(OS X) and Linux(i386 and Raspberry Pi2)
```bash
mkdir build
cd build
cmake ..
make -j4
```
# How to test
```bash
./bin/SimpleLoginRESTfulAPI ../html/
```
You can connect to this Web Server using Web browser after executing this application.
The default port of Web Server is 8000, so you must use this url: http://localhost:8000
And this Web Server requires the username and password to login.
Default username and password are:
```bash
username: root
password: admin
```

# Reference Sources
1. AngularJS User Registration and Login Example & Tutorial: https://github.com/cornflourblue/angular-registration-login-example
2. Mongoose Embedded Web Server Library: https://github.com/cesanta/mongoose

