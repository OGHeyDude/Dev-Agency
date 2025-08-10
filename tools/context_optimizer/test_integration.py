#!/usr/bin/env python3
"""
Integration tests for Context Size Optimizer Tool.

Tests integration with agent invocation pipeline and real-world scenarios.
"""

import time
import tempfile
from pathlib import Path
from typing import List, Dict, Any

from .optimizer import ContextOptimizer
from .cli import ContextOptimizerCLI
from .config import get_default_config


class IntegrationTests:
    """Integration test suite for context optimizer."""
    
    def __init__(self):
        """Initialize integration test suite."""
        self.optimizer = ContextOptimizer()
        self.cli = ContextOptimizerCLI()
        self.test_results = {}
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all integration tests."""
        print("Running Context Optimizer Integration Tests...")
        print("=" * 50)
        
        # Test 1: End-to-end optimization pipeline
        print("1. Testing end-to-end optimization pipeline")
        e2e_results = self.test_end_to_end_pipeline()
        
        # Test 2: CLI integration
        print("\n2. Testing CLI integration")
        cli_results = self.test_cli_integration()
        
        # Test 3: Agent-specific optimization
        print("\n3. Testing agent-specific optimization")
        agent_results = self.test_agent_specific_optimization()
        
        # Test 4: Batch file processing
        print("\n4. Testing batch file processing")
        batch_results = self.test_batch_processing()
        
        # Test 5: Error handling and recovery
        print("\n5. Testing error handling")
        error_results = self.test_error_handling()
        
        # Compile results
        self.test_results = {
            "end_to_end_pipeline": e2e_results,
            "cli_integration": cli_results,
            "agent_specific": agent_results,
            "batch_processing": batch_results,
            "error_handling": error_results,
            "overall_pass": self._calculate_overall_pass()
        }
        
        self.print_summary()
        return self.test_results
    
    def test_end_to_end_pipeline(self) -> Dict[str, Any]:
        """Test complete optimization pipeline."""
        test_code = '''
import os
import sys
import json
import time
from typing import Dict, List, Optional, Any
from pathlib import Path
import logging

# This is a sample Python file for testing context optimization
# It contains various code patterns that should be optimized

logger = logging.getLogger(__name__)

class DataProcessor:
    """
    A comprehensive data processing class that handles various data formats
    and provides multiple processing capabilities for different use cases.
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the data processor with optional configuration.
        
        Args:
            config: Configuration dictionary with processing options
        """
        self.config = config or {}
        self.processed_count = 0
        self.error_count = 0
        
        # Debug print (should be removed by optimizer)
        print(f"DataProcessor initialized with config: {self.config}")
    
    def process_file(self, file_path: str) -> Optional[Dict[str, Any]]:
        """
        Process a single file and return structured data.
        
        This method handles various file formats including JSON, CSV, and text files.
        It performs validation, parsing, and data transformation as needed.
        
        Args:
            file_path: Path to the file to process
            
        Returns:
            Processed data as dictionary or None if processing fails
            
        Raises:
            FileNotFoundError: If the file doesn't exist
            ValueError: If the file format is unsupported
        """
        try:
            # Validate file existence
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Debug print (should be removed)
            print(f"Processing file: {file_path}")
            
            # Determine file type
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext == '.json':
                return self._process_json_file(file_path)
            elif file_ext == '.csv':
                return self._process_csv_file(file_path)
            elif file_ext == '.txt':
                return self._process_text_file(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_ext}")
        
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {e}")
            self.error_count += 1
            return None
        finally:
            self.processed_count += 1
    
    def _process_json_file(self, file_path: str) -> Dict[str, Any]:
        """Process JSON file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Add metadata
        return {
            "type": "json",
            "data": data,
            "processed_at": time.time(),
            "file_path": file_path
        }
    
    def _process_csv_file(self, file_path: str) -> Dict[str, Any]:
        """Process CSV file."""
        # This is a simplified CSV processing
        rows = []
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f):
                if line.strip():
                    rows.append(line.strip().split(','))
        
        return {
            "type": "csv",
            "rows": rows,
            "row_count": len(rows),
            "processed_at": time.time(),
            "file_path": file_path
        }
    
    def _process_text_file(self, file_path: str) -> Dict[str, Any]:
        """Process text file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Basic text analysis
        lines = content.splitlines()
        words = content.split()
        
        return {
            "type": "text",
            "content": content,
            "line_count": len(lines),
            "word_count": len(words),
            "char_count": len(content),
            "processed_at": time.time(),
            "file_path": file_path
        }
    
    def batch_process(self, file_paths: List[str]) -> List[Dict[str, Any]]:
        """
        Process multiple files in batch.
        
        This method processes a list of files and returns results for all files.
        Failed processing attempts are logged but don't stop the batch operation.
        """
        results = []
        
        print(f"Starting batch processing of {len(file_paths)} files")
        
        for i, file_path in enumerate(file_paths):
            print(f"Processing file {i+1}/{len(file_paths)}: {file_path}")
            
            result = self.process_file(file_path)
            if result:
                results.append(result)
        
        print(f"Batch processing completed. {len(results)} files processed successfully.")
        return results
    
    def get_stats(self) -> Dict[str, Any]:
        """Get processing statistics."""
        return {
            "processed_count": self.processed_count,
            "error_count": self.error_count,
            "success_rate": (
                (self.processed_count - self.error_count) / max(1, self.processed_count) * 100
            )
        }

def main():
    """Main function for command-line usage."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Data Processing Tool")
    parser.add_argument("files", nargs="+", help="Files to process")
    parser.add_argument("--config", help="Configuration file")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Load configuration
    config = {}
    if args.config:
        with open(args.config, 'r') as f:
            config = json.load(f)
    
    # Initialize processor
    processor = DataProcessor(config)
    
    # Process files
    if len(args.files) == 1:
        result = processor.process_file(args.files[0])
        print(json.dumps(result, indent=2))
    else:
        results = processor.batch_process(args.files)
        print(json.dumps(results, indent=2))
    
    # Show statistics
    if args.verbose:
        stats = processor.get_stats()
        print(f"\\nProcessing Statistics:")
        print(f"Files processed: {stats['processed_count']}")
        print(f"Errors: {stats['error_count']}")
        print(f"Success rate: {stats['success_rate']:.1f}%")

if __name__ == "__main__":
    main()
'''
        
        try:
            # Test optimization
            result = self.optimizer.optimize_context(
                content=test_code,
                agent_type="coder",
                task_description="code review and optimization"
            )
            
            # Validate results
            success = (
                result.reduction_percentage > 0 and
                result.quality_score > 0.7 and
                result.processing_time_ms < 1000 and
                len(result.optimized_content) < len(test_code)
            )
            
            print(f"  ✓ Optimization completed: {result.reduction_percentage:.1f}% reduction")
            print(f"  ✓ Quality score: {result.quality_score:.2f}")
            print(f"  ✓ Processing time: {result.processing_time_ms:.1f}ms")
            
            return {
                "success": success,
                "reduction_percentage": result.reduction_percentage,
                "quality_score": result.quality_score,
                "processing_time_ms": result.processing_time_ms,
                "original_tokens": result.original_tokens,
                "optimized_tokens": result.optimized_tokens,
                "pass": success
            }
            
        except Exception as e:
            print(f"  ✗ Pipeline test failed: {e}")
            return {"success": False, "error": str(e), "pass": False}
    
    def test_cli_integration(self) -> Dict[str, Any]:
        """Test CLI interface integration."""
        try:
            # Create temporary test file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write("""
def hello_world():
    # This is a simple test function
    print("Hello, World!")
    return "success"

if __name__ == "__main__":
    result = hello_world()
    print(f"Result: {result}")
""")
                temp_file = f.name
            
            # Test CLI optimization
            cli_args = [
                "--input", temp_file,
                "--agent", "coder",
                "--task", "code review",
                "--format", "json",
                "--quiet"
            ]
            
            # Capture CLI output (simplified test)
            import io
            import contextlib
            from unittest.mock import patch
            
            output_buffer = io.StringIO()
            
            with contextlib.redirect_stdout(output_buffer):
                exit_code = self.cli.run(cli_args)
            
            output = output_buffer.getvalue()
            
            # Clean up
            Path(temp_file).unlink()
            
            success = exit_code == 0 and "optimization_result" in output
            
            if success:
                print("  ✓ CLI integration successful")
            else:
                print("  ✗ CLI integration failed")
            
            return {
                "success": success,
                "exit_code": exit_code,
                "output_contains_result": "optimization_result" in output,
                "pass": success
            }
            
        except Exception as e:
            print(f"  ✗ CLI test failed: {e}")
            return {"success": False, "error": str(e), "pass": False}
    
    def test_agent_specific_optimization(self) -> Dict[str, Any]:
        """Test optimization for different agent types."""
        test_content = '''
class SecurityManager:
    """Manages security and authentication for the application."""
    
    def __init__(self):
        self.auth_token = None
        self.permissions = {}
    
    def authenticate(self, username: str, password: str) -> bool:
        """Authenticate user credentials."""
        # Hash the password for security
        import hashlib
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Check credentials (simplified)
        if username == "admin" and password_hash == "expected_hash":
            self.auth_token = "secure_token_123"
            return True
        return False
    
    def check_permission(self, action: str) -> bool:
        """Check if current user has permission for action."""
        if not self.auth_token:
            return False
        
        return self.permissions.get(action, False)
'''
        
        agents = ["architect", "coder", "security", "documenter"]
        results = {}
        
        for agent in agents:
            try:
                result = self.optimizer.optimize_context(
                    content=test_content,
                    agent_type=agent,
                    task_description=f"{agent} analysis"
                )
                
                results[agent] = {
                    "reduction_percentage": result.reduction_percentage,
                    "quality_score": result.quality_score,
                    "success": result.reduction_percentage > 0
                }
                
                print(f"  ✓ {agent}: {result.reduction_percentage:.1f}% reduction")
                
            except Exception as e:
                print(f"  ✗ {agent}: failed - {e}")
                results[agent] = {"success": False, "error": str(e)}
        
        success = all(r.get("success", False) for r in results.values())
        
        return {
            "agent_results": results,
            "all_agents_successful": success,
            "pass": success
        }
    
    def test_batch_processing(self) -> Dict[str, Any]:
        """Test batch file processing."""
        try:
            # Create temporary files
            temp_files = []
            test_contents = [
                "def func1(): pass",
                "class TestClass: pass", 
                "# Comment only file\nprint('hello')"
            ]
            
            for i, content in enumerate(test_contents):
                with tempfile.NamedTemporaryFile(mode='w', suffix=f'_test_{i}.py', delete=False) as f:
                    f.write(content)
                    temp_files.append(f.name)
            
            # Test batch processing
            results = self.optimizer.batch_optimize_files(
                file_paths=temp_files,
                agent_type="coder",
                task_description="batch optimization test"
            )
            
            # Validate results
            success = (
                len(results) == len(temp_files) and
                all(r.was_successful for r in results.values())
            )
            
            # Clean up
            for temp_file in temp_files:
                Path(temp_file).unlink()
            
            print(f"  ✓ Processed {len(results)} files successfully")
            
            return {
                "files_processed": len(results),
                "files_expected": len(temp_files),
                "all_successful": success,
                "pass": success
            }
            
        except Exception as e:
            print(f"  ✗ Batch processing failed: {e}")
            return {"success": False, "error": str(e), "pass": False}
    
    def test_error_handling(self) -> Dict[str, Any]:
        """Test error handling and recovery."""
        test_cases = [
            # Empty content
            ("", "empty_content"),
            # Invalid characters
            ("def func():\n\x00invalid", "invalid_characters"),
            # Very large content
            ("x" * 100000, "large_content")
        ]
        
        results = {}
        
        for content, test_name in test_cases:
            try:
                result = self.optimizer.optimize_context(
                    content=content,
                    agent_type="coder", 
                    task_description="error handling test"
                )
                
                # Should handle gracefully without crashing
                results[test_name] = {
                    "handled_gracefully": True,
                    "returned_result": result is not None,
                    "error": None
                }
                
                print(f"  ✓ {test_name}: handled gracefully")
                
            except Exception as e:
                # Should not crash, but if it does, record the error
                results[test_name] = {
                    "handled_gracefully": False,
                    "error": str(e)
                }
                print(f"  ✗ {test_name}: {e}")
        
        success = all(r.get("handled_gracefully", False) for r in results.values())
        
        return {
            "test_cases": results,
            "all_handled_gracefully": success,
            "pass": success
        }
    
    def _calculate_overall_pass(self) -> bool:
        """Calculate overall test pass status."""
        if not self.test_results:
            return False
            
        return all(
            result.get("pass", False)
            for result in self.test_results.values()
            if isinstance(result, dict)
        )
    
    def print_summary(self):
        """Print integration test summary."""
        print("\n" + "=" * 50)
        print("INTEGRATION TEST SUMMARY")
        print("=" * 50)
        
        test_names = [
            ("end_to_end_pipeline", "End-to-End Pipeline"),
            ("cli_integration", "CLI Integration"),
            ("agent_specific", "Agent-Specific Optimization"),
            ("batch_processing", "Batch Processing"),
            ("error_handling", "Error Handling")
        ]
        
        for key, name in test_names:
            result = self.test_results.get(key, {})
            status = "✓ PASS" if result.get("pass", False) else "✗ FAIL"
            print(f"{name}: {status}")
        
        overall_status = "✓ ALL TESTS PASSED" if self.test_results["overall_pass"] else "✗ SOME TESTS FAILED"
        print(f"\nOverall Result: {overall_status}")


def main():
    """Run integration tests."""
    tests = IntegrationTests()
    results = tests.run_all_tests()
    
    return 0 if results["overall_pass"] else 1


if __name__ == "__main__":
    exit(main())