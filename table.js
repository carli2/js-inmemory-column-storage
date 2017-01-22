var Column = require('./column.js');

function Table(name, cols, rows) {
	var self = this;
	this.name = name;
	this.cols = {};
	cols.forEach(function (col) {
		self.cols[col.name] = new Column(self, col.name, rows);
	});

	this.lookup = function (ids, cols, result) {
		cols = cols || Object.keys(this.cols);
		if (typeof ids === 'number') {
			result = result || {};
			for (var j = 0; j < cols.length; j++) {
				result[cols[j]] = this.cols[cols[j]].get(ids);
			}
		} else {
			result = result || [];
			for (var i = 0; i < ids.length; i++) {
				result.push(this.lookup(ids[i], cols));
			}
		}
		return result;
	}
}

module.exports = Table;
