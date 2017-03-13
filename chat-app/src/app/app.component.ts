import { Component } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages: FirebaseListObservable<any[]>;

  username: string = "";
  text: string = "";
  errorMsg: string="";


  constructor(public af: AngularFire) {
    this.messages = af.database.list('/messages', {
      query: {
        orderByChild: 'ts',
        limitToLast: 15
      }
    });
  }
  
  private beginPostMessageProcess(): void {
    this.createTimeStamp()
  }
  private createTimeStamp(): void {
    //log last_message timestamp to the server. server rules prevent us posting a message if the time in this last_message table doesn't correlate to the message table. 
    //there is a global rule to block more than one message every 2 seconds, to prevent some sort of massive spam attack on the firebase database
    this.af.database.object('/last_message/').set(firebase.database.ServerValue.TIMESTAMP).then(res => this.getTimeStamp()).catch(err => this.handleError(err));
  }
  private getTimeStamp():void{
    this.af.database.object('/last_message/').take(1).subscribe(res => {
      this.postMessage(res.$value)
      }, err => this.handleError(err))
  }
  private postMessage(timestamp: any):void{
    console.log(timestamp);
      var input = {
      username: this.username,
      text: this.text,
      ts: timestamp
    }
    this.af.database.list('/messages/').push(input)
    this.clearInputFields();
  }
  private clearInputFields(): void {
    this.text = "";
    this.errorMsg = "";
  }
  private handleError(data: any){
    this.errorMsg = "Opps, please try again, perhaps wait 2 seconds ^_^ Error=>"+data.message;
  }

}