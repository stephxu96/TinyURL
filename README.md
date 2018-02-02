# TinyURL

## Purpose:

Provides a URL shortening service that encodes the hostname and path of a URL into a short alphanumeric sequence of 5 characters. (i.e. www.facebook.com => 8wrsd)

## Design Flow

![alt text](https://github.com/stephxu96/TinyURL/blob/master/FullStack_Diagram.png?raw=true "Deisgn Flowchart")

As shown in the chart, the client-side of this web application is built with AngularJS framework, providing a user interface to convert url's into tinyURL's. 

Shortening conversion is performed on the server using a randomized sequence generation algorithm, providing a total of (10 + 26 * 2)^5 tinyURL's options. Converted url's are stored in the database to prevent multiple conversions of the same url.

Accessing the tinyURL through a browser would retrieve and redirect to its original counterpart through a new window.

## Database 

Mongodb schema:

Collection: "urls"

'''{
  "__id": {
    "$old": "xxxxxxxxxxx"
  },
  "longUrl": "www.facebook.com",
  "tinyuRL": "8wrsd"
}
'''


## REST API

> url: "http://localhost:[portNum]/api"

> method: "POST"

> data: {"url": [longUrl]}

## Test and Run

From git shell or terminal, run:

> $ git clone https://github.com/stephxu96/TinyURL.git

> $ cd TinyURL

> $ npm install


> $ npm run dev

With currently specified environmental variables, the web app will run on Port 8080 at http://localhost:8080/


## Sample url conversion

www.facebook.com => http://localhost:8080/8wrsd
