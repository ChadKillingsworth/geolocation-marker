/**
 * @license geolocation-marker
 * @copyright 2012, 2015 Chad Killingsworth
 * @see https://github.com/ChadKillingsworth/geolocation-marker/blob/master/LICENSE.txt
 */

/**
 * @name GeolocationMarker for Google Maps v3
 * @version version 1.1
 * @author Chad Killingsworth [chadkillingsworth at gmail.com]
 * Copyright 2012
 * @fileoverview
 * This library uses geolocation to add a marker and accuracy circle to a map.
 * The marker position is automatically updated as the user position changes.
 */

'use strict';

class GeolocationMarker extends google.maps.MVCObject {
  /**
  * @param {google.maps.Map=} opt_map
  * @param {(google.maps.MarkerOptions|Object.<string>)=} opt_outerMarkerOpts
  * @param {(google.maps.MarkerOptions|Object.<string>)=} opt_markerOpts
  * @param {(google.maps.CircleOptions|Object.<string>)=} opt_circleOpts
  */
  constructor(opt_map, opt_outerMarkerOpts, opt_markerOpts, opt_circleOpts) {
     super();

     /**
      * @private
      * @type {google.maps.Marker}
      */
     this.outerMarker_ = null;

     /**
      * @private
      * @type {google.maps.Marker}
      */
     this.marker_ = null;

     /**
      * @private
      * @type {google.maps.Circle}
      */
     this.circle_ = null;

     /**
      * @private
      * @type {number}
      */
     this.watchId_ = -1;

     var outerMarkerOpts = {
       'clickable': false,
       'cursor': 'pointer',
       'draggable': false,
       'flat': true,
       'icon': {
           'path': google.maps.SymbolPath.CIRCLE,
           'fillColor': '#C8D6EC',
           'fillOpacity': 0.7,
           'scale': 12,
           'strokeWeight': 0,
       },
       'position': new google.maps.LatLng(0, 0),
       'title': 'Current location',
       'zIndex': 2
     };

     var markerOpts = {
       'clickable': false,
       'cursor': 'pointer',
       'draggable': false,
       'flat': true,
       'icon': {
           'path': google.maps.SymbolPath.CIRCLE,
           'fillColor': '#4285F4',
           'fillOpacity': 1,
           'scale': 6,
           'strokeColor': 'white',
           'strokeWeight': 2,
       },
       // This marker may move frequently - don't force canvas tile redraw
       'optimized': false,
       'position': new google.maps.LatLng(0, 0),
       'title': 'Current location',
       'zIndex': 3
     };

     if(opt_outerMarkerOpts) {
       outerMarkerOpts = this.copyOptions_(outerMarkerOpts, opt_outerMarkerOpts);
     }

     if(opt_markerOpts) {
       markerOpts = this.copyOptions_(markerOpts, opt_markerOpts);
     }

     var circleOpts = {
       'clickable': false,
       'radius': 0,
       'strokeColor': '1bb6ff',
       'strokeOpacity': .4,
       'fillColor': '61a0bf',
       'fillOpacity': .4,
       'strokeWeight': 1,
       'zIndex': 1
     };

     if(opt_circleOpts) {
       circleOpts = this.copyOptions_(circleOpts, opt_circleOpts);
     }

     this.outerMarker_ = new google.maps.Marker(outerMarkerOpts);
     this.marker_ = new google.maps.Marker(markerOpts);
     this.circle_ = new google.maps.Circle(circleOpts);

     google.maps.MVCObject.prototype.set.call(this, 'accuracy', null);
     google.maps.MVCObject.prototype.set.call(this, 'position', null);
     google.maps.MVCObject.prototype.set.call(this, 'map', null);

     this.set('minimum_accuracy', null);

     this.set('position_options', /** GeolocationPositionOptions */
         ({enableHighAccuracy: true, maximumAge: 1000}));

     this.circle_.bindTo('map', this.outerMarker_);
     this.circle_.bindTo('map', this.marker_);

     if(opt_map) {
       this.setMap(opt_map);
     }
  }

  /**
   * @override
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
     if (GeolocationMarker.invalidPropertiesExpr_.test(key)) {
       throw '\'' + key + '\' is a read-only property.';
     } else if (key === 'map') {
       this.setMap(/** @type {google.maps.Map} */ (value));
     } else {
       google.maps.MVCObject.prototype.set.call(this, key, value);
     }
  }

  /** @return {google.maps.Map} */
  getMap() {
     return /** @type {google.maps.Map|null} */ (this.get('map'));
  }

  /** @return {GeolocationPositionOptions} */
  getPositionOptions() {
     return /** @type {GeolocationPositionOptions} */(this.get('position_options'));
  }

  /** @param {!GeolocationPositionOptions|!Object.<string, *>} positionOpts */
  setPositionOptions(positionOpts) {
     this.set('position_options', positionOpts);
  }

  /** @return {google.maps.LatLng|null} */
  getPosition() {
     return /** @type {google.maps.LatLng|null} */ (this.get('position'));
  }

  /** @return {google.maps.LatLngBounds?} */
  getBounds() {
     if (this.get('position')) {
       return this.circle_.getBounds();
     } else {
       return null;
     }
  }

  /** @return {number|null} */
  getAccuracy() {
     return /** @type {number|null} */ (this.get('accuracy'));
  }

  /** @return {number|null} */
  getMinimumAccuracy() {
     return /** @type {number|null} */ (this.get('minimum_accuracy'));
  }

  /** @param {number|null} accuracy */
  setMinimumAccuracy(accuracy) {
     this.set('minimum_accuracy', accuracy);
  }

  /** @param {google.maps.Map|null} map */
  setMap(map) {
     google.maps.MVCObject.prototype.set.call(this, 'map', map);
     if (map) {
       this.watchPosition_();
     } else {
       this.outerMarker_.unbind('position');
       this.marker_.unbind('position');
       this.circle_.unbind('center');
       this.circle_.unbind('radius');
       google.maps.MVCObject.prototype.set.call(this, 'accuracy', null);
       google.maps.MVCObject.prototype.set.call(this, 'position', null);
       navigator.geolocation.clearWatch(this.watchId_);
       this.watchId_ = -1;
       this.outerMarker_.setMap(map);
       this.marker_.setMap(map);
     }
  }

  /** @param {google.maps.MarkerOptions|Object.<string>} outerMarkerOpts */
  setOuterMarkerOptions(outerMarkerOpts) {
     this.outerMarker_.setOptions(this.copyOptions_({}, outerMarkerOpts));
  }

  /** @param {google.maps.MarkerOptions|Object.<string>} markerOpts */
  setMarkerOptions(markerOpts) {
     this.marker_.setOptions(this.copyOptions_({}, markerOpts));
  }

  /** @param {google.maps.CircleOptions|Object.<string>} circleOpts */
  setCircleOptions(circleOpts) {
     this.circle_.setOptions(this.copyOptions_({}, circleOpts));
  }

  /**
   * @private
   * @param {GeolocationPosition} position
   */
  updatePosition_(position) {
     var newPosition = new google.maps.LatLng(position.coords.latitude,
         position.coords.longitude), mapNotSet = this.marker_.getMap() == null;

     if (mapNotSet) {
       if (this.getMinimumAccuracy() != null &&
           position.coords.accuracy > this.getMinimumAccuracy()) {
         return;
       }
       this.outerMarker_.setMap(this.getMap());
       this.marker_.setMap(this.getMap());
       this.outerMarker_.bindTo('position', this);
       this.marker_.bindTo('position', this);
       this.circle_.bindTo('center', this, 'position');
       this.circle_.bindTo('radius', this, 'accuracy');
     }

     if (this.getAccuracy() != position.coords.accuracy) {
       // The local set method does not allow accuracy to be updated
       google.maps.MVCObject.prototype.set.call(this, 'accuracy',
           position.coords.accuracy);
     }

     if (mapNotSet || this.getPosition() == null ||
         !this.getPosition().equals(newPosition)) {
       // The local set method does not allow position to be updated
       google.maps.MVCObject.prototype.set.call(this, 'position', newPosition);
     }
  }

  /**
   * @private
   */
  watchPosition_() {
     if (navigator.geolocation) {
       this.watchId_ = navigator.geolocation.watchPosition(
           this.updatePosition_.bind(this),
           this.geolocationError_.bind(this),
           this.getPositionOptions());
     }
  }

  /**
   * @private
   * @param {GeolocationPositionError} data
   */
  geolocationError_(data) {
     google.maps.event.trigger(this, 'geolocation_error', data);
  }

  /**
   * @private
   * @param {Object.<string,*>} target
   * @param {Object.<string,*>} source
   * @return {Object.<string,*>}
   */
  copyOptions_(target, source) {
     for (var opt in source) {
       if (GeolocationMarker.DISALLOWED_OPTIONS[opt] !== true) {
         target[opt] = source[opt];
       }
     }
     return target;
  }
}

/**
 * @const
 * @type {Object.<string, boolean>}
 */
GeolocationMarker.DISALLOWED_OPTIONS = {
    'map': true,
    'position': true,
    'radius': true
};

/**
 * @private
 * @const
 */
GeolocationMarker.invalidPropertiesExpr_ = /^(?:position|accuracy)$/i;

export default GeolocationMarker;
