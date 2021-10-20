import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";


const config: SocketIoConfig = {url: 'http://192.168.0.9:3000', options: {}};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    SocketIoModule.forRoot(config),
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}