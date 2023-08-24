var globalOCV;

function runThresholding(){
  var settings = {
    type:'simple',
    simple:{
      min:177,
      max:255,
      type:'THRESH_BINARY'
    },
    adaptive:{
      max:255,
      type:'THRESH_BINARY',
      method:'ADAPTIVE_THRESH_GAUSSIAN_C'
    }
  };
  globalOCV = new OCV('map','thresholding',map,'openlayers');
  globalOCV.start();
  globalOCV.setThresholding(true,settings);
}

function stopThresholding(){
  globalOCV.setThresholding(false);
  globalOCV.close();
}