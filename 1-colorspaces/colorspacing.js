var globalOCV;

function runColorSpaces(){
  var settings = {
    low:{
      red:0,
      green:0,
      blue:0
    },
    high:{
      red:150,
      green:150,
      blue:150
    }
  };
  globalOCV = new OCV('map','colorspaces',map,'openlayers');
  globalOCV.start();
  globalOCV.setColorSpace(true,settings);
}

function stopColorSpaces(){
  globalOCV.setColorSpace(false);
  globalOCV.close();
}