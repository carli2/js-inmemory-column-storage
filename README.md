JS InMemory Column Storage
==========================
JICS is a self-optimizing in-memory column storage. Its design is inspired from SAP HANA and follows the following principles:
- Data is organized into tables which are organized into columns
- Table's entries are identified by a record-id
- You can import tables from existing MySQL databases
- Tables are automatically optimized: Indices are created when you use search(value) often enough
- The column storage format is wisely chosen (bit compressing for integers, strings are stored in dictionaries)
- You can add a DeltaStorage overlay over a table that allows you to delete(recId) and insert(object) records
- DeltaStorage gets slower the more changes you made. You can merge it with the table to get a optimized table SAP HANA does this every 15 minutes

Fun Fact: In a first test, querying a join over 10,000 items I got the same speed as MySQL running in a tempfs container (JICS built the index on-the-fly during query time)

Interfaces
----------

Table and DeltaStorage provide the following interface:
- constructor Table(name, cols, rows) is compatible with (results, fields) from Node.js MySQL connector and is ment for importing tables
- lookup(id_or_array_of_ids, [cols], [object_or_list_to_append]) creates a object or a list of objects given a id or list of ids and optinally a list of columns to retrieve; Runtime is O(1) for IDs and O(N) for a list of IDs
- cols: Object containing all columns

DeltaStorage also has the following methods:
- constructor DeltaStorage(table) creates an overlay over a existing table and therefore allow changes to it
- delete(recId) deletes the record with the specified record id, Runtime is O(1) but slows down future queries
- insert(record) inserts the given record into the table. record should have properties named after the table's columns, Runtime is O(1) but slows down future queries
- flush() rebuilds the underlying table from the table and delta - speeds up queries

A Column has the following methods:
- getAll() returns a list of all values in the table (array indexed after record id, deleted records have undefined), Runtime is O(1)
- get(recId) returns the value for record recId. This does not check for deleted columns, so only call it if the record exists, Runtime is O(1)
- search(value/*, TODO: =, >, <, >=, <=*/) returns a array of recIds where the value equals (TODO: also ask for ranges) - this function automagically builds indexes, Runtime is O(log N)

ToDo
----
- SQL frontend with query optimization (implmenting "Unnesting Arbitrary Nested Queries")
- Automatic column statistic (e.g. selectivity) for Join Reordering and other optimizations
- MySQL compatible server protocol
