import { Component, OnInit,OnChanges,Inject, SimpleChanges,ChangeDetectionStrategy,HostListener } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import {UploadserviceService} from '../uploadservice.service';
import Swal from 'sweetalert2'
import {trigger,state,style,transition,animate  } from '@angular/animations'
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

export interface DialogData {
  
  source_log: string;
  destination_countcheck:boolean;
  countcheck:boolean;
  nullcheck:boolean;
  duplicate:boolean;
  datavalidation:boolean;log:string;
  datavalidation_pass:boolean;
  ddlcheck_pass:boolean;
  ddlcheck:boolean;
  key_src:Array<any>;
  value_src:Array<any>;
  case_log_id:number;
}

import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-startup',
  templateUrl: './startup.component.html',
  styleUrls: ['./startup.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  animations:[
    trigger('divState',[
      state('normal',style({
        'background-color':'transarent',
        transform:'translateX(0px)'
      })),
      state('high',
      style({
        backgroundColor:'black',
        transform:'translateX(0px)'
      })),
      transition('normal => high', [
        style({transform: 'translateX(-100%)'}),
        animate(100)
    ]),
     
    ])
  ]
})


export class StartupComponent implements OnInit {
  panelOpenState = false;
  id:any;
  all_test_suite:any=[]
  arr1:any=[]
  playButtons: Array<boolean>=[]
  playButtons2: Boolean[][] = new Array();
  temparr:Array<Boolean>=[]
  p: number = 1;
  show:Array<boolean>=[]
  show2:Array<Boolean>=[]
  z:number;
  q:number=1;
  res:string="sas"
  countcheck:boolean=true;
  nullcheck:boolean=true;
  duplicate:boolean=true;
  datavalidation_pass:boolean=true;
  ddlcheck_pass:boolean=true;
  datavalidation:boolean=true;
  ddlcheck:boolean=true;
  keys_src=[]
  value_src=[]
  first_obj=[]
  parsed_obj=""
  stilload=false;
  t:number;
  times:any;

  len:number;
  constructor( private router:Router,
    private fileUploadService:UploadserviceService,
    private spinnerService: Ng4LoadingSpinnerService,
    public dialog: MatDialog) { }


  ngOnInit() {
    this.Initialize()
    
  }

  suitestatusopen(x){
    console.log("suite"+x+"is opened")
    localStorage.setItem('suite'+x,x)
  }  
  suitestatusclose(x){
    console.log("suite"+x+"is closed")
    localStorage.removeItem('suite'+x)
  }
  checkstatus(x){
    if(x == localStorage.getItem('suite'+x)){
      return 'true'
    }

  }

  starttimer(){
    clearInterval(this.times)
 this.times=setInterval(()=>{
     this.Initialize();
  },39000)

  }

  Initialize(){
    this.id=localStorage.getItem('id')
    this.fileUploadService.getSuiteById(this.id).subscribe(data => {
      if(data.success){
        this.stilload=false;    
      this.all_test_suite=data.suites.user
      // this.all_test_suite.expandCol = localStorage.getItem("col");
      console.log(this.all_test_suite)
       this.arr1=[]
      for (var i=0;i<this.all_test_suite.length;i++)
      {
        this.arr1.push(this.all_test_suite[i]['test_case_list']) //TO DO:HARD CODED.['Test Class']
        this.playButtons[i]=true;
        this.show[i]=true;
      }
   
      this.playButtons2 = new Array();
      this.show2=[]
      for(var i=0;i<this.arr1.length;i++)
      {
        this.temparr=[]
        this.show2.push(true)
        for(var j=0;j<this.arr1[i].length;j++)
        {
          this.temparr.push(true)
          
        }
        this.playButtons2.push(this.temparr)
      }

      }
   });
  }
  ToHome(){
    this.router.navigate(['home'])
  }
  ToDB(){
    this.router.navigate(['db'])
  }
  executeTestCase(test_Suite_id,event:Event,x){
    event.stopPropagation();
    // this.spinnerService.show();
    this.show2[x]=false;
    this.playButtons[x]=!this.playButtons[x]
    this.fileUploadService.ExecuteTestbySuiteId(test_Suite_id).subscribe(data=>{
      if(data.success)
      {         this.starttimer();

        // this.spinnerService.hide();       
        this.playButtons[x]=!this.playButtons[x]
      this.show2[x]=true;

        Swal("Success","Test Done Succesfully","success")
  
      }
      else{
      this.Initialize()
        Swal("error","Something went wrong","error")

      }
    },err=>{
      console.log("error")
    })
  }
  executeTestByCaseId(test_case_id,event:Event,z,x){
    event.stopPropagation();
    console.log(x)
    this.playButtons2[x][z]=false
    this.show[x]=false;
    this.fileUploadService.ExecuteTestbyCaseId(test_case_id).subscribe(data=>{
      if(data.success)
      {
        this.show[x]=true;
        this.playButtons2[x][z]=true
        this.Initialize();
        this.starttimer();
        Swal("Success","Test Done Succesfully","success")
  
      }
      else{
        this.Initialize();
        Swal("error","Something went wrong","error")

      }
    })
  }

  getcolor(x){
    switch(x){
      case 0:
      return 'blue';
      case 1:
      return '#45CE30';
      case 2:
      return "#E84342";
      case 3:
      return '#F7861B'
      case 4:
      return 'red';
    }

  }
  @HostListener("window:scroll", []) onWindowScroll() {
    this.scrollFunction();
  }
  // When the user scrolls down 20px from the top of the document, show the button
scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
} 
showlog(test_name,case_log){
  console.log(case_log)
  if (test_name =='CountCheck'){
    this.countcheck=false
    this.nullcheck=true
    this.datavalidation=true
    this.datavalidation_pass=true
    this.ddlcheck_pass=true
    this.duplicate=true
    this.ddlcheck=true
  }
  else if (test_name == 'NullCheck'){
    this.value_src=[]

    this.countcheck=true
    this.nullcheck=false
    this.datavalidation=true
    this.datavalidation_pass=true
    this.ddlcheck_pass=true
    this.duplicate=true
    this.ddlcheck=true
    if(case_log.destination_log==null){
      //pass
      console.log("in null")
    }
    else{
      console.log(case_log.destination_log)
      // this.len=eval(case_log.destination_log).length
      // JSON.parse(case_log.)
      // for(var i=0;i<this.len;i++){
      //   this.first_obj=(JSON.parse(String(this.parsed_obj)))
      //   this.value_src.push(Object.values()
      // }
    }
 
  }
  else if (test_name == "DuplicateCheck"){
    this.countcheck=true
    this.nullcheck=true
    this.datavalidation=true
    this.datavalidation_pass=true
    this.ddlcheck_pass=true
    this.duplicate=false
    this.ddlcheck=true

  }
  else if (test_name == "Datavalidation"){
    this.value_src=[]
    this.keys_src=[]
    if(case_log.source_log=='none'){
      this.countcheck=true
      this.nullcheck=true
      this.datavalidation=true
      this.datavalidation_pass=false
      this.ddlcheck_pass=true
      this.duplicate=true
      this.ddlcheck=true
    }
    else{
      this.parsed_obj=(eval(case_log.source_log)[0])
    this.first_obj=(JSON.parse(String(this.parsed_obj)))
    this.keys_src=(Object.keys(this.first_obj))
    //console.log(this.keys_src.length)
     this.len=eval(case_log.source_log).length
     //console.log((Object.values(this.first_obj)))
     console.log(this.len)
    for(var i=0;i<this.len;i++){
        this.parsed_obj=(eval(case_log.source_log)[i])
        this.first_obj=(JSON.parse(String(this.parsed_obj)))
        this.value_src.push(Object.values(this.first_obj))
      }
      console.log(this.value_src)
      this.countcheck=true
      this.nullcheck=true
      this.datavalidation=false
      this.datavalidation_pass=true
      this.ddlcheck_pass=true
      this.duplicate=true
      this.ddlcheck=true

    }
  }
  else if(test_name == 'DDLCheck'){
  
   if(case_log.source_log=='none1')
    {
      this.countcheck=true
      this.nullcheck=true
      this.datavalidation=true
      this.datavalidation_pass=true
      this.ddlcheck_pass=false
      this.duplicate=true
      this.ddlcheck=true
    }
   else if(case_log.destination_log=='none1')
    {
      this.countcheck=true
      this.nullcheck=true
      this.datavalidation=true
      this.datavalidation_pass=true
      this.ddlcheck_pass=false
      this.duplicate=true
      this.ddlcheck=true
    }
   else {
    this.countcheck=true
    this.nullcheck=true
    this.datavalidation=true
    this.datavalidation_pass=true
    this.ddlcheck_pass=true
    this.duplicate=true
    this.ddlcheck=false
   }
  }
  const dialogRef = this.dialog.open(DialogOverviewExampleDialogstartup, {    //break
    width: '90%',
    height:'90%',

    data : {countcheck:this.countcheck,nullcheck:this.nullcheck,duplicate:this.duplicate,
      datavalidation:this.datavalidation,source_log :case_log.source_log,destination_log:case_log.destination_log,
    key_src:this.keys_src,value_src:this.value_src,datavalidation_pass:this.datavalidation_pass,ddlcheck_pass:this.ddlcheck_pass,ddlcheck:this.ddlcheck,
  case_log_id:case_log.test_case_log_id}
   
  });
  dialogRef.afterClosed().subscribe(result => {
    console.log(result)
   });
}
}
@Component({
  selector: 'dialog-overview-example-startup-dialog',
  templateUrl: 'dialog-overview-example-startup-dialog.html',
})
export class DialogOverviewExampleDialogstartup {

  constructor( private fileUploadService:UploadserviceService,
    public dialogRef: MatDialogRef<DialogOverviewExampleDialogstartup>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onexport(case_log_id){
    console.log(case_log_id)
    this.fileUploadService.exportinexcel(case_log_id).subscribe(data=>{
      console.log("nothing")
  },err=>{
    
  })
}


}