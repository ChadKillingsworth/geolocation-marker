/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

goog.provide('GeolocationMarker');

/**
 * @constructor
 * @extends {google.maps.MVCObject}
 * @param {google.maps.Map=} opt_map
 * @param {(google.maps.MarkerOptions|Object.<string>)=} opt_markerOpts
 * @param {(google.maps.CircleOptions|Object.<string>)=} opt_circleOpts
 */
var GeolocationMarker = function (opt_map, opt_markerOpts, opt_circleOpts) {

  var markerOpts = {
    'clickable': false,
    'cursor': 'pointer',
    'draggable': false,
    'flat': true,
    'icon': {
        'url': 'http://chadkillingsworth.github.io/geolocation-marker/images/gpsloc.png',
        'size': new google.maps.Size(34, 34),
        'scaledSize': new google.maps.Size(17, 17),
        'origin': new google.maps.Point(0, 0),
        'anchor': new google.maps.Point(8, 8)
    },
    // This marker may move frequently - don't force canvas tile redraw
    'optimized': false, 
    'position': new google.maps.LatLng(0, 0),
    'title': 'Current location',
    'zIndex': 2
  };

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

  this.marker_ = new google.maps.Marker(markerOpts);
  this.circle_ = new google.maps.Circle(circleOpts);

  google.maps.MVCObject.prototype.set.call(this, 'accuracy', null);
  google.maps.MVCObject.prototype.set.call(this, 'position', null);
  google.maps.MVCObject.prototype.set.call(this, 'map', null);

  
  this.set('minimum_accuracy', null);
  
  this.set('position_options', /** GeolocationPositionOptions */
      ({enableHighAccuracy: true, maximumAge: 1000}));

  this.circle_.bindTo('map', this.marker_);

  if(opt_map) {
    this.setMap(opt_map);
  }
};


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

/**
 * Init function allows the source to be included prior to the
 * maps api being loaded on the page.
 */
GeolocationMarker.Init = function() {
  goog.inherits(GeolocationMarker, google.maps.MVCObject);

  /**
   * @override
   * @param {string} key
   * @param {*} value
   */
  GeolocationMarker.prototype.set = function (key, value) {
    if (GeolocationMarker.invalidPropertiesExpr_.test(key)) {
      throw '\'' + key + '\' is a read-only property.';
    } else if (key === 'map') {
      this.setMap(/** @type {google.maps.Map} */ (value));
    } else {
      google.maps.MVCObject.prototype.set.apply(this, arguments);
    }
  };

  /**
   * @private
   * @type {google.maps.Marker}
   */
  GeolocationMarker.prototype.marker_ = null;

  /**
   * @private
   * @type {google.maps.Circle}
   */
  GeolocationMarker.prototype.circle_ = null;

  /** @return {google.maps.Map} */
  GeolocationMarker.prototype.getMap = function () {
    return /** @type {google.maps.Map|null} */ (this.get('map'));
  };

  /** @return {GeolocationPositionOptions} */
  GeolocationMarker.prototype.getPositionOptions = function () {
    return /** @type {GeolocationPositionOptions} */(this.get('position_options'));
  };

  /** @param {!GeolocationPositionOptions|!Object.<string, *>} positionOpts */
  GeolocationMarker.prototype.setPositionOptions = function (positionOpts) {
    this.set('position_options', positionOpts);
  };

  /** @return {google.maps.LatLng|null} */
  GeolocationMarker.prototype.getPosition = function () {
    return /** @type {google.maps.LatLng|null} */ (this.get('position'));
  };

  /** @return {google.maps.LatLngBounds?} */
  GeolocationMarker.prototype.getBounds = function () {
    if (this.get('position')) {
      return this.circle_.getBounds();
    } else {
      return null;
    }
  };

  /** @return {number|null} */
  GeolocationMarker.prototype.getAccuracy = function () {
    return /** @type {number|null} */ (this.get('accuracy'));
  };

  /** @return {number|null} */
  GeolocationMarker.prototype.getMinimumAccuracy = function () {
    return /** @type {number|null} */ (this.get('minimum_accuracy'));
  };

  /** @param {number|null} accuracy */
  GeolocationMarker.prototype.setMinimumAccuracy = function (accuracy) {
    this.set('minimum_accuracy', accuracy);
  };

  /**
   * @private
   * @type {number}
   */
  GeolocationMarker.prototype.watchId_ = -1;

  /** @param {google.maps.Map|null} map */
  GeolocationMarker.prototype.setMap = function (map) {
    google.maps.MVCObject.prototype.set.call(this, 'map', map);
    if (map) {
      this.watchPosition_();
    } else {
      this.marker_.unbind('position');
      this.circle_.unbind('center');
      this.circle_.unbind('radius');
      google.maps.MVCObject.prototype.set.call(this, 'accuracy', null);
      google.maps.MVCObject.prototype.set.call(this, 'position', null);
      navigator.geolocation.clearWatch(this.watchId_);
      this.watchId_ = -1;
      this.marker_.setMap(map);
    }
  };

  /** @param {google.maps.MarkerOptions|Object.<string>} markerOpts */
  GeolocationMarker.prototype.setMarkerOptions = function (markerOpts) {
    this.marker_.setOptions(this.copyOptions_({}, markerOpts));
  };

  /** @param {google.maps.CircleOptions|Object.<string>} circleOpts */
  GeolocationMarker.prototype.setCircleOptions = function (circleOpts) {
    this.circle_.setOptions(this.copyOptions_({}, circleOpts));
  };

  /**
   * @private
   * @param {GeolocationPosition} position
   */
  GeolocationMarker.prototype.updatePosition_ = function (position) {
    var newPosition = new google.maps.LatLng(position.coords.latitude,
        position.coords.longitude), mapNotSet = this.marker_.getMap() == null;

    if (mapNotSet) {
      if (this.getMinimumAccuracy() != null &&
          position.coords.accuracy > this.getMinimumAccuracy()) {
        return;
      }
      this.marker_.setMap(this.getMap());
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
  };

  /**
   * @private
   */
  GeolocationMarker.prototype.watchPosition_ = function () {
    if (navigator.geolocation) {
      this.watchId_ = navigator.geolocation.watchPosition(
          goog.bind(this.updatePosition_, this),
          goog.bind(this.geolocationError_, this),
          this.getPositionOptions());
    }
  };

  /**
   * @private
   * @param {GeolocationPositionError} data
   */
  GeolocationMarker.prototype.geolocationError_ = function (data) {
    google.maps.event.trigger(this, 'geolocation_error', data);
  };

  /**
   * @private
   * @param {Object.<string,*>} target
   * @param {Object.<string,*>} source
   * @return {Object.<string,*>}
   */
  GeolocationMarker.prototype.copyOptions_ = function (target, source) {
    for (var opt in source) {
      if (GeolocationMarker.DISALLOWED_OPTIONS[opt] !== true) {
        target[opt] = source[opt];
      }
    }
    return target;
  };
};
