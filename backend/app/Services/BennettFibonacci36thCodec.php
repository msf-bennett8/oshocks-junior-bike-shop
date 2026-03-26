<?php

namespace App\Services;

/**
 * Bennett Fibonacci 36th Codec
 * Encodes/decodes Base36 strings using Fibonacci sequence shifting
 */
class BennettFibonacci36thCodec
{
    private string $alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private array $fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
    private int $batchSize = 10;
    
    /**
     * Encode a Base36 string
     */
    public function encode(string $input): string
    {
        $result = [];
        $input = strtoupper($input);
        
        for ($i = 0; $i < strlen($input); $i++) {
            $char = $input[$i];
            $originalIndex = strpos($this->alphabet, $char);
            
            if ($originalIndex === false) {
                throw new \InvalidArgumentException("Invalid character: {$char}");
            }
            
            $fibValue = $this->getFibonacci($i);
            $encodedIndex = ($originalIndex + $fibValue) % 36;
            $result[] = $this->alphabet[$encodedIndex];
        }
        
        return implode('', $result);
    }
    
    /**
     * Decode an encoded string
     */
    public function decode(string $encoded): string
    {
        $result = [];
        $encoded = strtoupper($encoded);
        
        for ($i = 0; $i < strlen($encoded); $i++) {
            $char = $encoded[$i];
            $encodedIndex = strpos($this->alphabet, $char);
            
            if ($encodedIndex === false) {
                throw new \InvalidArgumentException("Invalid character: {$char}");
            }
            
            $fibValue = $this->getFibonacci($i);
            $originalIndex = ($encodedIndex - $fibValue) % 36;
            
            // Handle negative modulo
            if ($originalIndex < 0) {
                $originalIndex += 36;
            }
            
            $result[] = $this->alphabet[$originalIndex];
        }
        
        return implode('', $result);
    }
    
    /**
     * Get Fibonacci value for position
     */
    private function getFibonacci(int $position): int
    {
        $batchNum = intdiv($position, $this->batchSize);
        $posInBatch = $position % $this->batchSize;
        
        // Generate batch sequence with drop/reintroduction
        $batch = $this->generateBatch($batchNum);
        
        return $batch[$posInBatch];
    }
    
    /**
     * Generate batch sequence
     */
    private function generateBatch(int $batchNum): array
    {
        if ($batchNum === 0) {
            return $this->fib;
        }
        
        // Phase 1: Dropping (batches 1-10)
        if ($batchNum <= 10) {
            $prevBatch = $this->generateBatch($batchNum - 1);
            $lastDropped = end($prevBatch);
            return array_merge([$lastDropped], array_slice($prevBatch, 0, -1));
        }
        
        // Phase 2: Reintroduction (batches 11+)
        $reintroIndex = $batchNum - 11;
        $batch = $this->fib;
        
        if ($reintroIndex < 10) {
            // Reintroduce dropped values in order
            $droppedStack = [];
            for ($i = 1; $i <= 10; $i++) {
                $prev = $this->generateBatch($i - 1);
                $droppedStack[] = end($prev);
            }
            $batch[9] = $droppedStack[$reintroIndex] ?? 0;
        }
        
        return $batch;
    }
}