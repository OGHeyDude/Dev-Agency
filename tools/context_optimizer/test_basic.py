#!/usr/bin/env python3
"""
Basic test to verify Context Size Optimizer functionality.

This test uses mock dependencies to verify the core implementation works
without requiring external packages like tiktoken.
"""

import sys
import time
from pathlib import Path
from unittest.mock import Mock, patch

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def mock_tiktoken():
    """Mock tiktoken module."""
    tiktoken_mock = Mock()
    tiktoken_mock.get_encoding.return_value.encode.side_effect = lambda x: [1] * (len(x) // 4)
    return tiktoken_mock

def test_basic_optimization():
    """Test basic optimization functionality."""
    print("Testing Context Size Optimizer Basic Functionality")
    print("=" * 50)
    
    # Mock dependencies
    with patch.dict('sys.modules', {'tiktoken': mock_tiktoken()}):
        
        # Import after mocking
        from context_optimizer.optimizer import ContextOptimizer
        from context_optimizer.config import get_default_config
        
        print("✓ Imports successful")
        
        # Initialize optimizer with lower token limits to trigger optimization
        config = get_default_config("balanced")
        config.token_counting.max_tokens = 200  # Lower limit to trigger optimization
        config.token_counting.safety_margin = 20
        optimizer = ContextOptimizer(config)
        print("✓ Optimizer initialized")
        
        # Test content with various optimization opportunities
        test_content = """import os
import sys
from pathlib import Path

def process_data(data):
    '''
    This function processes data and returns results.
    
    Args:
        data: Input data to process
    
    Returns:
        Processed data
    '''
    # Debug print statement
    print(f"Processing data: {data}")
    
    # Check if data is valid
    if not data:
        print("Warning: No data provided")
        return None
    
    # Process the data
    result = []
    for item in data:
        # Another debug statement
        print(f"Processing item: {item}")
        
        # Add processed item
        processed = item.upper()
        result.append(processed)
    
    # Final debug statement  
    print(f"Processing complete. Results: {result}")
    return result

if __name__ == "__main__":
    # Test data
    test_data = ["hello", "world", "test"]
    
    # Process the data
    output = process_data(test_data)
    print(f"Final output: {output}")
"""
        
        print(f"Test content length: {len(test_content)} characters")
        
        # Test optimization
        start_time = time.time()
        result = optimizer.optimize_context(
            content=test_content,
            agent_type="coder",
            task_description="code review and cleanup"
        )
        end_time = time.time()
        
        processing_time = (end_time - start_time) * 1000
        
        print("\nOptimization Results:")
        print("-" * 30)
        print(f"✓ Original tokens: {result.original_tokens}")
        print(f"✓ Optimized tokens: {result.optimized_tokens}")
        print(f"✓ Tokens saved: {result.tokens_saved}")
        print(f"✓ Reduction: {result.reduction_percentage:.1f}%")
        print(f"✓ Quality score: {result.quality_score:.2f}")
        print(f"✓ Processing time: {result.processing_time_ms:.1f}ms")
        print(f"✓ Cache used: {result.cache_used}")
        
        if result.operations_applied:
            print(f"✓ Operations applied: {', '.join(result.operations_applied)}")
        
        if result.warnings:
            print(f"⚠ Warnings: {', '.join(result.warnings)}")
        
        # Verify performance targets
        print("\nPerformance Target Validation:")
        print("-" * 30)
        
        targets_met = {
            "Reduction >= 10%": result.reduction_percentage >= 10.0,
            "Quality >= 0.7": result.quality_score >= 0.7, 
            "Processing < 500ms": result.processing_time_ms < 500.0,
            "Optimization successful": result.was_successful
        }
        
        all_targets_met = True
        for target, met in targets_met.items():
            status = "✓ PASS" if met else "✗ FAIL"
            print(f"{status} {target}")
            if not met:
                all_targets_met = False
        
        print(f"\nOverall Test Result: {'✓ SUCCESS' if all_targets_met else '✗ FAILURE'}")
        
        # Test metrics
        metrics = optimizer.get_optimization_metrics()
        print(f"\nOptimizer Metrics:")
        print(f"- Total optimizations: {metrics['optimizations_count']}")
        print(f"- Average reduction: {metrics['average_reduction_percentage']:.1f}%")
        print(f"- Cache hit rate: {metrics['cache_hit_rate']:.1f}%")
        
        return all_targets_met

def test_different_strategies():
    """Test different optimization strategies."""
    print("\nTesting Different Optimization Strategies")
    print("=" * 50)
    
    with patch.dict('sys.modules', {'tiktoken': mock_tiktoken()}):
        from context_optimizer.config import ConfigManager
        from context_optimizer.optimizer import ContextOptimizer
        
        strategies = ["balanced", "aggressive", "conservative"]
        test_content = "def hello(): # comment\n    print('hello')\n    # another comment\n    pass"
        
        results = {}
        
        for strategy in strategies:
            try:
                config_manager = ConfigManager()
                config = config_manager.load_config(strategy)
                # Set lower token limits to trigger optimization
                config.token_counting.max_tokens = 50
                config.token_counting.safety_margin = 5
                optimizer = ContextOptimizer(config)
                
                result = optimizer.optimize_context(
                    content=test_content,
                    agent_type="coder",
                    task_description="test strategy"
                )
                
                results[strategy] = {
                    "reduction": result.reduction_percentage,
                    "quality": result.quality_score,
                    "success": result.was_successful
                }
                
                print(f"✓ {strategy}: {result.reduction_percentage:.1f}% reduction, quality {result.quality_score:.2f}")
                
            except Exception as e:
                print(f"✗ {strategy}: failed - {e}")
                results[strategy] = {"success": False}
        
        success = all(r.get("success", False) for r in results.values())
        print(f"\nStrategy Test Result: {'✓ SUCCESS' if success else '✗ FAILURE'}")
        
        return success

def main():
    """Run basic tests."""
    try:
        test1_success = test_basic_optimization()
        test2_success = test_different_strategies()
        
        overall_success = test1_success and test2_success
        
        print("\n" + "=" * 50)
        print(f"OVERALL TEST RESULT: {'✓ ALL TESTS PASSED' if overall_success else '✗ SOME TESTS FAILED'}")
        print("=" * 50)
        
        return 0 if overall_success else 1
        
    except Exception as e:
        print(f"\n✗ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())