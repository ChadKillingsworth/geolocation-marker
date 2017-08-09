# Geolocation Marker for Google Maps API v3

This library uses geolocation to add a marker and accuracy circle to a map. The marker position is automatically updated as the user position changes.

## Obtaining the Library

### Direct download
Download the [latest release files](https://github.com/ChadKillingsworth/geolocation-marker/releases/tag/v2.0.5) directly.

For most users, all you really need is the [geolocation-marker.js](https://github.com/ChadKillingsworth/geolocation-marker/releases/download/v2.0.5/geolocation-marker.js) file.
This is the prebuilt source that works in all supported browsers.

### npm
This library is published on [npm](https://www.npmjs.com/package/geolocation-marker):

    npm install geolocation-marker

### Bower
This repo no longer contains the compiled source files. To install the library using bower, use the release distributable url:

    bower install https://github.com/ChadKillingsworth/geolocation-marker/releases/download/v2.0.5/geolocation-marker.tgz

## Example Usage

![GeolocationMarker example](https://chadkillingsworth.github.io/geolocation-marker/images/example.png)

To add the Geolocation Marker, just instantiate a new GeolocationMarker object, passing the constructor your map object:

```JavaScript
var mapOptions = {
  zoom: 17,
  center: new google.maps.LatLng(-34.397, 150.644),
  mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map = new google.maps.Map(document.getElementById('map_canvas'),
    mapOptions);
var GeoMarker = new GeolocationMarker(map);
```

[See the example](https://chadkillingsworth.github.io/geolocation-marker/test/example.html).

*Note: This library will only function in browsers supporting the W3C Geolocation API. This excludes Internet Explorer versions 8 and older.*

[Reference documentation](https://chadkillingsworth.github.io/geolocation-marker/docs/reference.html)

## Modules
The source now uses ES6 modules. It may be included in a build with an ES6 import.

The compiled source now uses a UMD pattern so that it is compatible with both AMD and commonjs
modules. However, the library depends on the Google Maps API. The maps api must be defined prior to the GeolocationMarker inclusion.
