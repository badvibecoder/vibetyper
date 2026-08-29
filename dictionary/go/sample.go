package main

import (
	"errors"
	"fmt"
	"strings"
)

// greeting returns a friendly greeting for the given name.
func greeting(name string) string {
	if strings.TrimSpace(name) == "" {
		name = "friend"
	}
	return fmt.Sprintf("Hello, %s!", name)
}

// divide performs integer division with a divide-by-zero guard.
func divide(numerator, denominator int) (int, error) {
	if denominator == 0 {
		return 0, errors.New("cannot divide by zero")
	}
	return numerator / denominator, nil
}

// sum adds every integer in a slice and returns the total.
func sum(values []int) int {
	total := 0
	for _, value := range values {
		total += value
	}
	return total
}

// reverse returns a new slice with the elements in reverse order.
func reverse(values []int) []int {
	reversed := make([]int, len(values))
	for i, value := range values {
		reversed[len(values)-1-i] = value
	}
	return reversed
}

// contains reports whether a target string exists in a slice.
func contains(items []string, target string) bool {
	for _, item := range items {
		if item == target {
			return true
		}
	}
	return false
}
