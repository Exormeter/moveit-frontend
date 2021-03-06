import { Component } from '@angular/core';
import { IonicPage, ModalController, ViewController, NavController, NavParams, Platform } from 'ionic-angular';
import { GoogleMap, GoogleMaps, GoogleMapsEvent, LatLng, MarkerOptions, Marker, CameraPosition } from '@ionic-native/google-maps';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';

IonicPage()
@Component({
    selector: 'page-event-map-create',
    templateUrl: 'event-map-create.html',
})
export class EventCreateMap {

    map: GoogleMap;
    googleMaps: GoogleMaps = new GoogleMaps();
    latLng: LatLng = new LatLng(0, 0);

    geoOptions: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 500000,
        maximumAge: 10,
    };

    constructor(public geolocation: Geolocation, public navCtrl: NavController, public platform: Platform, public navParams: NavParams, public viewCtrl: ViewController, ) {
        console.log("Constructed");
    }

    ionViewDidLoad() {
        console.log("Map Modal");
        this.loadMap();
    }

    loadMap() {

        let element: HTMLElement = document.getElementById('createMap');

        this.map = this.googleMaps.create(element);
        this.map.clear();
        if (this.navParams.get("lat") == undefined) {
            this.addDraggableMarker();
        }
        else {
            this.addConstatMarker(this.navParams.get("lat"), this.navParams.get("lng"), this.navParams.get("eventName"));
        }


        //Setz die Elemnte über der Karte unsichtbar, da die Karte sonst nicht angezeigt wird
        document.getElementsByClassName("app-root")[1].setAttribute("style", "opacity:0");
    }

    //added einen Marker an der akutellen Postion
    addDraggableMarker() {
        console.log("Draggable Marker added");

        //Wird für das Promise beim MarkerDragEvent gebraucht
        let eventCreateMap: EventCreateMap = this;

        this.geolocation.getCurrentPosition(this.geoOptions).then((resp) => {
            console.log(resp);
            let lat: number = resp.coords.latitude;
            let long: number = resp.coords.longitude;
            let myPosLatLong: LatLng = new LatLng(lat, long);
            this.latLng = myPosLatLong;
            let position: CameraPosition = {
                target: myPosLatLong,
                zoom: 18,
                tilt: 30
            };
            this.map.moveCamera(position);
            let markerOptions: MarkerOptions = {
                position: myPosLatLong,
                title: 'Event',
                draggable: true
            };

            this.map.addMarker(markerOptions).then((marker: Marker) => {
                this.latLng = marker.get('position') //falls der Marker nicht gedragged wird

                marker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe(function () {
                    marker.getPosition().then(function (pos: LatLng) {
                        eventCreateMap.latLng = pos;
                        console.log('Promise LatLng Fullfilled');
                    }).catch(function (error) {
                        console.log(error);
                    });
                });
            });
        });
    }

    addConstatMarker(lat: number, lng: number, eventName: string) {
        let myPosLatLong: LatLng = new LatLng(lat, lng);
        this.latLng = myPosLatLong;
        let position: CameraPosition = {
            target: myPosLatLong,
            zoom: 18,
            tilt: 30
        };
        this.map.moveCamera(position);
        let markerOptions: MarkerOptions = {
            position: myPosLatLong,
            title: eventName
        };
        this.map.addMarker(markerOptions);
    }

    //entfert den Marker, da die Map als Singelton geladen wird und somit
    //alle Änderungen an der Karte auch im regulären MapView angezeigt würden
    confirmLocation() {
        this.viewCtrl.dismiss({
            latitude: this.latLng.lat,
            longitude: this.latLng.lng

        });
    }

    ionViewDidLeave() {
        this.map.clear();
        document.getElementsByClassName("app-root")[1].setAttribute("style", "opacity:1");
    }
}