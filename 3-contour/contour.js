var globalOCV;

function runContour(){
  var settings = {
    type:'simple',
    min:245,
    max:255
  };
  globalOCV = new OCV('map','contour',map,'openlayers');
  globalOCV.start();
  globalOCV.setContour(true,settings);
}

function stopContour(){
  globalOCV.setContour(false);
  globalOCV.close();
}