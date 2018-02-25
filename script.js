/************************************************************************************************
 *                                                                                              *
 *                              VARIABLES DECLARATION                                           *
 *                                                                                              *
 ************************************************************************************************/
var adIsViewable = true,
  viewabilityTime = 0,
  hidden = null,
  visibilityChange = null,
  startTime = Date.now(),
  isWindowFocused = true,
  noOfClicks = 0,
  percentViewable = 0,
  thresold = 100;
  adElement = document.getElementById("ad");

/**
 * Logs the viewability values in the console
 *
 * @override
 */
window.log = function () {
	console.log(`
		Ad is viewable: ${adIsViewable && isWindowFocused ? 'Yes' : 'No'},
		Percentage viewable: ${percentViewable.toFixed(2)}%,
		Viewability time of the ad in sec: ${parseInt(startTime === -1 ? viewabilityTime : viewabilityTime + (Date.now() - startTime) / 1000)} sec.,
		No of Clicks: ${noOfClicks}`);
};

/************************************************************************************************
 *                                                                                              *
 *                              YOUR IMPLEMENTATION                                             *
 *                                                                                              *
 ************************************************************************************************/

// determine properties for document for hidden and visibilityChange based on the browser.
if(typeof document.hidden !== "undefined") {
	hidden = "hidden";
	visibilityChange = "visibilitychange";
} else if(typeof document.msHidden !== "undefined") {
	hidden = "msHidden";
	visibilityChange = "msvisibilitychange";
} else if(typeof document.webkitHidden !== "undefined") {
	hidden = "webkitHidden";
	visibilityChange = "webkitvisibilitychange";
}

/**
 * @desc Visibility change handler, resets to the initial values on focus and
 * on focus out calculate the viewability time and makes the window focus.
 */
function handleVisibilityChange() {
	if(document[hidden]) {
		isWindowFocused = false;
	} else {
		isWindowFocused = true;
	}
}

// add event listener for focus on / off of the window.
document.addEventListener(visibilityChange, handleVisibilityChange, false);
// add event listener to listen for mouse clicks on the add.
adElement.addEventListener("click", function(event) {
	event.preventDefault();
	noOfClicks++;
});

/*
 * @desc Evaluates the vertical viewability.
 *
 * @param Element - ad element reference.
 * @return number - portion of the ad viewable vertically.
 */
function verticalViewability(el) {
	var windowHeight = window.innerHeight;
	var elemTop = el.getBoundingClientRect().top;
	var elemBottom = el.getBoundingClientRect().bottom;
	var elemHeight = elemBottom - elemTop;

	if (elemTop > windowHeight  || elemBottom <= 0) { // element is not visible.
		return 0;
	} else if (elemTop >= 0 && elemBottom <= windowHeight) { // element is visible completely.
		return 1;
	} else if (elemTop < 0 && elemBottom > windowHeight) { // Top and bottom of element truncated
		return windowHeight / elemHeight;
	} else if (elemTop < 0 && elemBottom <= windowHeight) { // Top of element is truncated
		return elemBottom / elemHeight;
	} else if (elemTop >= 0 && elemBottom > windowHeight) { // Bottom of element is trunctaed
		return (windowHeight - elemTop) / elemHeight;
	}

	return 0;
}

/*
 * @desc Evaluates the horizontal viewability.
 *
 * @param Element - ad element reference.
 * @return number - portion of the ad viewable horizontally.
 */
function horizontalViewability(el) {
	var windowWidth = window.innerWidth;
	var elemLeft = el.getBoundingClientRect().left;
	var elemRight = el.getBoundingClientRect().right;
	var elemWidth = elemRight - elemLeft;

	if (elemLeft > windowWidth || elemRight <= 0) { // Not viewable, below viewport.
		return 0;
	}else if (elemLeft >= 0 && elemRight <= windowWidth) { // element is completely visible.
		return 1;
	} else if (elemLeft < 0 && elemRight > windowWidth) { // Top and bottom of element truncated.
		return windowWidth / elemWidth;
	} else if (elemLeft < 0 && elemRight <= windowWidth) { // Top of element is truncated
		return elemRight / elemWidth;
	} else if (elemLeft >= 0 && elemRight > windowWidth) { // Bottom of element is trunctaed
		return (windowWidth - elemLeft) / elemWidth;
	}

	return 0;
}

/*
 * @desc Evaluates the total viewability percentage and is it viewable above the thresold,
 * by calling verticalViewability and horizontalViewability methods internally.
 *
 * @param number - Threshold to be considered for the ad viewability .
 */
function setAdViewableStatus (thresold) {
	var v = verticalViewability(adElement);
	var h = horizontalViewability(adElement);

	percentViewable = v.toFixed(2) * h.toFixed(2) * 100;
	adIsViewable = percentViewable >= thresold && isWindowFocused;
	viewabilityTime += !adIsViewable && startTime !== -1 ? (Date.now() - startTime) / 1000 : 0;
	startTime = !adIsViewable
		? -1
		: startTime === -1 ? Date.now() : startTime;
	

	setTimeout(function() {
		setAdViewableStatus(thresold);
	}, 1000);
};

// initial call to evaluate the viewability status.
setAdViewableStatus(thresold);
