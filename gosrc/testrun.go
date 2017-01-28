package main

import "fmt"
import "time"
import "log"

// go get github.com/go-sql-driver/mysql
import "database/sql"
import _ "github.com/go-sql-driver/mysql"

var tables map[string] *Table

func main() {
	start := time.Now()
	db, err := sql.Open("mysql", "root:@tcp(localhost:3333)/waechtler")
	if err != nil {
		log.Fatal(err)
	}

	tables = importTables(db)

	fmt.Println("Import took", time.Since(start))

	for n := 0; n < 200; n++ {
		start := time.Now()
		maids := tables["Mitarbeiter"].cols["ID"].getAll()
		for recId, maId := range maids {
			x := tables["Mitarbeiter"].lookup(recId)
			ma := tables["GehaltBonus"].cols["Mitarbeiter"].search(maId)
			for _, recId2 := range ma {
				/*record := tables["GehaltBonus"].lookupTo(recId2, x)
				fmt.Println(record)*/
				tables["GehaltBonus"].lookupTo(recId2, x)
			}
		}
		fmt.Println(time.Since(start))
	}
	/*recs := tables["Firmen"].cols["Kuerzel"].search("HSK")
	for _, id := range recs {
		fmt.Println(tables["Firmen"].lookup(id))
	}*/
}
