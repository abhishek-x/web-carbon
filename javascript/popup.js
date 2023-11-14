var bg;
var carbonPerPage = 1.76;	// Average carbon per page view

chrome.tabs.getSelected(null, function (tab) {
	bg = chrome.extension.getBackgroundPage();
	renderPage();
});

function formatCarbonWeight(value) {
	var suffix = "g";
	if (value >= 1000000000) {
		value = value / 1000000000;
		suffix = "mmt";
	} else if (value >= 1000000) {
		value = value / 1000000;
		suffix = "mt";
	} else if (value >= 1000) {
		value = value / 1000;
		suffix = "kg";
	}
	value = value % 1 == 0 ? value : value.toFixed(1)
	return value + suffix;
}

function renderPage() {
	var today = bg.getDayCount(0)
	var todayCarbon = document.getElementById('today-carbon');
	todayCarbon.innerHTML = formatCarbonWeight(today * carbonPerPage);

	var dayArr = [];
	var chart = document.getElementById('chart');
	for (var i = 29; i >= 0; i--) {
		var dayCount = bg.getDayCount(i);
		dayArr[i] = dayCount * carbonPerPage;
	}
	var max = dayArr.length ? Math.max.apply(null, dayArr) : 0;

	var columnHeight = 120.0;
	var ratio = columnHeight / max;
	var bar = null;
	var sum = 0;
	var days = 0;
	chart.style.height = (parseInt(columnHeight)) + 'px';

	for (var i = 29; i >= 0; i--) {
		var dayCount = dayArr[i];
		var barHeight = parseInt(dayCount * ratio);

		var column = document.createElement('div');
		column.setAttribute('class', 'chart-column');
		column.setAttribute('title', formatCarbonWeight(dayCount) + ' on ' + bg.formatDate(i, '-'));
		column.style.height = parseInt(columnHeight) + 'px';

		var area = document.createElement('div');
		area.setAttribute('class', 'chart-area');
		area.style.height = parseInt(columnHeight) + 'px';
		column.appendChild(area);

		var barWrap = document.createElement('div');
		barWrap.setAttribute('class', 'chart-bar-wrap');
		barWrap.style.height = barHeight + 'px';
		area.appendChild(barWrap);

		bar = document.createElement('div');
		bar.setAttribute('class', 'chart-bar');
		if (i == 0) {
			bar.setAttribute('class', 'chart-bar today');
		}
		bar.style.height = barHeight + 'px';
		barWrap.appendChild(bar);
		chart.appendChild(column);

		if (dayCount > 0) {
			sum += dayCount;
			days++;
		}
	}

	if (days > 7) {
		var chartDefault = document.getElementById('chart-default');
		chartDefault.setAttribute('class', 'chart-default-hidden');
	}

	var avgDay = sum / days;
	if (avgDay) {
		var year = avgDay * 365;
		var fc = document.getElementById('forecast-count');
		fc.innerHTML = formatCarbonWeight(year);

		var flight = 50 * 1000;
		var trees = 24 * 1000;
		if (year >= flight) {
			var fe = document.getElementById('flights');
			var ft = document.getElementById('trees');
			fe.innerHTML = "🛫  Whoa! That's equivalent to " + (year / flight).toFixed(0) + " flights between Paris and London. ";
			ft.innerHTML = "🌴  You need to plant " + (year / trees).toFixed(0) + " trees to offset this amount.";
		}
	}
}
