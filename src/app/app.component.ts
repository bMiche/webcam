import { Component } from '@angular/core';
import {WebcamImage} from 'ngx-webcam';
import {Subject, Observable} from 'rxjs';
import Tesseract from 'tesseract.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'websocket';
  loginUserData = { email: "", password:""}
  display: string | undefined

  constructor() {
  }

  loginUser() {
    console.log('login user')
    if (true) {
      this.display = 'success'
    } else {
      this.display = 'email and password do not match'
    }
  }


  private trigger: Subject<void> = new Subject<void>()
  private scanSuccessful: boolean
  private fuelTypes = ['Angular'] //do not use spacebars in here
  private fuelTypeResult: string
  private scanInProgress = []
  cameraSwitch: boolean = true
  displayProgress: string | undefined

  async activateLoop() {
    this.displayProgress = "scanning..."
    this.scanSuccessful = false
    this.scanInProgress = []
    //takes 8 pictures in total (1 every 750ms)
    for (let i = 0; i < 8; i++) {
      this.trigger.next()
      await new Promise(resolve => setTimeout(resolve, 750));
      if (this.scanSuccessful) break;
    }
    //waits for all pictures (8) to be processed or a successful scan
    while(this.scanInProgress.length < 8 && !this.scanSuccessful) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (this.scanSuccessful) {
      this.displayProgress = this.fuelTypeResult + 'was found!'
    } else {
      this.displayProgress = 'scan was unsuccessful'
    }
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable()
  }

  //scans image for text
  analyseImage(webcamImage: WebcamImage) {
    Tesseract.recognize(
      webcamImage.imageAsDataUrl,
      'eng'
    ).then(res => {
      const text = res.data.text
      text.split(" ").join("") //remove spacebars from string
      console.log(text)
      for (let i = 0; i < this.fuelTypes.length; i++) { //search for fuelTypes in String
        if (text.search(this.fuelTypes[i]) != -1) {
          this.scanSuccessful = true;
          this.fuelTypeResult = this.fuelTypes[i]
        }
        this.scanInProgress.push(0)
      }
    })
  }
}
