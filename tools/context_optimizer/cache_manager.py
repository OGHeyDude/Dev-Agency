"""
Context caching system with LRU eviction and performance optimization.

This module provides intelligent caching for optimized contexts to improve
performance and reduce redundant processing.
"""

import json
import hashlib
import time
import os
import gzip
import pickle
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
from dataclasses import dataclass, asdict
from threading import Lock
import logging

logger = logging.getLogger(__name__)


@dataclass
class CacheEntry:
    """Represents a cached context optimization result."""
    
    key: str
    content: str
    metadata: Dict[str, Any]
    created_at: float
    accessed_at: float
    access_count: int
    size_bytes: int
    compression_ratio: float
    
    def is_expired(self, ttl_seconds: int) -> bool:
        """Check if this cache entry has expired."""
        return (time.time() - self.created_at) > ttl_seconds
    
    def touch(self):
        """Update access time and count."""
        self.accessed_at = time.time()
        self.access_count += 1


@dataclass
class CacheStats:
    """Cache performance statistics."""
    
    total_entries: int
    total_size_bytes: int
    hit_count: int
    miss_count: int
    eviction_count: int
    compression_savings_bytes: int
    average_access_time_ms: float
    cache_hit_rate: float
    
    @classmethod
    def empty(cls) -> 'CacheStats':
        """Create empty cache statistics."""
        return cls(
            total_entries=0,
            total_size_bytes=0,
            hit_count=0,
            miss_count=0,
            eviction_count=0,
            compression_savings_bytes=0,
            average_access_time_ms=0.0,
            cache_hit_rate=0.0
        )


class ContextCache:
    """
    High-performance context cache with LRU eviction and compression.
    
    Features:
    - LRU (Least Recently Used) eviction policy
    - Transparent compression for large entries
    - TTL (Time To Live) expiration
    - Thread-safe operations
    - Performance metrics tracking
    - Persistent storage support
    """
    
    def __init__(self, cache_dir: str = ".context_cache", 
                 max_size_mb: int = 100, ttl_hours: int = 24,
                 compression_enabled: bool = True, persistent: bool = True):
        """
        Initialize the context cache.
        
        Args:
            cache_dir: Directory for persistent cache storage
            max_size_mb: Maximum cache size in megabytes
            ttl_hours: Time-to-live for cache entries in hours
            compression_enabled: Whether to compress large entries
            persistent: Whether to persist cache to disk
        """
        self.cache_dir = Path(cache_dir)
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.ttl_seconds = ttl_hours * 3600
        self.compression_enabled = compression_enabled
        self.persistent = persistent
        
        # In-memory cache storage
        self._cache: Dict[str, CacheEntry] = {}
        self._access_order: List[str] = []  # For LRU tracking
        self._lock = Lock()
        
        # Performance tracking
        self._stats = CacheStats.empty()
        self._access_times: List[float] = []
        
        # Initialize cache directory
        if self.persistent:
            self.cache_dir.mkdir(parents=True, exist_ok=True)
            self._load_persistent_cache()
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached content by key.
        
        Args:
            key: Cache key
            
        Returns:
            Cached content dictionary or None if not found/expired
        """
        start_time = time.time()
        
        with self._lock:
            entry = self._cache.get(key)
            
            if entry is None:
                self._stats.miss_count += 1
                self._update_hit_rate()
                return None
            
            # Check expiration
            if entry.is_expired(self.ttl_seconds):
                self._remove_entry(key)
                self._stats.miss_count += 1
                self._update_hit_rate()
                return None
            
            # Update access information
            entry.touch()
            self._update_access_order(key)
            
            # Decompress content if needed
            content = self._decompress_content(entry.content, entry.metadata)
            
            self._stats.hit_count += 1
            self._update_hit_rate()
            
            # Track access time
            access_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            self._access_times.append(access_time)
            if len(self._access_times) > 100:  # Keep last 100 measurements
                self._access_times.pop(0)
            self._stats.average_access_time_ms = sum(self._access_times) / len(self._access_times)
            
            logger.debug(f"Cache hit for key {key[:16]}... (access time: {access_time:.2f}ms)")
            
            return {
                "content": content,
                "metadata": entry.metadata,
                "cached_at": entry.created_at,
                "access_count": entry.access_count
            }
    
    def set(self, key: str, content: str, metadata: Dict[str, Any] = None) -> bool:
        """
        Store content in cache with optional metadata.
        
        Args:
            key: Cache key
            content: Content to cache
            metadata: Optional metadata dictionary
            
        Returns:
            True if successfully cached, False otherwise
        """
        if not content:
            return False
        
        metadata = metadata or {}
        
        try:
            with self._lock:
                # Compress content if enabled and content is large
                compressed_content, compression_ratio = self._compress_content(content)
                
                # Calculate sizes
                original_size = len(content.encode('utf-8'))
                compressed_size = len(compressed_content.encode('utf-8') if isinstance(compressed_content, str) 
                                     else compressed_content)
                
                # Create cache entry
                entry = CacheEntry(
                    key=key,
                    content=compressed_content,
                    metadata={
                        **metadata,
                        'original_size': original_size,
                        'compressed': compression_ratio < 1.0,
                        'compression_ratio': compression_ratio
                    },
                    created_at=time.time(),
                    accessed_at=time.time(),
                    access_count=1,
                    size_bytes=compressed_size,
                    compression_ratio=compression_ratio
                )
                
                # Check if we need to make space
                if not self._has_space_for_entry(entry):
                    self._make_space_for_entry(entry)
                
                # Store the entry
                self._cache[key] = entry
                self._update_access_order(key)
                
                # Update statistics
                self._stats.total_entries = len(self._cache)
                self._stats.total_size_bytes = sum(e.size_bytes for e in self._cache.values())
                
                if compression_ratio < 1.0:
                    self._stats.compression_savings_bytes += (original_size - compressed_size)
                
                # Persist if enabled
                if self.persistent:
                    self._persist_entry(key, entry)
                
                logger.debug(f"Cached content for key {key[:16]}... "
                           f"(size: {original_size} -> {compressed_size} bytes, "
                           f"compression: {compression_ratio:.2f})")
                
                return True
                
        except Exception as e:
            logger.error(f"Failed to cache content for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete a cache entry by key."""
        with self._lock:
            if key in self._cache:
                self._remove_entry(key)
                return True
            return False
    
    def clear(self):
        """Clear all cache entries."""
        with self._lock:
            self._cache.clear()
            self._access_order.clear()
            self._stats = CacheStats.empty()
            self._access_times.clear()
            
            # Clear persistent storage
            if self.persistent:
                for cache_file in self.cache_dir.glob("*.cache"):
                    try:
                        cache_file.unlink()
                    except Exception as e:
                        logger.warning(f"Failed to delete cache file {cache_file}: {e}")
    
    def get_stats(self) -> CacheStats:
        """Get current cache statistics."""
        with self._lock:
            return CacheStats(
                total_entries=self._stats.total_entries,
                total_size_bytes=self._stats.total_size_bytes,
                hit_count=self._stats.hit_count,
                miss_count=self._stats.miss_count,
                eviction_count=self._stats.eviction_count,
                compression_savings_bytes=self._stats.compression_savings_bytes,
                average_access_time_ms=self._stats.average_access_time_ms,
                cache_hit_rate=self._stats.cache_hit_rate
            )
    
    def cleanup_expired(self) -> int:
        """Remove expired cache entries and return count of removed entries."""
        removed_count = 0
        current_time = time.time()
        
        with self._lock:
            expired_keys = []
            
            for key, entry in self._cache.items():
                if entry.is_expired(self.ttl_seconds):
                    expired_keys.append(key)
            
            for key in expired_keys:
                self._remove_entry(key)
                removed_count += 1
            
            if removed_count > 0:
                logger.info(f"Cleaned up {removed_count} expired cache entries")
        
        return removed_count
    
    def get_cache_info(self) -> Dict[str, Any]:
        """Get detailed cache information for debugging."""
        with self._lock:
            entries_info = []
            for key, entry in self._cache.items():
                entries_info.append({
                    'key': key[:32] + '...' if len(key) > 32 else key,
                    'size_bytes': entry.size_bytes,
                    'created_at': entry.created_at,
                    'access_count': entry.access_count,
                    'compression_ratio': entry.compression_ratio,
                    'age_hours': (time.time() - entry.created_at) / 3600
                })
            
            # Sort by access count (most accessed first)
            entries_info.sort(key=lambda x: x['access_count'], reverse=True)
            
            return {
                'stats': asdict(self.get_stats()),
                'entries': entries_info[:10],  # Top 10 most accessed
                'cache_utilization': (self._stats.total_size_bytes / self.max_size_bytes) * 100,
                'average_entry_size': self._stats.total_size_bytes / max(1, self._stats.total_entries)
            }
    
    def _compress_content(self, content: str) -> Tuple[Any, float]:
        """Compress content if beneficial."""
        if not self.compression_enabled:
            return content, 1.0
        
        original_bytes = content.encode('utf-8')
        original_size = len(original_bytes)
        
        # Only compress if content is large enough to benefit
        if original_size < 1024:  # Less than 1KB
            return content, 1.0
        
        try:
            compressed_bytes = gzip.compress(original_bytes)
            compressed_size = len(compressed_bytes)
            compression_ratio = compressed_size / original_size
            
            # Only use compression if it provides significant savings
            if compression_ratio < 0.8:  # At least 20% savings
                return compressed_bytes, compression_ratio
            else:
                return content, 1.0
                
        except Exception as e:
            logger.warning(f"Compression failed: {e}")
            return content, 1.0
    
    def _decompress_content(self, content: Any, metadata: Dict[str, Any]) -> str:
        """Decompress content if it was compressed."""
        if not metadata.get('compressed', False):
            return content
        
        try:
            if isinstance(content, bytes):
                decompressed_bytes = gzip.decompress(content)
                return decompressed_bytes.decode('utf-8')
            else:
                return content
        except Exception as e:
            logger.error(f"Decompression failed: {e}")
            return str(content)  # Fallback to string representation
    
    def _has_space_for_entry(self, entry: CacheEntry) -> bool:
        """Check if cache has space for a new entry."""
        current_size = sum(e.size_bytes for e in self._cache.values())
        return (current_size + entry.size_bytes) <= self.max_size_bytes
    
    def _make_space_for_entry(self, new_entry: CacheEntry):
        """Make space for a new entry by evicting LRU entries."""
        target_size = self.max_size_bytes - new_entry.size_bytes
        current_size = sum(e.size_bytes for e in self._cache.values())
        
        # Remove LRU entries until we have enough space
        while current_size > target_size and self._access_order:
            lru_key = self._access_order[0]  # Least recently used is at the front
            lru_entry = self._cache.get(lru_key)
            
            if lru_entry:
                current_size -= lru_entry.size_bytes
                self._remove_entry(lru_key)
                self._stats.eviction_count += 1
                logger.debug(f"Evicted LRU entry {lru_key[:16]}... to make space")
            else:
                # Entry not found, remove from access order
                self._access_order.remove(lru_key)
    
    def _update_access_order(self, key: str):
        """Update the access order for LRU tracking."""
        if key in self._access_order:
            self._access_order.remove(key)
        self._access_order.append(key)  # Most recent at the end
    
    def _remove_entry(self, key: str):
        """Remove an entry from cache and access order."""
        if key in self._cache:
            del self._cache[key]
        
        if key in self._access_order:
            self._access_order.remove(key)
        
        # Remove persistent file
        if self.persistent:
            cache_file = self.cache_dir / f"{key}.cache"
            if cache_file.exists():
                try:
                    cache_file.unlink()
                except Exception as e:
                    logger.warning(f"Failed to delete cache file {cache_file}: {e}")
        
        # Update stats
        self._stats.total_entries = len(self._cache)
        self._stats.total_size_bytes = sum(e.size_bytes for e in self._cache.values())
    
    def _update_hit_rate(self):
        """Update cache hit rate statistic."""
        total_requests = self._stats.hit_count + self._stats.miss_count
        if total_requests > 0:
            self._stats.cache_hit_rate = (self._stats.hit_count / total_requests) * 100
    
    def _persist_entry(self, key: str, entry: CacheEntry):
        """Persist a cache entry to disk."""
        if not self.persistent:
            return
        
        try:
            cache_file = self.cache_dir / f"{key}.cache"
            
            # Prepare data for serialization
            entry_data = {
                'key': entry.key,
                'content': entry.content,
                'metadata': entry.metadata,
                'created_at': entry.created_at,
                'accessed_at': entry.accessed_at,
                'access_count': entry.access_count,
                'size_bytes': entry.size_bytes,
                'compression_ratio': entry.compression_ratio
            }
            
            # Handle bytes content for JSON serialization
            if isinstance(entry.content, bytes):
                entry_data['content'] = entry.content.hex()
                entry_data['metadata']['content_is_bytes'] = True
            
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(entry_data, f, indent=2)
                
        except Exception as e:
            logger.warning(f"Failed to persist cache entry {key}: {e}")
    
    def _load_persistent_cache(self):
        """Load cache entries from persistent storage."""
        if not self.persistent or not self.cache_dir.exists():
            return
        
        loaded_count = 0
        
        for cache_file in self.cache_dir.glob("*.cache"):
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    entry_data = json.load(f)
                
                # Reconstruct content
                content = entry_data['content']
                if entry_data.get('metadata', {}).get('content_is_bytes', False):
                    content = bytes.fromhex(content)
                
                # Create cache entry
                entry = CacheEntry(
                    key=entry_data['key'],
                    content=content,
                    metadata=entry_data['metadata'],
                    created_at=entry_data['created_at'],
                    accessed_at=entry_data['accessed_at'],
                    access_count=entry_data['access_count'],
                    size_bytes=entry_data['size_bytes'],
                    compression_ratio=entry_data['compression_ratio']
                )
                
                # Check if expired
                if not entry.is_expired(self.ttl_seconds):
                    self._cache[entry.key] = entry
                    self._access_order.append(entry.key)
                    loaded_count += 1
                else:
                    # Remove expired cache file
                    cache_file.unlink()
                
            except Exception as e:
                logger.warning(f"Failed to load cache file {cache_file}: {e}")
                # Remove corrupted cache file
                try:
                    cache_file.unlink()
                except:
                    pass
        
        if loaded_count > 0:
            logger.info(f"Loaded {loaded_count} cache entries from persistent storage")
        
        # Update statistics
        self._stats.total_entries = len(self._cache)
        self._stats.total_size_bytes = sum(e.size_bytes for e in self._cache.values())
    
    def generate_cache_key(self, content: str, optimization_params: Dict[str, Any]) -> str:
        """
        Generate a unique cache key for content and optimization parameters.
        
        Args:
            content: Content to be optimized
            optimization_params: Parameters affecting optimization
            
        Returns:
            Unique cache key string
        """
        # Create a deterministic hash based on content and parameters
        content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
        
        # Sort parameters for consistent hashing
        params_str = json.dumps(optimization_params, sort_keys=True, separators=(',', ':'))
        params_hash = hashlib.sha256(params_str.encode('utf-8')).hexdigest()
        
        # Combine hashes
        combined = f"{content_hash}:{params_hash}"
        cache_key = hashlib.sha256(combined.encode('utf-8')).hexdigest()
        
        return cache_key[:32]  # Use first 32 characters for shorter keys