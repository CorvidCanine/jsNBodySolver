function draw(){
  //Update bound each frame so that window size cvs be changed by user
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  cvsWidth = cvs.width;
  cvsHeight = cvs.height;
  ctx.clearRect(0,0,cvsWidth,cvsHeight);
  ctx.strokeStyle = mainColour[dayNight];
  ctx.fillStyle = mainColour[dayNight];
  ctx.lineWidth=3;

  //Setting this to false will stop objects and their trails from being drawn
  //Used so that only the graph is visable
  if(true){
    radius = 10;
    camx=objects[cameraFocus].pos[0];
    camy=objects[cameraFocus].pos[1];
    /*
    var imageData = ctx.createImageData(cvsWidth, cvsHeight);
    var data = imageData.data;
    var field = new Array();
    var fieldOut = new Array();

    for(var i=0;i<data.length;i+=12){
      var y = Maths.floor((i/4)/cvsWidth);
      var x = (i/4)-(y*cvsWidth);
      //console.log([(x+(camx/scale))*scale,(y+(camy/scale))*scale]);
      var grav = getField([(x+(camx/scale)-(cvsWidth/2))*scale,(y+(camy/scale)-(cvsHeight/2))*scale,-1.713750298342091e+7]);
      var magnitude = Maths.sqrt(Maths.pow(grav[0],2)+Maths.pow(grav[1],2)+Maths.pow(grav[2],2));
      field.push(magnitude);
      fieldOut.push([x,y,field]);
    }

    var largest = 0;
    var smallest = 10000;
    field.forEach(function(v){
      if(v>largest)largest=v;
      if(v<smallest)smallest=v;
    });

    //var colourScale = 255/largest*2;

    var ignore = largest-(2*(largest/3));
    var ignoreSml = 1;
    //console.log(field[100]*colourScale);
    for(var i=0;i<data.length;i+=12){

      var col = (255)*((field[i/4]-ignoreSml)/(ignore-ignoreSml));
      data[i] = field[i/4]>ignore ? 200 : 0;
      data[i+1] = field[i/4]>ignore ? 0 : col;
      //data[i] = col - (255*2);
      //data[i+1] = col - 255;
      //data[i+2] = col;
      data[i+3] = 255;
    }
    ctx.putImageData(imageData,0,0);
    log[0] = fieldOut;

    */
    ctx.font="15px Consolas";
    for(var i=0; i<objects.length;i++){
      ctx.fillStyle = objects[i].colour;
      ctx.strokeStyle = objects[i].colour;
      //Draws circle to represent object
      ctx.beginPath();
      ctx.arc((objects[i].pos[0]/scale)-(camx/scale)+(cvsWidth/2),(objects[i].pos[1]/scale)-(camy/scale)+(cvsHeight/2),radius,0,2*Math.PI);
      ctx.fill();
      //Draw name
      ctx.fillText(objects[i].name,(objects[i].pos[0]/scale)-(camx/scale)+(cvsWidth/2)-20,(objects[i].pos[1]/scale)-(camy/scale)+(cvsHeight/2)-15);

      //Draws the trail
      if(tailStepState!=0){
        ctx.beginPath();
        ctx.moveTo(objects[i].tail[0][0]/scale-(camx/scale)+(cvsWidth/2),objects[i].tail[0][1]/scale-(camy/scale)+(cvsHeight/2));
        for(var k=1;k<objects[i].tail.length;k++){
          ctx.lineTo(objects[i].tail[k][0]/scale-(camx/scale)+(cvsWidth/2),objects[i].tail[k][1]/scale-(camy/scale)+(cvsHeight/2));
        }
        ctx.stroke();
      }
    }

    /*Earth Kepler orbit
    var eccen = 0.0167086;
    var peri = 147095000000;
    var slr = peri*(1+eccen);
    ctx.beginPath();
    var r = slr/(1+eccen*Maths.cos(0));
    ctx.moveTo((r*Maths.cos(0)+objects[0].pos[0])/scale-(camx/scale)+(cvsWidth/2),(r*Maths.sin(0)+objects[0].pos[1])/scale-(camy/scale)+(cvsHeight/2));
    for(var i=0.01;i<=(2*Maths.PI);i+=0.01){
      var r = slr/(1+eccen*Maths.cos(i));
      ctx.lineTo((r*Maths.cos(i)+objects[0].pos[0])/scale-(camx/scale)+(cvsWidth/2),(r*Maths.sin(i)+objects[0].pos[1])/scale-(camy/scale)+(cvsHeight/2));
    }
    r = slr/(1+eccen*Maths.cos(0));
    ctx.lineTo((r*Maths.cos(0)+objects[0].pos[0])/scale-(camx/scale)+(cvsWidth/2),(r*Maths.sin(0)+objects[0].pos[1])/scale-(camy/scale)+(cvsHeight/2));
    ctx.stroke();
    */

    ctx.font="19px Consolas";
    //Draws info
    ctx.fillStyle=mainColour[dayNight];
    var td = new Date(t);
    ctx.fillText("t: " + td.toUTCString(),5,20);
    ctx.fillText("dt: " + dt +"s",5,40);
    ctx.fillText("Steps per frame: " + noStepsPerFrame,5,60);
    ctx.fillText("Scale: " + scale.toExponential(2) +"m/px",5,80);
    ctx.fillText("Camera Focus: " + objects[cameraFocus].name,5,100);

    //TODO Using abs is not the best way here.
    ctx.fillText("Energy Diff: " + (currentEnergy-initalEnergy).toExponential(4),5,120);
    ctx.fillText("Current energy: " + currentEnergy.toExponential(4),5,140);
    ctx.fillText("Percent Error: " + (((currentEnergy-initalEnergy)/initalEnergy)*100),5,180);

    ctx.fillText("Tail Length: ",5,500);
    ctx.fillText("Tail Precision: ",5,525);

    ctx.font="12px Consolas";
    var tstp=totalStoredTailPos();
    ctx.fillStyle= tstp>200000?'red':tstp>100000?'orange':mainColour[dayNight];
    ctx.fillText("Total stored tail positions: "+totalStoredTailPos(),5,475);
    ctx.font="18px Consolas";
    ctx.fillStyle=mainColour[dayNight];
}

//Buttons
pauseButton = {x:0, y:cvsHeight-40, width: 60, height: 40, state: 0, col: standardColours[dayNight], text: play ? 'Pause' : 'Run', onPress: function(){play = !play;}, small:false};
if(!play){
  stepButton = {x:60, y:cvsHeight-40, width: 60, height: 40, state: 0, col: standardColours[dayNight], text: 'Step', onPress: function(){steps=1;}, small:false};
  drawButton(stepButton);
  stepTButton = {x:120, y:cvsHeight-40, width: 65, height: 40, state: 0, col: standardColours[dayNight], text: 'Batch', onPress: function(){batch();}, small:false};
  drawButton(stepTButton);
}
modeButton = {x:cvsWidth-60, y:cvsHeight-40, width: 60, height: 40, state: 0, col: standardColours[dayNight], text: dayNight == 0 ? 'Dark' : 'Light', onPress: function(){dayNight==0 ? dayNight=1 : dayNight=0; cvs.style.background=background[dayNight];}, small:false};
exportButton = {x:cvsWidth-121, y:cvsHeight-40, width: 60, height: 40, state: 0, col: standardColours[dayNight], text:'Export', onPress: function(){exportLog(5);}, small:false};
keplerButton = {x:cvsWidth-182, y:cvsHeight-40, width: 60, height: 40, state: 0, col: standardColours[dayNight], text:'Kepler', onPress: function(){keplerDiff();}, small:false};

var bAlign = 220;
var smallButtonSize = 15;
scalePButton = {x:bAlign+30, y:70, width: smallButtonSize, height: smallButtonSize, state: 0, col: standardColours[dayNight], text: '+', onPress: function(){scale=scale/2;}, small:true};
scaleNButton = {x:bAlign, y:70, width: smallButtonSize, height: smallButtonSize, state: 0, col: standardColours[dayNight], text: '-', onPress: function(){scale=scale*2;}, small:true};
scaleDButton = {x:bAlign+15, y:70, width: smallButtonSize, height: smallButtonSize, state: 0, col: standardColours[dayNight], text: 'D', onPress: function(){scale=2e9;}, small:true};

dtNButton = {x:bAlign, y:30, width: smallButtonSize, height: smallButtonSize, state: 0, col: standardColours[dayNight], text: '-', onPress: function(){dt=dt/2;}, small:true};
dtPButton = {x:bAlign+15, y:30, width: smallButtonSize, height: smallButtonSize, state: 0, col: standardColours[dayNight], text: '+', onPress: function(){dt=dt*2;}, small:true};

stepsNButton = {x:bAlign, y:50, width: smallButtonSize, height: smallButtonSize, state: 0, col: standardColours[dayNight], text: '-', onPress: function(){noStepsPerFrame=Maths.round(noStepsPerFrame/2);}, small:true};
stepsPButton = {x:bAlign+15, y:50, width: smallButtonSize, height: smallButtonSize, state: 0, col: standardColours[dayNight], text: '+', onPress: function(){noStepsPerFrame=noStepsPerFrame*2;}, small:true};

camFocusPButton = {x:bAlign, y:90, width: smallButtonSize, height: smallButtonSize, state: 0, col: standardColours[dayNight], text: '-', onPress: function(){cameraFocus<=0?cameraFocus=objects.length-1:cameraFocus--;}, small:true};
camFocusNButton = {x:bAlign+15, y:90, width: smallButtonSize, height: smallButtonSize, state: 0, col: standardColours[dayNight], text: '+', onPress: function(){cameraFocus>=objects.length-1?cameraFocus=0:cameraFocus++;}, small:true};


var lbAlign = 160;
tailPrecButton = {x:lbAlign, y:507, width: 60, height: 22, state: 0, col: standardColours[dayNight], text:tailPrecisionNames[tailStepState], onPress: function(){if(tailStepState>=tailPrecisions.length-1){tailStepState=0}else{tailStepState++;}}, small:false};
tailLengthButton = {x:lbAlign, y:485, width: 75, height: 22, state: 0, col: tailLengthState==0 ? warningColours[dayNight] : standardColours[dayNight], text:tailLengthNames[tailLengthState], onPress: function(){if(tailLengthState>=tailAllowedLengths.length-1){tailLengthState=0}else{tailLengthState++;}}, small:false};

//graphButton = {x:cvsWidth-100, y:2, width: 100, height: 30, state: 0, col: standardColours[dayNight], text: drawGraph ? 'Hide Graph' : 'Show Graph', onPress: function(){drawGraph = !drawGraph;}};

drawButton(pauseButton);
drawButton(tailLengthButton);
drawButton(tailPrecButton);
drawButton(modeButton);
drawButton(exportButton);
drawButton(keplerButton);

//drawButton(graphButton);

ctx.lineWidth=2;
drawButton(scaleNButton);
drawButton(scalePButton);
drawButton(scaleDButton);
drawButton(dtNButton);
drawButton(dtPButton);
drawButton(stepsPButton);
drawButton(stepsNButton);
drawButton(camFocusNButton);
drawButton(camFocusPButton);
ctx.lineWidth=3;

reDraw=false;
}

//graph big, positive only
function drawGraph(graph){
  ctx.strokeStyle=mainColour[dayNight];
  xAlign = 1500;
  yAlign = 800;
  yAlignMin = 150;
  ctx.beginPath();
  ctx.moveTo(cvsWidth-xAlign,yAlign);
  ctx.lineTo(cvsWidth-100,yAlign);
  ctx.moveTo(cvsWidth-xAlign,yAlignMin);
  ctx.lineTo(cvsWidth-xAlign,yAlign);
  ctx.stroke();
  //big scale
  gscalexn=startTime;
  //small scale
  //graph.scalex=dt*10000;
  //gscalexn=startTime;
  //graph.scaley=5e8;

  ctx.strokeStyle=mainColour[dayNight];
  ctx.font="14px Consolas";
  //ctx.fillText((graph.scaley*350).toExponential(1),cvsWidth-850,155);
  //ctx.fillText('0',cvsWidth-810,yAlign);
  xLineGap=(xAlign-100)/10;
  for(var i=0;i<10;i++){
    //draw graph lines vertical
    ctx.beginPath();
    ctx.lineWidth=1;
    ctx.moveTo(cvsWidth-(xAlign-((xLineGap)*i)),yAlignMin);
    ctx.lineTo(cvsWidth-(xAlign-(xLineGap*i)),yAlign);
    ctx.stroke();
    // Draw x axis line marks
    ctx.beginPath();
    ctx.lineWidth=2;
    ctx.moveTo(cvsWidth-(xAlign-(xLineGap*i)),yAlign);
    ctx.lineTo(cvsWidth-(xAlign-(xLineGap*i)),yAlign+5);
    ctx.stroke();
    //var num = (graph.scalex*(xLineGap*i))/(24*60*60*1000);
    var num = (graph.scalex*(xLineGap*i));
    ctx.fillText(num,cvsWidth-(xAlign-(xLineGap*i)+(ctx.measureText(num).width/2)),yAlign+20);

  }
  yLineGap=(yAlign-yAlignMin)/10;
  for(var i=0;i<10;i++){
    ctx.beginPath();
    ctx.lineWidth=1;
    ctx.moveTo(cvsWidth-xAlign,yAlign-(i*yLineGap));
    ctx.lineTo(cvsWidth-100,yAlign-(i*yLineGap));
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth=2;
    ctx.moveTo(cvsWidth-xAlign-8,yAlign-(i*yLineGap));
    ctx.lineTo(cvsWidth-xAlign,yAlign-(i*yLineGap));
    ctx.stroke();
    var num = ((yLineGap*i)*graph.scaley)+(graph.yoffset/graph.scaley);
    ctx.fillText(num,cvsWidth-xAlign-55,yAlign+4-(i*yLineGap));
  }

  ctx.save();
  ctx.translate(cvsWidth - 1, 0);
  ctx.rotate(-Math.PI/2);
  ctx.textAlign = "center";
  ctx.fillText(graph.yAxisName, -(yAlign+yAlignMin)/2, -xAlign-80);
  ctx.restore();
  ctx.fillText(graph.xAxisName,(xAlign+100)/2,yAlign+20);

  ctx.beginPath();
  ctx.moveTo((log[graph.logID][0][1]-gscalexn)/graph.scalex+(cvsWidth-xAlign),(-log[graph.logID][0][0]/graph.scaley)+yAlign);
  for(var k=1;k<log[graph.logID].length;k++){
    ctx.lineTo((log[graph.logID][k][1]-gscalexn)/graph.scalex+(cvsWidth-xAlign),((-log[graph.logID][k][0]-graph.yoffset)/graph.scaley)+yAlign);
    //console.log("x:"+((log[graph.logID][k][1]-gscalexn)/graph.scalex+(cvsWidth-xAlign))+" y:"+((-log[graph.logID][k][0]+graph.yoffset/graph.scaley)+yAlign));
  }
  ctx.stroke();


}

function drawButton(button){
  //Button states
  // 0 = normal
  //1 = hover
  //2 = mouse down
  //3 = disabled

  if(button.state != 3){
    button.state = pointInBox(mousePos.x,mousePos.y,button.x,button.y,button.width,button.height) ? (mouseDown ? 2 : 1) : 0;
    if(button.state == 1 && mouseReleased){button.onPress();};
  }

  ctx.beginPath();
  ctx.strokeStyle = button.col[button.state];
  ctx.rect(button.x,button.y,button.width,button.height);
  ctx.stroke();

  ctx.fillStyle=mainColour[dayNight];
  var m = ctx.measureText(button.text);
  ctx.fillText(button.text,button.x+(button.width/2)-(m.width/2),button.y+(button.height/2)+(button.small ? 4 : 6));

}

function drawPanel(panel){

  ctx.beginPath();
  ctx.strokeStyle = 'deepSkyBlue';
  ctx.fillStyle = 'rgba(4,32,66,.85)';
  //ctx.rect((panel.width-cvsWidth)/2,(panel.height-cvsHeight)/2,panel.width,panel.height);
  ctx.rect(cvsWidth/6,cvsHeight/8,cvsWidth-cvsWidth/3,cvsHeight-cvsHeight/4);
  ctx.stroke();
  ctx.fill();

}

function guiSetup(){
  background = ['black','rgb(226,220,220)'];
  mainColour = ['rgb(245,245,248)','rgb(4,4,7)'];
  standardColours = [[mainColour[0],'deepSkyBlue','springGreen','grey'],[mainColour[1],'deepSkyBlue','springGreen','grey']];
  warningColours = [['red','Salmon','springGreen','grey'],['red','Salmon','springGreen','grey']];
  dayNight = 0;
}
