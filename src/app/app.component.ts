import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {MapCustomService} from "./map-custom.service";
import {Socket} from "ngx-socket-io";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('asGeoCoder') asGeoCoder: ElementRef;
  modeInput = 'start';
  wayPoints: WayPoints = {start: null, end: null};

  constructor(private mapCustomService: MapCustomService, private renderer2: Renderer2,
              private socket: Socket) {
  }

  ngOnInit(): void {
    
    this.mapCustomService.buildMap()
      .then(({geocoder, map}) => {
        // this.asGeoCoder
        this.renderer2.appendChild(this.asGeoCoder.nativeElement,
          geocoder.onAdd(map)
        );


        console.log('*** TODO BIEN *****');
      })
      .catch((err) => {
        console.log('******* ERROR ******', err);
      });

    this.mapCustomService.cbAddress.subscribe((getPoint) => {
      if (this.modeInput === 'start') {
        this.wayPoints.start = getPoint;
      }
      if (this.modeInput === 'end') {
        this.wayPoints.end = getPoint;
      }
    });

    this.socket.fromEvent('position')
      .subscribe((coords: string) => {
        const newCord=coords.split(',');
       const cors =[parseFloat(newCord[1]),parseFloat(newCord[0])];
       console.log('Server:', cors);
        this.mapCustomService.addMarkerCustom(cors);
      });

      this.socket.fromEvent('message')
      .subscribe((ms) => {
        console.log('Message server: ', ms);
        
      });


      


      

      
  }

  

  drawRoute(): void {
    console.log('***** PUNTOS de ORIGEN y DESTINO', this.wayPoints)
    const coords = [
      [-89.8939141,14.2876664],
      [-89.8829917,14.2811682]
    ];
    console.log(coords);
    
    this.mapCustomService.loadCoords(coords);
  }

  changeMode(mode: string): void {
    this.modeInput = mode;
  }

  testMarker(): void {
    this.mapCustomService.addMarkerCustom([-8.628139488926513, 41.159082702543635]);
  }


  



  
}





export class WayPoints {
  start: any;
  end: any
}