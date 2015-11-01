# Geolocation Marker for Google Maps API v3

This library uses geolocation to add a marker and accuracy circle to a map. The marker position is automatically updated as the user position changes.

![GeolocationMarker example](http://chadkillingsworth.github.io/geolocation-marker/images/example.png)

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

[See the example](http://chadkillingsworth.github.io/geolocation-marker/test/example.html).

*Note: This library will only function in browsers supporting the W3C Geolocation API. This excludes Internet Explorer versions 8 and older.*

[Reference documentation](http://chadkillingsworth.github.io/geolocation-marker/docs/reference.html)

## Modules
The source now uses ES6 modules. It may be included in a build with an ES6 import.

The compiled source now uses a UMD pattern so that it is compatible with UMD and commonjs
modules. However, the library depends on the Google Maps API. The maps api must be defined prior to the GeolocationMarker inclusion.
