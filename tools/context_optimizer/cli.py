#!/usr/bin/env python3
"""
Command-line interface for Context Size Optimizer Tool.

This module provides a comprehensive CLI for real-time context optimization
with integration support for agent invocation pipelines.
"""

import argparse
import json
import sys
import time
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

from .optimizer import ContextOptimizer, OptimizationResult
from .config import get_default_config, ConfigManager
from .token_counter import TokenCounter


def setup_logging(verbose: bool = False):
    """Configure logging for CLI."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )


class ContextOptimizerCLI:
    """Command-line interface for the Context Size Optimizer."""
    
    def __init__(self):
        """Initialize the CLI."""
        self.optimizer = None
        self.config_manager = ConfigManager()
    
    def create_parser(self) -> argparse.ArgumentParser:
        """Create and configure the argument parser."""
        parser = argparse.ArgumentParser(
            description="Context Size Optimizer - Intelligent context optimization for agent invocations",
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Examples:
  # Optimize a single file for architect agent
  %(prog)s --input code.py --agent architect --task "code review"
  
  # Optimize multiple files with specific target
  %(prog)s --input src/ --agent coder --task "refactoring" --target-tokens 50000
  
  # Use aggressive optimization strategy
  %(prog)s --input docs/ --strategy aggressive --output optimized/
  
  # Show optimization metrics
  %(prog)s --metrics
  
  # Analyze content without optimization
  %(prog)s --input file.py --analyze-only
            """
        )
        
        # Input/Output options
        io_group = parser.add_argument_group("Input/Output")
        io_group.add_argument(
            "--input", "-i",
            type=str,
            help="Input file or directory to optimize"
        )
        io_group.add_argument(
            "--output", "-o", 
            type=str,
            help="Output file or directory for optimized content"
        )
        io_group.add_argument(
            "--stdin",
            action="store_true",
            help="Read content from stdin"
        )
        io_group.add_argument(
            "--stdout",
            action="store_true",
            help="Write optimized content to stdout"
        )
        
        # Optimization options
        opt_group = parser.add_argument_group("Optimization")
        opt_group.add_argument(
            "--agent", "-a",
            type=str,
            default="general",
            choices=["architect", "coder", "tester", "security", "documenter", "performance", "general"],
            help="Agent type for optimization (default: general)"
        )
        opt_group.add_argument(
            "--task", "-t",
            type=str,
            default="code analysis",
            help="Task description for context prioritization (default: 'code analysis')"
        )
        opt_group.add_argument(
            "--target-tokens",
            type=int,
            help="Target token count for optimization"
        )
        opt_group.add_argument(
            "--strategy", "-s",
            type=str,
            default="balanced",
            choices=["balanced", "aggressive", "conservative", "code_focused", "documentation_focused"],
            help="Optimization strategy (default: balanced)"
        )
        
        # Configuration options
        config_group = parser.add_argument_group("Configuration")
        config_group.add_argument(
            "--config", "-c",
            type=str,
            help="Configuration file path"
        )
        config_group.add_argument(
            "--model",
            type=str,
            default="gpt-4",
            help="Token counting model (default: gpt-4)"
        )
        config_group.add_argument(
            "--no-cache",
            action="store_true",
            help="Disable caching"
        )
        config_group.add_argument(
            "--cache-dir",
            type=str,
            help="Cache directory path"
        )
        
        # Analysis and reporting
        analysis_group = parser.add_argument_group("Analysis and Reporting")
        analysis_group.add_argument(
            "--analyze-only",
            action="store_true",
            help="Analyze content without optimization"
        )
        analysis_group.add_argument(
            "--estimate-only",
            action="store_true",
            help="Estimate optimization potential only"
        )
        analysis_group.add_argument(
            "--metrics",
            action="store_true",
            help="Show optimization metrics and exit"
        )
        analysis_group.add_argument(
            "--validate-targets",
            action="store_true",
            help="Validate performance targets and exit"
        )
        analysis_group.add_argument(
            "--stats",
            action="store_true",
            help="Show detailed statistics after optimization"
        )
        
        # Output formatting
        format_group = parser.add_argument_group("Output Formatting")
        format_group.add_argument(
            "--format",
            type=str,
            choices=["text", "json", "yaml"],
            default="text",
            help="Output format (default: text)"
        )
        format_group.add_argument(
            "--include-original",
            action="store_true",
            help="Include original content in output"
        )
        format_group.add_argument(
            "--quiet", "-q",
            action="store_true",
            help="Suppress progress messages"
        )
        format_group.add_argument(
            "--verbose", "-v",
            action="store_true",
            help="Enable verbose output"
        )
        
        # Utility options
        parser.add_argument(
            "--version",
            action="version",
            version="Context Size Optimizer 1.0.0"
        )
        parser.add_argument(
            "--clear-cache",
            action="store_true",
            help="Clear optimization cache and exit"
        )
        parser.add_argument(
            "--cleanup-cache",
            action="store_true",
            help="Clean up expired cache entries and exit"
        )
        
        return parser
    
    def initialize_optimizer(self, args: argparse.Namespace):
        """Initialize the optimizer with configuration."""
        # Load configuration
        config = self.config_manager.load_config(args.strategy)
        
        # Override config with command-line arguments
        if args.config:
            config = self.config_manager._load_from_file(args.config)
        
        if args.target_tokens:
            config.token_counting.max_tokens = args.target_tokens + config.token_counting.safety_margin
        
        if args.model:
            config.token_counting.model_name = args.model
        
        if args.no_cache:
            config.caching.enabled = False
        
        if args.cache_dir:
            config.caching.cache_dir = args.cache_dir
        
        # Initialize optimizer
        self.optimizer = ContextOptimizer(config)
        
        if not args.quiet:
            print(f"Initialized Context Optimizer with {args.strategy} strategy")
            print(f"Target tokens: {config.token_counting.max_tokens - config.token_counting.safety_margin}")
            print(f"Model: {config.token_counting.model_name}")
            print(f"Caching: {'enabled' if config.caching.enabled else 'disabled'}")
            print()
    
    def run(self, args: List[str] = None) -> int:
        """Run the CLI with provided arguments."""
        parser = self.create_parser()
        args = parser.parse_args(args)
        
        # Setup logging
        setup_logging(args.verbose)
        
        # Handle utility commands first
        if args.clear_cache:
            return self.clear_cache(args)
        
        if args.cleanup_cache:
            return self.cleanup_cache(args)
        
        if args.metrics:
            return self.show_metrics(args)
        
        if args.validate_targets:
            return self.validate_targets(args)
        
        # Initialize optimizer for main operations
        self.initialize_optimizer(args)
        
        # Handle main operations
        if args.stdin:
            return self.process_stdin(args)
        elif args.input:
            return self.process_input(args)
        else:
            parser.print_help()
            return 1
    
    def process_stdin(self, args: argparse.Namespace) -> int:
        """Process content from stdin."""
        try:
            if not args.quiet:
                print("Reading content from stdin...")
            
            content = sys.stdin.read()
            
            if not content.strip():
                print("Error: No content provided", file=sys.stderr)
                return 1
            
            # Process the content
            result = self.process_content(content, args)
            
            # Output result
            if args.stdout:
                print(result.optimized_content)
            else:
                self.output_result(result, args)
            
            return 0
            
        except KeyboardInterrupt:
            print("\nOperation cancelled", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"Error processing stdin: {e}", file=sys.stderr)
            return 1
    
    def process_input(self, args: argparse.Namespace) -> int:
        """Process input file or directory."""
        input_path = Path(args.input)
        
        if not input_path.exists():
            print(f"Error: Input path '{args.input}' does not exist", file=sys.stderr)
            return 1
        
        try:
            if input_path.is_file():
                return self.process_file(input_path, args)
            elif input_path.is_dir():
                return self.process_directory(input_path, args)
            else:
                print(f"Error: '{args.input}' is neither a file nor directory", file=sys.stderr)
                return 1
                
        except KeyboardInterrupt:
            print("\nOperation cancelled", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"Error processing input: {e}", file=sys.stderr)
            return 1
    
    def process_file(self, file_path: Path, args: argparse.Namespace) -> int:
        """Process a single file."""
        try:
            if not args.quiet:
                print(f"Processing file: {file_path}")
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Process content
            if args.analyze_only:
                analysis = self.optimizer.analyze_content_only(content, str(file_path))
                self.output_analysis(analysis, args)
            elif args.estimate_only:
                estimate = self.optimizer.estimate_optimization_potential(content)
                self.output_estimate(estimate, args)
            else:
                result = self.process_content(content, args, str(file_path))
                
                # Save or display result
                if args.output:
                    self.save_result(result, Path(args.output), args)
                elif args.stdout:
                    print(result.optimized_content)
                else:
                    self.output_result(result, args)
            
            return 0
            
        except Exception as e:
            print(f"Error processing file {file_path}: {e}", file=sys.stderr)
            return 1
    
    def process_directory(self, dir_path: Path, args: argparse.Namespace) -> int:
        """Process all files in a directory."""
        # Find all processable files
        file_patterns = ["*.py", "*.js", "*.ts", "*.java", "*.md", "*.txt", "*.json", "*.yaml", "*.yml"]
        files = []
        
        for pattern in file_patterns:
            files.extend(dir_path.rglob(pattern))
        
        if not files:
            print(f"No processable files found in {dir_path}", file=sys.stderr)
            return 1
        
        if not args.quiet:
            print(f"Found {len(files)} files to process")
        
        # Process files
        success_count = 0
        total_tokens_saved = 0
        
        for file_path in files:
            try:
                if not args.quiet:
                    print(f"Processing: {file_path.relative_to(dir_path)}")
                
                # Read and process file
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                if args.analyze_only:
                    analysis = self.optimizer.analyze_content_only(content, str(file_path))
                    if args.verbose:
                        self.output_analysis(analysis, args)
                elif args.estimate_only:
                    estimate = self.optimizer.estimate_optimization_potential(content)
                    if args.verbose:
                        self.output_estimate(estimate, args)
                else:
                    result = self.process_content(content, args, str(file_path))
                    total_tokens_saved += result.tokens_saved
                    
                    # Save result if output directory specified
                    if args.output:
                        output_dir = Path(args.output)
                        relative_path = file_path.relative_to(dir_path)
                        output_path = output_dir / relative_path
                        output_path.parent.mkdir(parents=True, exist_ok=True)
                        self.save_result(result, output_path, args)
                
                success_count += 1
                
            except Exception as e:
                print(f"Error processing {file_path}: {e}", file=sys.stderr)
                continue
        
        # Summary
        if not args.quiet:
            print(f"\nProcessed {success_count}/{len(files)} files successfully")
            if total_tokens_saved > 0:
                print(f"Total tokens saved: {total_tokens_saved}")
        
        return 0 if success_count > 0 else 1
    
    def process_content(self, content: str, args: argparse.Namespace, 
                       file_path: str = None) -> OptimizationResult:
        """Process content with optimization."""
        return self.optimizer.optimize_context(
            content=content,
            agent_type=args.agent,
            task_description=args.task,
            target_tokens=args.target_tokens,
            file_path=file_path
        )
    
    def output_result(self, result: OptimizationResult, args: argparse.Namespace):
        """Output optimization result in specified format."""
        if args.format == "json":
            self.output_json(result, args)
        elif args.format == "yaml":
            self.output_yaml(result, args)
        else:
            self.output_text(result, args)
    
    def output_text(self, result: OptimizationResult, args: argparse.Namespace):
        """Output result in text format."""
        print("Context Optimization Result:")
        print("=" * 50)
        print(f"Original tokens: {result.original_tokens:,}")
        print(f"Optimized tokens: {result.optimized_tokens:,}")
        print(f"Tokens saved: {result.tokens_saved:,}")
        print(f"Reduction: {result.reduction_percentage:.1f}%")
        print(f"Quality score: {result.quality_score:.2f}")
        print(f"Processing time: {result.processing_time_ms:.1f}ms")
        print(f"Cache used: {'Yes' if result.cache_used else 'No'}")
        
        if result.operations_applied:
            print(f"\nOperations applied:")
            for op in result.operations_applied:
                print(f"  - {op}")
        
        if result.warnings:
            print(f"\nWarnings:")
            for warning in result.warnings:
                print(f"  - {warning}")
        
        if args.include_original:
            print("\nOriginal Content:")
            print("-" * 20)
            print(result.original_content[:1000] + ("..." if len(result.original_content) > 1000 else ""))
        
        print("\nOptimized Content:")
        print("-" * 20)
        print(result.optimized_content)
    
    def output_json(self, result: OptimizationResult, args: argparse.Namespace):
        """Output result in JSON format."""
        data = {
            "optimization_result": {
                "original_tokens": result.original_tokens,
                "optimized_tokens": result.optimized_tokens,
                "tokens_saved": result.tokens_saved,
                "reduction_percentage": result.reduction_percentage,
                "quality_score": result.quality_score,
                "processing_time_ms": result.processing_time_ms,
                "cache_used": result.cache_used,
                "operations_applied": result.operations_applied,
                "warnings": result.warnings
            }
        }
        
        if args.include_original:
            data["original_content"] = result.original_content
        
        data["optimized_content"] = result.optimized_content
        
        print(json.dumps(data, indent=2))
    
    def output_yaml(self, result: OptimizationResult, args: argparse.Namespace):
        """Output result in YAML format."""
        try:
            import yaml
            
            data = {
                "optimization_result": {
                    "original_tokens": result.original_tokens,
                    "optimized_tokens": result.optimized_tokens,
                    "tokens_saved": result.tokens_saved,
                    "reduction_percentage": result.reduction_percentage,
                    "quality_score": result.quality_score,
                    "processing_time_ms": result.processing_time_ms,
                    "cache_used": result.cache_used,
                    "operations_applied": result.operations_applied,
                    "warnings": result.warnings
                }
            }
            
            if args.include_original:
                data["original_content"] = result.original_content
            
            data["optimized_content"] = result.optimized_content
            
            print(yaml.dump(data, default_flow_style=False))
            
        except ImportError:
            print("YAML output requires PyYAML. Falling back to JSON format.")
            self.output_json(result, args)
    
    def output_analysis(self, analysis, args: argparse.Namespace):
        """Output content analysis."""
        print("Content Analysis:")
        print("=" * 30)
        print(f"Content type: {analysis.content_type.value}")
        print(f"File extension: {analysis.file_extension}")
        print(f"Total lines: {analysis.total_lines}")
        print(f"Total tokens: {analysis.total_tokens}")
        print(f"Complexity score: {analysis.complexity_score:.2f}")
        print(f"Sections: {len(analysis.sections)}")
        
        if analysis.optimization_opportunities:
            print("\nOptimization opportunities:")
            for opp in analysis.optimization_opportunities:
                print(f"  - {opp}")
    
    def output_estimate(self, estimate: Dict[str, Any], args: argparse.Namespace):
        """Output optimization estimate."""
        print("Optimization Estimate:")
        print("=" * 30)
        print(f"Current tokens: {estimate['current_tokens']:,}")
        print(f"Estimated reduction: {estimate['estimated_reduction_percentage']:.1f}%")
        print(f"Estimated final tokens: {estimate['estimated_final_tokens']:,}")
        print(f"Estimated tokens saved: {estimate['estimated_tokens_saved']:,}")
        print(f"Optimization recommended: {'Yes' if estimate['optimization_recommended'] else 'No'}")
        print(f"Estimated processing time: {estimate['estimated_processing_time_ms']:.1f}ms")
    
    def save_result(self, result: OptimizationResult, output_path: Path, args: argparse.Namespace):
        """Save optimization result to file."""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(result.optimized_content)
            
            if not args.quiet:
                print(f"Saved optimized content to: {output_path}")
        
        except Exception as e:
            print(f"Error saving to {output_path}: {e}", file=sys.stderr)
    
    def clear_cache(self, args: argparse.Namespace) -> int:
        """Clear optimization cache."""
        try:
            # Initialize optimizer to access cache
            self.initialize_optimizer(args)
            self.optimizer.clear_cache()
            print("Cache cleared successfully")
            return 0
        except Exception as e:
            print(f"Error clearing cache: {e}", file=sys.stderr)
            return 1
    
    def cleanup_cache(self, args: argparse.Namespace) -> int:
        """Clean up expired cache entries."""
        try:
            self.initialize_optimizer(args)
            removed = self.optimizer.cleanup_expired_cache()
            print(f"Cleaned up {removed} expired cache entries")
            return 0
        except Exception as e:
            print(f"Error cleaning cache: {e}", file=sys.stderr)
            return 1
    
    def show_metrics(self, args: argparse.Namespace) -> int:
        """Show optimization metrics."""
        try:
            self.initialize_optimizer(args)
            metrics = self.optimizer.get_optimization_metrics()
            
            print("Optimization Metrics:")
            print("=" * 30)
            for key, value in metrics.items():
                if isinstance(value, float):
                    print(f"{key}: {value:.2f}")
                elif isinstance(value, int):
                    print(f"{key}: {value:,}")
                else:
                    print(f"{key}: {value}")
            
            return 0
        except Exception as e:
            print(f"Error retrieving metrics: {e}", file=sys.stderr)
            return 1
    
    def validate_targets(self, args: argparse.Namespace) -> int:
        """Validate performance targets."""
        try:
            self.initialize_optimizer(args)
            targets = self.optimizer.validate_optimization_targets()
            
            print("Performance Target Validation:")
            print("=" * 40)
            
            all_met = True
            for target, met in targets.items():
                status = "✓" if met else "✗"
                print(f"{status} {target}: {'PASS' if met else 'FAIL'}")
                if not met:
                    all_met = False
            
            print(f"\nOverall status: {'PASS' if all_met else 'FAIL'}")
            return 0 if all_met else 1
            
        except Exception as e:
            print(f"Error validating targets: {e}", file=sys.stderr)
            return 1


def main():
    """Main entry point for CLI."""
    cli = ContextOptimizerCLI()
    return cli.run()


if __name__ == "__main__":
    sys.exit(main())