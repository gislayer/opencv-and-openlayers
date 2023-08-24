class OCV {
  constructor(divId, id,map,mapType){
    this.id = id;
    this.divId = divId;
    this.canvas=null;
    this.config={};
    this.status={
      canvasCreated:false
    };
    this.active=false;
    this.map = map;
    this.mapType = mapType;
    this.imageData=null;
    this.processSort=[];
    this.process={
      colorspaces:{status:false,settings:{low:{red:0,green:0,blue:0},high:{red:150,green:150,blue:150}}},
      thresholding:{status:false,settings:{}},
    };
    this.postrenderEvent = map.on('postrender', (e)=>{
      this.sizeChanged(e);
    });
  }

  sizeChanged(){
    if(this.active){
      this.createCanvas();
      this.addMapToCanvas();
    }
  }

  runProcess(){
    if(this.processSort.length>0){
      this.processSort.map((name)=>{
        var process = this.process[name];
        if(process.status){
          var settings = process.settings;
          switch(name){
            case 'colorspaces':{
              this.runColorSpace(settings);
              break;
            }
            case 'thresholding':{
              this.runThresholding(settings);
              break;
            }
          }
        }
      });
    }else{
      this.addMapToCanvas();
    }
    
  }

  runTresholding(s){
    debugger;
    if(s.type=='simple'){
      debugger;
      let src = cv.matFromImageData(this.imageData);
      let dst = new cv.Mat();
      var simpletypes = {
        'THRESH_BINARY':cv.THRESH_BINARY,
        'THRESH_BINARY_INV':cv.THRESH_BINARY_INV,
        'THRESH_TRUNC':cv.THRESH_TRUNC,
        'THRESH_TOZERO':cv.THRESH_TOZERO
      };
      cv.threshold(src, dst, s.simple.min, s.simple.max, simpletypes[s.simple.type]);
      cv.imshow(this.id, dst);
      src.delete();
      dst.delete();
    }
    if(s.type=='adaptive'){
      var adaptiveMethods = {
        'ADAPTIVE_THRESH_MEAN_C':cv.ADAPTIVE_THRESH_MEAN_C,
        'ADAPTIVE_THRESH_GAUSSIAN_C':cv.ADAPTIVE_THRESH_GAUSSIAN_C
      };
      var simpletypes = {
        'THRESH_BINARY':cv.THRESH_BINARY,
        'THRESH_BINARY_INV':cv.THRESH_BINARY_INV
      };
      let src = cv.matFromImageData(this.imageData);
      let dst = new cv.Mat();
      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
      // You can try more different parameters
      cv.adaptiveThreshold(src, dst, s.adaptive.max, adaptiveMethods[s.adaptive.method], simpletypes[s.adaptive.type], 3, 2);
      cv.imshow(this.id, dst);
      src.delete();
      dst.delete();
    }
  }

  setThresholding(status,settings){
    var id = 'thresholding'; 
    if(status){
      if(this.processSort.indexOf(id)==-1){
        this.process.thresholding.status=true;
        this.processSort.push(id);
      }
      this.process.thresholding.settings = {
        type:settings.type==undefined?'simple':settings.type,
        simple:{
          min:settings.simple==undefined?177:settings.simple.min==undefined?177:Number(settings.simple.min),
          max:settings.simple==undefined?255:settings.simple.max==undefined?255:Number(settings.simple.max),
          type:settings.simple==undefined?'THRESH_BINARY':settings.simple.type==undefined?'THRESH_BINARY':settings.simple.type
        },
        adaptive:{
          max:settings.adaptive==undefined?255:settings.adaptive.max==undefined?255:Number(settings.adaptive.max),
          type:settings.adaptive==undefined?'THRESH_BINARY':settings.adaptive.type==undefined?'THRESH_BINARY':settings.adaptive.type,
          method:settings.adaptive==undefined?'ADAPTIVE_THRESH_GAUSSIAN_C':settings.adaptive.method==undefined?'ADAPTIVE_THRESH_GAUSSIAN_C':settings.adaptive.method,
        }
      }
    }else{
      var index = this.processSort.indexOf(id);
      if(index!==-1){
        this.processSort.splice(index,1);
      }
      this.process.thresholding.status=false;
    }
    this.runProcess();
  }

  runColorSpace(s){
    let src = cv.matFromImageData(this.imageData);
    let dst = new cv.Mat();
    let low = new cv.Mat(src.rows, src.cols, src.type(), [s.low.red, s.low.green, s.low.blue, 0]);
    let high = new cv.Mat(src.rows, src.cols, src.type(), [s.high.red, s.high.green, s.high.blue, 255]);
    cv.inRange(src, low, high, dst);
    cv.imshow(this.id, dst);
    src.delete(); dst.delete(); low.delete(); high.delete();
  }

  getValue(prop, obj, def, type) {
    if (obj === undefined) return def;
    if (obj[prop] === undefined) return def;
    switch(type){
      case 'number':{
        return Number(obj[prop]);
      }
    }
  }

  setColorSpace(status,settings){
    var id = 'colorspaces'; 
    if(status){
      if(this.processSort.indexOf(id)==-1){
        this.process.colorspaces.status=true;
        this.processSort.push(id);
      }
      this.process.colorspaces.settings = {
        low: {
          red: this.getValue('red', settings?.low, 0,'number'),
          green: this.getValue('green', settings?.low, 0,'number'),
          blue: this.getValue('blue', settings?.low, 0,'number'),
        },
        high: {
          red: this.getValue('red', settings?.high, 150,'number'),
          green: this.getValue('green', settings?.high, 150,'number'),
          blue: this.getValue('blue', settings?.high, 150,'number'),
        },
      };
    }else{
      var index = this.processSort.indexOf(id);
      if(index!==-1){
        this.processSort.splice(index,1);
      }
      this.process.colorspaces.status=false;
    }
    this.runProcess();
  }

  addMapToCanvas(){
    var canvasElement = this.map.getViewport().querySelector('canvas');
    var canvasDataUrl = canvasElement.toDataURL('image/png');
    var img = new Image();
    img.onload = ()=>{
        var canvas = document.createElement('canvas');
        var w50 = Math.floor(this.config.firstWidth/2);
        canvas.width = w50;
        canvas.height = this.config.firstHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var mat = cv.matFromImageData(this.imageData);
        cv.imshow(this.id, mat);
        mat.delete();
        this.runProcess();
    };
    img.src = canvasDataUrl;
  }

  removeCanvas(){
    var elm = document.getElementById(this.id);
    var verticalDiv = document.getElementById('verticalDiv');
    elm.remove();
    verticalDiv.remove();
    this.canvas=null;
    this.config = {};
    this.status.canvasCreated=false;
  }

  createCanvas(){
    if(this.status.canvasCreated==false){
      var w = Math.floor(this.config.firstWidth/2);
      var h = this.config.firstHeight-0;
      const canvas = document.createElement('canvas');
      var verticalDiv = document.createElement('div');
      verticalDiv.id='verticalDiv';
      verticalDiv.style.position='fixed';
      verticalDiv.style.top=0;
      verticalDiv.style.left=`${w}px`;
      verticalDiv.style.width=`2px`;
      verticalDiv.style.height=`${this.config.firstHeight}px`;
      verticalDiv.style.backgroundColor='#000';
      
      canvas.width = (w-2);
      canvas.height = h;
      canvas.id = this.id;
      canvas.style.position='fixed';
      canvas.style.top=0;
      canvas.style.right=0;
      this.canvas = canvas;
      document.body.appendChild(canvas);
      document.body.appendChild(verticalDiv);
      this.status.canvasCreated=true;
    }
  }

  start(){
    var elm = document.getElementById(this.divId);
    if(this.active==false){
      this.active=true;
      var size = this.map.getView().viewportSize_;
      this.config.firstWidth = size[0];
      this.config.firstHeight = size[1];
      var w50 = Math.floor(size[0]/2);
      elm.style.width = `${w50}px`;
      this.map.updateSize();
    }else{
      this.close();
    }
  }

  close(){
    if(this.processSort.length==0){
      this.active=false;
      this.postrenderEvent=false;
      var elm = document.getElementById(this.divId);
      elm.style.width = `${this.config.firstWidth}px`;
      this.map.updateSize();
      this.removeCanvas();
      this.map.un(this.postrenderEvent);
      delete GL.ocv;
    }
  }
}