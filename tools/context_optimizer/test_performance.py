#!/usr/bin/env python3
"""
Performance testing for Context Size Optimizer Tool.

Tests the core performance targets:
- 30% average context reduction
- 95% token prediction accuracy  
- <500ms optimization overhead
- Context cache hit rate >70%
"""

import time
import statistics
from typing import List, Dict, Any
from pathlib import Path

from .optimizer import ContextOptimizer
from .config import get_default_config


class PerformanceTests:
    """Performance testing suite for context optimizer."""
    
    def __init__(self):
        """Initialize performance test suite."""
        self.optimizer = ContextOptimizer()
        self.test_results = {}
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all performance tests and return results."""
        print("Running Context Optimizer Performance Tests...")
        print("=" * 50)
        
        # Test 1: Context Reduction Target (30%)
        print("1. Testing context reduction target (30%)")
        reduction_results = self.test_context_reduction()
        
        # Test 2: Token Prediction Accuracy (95%)
        print("\n2. Testing token prediction accuracy (95%)")
        accuracy_results = self.test_token_prediction_accuracy()
        
        # Test 3: Processing Time (<500ms)
        print("\n3. Testing processing time (<500ms)")
        timing_results = self.test_processing_time()
        
        # Test 4: Cache Performance (>70% hit rate)
        print("\n4. Testing cache performance (>70% hit rate)")
        cache_results = self.test_cache_performance()
        
        # Compile overall results
        self.test_results = {
            "context_reduction": reduction_results,
            "token_prediction_accuracy": accuracy_results,
            "processing_time": timing_results,
            "cache_performance": cache_results,
            "overall_pass": self._calculate_overall_pass()
        }
        
        # Print summary
        self.print_summary()
        
        return self.test_results
    
    def test_context_reduction(self) -> Dict[str, Any]:
        """Test if average context reduction meets 30% target."""
        test_contents = self._generate_test_contents()
        reductions = []
        
        for i, content in enumerate(test_contents):
            try:
                result = self.optimizer.optimize_context(
                    content=content,
                    agent_type="coder",
                    task_description="code analysis"
                )
                reductions.append(result.reduction_percentage)
                print(f"  Test {i+1}: {result.reduction_percentage:.1f}% reduction")
                
            except Exception as e:
                print(f"  Test {i+1}: FAILED - {e}")
                reductions.append(0.0)
        
        average_reduction = statistics.mean(reductions) if reductions else 0.0
        target_met = average_reduction >= 30.0
        
        return {
            "average_reduction_percentage": average_reduction,
            "target_percentage": 30.0,
            "target_met": target_met,
            "individual_results": reductions,
            "pass": target_met
        }
    
    def test_token_prediction_accuracy(self) -> Dict[str, Any]:
        """Test token prediction accuracy against actual token counts."""
        test_contents = self._generate_test_contents()
        accuracy_scores = []
        
        for i, content in enumerate(test_contents):
            try:
                # Get predicted count
                predicted_tokens = self.optimizer.predict_token_count(content)
                
                # Get actual count through optimization
                result = self.optimizer.optimize_context(
                    content=content,
                    agent_type="general",
                    task_description="analysis"
                )
                actual_tokens = result.original_tokens
                
                # Calculate accuracy
                if actual_tokens > 0:
                    accuracy = 1.0 - abs(predicted_tokens - actual_tokens) / actual_tokens
                    accuracy = max(0.0, min(1.0, accuracy))  # Clamp to [0, 1]
                else:
                    accuracy = 1.0 if predicted_tokens == 0 else 0.0
                
                accuracy_scores.append(accuracy)
                print(f"  Test {i+1}: Predicted {predicted_tokens}, Actual {actual_tokens}, "
                      f"Accuracy {accuracy:.1%}")
                
            except Exception as e:
                print(f"  Test {i+1}: FAILED - {e}")
                accuracy_scores.append(0.0)
        
        average_accuracy = statistics.mean(accuracy_scores) if accuracy_scores else 0.0
        target_met = average_accuracy >= 0.95
        
        return {
            "average_accuracy": average_accuracy,
            "target_accuracy": 0.95,
            "target_met": target_met,
            "individual_scores": accuracy_scores,
            "pass": target_met
        }
    
    def test_processing_time(self) -> Dict[str, Any]:
        """Test if processing time is under 500ms."""
        test_contents = self._generate_test_contents()
        processing_times = []
        
        for i, content in enumerate(test_contents):
            try:
                start_time = time.time()
                result = self.optimizer.optimize_context(
                    content=content,
                    agent_type="coder",
                    task_description="optimization"
                )
                end_time = time.time()
                
                processing_time_ms = (end_time - start_time) * 1000
                processing_times.append(processing_time_ms)
                
                print(f"  Test {i+1}: {processing_time_ms:.1f}ms")
                
            except Exception as e:
                print(f"  Test {i+1}: FAILED - {e}")
                processing_times.append(1000.0)  # Penalty for failure
        
        average_time = statistics.mean(processing_times) if processing_times else 1000.0
        max_time = max(processing_times) if processing_times else 1000.0
        target_met = average_time < 500.0
        
        return {
            "average_time_ms": average_time,
            "max_time_ms": max_time,
            "target_time_ms": 500.0,
            "target_met": target_met,
            "individual_times": processing_times,
            "pass": target_met
        }
    
    def test_cache_performance(self) -> Dict[str, Any]:
        """Test cache hit rate performance."""
        test_content = self._generate_test_contents()[0]  # Use first test content
        
        # Clear cache to start fresh
        self.optimizer.clear_cache()
        
        # First optimization (cache miss)
        result1 = self.optimizer.optimize_context(
            content=test_content,
            agent_type="coder",
            task_description="test caching"
        )
        
        # Repeat same optimization multiple times (should hit cache)
        cache_hits = 0
        total_attempts = 10
        
        for i in range(total_attempts):
            result = self.optimizer.optimize_context(
                content=test_content,
                agent_type="coder", 
                task_description="test caching"
            )
            if result.cache_used:
                cache_hits += 1
        
        cache_hit_rate = (cache_hits / total_attempts) * 100
        target_met = cache_hit_rate >= 70.0
        
        # Get cache metrics
        cache_metrics = self.optimizer.get_cache_info()
        
        print(f"  Cache hits: {cache_hits}/{total_attempts}")
        print(f"  Hit rate: {cache_hit_rate:.1f}%")
        
        return {
            "cache_hit_rate": cache_hit_rate,
            "target_hit_rate": 70.0,
            "target_met": target_met,
            "cache_hits": cache_hits,
            "total_attempts": total_attempts,
            "cache_info": cache_metrics,
            "pass": target_met
        }
    
    def _generate_test_contents(self) -> List[str]:
        """Generate test content of various sizes and types."""
        test_contents = []
        
        # Small Python code sample
        test_contents.append("""
import os
import sys
from pathlib import Path

def process_file(file_path: str) -> str:
    \"\"\"Process a file and return its content.\"\"\"
    # Read the file
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Process the content
    lines = content.splitlines()
    processed_lines = []
    
    for line in lines:
        if line.strip():  # Skip empty lines
            processed_lines.append(line.strip())
    
    return '\\n'.join(processed_lines)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        result = process_file(sys.argv[1])
        print(result)
    else:
        print("Usage: script.py <file_path>")
""")
        
        # Medium documentation sample
        test_contents.append("""
# Context Size Optimizer

The Context Size Optimizer is a powerful tool designed to reduce the size of context passed to AI agents while maintaining the quality and relevance of the information.

## Features

- **Intelligent Pruning**: Removes unnecessary comments, whitespace, and redundant code
- **Content Prioritization**: Ranks content by relevance to the specific agent and task
- **Token-Accurate Counting**: Provides precise token counts for various AI models
- **Caching System**: Stores optimized contexts for improved performance
- **Real-time Optimization**: Integrates seamlessly with agent invocation pipelines

## Usage

Basic usage example:

```python
from context_optimizer import ContextOptimizer

optimizer = ContextOptimizer()
result = optimizer.optimize_context(
    content=source_code,
    agent_type="architect",
    task_description="code review"
)

print(f"Reduced from {result.original_tokens} to {result.optimized_tokens} tokens")
print(f"Reduction: {result.reduction_percentage:.1f}%")
```

## Configuration

The optimizer supports multiple configuration options:

- **Strategy**: Choose from balanced, aggressive, or conservative optimization
- **Target Size**: Set maximum token limits
- **Caching**: Configure cache size and TTL
- **Model Support**: Supports various AI models (GPT-4, Claude, etc.)

## Performance

The optimizer is designed to meet specific performance targets:

- 30% average context reduction
- 95% token prediction accuracy
- Sub-500ms processing time
- 70%+ cache hit rate

## Installation

Install the required dependencies:

```bash
pip install tiktoken pyyaml python-magic psutil
```

Then import and use the optimizer in your code.
""")
        
        # Large mixed content sample
        large_content = """
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import json
import time

# Configuration constants
DEFAULT_TIMEOUT = 30
MAX_RETRIES = 3
CACHE_SIZE = 1000

class APIError(Exception):
    \"\"\"Custom exception for API errors.\"\"\"
    pass

class RateLimitError(APIError):
    \"\"\"Exception for rate limit exceeded.\"\"\"
    pass

@dataclass
class RequestConfig:
    \"\"\"Configuration for API requests.\"\"\"
    url: str
    method: str = "GET"
    headers: Dict[str, str] = None
    timeout: int = DEFAULT_TIMEOUT
    retries: int = MAX_RETRIES
    
    def __post_init__(self):
        if self.headers is None:
            self.headers = {"Content-Type": "application/json"}

class AsyncAPIClient:
    \"\"\"
    Asynchronous API client with advanced features.
    
    This class provides a robust HTTP client with:
    - Automatic retries with exponential backoff
    - Rate limiting protection
    - Response caching
    - Comprehensive error handling
    - Request/response logging
    \"\"\"
    
    def __init__(self, base_url: str, api_key: str = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = None
        self.cache = {}
        self.request_count = 0
        self.logger = logging.getLogger(__name__)
    
    async def __aenter__(self):
        \"\"\"Async context manager entry.\"\"\"
        import aiohttp
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        \"\"\"Async context manager exit.\"\"\"
        if self.session:
            await self.session.close()
    
    async def request(self, config: RequestConfig) -> Dict[str, Any]:
        \"\"\"
        Make an HTTP request with the given configuration.
        
        Args:
            config: Request configuration
            
        Returns:
            Response data as dictionary
            
        Raises:
            APIError: For various API-related errors
            RateLimitError: When rate limit is exceeded
        \"\"\"
        if not self.session:
            raise APIError("Client not initialized. Use async context manager.")
        
        # Check cache first
        cache_key = self._generate_cache_key(config)
        if cache_key in self.cache:
            self.logger.debug(f"Cache hit for {config.url}")
            return self.cache[cache_key]
        
        # Prepare request
        url = f"{self.base_url}/{config.url.lstrip('/')}"
        headers = config.headers.copy()
        
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        
        # Retry loop
        last_exception = None
        for attempt in range(config.retries + 1):
            try:
                self.logger.debug(f"Request attempt {attempt + 1}: {config.method} {url}")
                
                async with self.session.request(
                    method=config.method,
                    url=url,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=config.timeout)
                ) as response:
                    
                    self.request_count += 1
                    
                    # Handle rate limiting
                    if response.status == 429:
                        retry_after = int(response.headers.get("Retry-After", 60))
                        self.logger.warning(f"Rate limited. Waiting {retry_after} seconds.")
                        
                        if attempt < config.retries:
                            await asyncio.sleep(retry_after)
                            continue
                        else:
                            raise RateLimitError("Rate limit exceeded and max retries reached")
                    
                    # Handle other HTTP errors
                    if response.status >= 400:
                        error_text = await response.text()
                        raise APIError(f"HTTP {response.status}: {error_text}")
                    
                    # Parse response
                    try:
                        data = await response.json()
                    except Exception:
                        data = {"text": await response.text()}
                    
                    # Cache successful response
                    self.cache[cache_key] = data
                    return data
            
            except asyncio.TimeoutError as e:
                last_exception = APIError(f"Request timeout: {e}")
                if attempt < config.retries:
                    wait_time = 2 ** attempt  # Exponential backoff
                    self.logger.warning(f"Timeout on attempt {attempt + 1}. Retrying in {wait_time}s")
                    await asyncio.sleep(wait_time)
            
            except Exception as e:
                last_exception = APIError(f"Request failed: {e}")
                if attempt < config.retries:
                    wait_time = 2 ** attempt
                    await asyncio.sleep(wait_time)
        
        # All retries exhausted
        raise last_exception or APIError("Request failed after all retries")
    
    def _generate_cache_key(self, config: RequestConfig) -> str:
        \"\"\"Generate cache key for request.\"\"\"
        key_data = {
            "url": config.url,
            "method": config.method,
            "headers": config.headers
        }
        return hash(json.dumps(key_data, sort_keys=True))
    
    def get_stats(self) -> Dict[str, Any]:
        \"\"\"Get client statistics.\"\"\"
        return {
            "total_requests": self.request_count,
            "cache_entries": len(self.cache),
            "base_url": self.base_url
        }
    
    def clear_cache(self):
        \"\"\"Clear response cache.\"\"\"
        self.cache.clear()
        self.logger.info("Cache cleared")

# Usage example
async def main():
    \"\"\"Example usage of AsyncAPIClient.\"\"\"
    
    config = RequestConfig(
        url="/api/v1/data",
        method="GET",
        timeout=10,
        retries=2
    )
    
    async with AsyncAPIClient("https://api.example.com", "your-api-key") as client:
        try:
            data = await client.request(config)
            print(f"Received data: {data}")
            
            # Make the same request again (should hit cache)
            cached_data = await client.request(config)
            print(f"Cached data: {cached_data}")
            
            # Print client stats
            stats = client.get_stats()
            print(f"Client stats: {stats}")
            
        except RateLimitError:
            print("Rate limit exceeded. Please try again later.")
        except APIError as e:
            print(f"API error: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
""" * 2  # Double the content to make it larger
        
        test_contents.append(large_content)
        
        return test_contents
    
    def _calculate_overall_pass(self) -> bool:
        """Calculate if all tests pass overall."""
        if not self.test_results:
            return False
        
        return all(
            result.get("pass", False)
            for result in self.test_results.values()
            if isinstance(result, dict)
        )
    
    def print_summary(self):
        """Print test summary."""
        print("\n" + "=" * 50)
        print("PERFORMANCE TEST SUMMARY")
        print("=" * 50)
        
        # Context reduction
        reduction = self.test_results["context_reduction"]
        print(f"1. Context Reduction: {'✓ PASS' if reduction['pass'] else '✗ FAIL'}")
        print(f"   Average: {reduction['average_reduction_percentage']:.1f}% "
              f"(Target: {reduction['target_percentage']:.1f}%)")
        
        # Token prediction accuracy
        accuracy = self.test_results["token_prediction_accuracy"]
        print(f"2. Token Prediction: {'✓ PASS' if accuracy['pass'] else '✗ FAIL'}")
        print(f"   Accuracy: {accuracy['average_accuracy']:.1%} "
              f"(Target: {accuracy['target_accuracy']:.1%})")
        
        # Processing time
        timing = self.test_results["processing_time"]
        print(f"3. Processing Time: {'✓ PASS' if timing['pass'] else '✗ FAIL'}")
        print(f"   Average: {timing['average_time_ms']:.1f}ms "
              f"(Target: <{timing['target_time_ms']:.0f}ms)")
        
        # Cache performance
        cache = self.test_results["cache_performance"]
        print(f"4. Cache Performance: {'✓ PASS' if cache['pass'] else '✗ FAIL'}")
        print(f"   Hit Rate: {cache['cache_hit_rate']:.1f}% "
              f"(Target: >{cache['target_hit_rate']:.0f}%)")
        
        print(f"\nOverall Result: {'✓ ALL TESTS PASSED' if self.test_results['overall_pass'] else '✗ SOME TESTS FAILED'}")


def main():
    """Run performance tests."""
    tests = PerformanceTests()
    results = tests.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["overall_pass"] else 1


if __name__ == "__main__":
    exit(main())