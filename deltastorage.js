function DeltaStorage(table) {
	var self = this;
	this.table = table;
	var size;

	this.lookup = table.lookup; // Methode kopieren, da sie mit this arbeitet

	var deleteList = {};
	var insertList = [];

	function DeltaColumn (delta, column) {
		this.table = delta;
		this.name = column.name;

		// imitate interface
		this.getAll = function () {
			var list = column.getAll().map((val, idx) => deleteList[idx] ? undefined : val);
			for (var i = 0; i < insertList.length; i++) {
				if (!deleteList[size + i]) list.push(insertList[i][column.name]);
			}
			return list;
		}

		this.get = function (recId) {
			// Je nach recId aus alt oder neu
			return recId < size ? column.get(recId) : insertList[recId - size][column.name];
		}
		this.search = function (value) {
			var list = column.search(value).filter(id => !deleteList[id]);
			for (var i = 0; i < insertList.length; i++) {
				// neue RecIds dazu
				if (!deleteList[size + i] && insertList[i][column.name] == value) list.push(size + i);
			}
			return list;
		}
	}

	// imitate table interface
	this.name = table.name;
	this.cols = {};
	for (var col in table.cols) {
		size = table.cols[col].getAll().length;
		this.cols[col] = new DeltaColumn(this, table.cols[col]);
	}

	// Lese-Schreib-Operationen
	this.delete = function (recId) {
		deleteList[recId] = true;
	}
	this.insert = function (record) {
		insertList.push(record);
		// neue recId
		return size + insertList.length - 1;
	}

	// TODO: Array.prototype.slice.call(arr); neue Table bauen
}

module.exports = DeltaStorage;
