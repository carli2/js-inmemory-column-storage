function optimizeIndices (arr) {
	if (arr.length < 256) {
		return Uint8Array.from(arr);
	} else if (arr.length < 32000) {
		return Uint16Array.from(arr);
	} else {
		return Uint32Array.from(arr);
	}
}

function Column(table, name, data) {
	var self = this;
	this.table = table;
	this.name = name;
	var data = data.map(x => x[name]);

	this.optimize = function () {
		// zu kleine Tabellen nicht optimieren
		if (data.length < 5) return;

		// Strings: Dictionary
		if (typeof data[0] === 'string') {
			// Dictionary bilden
			self.dictReverse = {};
			data.forEach(function (x) {
				self.dictReverse[x] = true;
			});
			// Dictionary sortieren, Index-Lookup bauen
			self.dict = Object.keys(self.dictReverse).sort();
			self.dict.forEach(function (x, i) {
				self.dictReverse[x] = i;
			});
			// Werte ersetzen
			data.forEach(function (x, i) {
				data[i] = self.dictReverse[x];
			});
			// Funktionen ersetzen
			self.get = function (recId) {
				return self.dict[data[recId]];
			};
			self.search = function (value) {
				return search_internal(self.dictReverse[value] | 0);
			};
			data = optimizeIndices(data);
		} else {
			// Zahlen optimieren
			var minValue = Infinity, maxValue = -Infinity, isInteger = true;
			for (var i = 0; i < data.length; i++) {
				if (data[i] < minValue) minValue = data[i];
				if (data[i] > maxValue) maxValue = data[i];
				if (data[i] % 1 !== 0) isInteger = false;
			}
			if (isInteger) {
				if (minValue < 0) {
					maxValue = 2 * Math.max(maxValue, -minValue);
				}
				if (maxValue < 255) data = (minValue < 0 ? Int8Array : Uint8Array).from(data);
				else if (maxValue < 32000) data = (minValue < 0 ? Int16Array : Uint16Array).from(data);
				else if (maxValue < 4000000) data = (minValue < 0 ? Int32Array : Uint32Array).from(data);
			}
		}
	}

	this.getAll = function () {
		return data;
	}

	// get, getAll und search werden je nach Optimierung ersetzt
	this.get = function (recId) {
		return data[recId];
	}

	var costCount = 0;
	var search_internal = function (value/*, TODO: Comparison */) {
		costCount += data.length + 2;
		if (costCount > 1000) {
			console.log('optimize for index: ' + self.table.name + '.' + self.name);
			self.indices = optimizeIndices(Object.keys(data));
			self.indices.sort(function (a, b) {
				if (data[a] < data[b]) return -1;
				if (data[a] > data[b]) return 1;
				return 0;
			});
			search_internal = function (value) {
				var left = 0, right = self.indices.length - 1;
				while (left != right) {
					// linke Seite finden
					var pivot = ((left + right) / 2) | 0;
					var pv = data[self.indices[pivot]];
					if (pv < value) left = pivot + 1;
					else right = pivot;
				}
				var start = left;
				right = self.indices.length;
				while (left != right) {
					// linke Seite finden
					var pivot = ((left + right) / 2) | 0;
					var pv = data[self.indices[pivot]];
					if (pv <= value) left = pivot + 1;
					else right = pivot;
				}
				return self.indices.slice(start, right);
			}
			return search_internal(value);
		}
		var result = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i] == value) {
				result.push(i);
			}
		}
		return result;
	}

	this.search = function (value) { return search_internal(value); };

	this.optimize();
}

module.exports = Column;
