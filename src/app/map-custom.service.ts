import {Injectable, EventEmitter} from '@angular/core';
import * as mapboxgl from 'mapbox-gl' ;
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Socket} from "ngx-socket-io";

@Injectable({
  providedIn: 'root'
})
export class MapCustomService {
  cbAddress: EventEmitter<any> = new EventEmitter<any>();

  mapbox = (mapboxgl as typeof mapboxgl);
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat =14.2917827;
  lng = -89.9047073;
  zoom = 13;
  wayPoints: Array<any> = [];
  markerDriver: any = null;

  rutaTunas: any []=[
    [-89.90828285149499,14.298034832797825],
    [-89.90562210016701,14.29445840780059],
    [-89.90188846523907,14.29366825972215],
    [-89.89914188322312,14.292171129433752],
    [-89.89828357634313,14.291588909407917],
    [-89.89691028533515,14.290881925921818],
    [-89.89575157104719,14.288220321103672],
    [-89.89180335939925,14.287721266694483],
    [-89.89111671389527,14.2877628546042],
    [-89.89055881442326,14.287970794037463],
    [-89.89025840701528,14.287263799180247],
    [-89.8890996927273,14.287139035151313],
    [-89.88931426944728,14.286390449524717],
    [-89.88785514775132,14.284726916993481],
    [-89.88523731176737,14.283437670823185],
    [-89.88116035408743,14.28148299318752]
    
];
  

  constructor(private httpClient: HttpClient, private socket: Socket) {
    this.mapbox.accessToken = environment.mapPk;
  }

  buildMap(): Promise<any> {
    /**
     * TODO: Aqui construimos el mapa
     */
    return new Promise((resolve, reject) => {
      try {
        this.map = new mapboxgl.Map({
          container: 'map',
          style: this.style,
          zoom: this.zoom,
          center: [this.lng, this.lat]
        });

        // this.map.addControl(new mapboxgl.NavigationControl())

        /**
         *  TODO: Aqui construimos el input buscador de direcciones
         */
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl
        });

        // *************
        geocoder.on('result', ($event) => {
          const {result} = $event;
          geocoder.clear();
          console.log('*********', result)
          this.cbAddress.emit(result);
        })

        resolve({
          map: this.map,
          geocoder
        });

      } catch (e) {
        reject(e);
      }
    });
  }

  loadCoords(coords): void {

    const url = [
      `https://api.mapbox.com/directions/v5/mapbox/driving/`,
      `${coords[0][0]},${coords[0][1]};${coords[1][0]},${coords[1][1]}`,
      `?steps=true&geometries=geojson&access_token=${environment.mapPk}`,
    ].join('');
//`,-89.8939141,14.2876664;-89.8829917,14.2811682`,
    this.httpClient.get(url).subscribe((res: any) => {


      const data = res.routes[0];
      const route =this.rutaTunas;
     
      console.log('RUTA',route);
      console.log('RUTA T',this.rutaTunas);
      
      
      this.map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        }
      });

//pinta la ruta en el mapa
      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': 'red',
          'line-width': 8
        }
      });

      this.wayPoints = route;
      this.map.fitBounds([route[0], route[route.length - 1]], {
        padding: 70
      });

      this.socket.emit('find-driver', {points: route});

    });


  }

  addMarkerCustom(coords): void {
    console.log('----->', coords)
    const el = document.createElement('div');
    el.className = 'marker';
    if (!this.markerDriver) {
      this.markerDriver = new mapboxgl.Marker(el);
    } else {
      this.markerDriver
        .setLngLat(coords)
        .addTo(this.map);
    }
  }
}
