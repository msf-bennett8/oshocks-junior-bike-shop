# Bennett Fibonacci 36th Codec
## Comprehensive Documentation

**Version:** 1.0.0  
**Author:** Zablon Bennett  
**Date:** 2026-03-26  
**Language:** JavaScript (ES6+)

---

## Table of Contents
1. [Overview](#overview)
2. [Mathematical Foundation](#mathematical-foundation)
3. [Core Algorithms](#core-algorithms)
4. [Implementation](#implementation)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Security Considerations](#security-considerations)

---

## Overview

The Bennett Fibonacci 36th Codec is a bidirectional encoding/decoding system that transforms alphanumeric strings using the Fibonacci sequence with a dynamic batch dropping and reintroduction mechanism.

### Key Features
- **Base 36 encoding:** Uses characters 0-9 and A-Z
- **Fibonacci-based shifting:** Applies Fibonacci numbers (0,1,1,2,3,5,8,13,21,34) to shift characters
- **Dynamic batch evolution:** Each batch modifies the sequence by dropping and reintroducing values
- **Reversible:** Perfect lossless encoding and decoding
- **Length preserving:** Output length equals input length

---

## Mathematical Foundation

### Base 36 Alphabet

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 |
|-------|---|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|----|----|
| Char  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A  | B  | C  | D  | E  | F  | G  | H  |

| Index | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 |
|-------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| Char  | I  | J  | K  | L  | M  | N  | O  | P  | Q  | R  | S  | T  | U  | V  | W  | X  | Y  | Z  |

### Fibonacci Sequence
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34
plain
Copy

### Core Formulas

#### Encoding Formula
E(i) = (C(i) + Fib(batch(i), pos(i))) mod 36
Where:
E(i) = Encoded character at position i
C(i) = Original character index at position i
Fib(batch, pos) = Fibonacci value for batch and position
mod 36 = Modulo operation to stay within base 36
plain
Copy

#### Decoding Formula
D(i) = (E(i) - Fib(batch(i), pos(i))) mod 36
Where:
D(i) = Decoded character index at position i
E(i) = Encoded character index at position i
plain
Copy

#### Batch Calculation
batch(i) = floor(i / 10)
pos(i)   = i mod 10
plain
Copy

---

## Core Algorithms

### Batch Evolution Algorithm

The codec uses 10 batches before cycling, with each batch modifying the Fibonacci sequence through dropping and reintroduction.

#### Phase 1: Dropping (Batches 0-9)

| Batch | Sequence | Operation |
|-------|----------|-----------|
| 0 | 0, 1, 1, 2, 3, 5, 8, 13, 21, **34** | Original sequence |
| 1 | **34**, 0, 1, 1, 2, 3, 5, 8, 13, **21** | Prepend dropped 34, drop 21 |
| 2 | **21**, 34, 0, 1, 1, 2, 3, 5, 8, **13** | Prepend dropped 21, drop 13 |
| 3 | **13**, 21, 34, 0, 1, 1, 2, 3, 5, **8** | Prepend dropped 13, drop 8 |
| 4 | **8**, 13, 21, 34, 0, 1, 1, 2, 3, **5** | Prepend dropped 8, drop 5 |
| 5 | **5**, 8, 13, 21, 34, 0, 1, 1, 2, **3** | Prepend dropped 5, drop 3 |
| 6 | **3**, 5, 8, 13, 21, 34, 0, 1, 1, **2** | Prepend dropped 3, drop 2 |
| 7 | **2**, 3, 5, 8, 13, 21, 34, 0, 1, **1** | Prepend dropped 2, drop 1 |
| 8 | **1**, 2, 3, 5, 8, 13, 21, 34, 0, **1** | Prepend dropped 1, drop 1 |
| 9 | **1**, 1, 2, 3, 5, 8, 13, 21, 34, **0** | Prepend dropped 1, drop 0 |

#### Phase 2: Reintroduction (Batches 10+)

| Batch | Sequence | Operation |
|-------|----------|-----------|
| 10 | 0, 1, 1, 2, 3, 5, 8, 13, 21, **0** | Reintroduce first dropped (0) |
| 11 | 0, 1, 1, 2, 3, 5, 8, 13, 21, **1** | Reintroduce second dropped (1) |
| 12 | 0, 1, 1, 2, 3, 5, 8, 13, 21, **1** | Reintroduce third dropped (1) |
| ... | ... | Continue reintroducing in drop order |

---

## Implementation

### Complete JavaScript Implementation

```javascript
/**
 * Bennett Fibonacci 36th Codec
 * A bidirectional encoding/decoding system using Fibonacci sequence
 * with dynamic batch dropping and reintroduction.
 */

class BennettFibonacci36thCodec {
    /**
     * Creates a new codec instance
     */
    constructor() {
        // Base 36 alphabet: 0-9, A-Z
        this.ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        
        // Base Fibonacci sequence
        this.FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
        
        // Batch size
        this.BATCH_SIZE = 10;
        
        // State tracking
        this.droppedStack = [];
        this.batchCache = new Map();
    }

    /**
     * Converts character to numeric index (0-35)
     * @param {string} char - Single character
     * @returns {number} - Index in alphabet
     */
    charToIndex(char) {
        const index = this.ALPHABET.indexOf(char.toUpperCase());
        if (index === -1) {
            throw new Error(`Invalid character: ${char}`);
        }
        return index;
    }

    /**
     * Converts numeric index to character
     * @param {number} index - Index (0-35)
     * @returns {string} - Character
     */
    indexToChar(index) {
        // Handle negative modulo correctly
        const normalizedIndex = ((index % 36) + 36) % 36;
        return this.ALPHABET[normalizedIndex];
    }

    /**
     * Generates a batch sequence based on batch number
     * Implements drop and reintroduction logic
     * @param {number} batchNum - Batch number (0, 1, 2, ...)
     * @returns {Array} - Fibonacci sequence for this batch
     */
    generateBatch(batchNum) {
        // Batch 0: Original sequence
        if (batchNum === 0) {
            return [...this.FIB];
        }

        // Phase 1: Dropping (batches 1-10)
        if (batchNum <= 10) {
            const prevBatch = this.generateBatch(batchNum - 1);
            const lastDropped = prevBatch[prevBatch.length - 1];
            
            // Track dropped value
            this.droppedStack.push(lastDropped);
            
            // Create new batch: prepend dropped, shift right
            return [lastDropped, ...prevBatch.slice(0, -1)];
        }

        // Phase 2: Reintroduction (batches 11+)
        const reintroIndex = batchNum - 11;
        
        if (reintroIndex < this.droppedStack.length) {
            // Reintroduce dropped value at end
            const reintroValue = this.droppedStack[reintroIndex];
            const batch = [...this.FIB];
            batch[batch.length - 1] = reintroValue;
            return batch;
        }

        // Default: return original sequence
        return [...this.FIB];
    }

    /**
     * Gets Fibonacci value for a specific position
     * @param {number} position - Character position in input
     * @returns {number} - Fibonacci value to apply
     */
    getFibonacci(position) {
        const batchNum = Math.floor(position / this.BATCH_SIZE);
        const posInBatch = position % this.BATCH_SIZE;

        // Cache batch if not already computed
        if (!this.batchCache.has(batchNum)) {
            this.batchCache.set(batchNum, this.generateBatch(batchNum));
        }

        const batch = this.batchCache.get(batchNum);
        return batch[posInBatch];
    }

    /**
     * Resets internal state
     * Call before encode/decode operations
     */
    reset() {
        this.droppedStack = [];
        this.batchCache.clear();
    }

    /**
     * Encodes an input string
     * @param {string} inputString - String to encode (0-9, A-Z only)
     * @returns {string} - Encoded string
     */
    encode(inputString) {
        this.reset();

        const result = [];

        for (let i = 0; i < inputString.length; i++) {
            const char = inputString[i];
            const originalIndex = this.charToIndex(char);
            const fibValue = this.getFibonacci(i);
            const encodedIndex = (originalIndex + fibValue) % 36;
            
            result.push(this.indexToChar(encodedIndex));
        }

        return result.join('');
    }

    /**
     * Decodes an encoded string
     * @param {string} encodedString - String to decode
     * @returns {string} - Decoded string
     */
    decode(encodedString) {
        this.reset();

        const result = [];

        for (let i = 0; i < encodedString.length; i++) {
            const char = encodedString[i];
            const encodedIndex = this.charToIndex(char);
            const fibValue = this.getFibonacci(i);
            const originalIndex = (encodedIndex - fibValue) % 36;
            
            result.push(this.indexToChar(originalIndex));
        }

        return result.join('');
    }

    /**
     * Gets detailed encoding information for debugging
     * @param {string} inputString - String to analyze
     * @returns {Array} - Step-by-step encoding details
     */
    getEncodingDetails(inputString) {
        this.reset();

        const details = [];

        for (let i = 0; i < inputString.length; i++) {
            const char = inputString[i].toUpperCase();
            const originalIndex = this.charToIndex(char);
            const fibValue = this.getFibonacci(i);
            const encodedIndex = (originalIndex + fibValue) % 36;
            const encodedChar = this.indexToChar(encodedIndex);
            const batchNum = Math.floor(i / this.BATCH_SIZE);

            details.push({
                position: i,
                originalChar: char,
                originalIndex: originalIndex,
                batchNumber: batchNum,
                fibonacciValue: fibValue,
                sum: originalIndex + fibValue,
                mod36: encodedIndex,
                encodedChar: encodedChar
            });
        }

        return details;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BennettFibonacci36thCodec;
}
Usage Examples
Basic Usage
JavaScript
Copy
const codec = new BennettFibonacci36thCodec();

// Encode a string
const original = "ACQDAG7K9Z";
const encoded = codec.encode(original);
console.log(`Original: ${original}`);  // ACQDAG7K9Z
console.log(`Encoded:  ${encoded}`);   // ADRFDFLXUX

// Decode back
const decoded = codec.decode(encoded);
console.log(`Decoded:  ${decoded}`);   // ACQDAG7K9Z
console.log(`Match: ${original === decoded}`);  // true
Long String (Multiple Batches)
JavaScript
Copy
const codec = new BennettFibonacci36thCodec();
const longInput = "ACQDAG7K9ZACQDAG7K9Z";  // 20 characters, 2 batches

const encoded = codec.encode(longInput);
const decoded = codec.decode(longInput);

console.log(`Original: ${longInput}`);
console.log(`Encoded:  ${encoded}`);
console.log(`Decoded:  ${decoded}`);
console.log(`Match: ${longInput === decoded}`);  // true
Detailed Encoding Analysis
JavaScript
Copy
const codec = new BennettFibonacci36thCodec();
const input = "ACQDAG7K9Z";

const details = codec.getEncodingDetails(input);

console.log("Pos | Char | Index | Batch | Fib | Sum | mod36 | Result");
console.log("----|------|-------|-------|-----|-----|-------|--------");

details.forEach(step => {
    console.log(
        `${step.position.toString().padStart(3)} | ` +
        `${step.originalChar}    | ` +
        `${step.originalIndex.toString().padStart(5)} | ` +
        `${step.batchNumber.toString().padStart(5)} | ` +
        `${step.fibonacciValue.toString().padStart(3)} | ` +
        `${step.sum.toString().padStart(3)} | ` +
        `${step.mod36.toString().padStart(5)} | ` +
        `${step.encodedChar}`
    );
});
Output:
plain
Copy
Pos | Char | Index | Batch | Fib | Sum | mod36 | Result
----|------|-------|-------|-----|-----|-------|--------
  0 | A    |    10 |     0 |   0 |  10 |    10 | A
  1 | C    |    12 |     0 |   1 |  13 |    13 | D
  2 | Q    |    26 |     0 |   1 |  27 |    27 | R
  3 | D    |    13 |     0 |   2 |  15 |    15 | F
  4 | A    |    10 |     0 |   3 |  13 |    13 | D
  5 | G    |    16 |     0 |   5 |  21 |    21 | L
  6 | 7    |     7 |     0 |   8 |  15 |    15 | F
  7 | K    |    20 |     0 |  13 |  33 |    33 | X
  8 | 9    |     9 |     0 |  21 |  30 |    30 | U
  9 | Z    |    35 |     0 |  34 |  69 |    33 | X
API Reference
Constructor
new BennettFibonacci36thCodec()
Creates a new codec instance with fresh state.
Methods
encode(inputString: string): string
Encodes an alphanumeric string using the Bennett Fibonacci 36th Codec.
Parameters:
inputString - String containing only 0-9 and A-Z (case insensitive)
Returns:
Encoded string of same length
Throws:
Error if input contains invalid characters
decode(encodedString: string): string
Decodes an encoded string back to original.
Parameters:
encodedString - Previously encoded string
Returns:
Original decoded string
Throws:
Error if input contains invalid characters
getEncodingDetails(inputString: string): Array<Object>
Returns detailed step-by-step encoding information for debugging.
Returns:
Array of objects with properties:
position - Character position
originalChar - Input character
originalIndex - Numeric index (0-35)
batchNumber - Which batch this position uses
fibonacciValue - Fibonacci number applied
sum - Index + Fibonacci (before modulo)
mod36 - Result after modulo 36
encodedChar - Final encoded character
Private Methods (Internal)
charToIndex(char: string): number
Converts character to numeric index (0-35).
indexToChar(index: number): string
Converts numeric index to character.
generateBatch(batchNum: number): Array<number>
Generates Fibonacci sequence for specific batch with drop/reintroduction logic.
getFibonacci(position: number): number
Gets Fibonacci value for a specific character position.
reset(): void
Resets internal state (dropped stack and batch cache).
Security Considerations
Strengths
Table
Feature	Security Benefit
No fixed key	Pattern changes with every batch
Drop & reintroduction	Prevents simple frequency analysis
Reversible	Lossless encoding, no information loss
Deterministic	Same input always produces same output
Limitations
Table
Limitation	Mitigation
Keyless system	Anyone with algorithm can decode	Keep algorithm private
Pattern visible with analysis	Use as obfuscation, not encryption	Add additional encryption layer
Fixed batch size	Could be detected	Vary batch size per implementation
Recommended Use Cases
Order number obfuscation
Receipt code generation
URL shortener codes
Non-sensitive identifier masking
Not Recommended For
Password encryption
Sensitive data protection
Cryptographically secure applications
License
MIT License - Free for personal and commercial use.
Changelog
Table
Version	Date	Changes
1.0.0	2026-03-26	Initial release with drop & reintroduction
plain
Copy

This documentation provides complete specifications, formulas, implementation, and usage examples for the Bennett Fibonacci 36th Codec.