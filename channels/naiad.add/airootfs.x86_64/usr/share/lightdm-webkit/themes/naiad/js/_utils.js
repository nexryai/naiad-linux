/**
 * Logger for LoginManager (and general development).
 * 	show: - creates the on screen terminal if true
 *
 * Provides on screen terminal for testing without a developer console.
 *
 * Example Usage:
 *  let log = new Logger(true); // pass true to show output
 *  log.error("write errors like this"); // console.error()
 * 	log.normal("write normal logs here"); // console.log()
* 	log.warn("write warning logs here"); // console.warn()
 * 	log.debug("write debug logs here"); // console.debug()
 */
class Logger {
	constructor(show=false) {
		if (show) $("body").prepend(`	<!-- Debug Console -->
			<div id="console" class="row">
			<div class="col s3">
			<div class="row">
			<div class="switch">
			<label>
			<input type="checkbox" checked="true">
			<span class="lever"></span>
			Auto
			</label>
			</div>
			</div>

			<div class="row">
			<div class="input-field col ">
			<input id="inputEvent" >
			<label for="inputEvent">Event</label>
			</div>
			<a id="buttonTrigger" class="waves-effect waves-light btn">Trigger</a>
			</div>

			</div>
			<div class="col s9">
			<div contentEditable="true" class="terminal"></div>
			</div>
			</div>
			<!-- End Debug Console -->`);
      this.$log= $("#console .terminal");
      this.$autoscroll = $("#console input");
      this.$buttonTrigger = $("#buttonTrigger");
      
			window.onerror = (e) => {
				this.error(e);
			};

			$(document).ready(() => {


				this.$log.keypress(function(e) {
					e.preventDefault();
				});
				this.$buttonTrigger.click(() => {
					let e = $("#inputEvent").val();
					log.debug("triggering: " + e);
					$(greeter).trigger(e);

				});
			});
		}
		_parse(str, color) {
			if (typeof str == "object") str = JSON.stringify(str,null, 2);

			str =  "[" + moment().format("hh:mm:ss") + "] " + str;
			str = "<text style='color: " + color + "'>" + str + "</text>";
			return this.$log.html() + str;
		}
		normal (str) {
			console.log(str);
			this.$log.html(this._parse(str,"white"));
			if (this.$autoscroll.prop('checked'))
			this.$log[0].scrollTop = this.$log[0].scrollHeight;
		}
		error (str) {
			console.error(str);
			this.$log.html(this._parse(str,"red"));
			if (this.$autoscroll.prop('checked'))
			this.$log[0].scrollTop = this.$log[0].scrollHeight;
		}
		warn (str) {
			console.warn(str);
			this.$log.html(this._parse(str,"yellow"));
			if (this.$autoscroll.prop('checked'))
			this.$log[0].scrollTop = this.$log[0].scrollHeight;
		}
		debug (str) {
			console.debug(str);
			this.$log.html(this._parse(str,"lightblue"));
			if (this.$autoscroll.prop('checked'))
			this.$log[0].scrollTop = this.$log[0].scrollHeight;
		}
}

/************************ Basic Utility Functions *************************/

/**
* Scale an image up or down until it's larger than or equal to the viewport
* and then center it.
*/
var adjustBackground = function ($img) {
  var viewportWidth = screen.width;
  var viewportHeight = screen.height;
  var viewportAspect = viewportWidth/viewportHeight;
  var imgWidth = $img.width();
  var imgHeight = $img.height();
  var imgAspect = imgWidth/imgHeight;

  /* First determine what is
  the limiting factor (ie. if the image is wider, then the height is
  is the limiting factor and needs to be adjustested */
  if (imgAspect < viewportAspect) {
    /* The view port is wider compared to its height than
    the image is compared to the image height  meaning
    the width is the limiting dimension. Therefore we
    set image width = view ports width use the aspect
    ratio to set the correct height */
    $img.width(viewportWidth);
    $img.height(viewportWidth/imgAspect);
  } else {
    /* The image is wider than it is tall compared to the
    viewport so we adjust the to fit */
    $img.height(viewportHeight);
    $img.width(viewportHeight*imgAspect);
  }
  this.centerImage($img);
}
/**
 * Center an image in the viewport
 */
var centerImage =  function($img) {
  var overlapWidth = $img.width() - screen.width;
  var overlapHeight = $img.height() - screen.height;


  // image overlaps viewport, move the image back
  // half the length of the overlap
  $img.css({
    position: "relative",
    right: overlapWidth/2,
    bottom: overlapHeight/2
  });
}
