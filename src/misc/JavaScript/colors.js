// dissi 14 December 2016 at 23:18

function getColorBasedOnPercentage(thePercentage) {
  var hue = Math.floor(((100 - thePercentage) * 120) / 100); // go from green to red
  var saturation = Math.abs(thePercentage - 50) / 50;
  return hsv2rgb(hue, saturation, 1);
}

var hsv2rgb = function(h, s, v) {
  // adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
  var rgb,
    i,
    data = [];
  if (s === 0) {
    rgb = [v, v, v];
  } else {
    h = h / 60;
    i = Math.floor(h);
    data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];
    switch (i) {
      case 0:
        rgb = [v, data[2], data[0]];
        break;
      case 1:
        rgb = [data[1], v, data[0]];
        break;
      case 2:
        rgb = [data[0], v, data[2]];
        break;
      case 3:
        rgb = [data[0], data[1], v];
        break;
      case 4:
        rgb = [data[2], data[0], v];
        break;
      default:
        rgb = [v, data[0], data[1]];
        break;
    }
  }
  return (
    "#" +
    rgb
      .map(function(x) {
        return ("0" + Math.round(x * 255).toString(16)).slice(-2);
      })
      .join("")
  );
};
