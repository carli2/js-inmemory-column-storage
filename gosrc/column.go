package main

import "log"
import "strings"

type Column interface {
	optimize() Column
	getAll() []interface{}
	get(recId int) interface{}
	search(value interface{}) []int

	load(count int, get func (interface{}))
}

func createColumn(sqlType string) Column {
	if strings.Contains(sqlType, "enum") || strings.Contains(sqlType, "text") || strings.Contains(sqlType, "char") {
		return &StringColumn{[]string{}}
	} else if strings.Contains(sqlType, "int") {
		return &IntColumn{[]int64{}}
	} else if strings.Contains(sqlType, "double") {
		return &DoubleColumn{[]float64{}}
	} else {
		log.Fatal("Unknown type ", sqlType)
		return &StringColumn{[]string{}}
	}
}

/* String column */
type StringColumn struct {
	data []string
}

func (c *StringColumn) optimize() Column {
	return c
}

func (c *StringColumn) getAll() []interface{} {
	result := make([]interface{}, len(c.data))
	for idx, data := range c.data {
		result[idx] = data
	}
	return result
}

func (c *StringColumn) get(recId int) interface{} {
	return c.data[recId]
}

func (c *StringColumn) search(data interface{}) []int {
	result := []int{}
	needle := data.(string)
	for recId, val := range c.data {
		if needle == val {
			result = append(result, recId)
		}
	}
	return result
}

func (c *StringColumn) load(count int, get func (interface{})) {
	c.data = make([]string, count)
	for i := 0; i < count; i++ {
		get(&c.data[i])
	}
}

/* Integer Column */
type IntColumn struct {
	data []int64
}

func (c *IntColumn) optimize() Column {
	return c
}

func (c *IntColumn) getAll() []interface{} {
	result := make([]interface{}, len(c.data))
	for idx, data := range c.data {
		result[idx] = data
	}
	return result
}

func (c *IntColumn) get(recId int) interface{} {
	return c.data[recId]
}

func (c *IntColumn) search(data interface{}) []int {
	result := []int{}
	needle := data.(int64)
	for recId, val := range c.data {
		if needle == val {
			result = append(result, recId)
		}
	}
	return result
}

func (c *IntColumn) load(count int, get func (interface{})) {
	c.data = make([]int64, count)
	for i := 0; i < count; i++ {
		get(&c.data[i])
	}
}

/* Double Column */
type DoubleColumn struct {
	data []float64
}

func (c *DoubleColumn) optimize() Column {
	return c
}

func (c *DoubleColumn) getAll() []interface{} {
	result := make([]interface{}, len(c.data))
	for idx, data := range c.data {
		result[idx] = data
	}
	return result
}

func (c *DoubleColumn) get(recId int) interface{} {
	return c.data[recId]
}

func (c *DoubleColumn) search(data interface{}) []int {
	result := []int{}
	needle := data.(float64)
	for recId, val := range c.data {
		if needle == val {
			result = append(result, recId)
		}
	}
	return result
}

func (c *DoubleColumn) load(count int, get func (interface{})) {
	c.data = make([]float64, count)
	for i := 0; i < count; i++ {
		get(&c.data[i])
	}
}
