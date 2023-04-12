import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  name: string;
}
@Component({
  selector: 'app-newchat-dialog',
  templateUrl: './newchat-dialog.component.html',
  styleUrls: ['./newchat-dialog.component.css']
})
export class NewchatDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<NewchatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}