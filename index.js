var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'waechtler',
  port: 3333
});

connection.connect();

var Table = require('./table.js');
var Column = require('./column.js');
var DeltaStorage = require('./deltastorage.js');

var tables = {};
var tablesLeft = 0;


function importTable(tablename) {
	tablesLeft++;
	console.log('Importing Table ' + tablename + ' ...');
	connection.query('SELECT * FROM ??', tablename, function (error, results, fields) {
		console.log('Received ' + fields.length + ' columns and ' + results.length + ' rows for table ' + tablename);
		tables[tablename] = new Table(tablename, fields, results);
		if (!--tablesLeft) {
			console.log('Finished import after ' + process.uptime() + ' s');
			connection.end();
			startServer();
		}
	});
}

connection.query('SHOW TABLES', function (error, results, fields) {
	if (error) throw error;
	//console.log(fields, results);
	results.forEach(function (x) {
		importTable(x[fields[0].name]);
	});
});

function startServer() {
	// alle Tabellen veränderbar machen
	for (var table in tables) {
		tables[table] = new DeltaStorage(tables[table]);
	}
	tables['Users'].insert({ID: 1234, Username: 'anton'});

	//console.log(tables.Users);
	//console.log(tables.Users.cols.Username);
	console.log(tables.Users.lookup(tables.Users.cols.Username.search('anton')));

	console.log(tables.Maschine.lookup([1,2,3]));

	var uptime = process.uptime();
	var ids = tables.GehaltBonus.cols.ID.getAll();
	for (var i = 0; i < ids.length; i++) {
		var x = tables.GehaltBonus.lookup(tables.GehaltBonus.cols.ID.search(ids[i]));
		//console.log(ids[i], x);
	}
	console.log(process.uptime()-uptime);
}
