package main

type Table struct {
	name string
	cols map[string]Column
}

func (t *Table) lookup(recId int) map[string]interface{} {
	keys := make([]string, len(t.cols))
	i := 0
	for k := range t.cols {
		keys[i] = k
		i++
	}
	return t.lookupCols(recId, keys)
}

func (t *Table) lookupTo(recId int, result map[string]interface{}) map[string]interface{} {
	keys := make([]string, len(t.cols))
	i := 0
	for k := range t.cols {
		keys[i] = k
		i++
	}
	return t.lookupColsTo(recId, keys, result)
}

func (t *Table) lookupCols(recId int, cols []string) map[string]interface{} {
	result := make(map[string]interface{})
	return t.lookupColsTo(recId, cols, result)
}

func (t *Table) lookupColsTo(recId int, cols []string, result map[string]interface{}) map[string]interface{} {
	for _, col := range cols {
		result[col] = t.cols[col].get(recId)
	}
	return result
}

