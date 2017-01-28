package main

import "fmt"
import "log"
import "database/sql"

func importTable(db *sql.DB, name string) *Table {
	result := &Table{name, map[string]Column{}}
	var cnt int
	db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM `%s`", name)).Scan(&cnt)
	//fmt.Println("Item Count:", cnt)

	cols, err := db.Query(fmt.Sprintf("DESCRIBE `%s`", name))
	if err != nil {
		log.Fatal(err)
	}
	defer cols.Close()
	x, _ := cols.Columns()
	colrefs := make([]interface{}, len(x))
	var colname, typ sql.NullString
	colrefs[0] = &colname
	colrefs[1] = &typ
	for i := 2; i < len(x); i++ {
		var dummystr sql.NullString
		colrefs[i] = &dummystr
	}
	for cols.Next() {
		if err := cols.Scan(colrefs...); err != nil {
			log.Fatal(err)
		}
		//fmt.Printf("Spalte %s mit Typ %s\n", colname.String, typ.String)
		result.cols[colname.String] = createColumn(typ.String)
	}
	for colname, col := range result.cols {
		rows, err := db.Query(fmt.Sprintf("SELECT `%s` FROM `%s`", colname, name))
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		col.load(cnt, func (ref interface{}) {
			if rows.Next() {
				rows.Scan(ref)
			}
		})
	}
	/*for i := 0; i < cnt; i++ {
		fmt.Println(result.lookup(int64(i)))
	}*/
	return result
}


func importTables(db *sql.DB) map[string] *Table {
	tables := map[string] *Table{}
	rows, err := db.Query("SHOW TABLES")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			log.Fatal(err)
		}
		//fmt.Printf("Import Table %s\n", name)
		tables[name] = importTable(db, name)
	}
	return tables
}
