/* This is a javascript n-body gravity simulator
It should run on any modern browser but has only been tested with chrome
*/

function kinectEnergy(){
  var totalKE = 0;
  for(var i=0;i<objects.length;i++){
    totalKE += 0.5*objects[i].mass*(Math.pow(objects[i].vel[0],2)+Math.pow(objects[i].vel[1],2)+Math.pow(objects[i].vel[2],2));
  }
  return totalKE;
}

function gravPotEnergy(){
  var totalGP = 0;
  for(var i=0;i<objects.length;i++){
    for(var k=i+1;k<objects.length;k++){
      totalGP += -GConst*objects[i].mass*objects[k].mass/getDistance(i,k);
    }
  }
  return totalGP;
}

function percentEnergyError(){
  return ((Maths.abs(currentEnergy-initalEnergy)/Maths.abs(initalEnergy))*100);
}

//Step calculates the change in pos, vel and acc for each time step
function step(){
  //console.log('orbit period'+(findOrbit(3,0).toExponential(4)/60/60/24));
  //log[4].push([getDistance(12,3),t]);
  //log[5].push([getDistance(0,3),t]);
  //console.log(getDistance(0,2));
  if(tailStepState!=0){
    if(tailStepCount>=tailPrecisions[tailStepState]){
      tailThisStep=true;
      tailStepCount=0;
    } else {
      tailThisStep=false;
      tailStepCount++;
    }
  }

  for(var i=0; i<objects.length;i++){
    //Sim
    for(var k=0;k<3;k++){
      objects[i].vel[k] += objects[i].acc[k]*dt/2;
      objects[i].acc[k]=0.0;
    }

    if(tailThisStep) objects[i].tail.push([0.0,0.0,0.0]);
    for(var k=0;k<3;k++){
      //Sim
      objects[i].pos[k] += objects[i].vel[k]*dt;

      //Trail
      if(tailThisStep){
        objects[i].tail[objects[i].tail.length-1][k]=objects[i].pos[k];
        objects[i].tail[objects[i].tail.length-1][4]=t;
        if(tailLengthState!=0&&objects[i].tail.length>tailAllowedLengths[tailLengthState]){
          //This stops the trail getting too long
          while(objects[i].tail.length>tailAllowedLengths[tailLengthState])objects[i].tail.shift();
        }
      }
    }
  }

  //Sim
  for(var i=0; i<objects.length;i++){
    for(var j=i+1; j<objects.length;j++){
      var rji = new Array(3);
      for(var k=0; k<3;k++)
      rji[k]=objects[j].pos[k]-objects[i].pos[k];
      var r2 = 0.0;
      for(var k=0; k<3;k++)
      r2 += rji[k]*rji[k];
      var r3 = r2 * Maths.sqrt(r2);
      for(var k=0; k<3;k++){
        objects[i].acc[k]+=GConst*objects[j].mass*rji[k]/r3;
        objects[j].acc[k]-=GConst*objects[i].mass*rji[k]/r3;
      }
    }
  }

  for(var i=0; i<objects.length;i++){
    for(var k=0; k<3;k++)
    objects[i].vel[k]+=objects[i].acc[k]*dt/2;
  }

  t+=(dt*1000);

  currentEnergy=kinectEnergy()+gravPotEnergy();
  //console.log("cur: " +currentEnergy);

  reDraw = true;
}

function getField(pos){
  var strength = [0.0,0.0,0.0];
  for(var j=0; j<objects.length;j++){
    var rji = new Array(3);
    for(var k=0; k<3;k++)
    rji[k]=objects[j].pos[k]-pos[k];
    var r2 = 0.0;
    for(var k=0; k<3;k++)
    r2 += rji[k]*rji[k];
    var r3 = r2 * Maths.sqrt(r2);
    for(var k=0; k<3;k++)
    strength[k]+=GConst*objects[j].mass*rji[k]/r3;
  }
  //strength=[5000,5000,0];
  return strength;
}

function getRelativeVelocity(i,j){
  return Maths.sqrt(Maths.pow(objects[i].vel[0]-objects[j].vel[0],2)+Maths.pow(objects[i].vel[1]-objects[j].vel[1],2)+Maths.pow(objects[i].vel[2]-objects[j].vel[2],2));
}

function getDistance(i,j){
  return Maths.sqrt(Maths.pow(objects[i].pos[0]-objects[j].pos[0],2)+Maths.pow(objects[i].pos[1]-objects[j].pos[1],2)+Maths.pow(objects[i].pos[2]-objects[j].pos[2],2));
  //return Math.abs(objects[i].pos[0]-objects[j].pos[0])+Math.abs(objects[i].pos[1]-objects[j].pos[1])+Math.abs(objects[i].pos[2]-objects[j].pos[2]);
}

function exportLog(id,name){
  let csvContent = "";
  var saveCount = 0;
  log[id].forEach(function(rowArray){
    if (saveCount==0) {
      let row = rowArray.join(",");
      csvContent += row + "\n";
      //saveCount = 10;
    }
    else saveCount--;
  });
  var blob = new Blob([csvContent],{type:'text/csv'});
  var data=URL.createObjectURL(blob);
  //var data = encodeURI(csvContent);
  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', name==null?'export.csv':name+'.csv');
  link.click();
}

function totalStoredTailPos(){
  if(startTime==t) return "None";
  var total = 0;
  for(var i=0;i<objects.length;i++)
  total+=objects[i].tail.length;
  return total;
}

function wipeStoredTails(){
  for(var i=0;i<objects.length;i++){
    objects[i].tail=new Array();
  }
}

function findOrbit(sat,body){
  smAxis=-1/((Maths.pow(getRelativeVelocity(sat,body),2)/(GConst*objects[body].mass))-2/getDistance(sat,body));
  orbitPeriod = Maths.sqrt(4*Maths.pow(Maths.PI,2)/(GConst*objects[body].mass)*Maths.pow(smAxis,3));
  return [orbitPeriod,smAxis];
}

function batch(){
  tailStepState=0;
  console.log("Running batch");
  for(var i=245;i<=1800;i+=5){
    runTimestep(i);
    console.log("Completed dt:"+dt);
  }
  exportLog(0);
}

function runTimestep(dt){
  loadObjs();
  for(var i=(31536000/dt);i>0;i--){
    step();
  };
  log[0].push([dt,percentEnergyError()]);
}

function keplerDiff(){
  for(var obj=1;obj<objects.length;obj++){
    var max = tailAphe(obj);
    var min = tailPeri(obj);
    var eccen = (max[0]-min[0])/(max[0]+min[0]);
    var period = (max[1]-min[1])*2;
    var smaxis = (max[0]+min[0])/2;
    log[0].push([objects[obj].name,eccen,max[0],min[0],period,smaxis]);
  }
  exportLog(0,'kepler_dt'+dt);
}

function tailAphe(obj){
  var max = 0.0;
  var index = 0;
  for(var i=0;i<objects[obj].tail.length;i++){
    var radius = Maths.sqrt(Maths.pow(objects[obj].tail[i][0]-objects[0].tail[i][0],2)+Maths.pow(objects[obj].tail[i][1]-objects[0].tail[i][1],2)+Maths.pow(objects[obj].tail[i][2]-objects[0].tail[i][2],2));
    if(max<radius) {
      max = radius;
      index = i;
    }
  }
  return [max,objects[obj].tail[index][4]];
}

function tailPeri(obj){
  var min = 1e99;
  var index = 0;
  for(var i=0;i<objects[obj].tail.length;i++){
    var radius = Maths.sqrt(Maths.pow(objects[obj].tail[i][0]-objects[0].tail[i][0],2)+Maths.pow(objects[obj].tail[i][1]-objects[0].tail[i][1],2)+Maths.pow(objects[obj].tail[i][2]-objects[0].tail[i][2],2));
    if(min>radius) {
      min = radius;
      index = i;
    }
  }
  return [min,objects[obj].tail[index][4]];
}

function pointInBox(px,py,bx,by,l,h) {
  if (px >= bx && px <= (l+bx)) {
    if (py >= by && py <= (h+by)) {
      return true;
    }
  }
  return false;
}

function setMousePosRelTocanvas(e) {
  var rect = cvs.getBoundingClientRect();
  mousePos.x=e.x - rect.left,
  mousePos.y=e.y - rect.top
}

//The main function that gets called every frame.
function run(){

  if(play)for(var i=0;i<noStepsPerFrame;i++)step();
  else if(steps>0){
    //This steps check is not redundent, it fixes a bug
    step();
    steps--;
  }

  draw();
  mouseReleased=false;
}

window.onload = function(){
  Maths=Math;
  d = document;
  cvs = d.getElementById('canvas');
  ctx = cvs.getContext('2d');
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  loadObjs();

  reDraw=true;
  play=false;
  mousePos={x:0,y:0};
  mouseDown=false;
  mouseReleased=false;
  steps=1;
  noStepsPerFrame = 10;
  logging=false;
  cameraFocus=0;

  //Tail(Trail) varibles
  tailStepState=3;
  tailPrecisions=[0,1,2,10,60,240];
  tailPrecisionNames=["Off","All","Half","Some","Low","VLow"];
  tailStepCount=tailPrecisions[tailStepState];
  tailThisStep=true;
  tailLengthState=2;
  tailAllowedLengths=[0,300,1000,2000,5000,10000];
  tailLengthNames=["All","Short","Default","Double","Long","VLong"];

  eylCounter = 0.0;
  earthYearLength = 0.0;

  //Simulation varibles
  //Grav const
  GConst=6.67408e-11;

  //Time step
  //dt = 24*60*60; //One day in seconds
  dt=30;
  startTime=t;
  //Drawing varibles
  scale=2e9; //Meters per pixel

  log = new Array(4); //Stores data for graphs
  log[0] = new Array();
  log[1] = new Array();
  log[2] = new Array();
  log[4] = new Array();
  log[5] = new Array();


  initalEnergy = gravPotEnergy()+kinectEnergy();
  currentEnergy = 0;

  guiSetup();

  d.addEventListener('mousemove',function(evt){setMousePosRelTocanvas({x:evt.clientX,y:evt.clientY});}, false);
  d.addEventListener('touchmove', function(evt){setMousePosRelTocanvas({x:evt.pageX,y:evt.pageY});}, false);
  d.addEventListener('mousedown',function(evt){setMousePosRelTocanvas({x:evt.clientX,y:evt.clientY}); mouseDown=true;}, false);
  d.addEventListener('mouseup', function(evt) {mouseReleased=true;mouseDown = false;}, false);

  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); requestAnimationFrame(_cb);
      }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); mozRequestAnimationFrame(_cb);
      }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1);
    }
  }
  window.onEachFrame = onEachFrame;
  window.onEachFrame(run);
}
