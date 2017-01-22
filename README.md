JS InMemory Column Storage
==========================
JICS is a self-optimizing in-memory column storage. Its design is inspired from SAP HANA and follows the following principles:
- Data is organized into tables which are organized into columns
- Table's entries are identified by a record-id
- Columns provide get(recId) that retrieves data and search(value) that returns an array of record-ids that have the value
- You can import tables from existing MySQL databases
- Tables are automatically optimized: Indices are created when you use search(value) often enough
- The column storage format is wisely chosen (bit compressing for integers, strings are stored in dictionaries)
- You can add a DeltaStorage overlay over a table that allows you to delete(recId) and insert(object) records (update consists of delete and insert)
- DeltaStorage gets slower the more changes you made. You can merge it with the table to get a optimized table SAP HANA does this every 15 minutes

ToDo:
- SQL frontend with query optimization (implmenting "Unnesting Arbitrary Nested Queries")
- Automatic column statistic (e.g. selectivity) for Join Reordering and other optimizations
- MySQL compatible server protocol
