#!/usr/bin/env python3
"""
Simple integration test for Context Size Optimizer Tool.
"""

import sys
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def mock_tiktoken():
    """Mock tiktoken module."""
    tiktoken_mock = Mock()
    tiktoken_mock.get_encoding.return_value.encode.side_effect = lambda x: [1] * (len(x) // 4)
    return tiktoken_mock

def test_integration():
    """Test integration scenarios."""
    print("Testing Context Size Optimizer Integration")
    print("=" * 50)
    
    with patch.dict('sys.modules', {'tiktoken': mock_tiktoken()}):
        from context_optimizer.optimizer import ContextOptimizer
        from context_optimizer.config import get_default_config
        
        print("✓ Integration imports successful")
        
        # Test 1: Agent-specific optimization
        print("\n1. Testing agent-specific optimization")
        
        test_scenarios = [
            ("architect", "system design review", """
class UserManager:
    def __init__(self, db_connection):
        self.db = db_connection
        self.cache = {}
    
    def create_user(self, username, email, password):
        # Create a new user account
        # Hash the password for security
        password_hash = self._hash_password(password)
        
        # Insert into database
        user_id = self.db.insert_user(username, email, password_hash)
        
        # Cache the user
        self.cache[user_id] = {'username': username, 'email': email}
        
        return user_id
    
    def _hash_password(self, password):
        # Simple hashing (use proper hashing in production)
        return hash(password)
"""),
            ("security", "security audit", """
import hashlib
import os
from typing import Optional

class AuthenticationManager:
    def __init__(self):
        self.secret_key = os.getenv('SECRET_KEY', 'default_secret')
        self.failed_attempts = {}
    
    def authenticate(self, username: str, password: str) -> Optional[str]:
        # Check rate limiting
        if self.failed_attempts.get(username, 0) > 5:
            return None
        
        # Hash password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Verify against stored hash (simplified)
        if self._verify_password(username, password_hash):
            # Reset failed attempts
            self.failed_attempts[username] = 0
            
            # Generate token
            token = self._generate_token(username)
            return token
        else:
            # Increment failed attempts
            self.failed_attempts[username] = self.failed_attempts.get(username, 0) + 1
            return None
    
    def _verify_password(self, username: str, password_hash: str) -> bool:
        # Simplified password verification
        return True  # Replace with actual verification
    
    def _generate_token(self, username: str) -> str:
        # Generate secure token
        import time
        payload = f"{username}:{time.time()}"
        return hashlib.sha256(f"{payload}:{self.secret_key}".encode()).hexdigest()
"""),
            ("coder", "code optimization", """
def process_data(input_data):
    # Debug print
    print(f"Processing {len(input_data)} items")
    
    # Initialize result
    results = []
    
    # Process each item
    for i, item in enumerate(input_data):
        # Debug print for each item
        print(f"Processing item {i}: {item}")
        
        # Apply transformation
        if isinstance(item, str):
            processed = item.upper().strip()
        elif isinstance(item, int):
            processed = item * 2
        else:
            processed = str(item)
        
        # Add to results
        results.append(processed)
        
        # Another debug print
        print(f"Item {i} processed: {processed}")
    
    # Final debug print
    print(f"Processing complete. {len(results)} items processed.")
    
    return results
""")
        ]
        
        agent_results = {}
        
        for agent_type, task_desc, content in test_scenarios:
            try:
                # Configure for lower limits to trigger optimization
                config = get_default_config("balanced")
                config.token_counting.max_tokens = 150
                config.token_counting.safety_margin = 10
                
                optimizer = ContextOptimizer(config)
                
                result = optimizer.optimize_context(
                    content=content,
                    agent_type=agent_type,
                    task_description=task_desc
                )
                
                agent_results[agent_type] = {
                    "reduction": result.reduction_percentage,
                    "quality": result.quality_score,
                    "success": result.was_successful,
                    "processing_time": result.processing_time_ms
                }
                
                print(f"  ✓ {agent_type}: {result.reduction_percentage:.1f}% reduction, "
                      f"quality {result.quality_score:.2f}, {result.processing_time_ms:.1f}ms")
                
            except Exception as e:
                print(f"  ✗ {agent_type}: failed - {e}")
                agent_results[agent_type] = {"success": False}
        
        # Test 2: Batch processing simulation
        print("\n2. Testing batch processing")
        
        try:
            # Create temporary files
            temp_files = []
            test_contents = [
                "def func1(): pass",
                "class TestClass: pass\n# Comment to remove", 
                "import os\nprint('hello')\n# Debug comment"
            ]
            
            for i, content in enumerate(test_contents):
                temp_file = tempfile.NamedTemporaryFile(mode='w', suffix=f'_test_{i}.py', delete=False)
                temp_file.write(content)
                temp_file.close()
                temp_files.append(temp_file.name)
            
            # Configure optimizer for batch processing
            config = get_default_config("aggressive")  
            config.token_counting.max_tokens = 80
            config.token_counting.safety_margin = 10
            
            optimizer = ContextOptimizer(config)
            
            # Process files in batch
            batch_results = optimizer.batch_optimize_files(
                file_paths=temp_files,
                agent_type="coder",
                task_description="batch optimization"
            )
            
            # Clean up temp files
            for temp_file in temp_files:
                Path(temp_file).unlink()
            
            batch_success = len(batch_results) == len(temp_files)
            successful_optimizations = sum(1 for r in batch_results.values() if r.was_successful)
            
            print(f"  ✓ Batch processing: {len(batch_results)}/{len(temp_files)} files processed")
            print(f"  ✓ Successful optimizations: {successful_optimizations}")
            
        except Exception as e:
            print(f"  ✗ Batch processing failed: {e}")
            batch_success = False
        
        # Test 3: Cache performance
        print("\n3. Testing cache performance")
        
        try:
            config = get_default_config("balanced")
            config.token_counting.max_tokens = 100
            config.token_counting.safety_margin = 10
            
            optimizer = ContextOptimizer(config)
            
            test_content = "def cached_test(): print('cache test')\n# comment to optimize"
            
            # First optimization (cache miss)
            result1 = optimizer.optimize_context(
                content=test_content,
                agent_type="coder",
                task_description="cache test"
            )
            
            # Second optimization (should hit cache)
            result2 = optimizer.optimize_context(
                content=test_content,
                agent_type="coder", 
                task_description="cache test"
            )
            
            cache_hit = result2.cache_used
            cache_metrics = optimizer.get_optimization_metrics()
            
            print(f"  ✓ Cache functionality: {'Working' if cache_hit else 'Not working'}")
            print(f"  ✓ Cache hit rate: {cache_metrics['cache_hit_rate']:.1f}%")
            
        except Exception as e:
            print(f"  ✗ Cache test failed: {e}")
            cache_hit = False
        
        # Overall assessment
        agent_success = all(r.get("success", False) for r in agent_results.values())
        
        overall_success = agent_success and batch_success and cache_hit
        
        print(f"\nIntegration Test Results:")
        print(f"- Agent-specific optimization: {'✓ PASS' if agent_success else '✗ FAIL'}")
        print(f"- Batch processing: {'✓ PASS' if batch_success else '✗ FAIL'}")
        print(f"- Cache performance: {'✓ PASS' if cache_hit else '✗ FAIL'}")
        print(f"\nOverall Integration Test: {'✓ SUCCESS' if overall_success else '✗ FAILURE'}")
        
        return overall_success

def main():
    """Run integration test."""
    try:
        success = test_integration()
        return 0 if success else 1
        
    except Exception as e:
        print(f"\nIntegration test failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())