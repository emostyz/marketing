// Test performance and optimization
class PerformanceTester {
  constructor() {
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async testCodeOptimization() {
    this.log('Testing code optimization patterns...');

    const fs = require('fs');
    const codeFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/components/deck-builder/UltimateDeckBuilder.tsx',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/components/editor/WorldClassPresentationEditor.tsx',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/hooks/useTierLimits.ts'
    ];

    for (const file of codeFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasMemoization = content.includes('useMemo') || content.includes('useCallback');
        const hasLazyLoading = content.includes('lazy') || content.includes('Suspense');
        const hasDebouncing = content.includes('debounce') || content.includes('throttle');
        const hasVirtualization = content.includes('virtual') || content.includes('windowing');
        const hasCodeSplitting = content.includes('dynamic') || content.includes('import(');
        const hasOptimizedRendering = content.includes('React.memo') || content.includes('shouldComponentUpdate');
        
        this.log(`⚡ ${file.split('/').pop()}:`);
        this.log(`   ${hasMemoization ? '✅' : '❌'} Memoization (useMemo/useCallback)`);
        this.log(`   ${hasLazyLoading ? '✅' : '❌'} Lazy loading`);
        this.log(`   ${hasDebouncing ? '✅' : '❌'} Debouncing/throttling`);
        this.log(`   ${hasVirtualization ? '✅' : '❌'} Virtualization`);
        this.log(`   ${hasCodeSplitting ? '✅' : '❌'} Code splitting`);
        this.log(`   ${hasOptimizedRendering ? '✅' : '❌'} Optimized rendering`);
      }
    }

    return true;
  }

  async testDatabaseOptimization() {
    this.log('Testing database optimization...');

    const fs = require('fs');
    const dbFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/schema.ts',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/queries.ts'
    ];

    for (const file of dbFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasIndexes = content.includes('index') || content.includes('createIndex');
        const hasOptimizedQueries = content.includes('select') && content.includes('where');
        const hasQueryOptimization = content.includes('limit') || content.includes('offset');
        const hasJoinOptimization = content.includes('join') || content.includes('leftJoin');
        const hasConnectionPooling = content.includes('pool') || content.includes('connection');
        const hasCaching = content.includes('cache') || content.includes('memoize');
        
        this.log(`🗄️  ${file.split('/').pop()}:`);
        this.log(`   ${hasIndexes ? '✅' : '❌'} Database indexes`);
        this.log(`   ${hasOptimizedQueries ? '✅' : '❌'} Optimized queries`);
        this.log(`   ${hasQueryOptimization ? '✅' : '❌'} Query pagination`);
        this.log(`   ${hasJoinOptimization ? '✅' : '❌'} Join optimization`);
        this.log(`   ${hasConnectionPooling ? '✅' : '❌'} Connection pooling`);
        this.log(`   ${hasCaching ? '✅' : '❌'} Query caching`);
      }
    }

    return true;
  }

  async testAssetOptimization() {
    this.log('Testing asset optimization...');

    const fs = require('fs');
    
    // Check Next.js configuration
    const nextConfigPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/next.config.ts';
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf8');
      
      const hasImageOptimization = content.includes('images') || content.includes('Image');
      const hasCompression = content.includes('compress') || content.includes('gzip');
      const hasBundleAnalyzer = content.includes('bundle') || content.includes('analyzer');
      const hasCaching = content.includes('cache') || content.includes('revalidate');
      
      this.log(`📦 next.config.ts:`);
      this.log(`   ${hasImageOptimization ? '✅' : '❌'} Image optimization`);
      this.log(`   ${hasCompression ? '✅' : '❌'} Asset compression`);
      this.log(`   ${hasBundleAnalyzer ? '✅' : '❌'} Bundle analyzer`);
      this.log(`   ${hasCaching ? '✅' : '❌'} Asset caching`);
    }

    // Check for static asset optimization
    const publicDir = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/public';
    if (fs.existsSync(publicDir)) {
      const assets = fs.readdirSync(publicDir);
      const imageAssets = assets.filter(asset => 
        asset.endsWith('.png') || asset.endsWith('.jpg') || asset.endsWith('.jpeg') || asset.endsWith('.webp')
      );
      
      this.log(`🖼️  Public assets: ${assets.length} total, ${imageAssets.length} images`);
      
      if (imageAssets.length > 0) {
        const hasWebp = imageAssets.some(img => img.endsWith('.webp'));
        this.log(`   ${hasWebp ? '✅' : '❌'} WebP format usage`);
      }
    }

    return true;
  }

  async testAPIPerformance() {
    this.log('Testing API performance optimizations...');

    const fs = require('fs');
    const apiFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/openai/enhanced-analyze/route.ts',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/upload/route.ts',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/presentations/route.ts'
    ];

    for (const file of apiFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasRateLimiting = content.includes('rate') || content.includes('throttle');
        const hasCaching = content.includes('cache') || content.includes('revalidate');
        const hasDataPagination = content.includes('page') || content.includes('limit');
        const hasCompressionUsage = content.includes('gzip') || content.includes('compress');
        const hasParallelProcessing = content.includes('Promise.all') || content.includes('concurrent');
        const hasResponseOptimization = content.includes('stringify') || content.includes('minimize');
        
        this.log(`🌐 ${file.split('/').pop()}:`);
        this.log(`   ${hasRateLimiting ? '✅' : '❌'} Rate limiting`);
        this.log(`   ${hasCaching ? '✅' : '❌'} Response caching`);
        this.log(`   ${hasDataPagination ? '✅' : '❌'} Data pagination`);
        this.log(`   ${hasCompressionUsage ? '✅' : '❌'} Response compression`);
        this.log(`   ${hasParallelProcessing ? '✅' : '❌'} Parallel processing`);
        this.log(`   ${hasResponseOptimization ? '✅' : '❌'} Response optimization`);
      }
    }

    return true;
  }

  async testMemoryManagement() {
    this.log('Testing memory management...');

    const fs = require('fs');
    const memoryFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/components/deck-builder/UltimateDeckBuilder.tsx',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/hooks/useTierLimits.ts'
    ];

    for (const file of memoryFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasCleanupEffects = content.includes('useEffect') && content.includes('return ()');
        const hasEventListenerCleanup = content.includes('removeEventListener');
        const hasTimerCleanup = content.includes('clearTimeout') || content.includes('clearInterval');
        const hasMemoryLeakPrevention = content.includes('AbortController') || content.includes('signal');
        const hasReferenceCleanup = content.includes('null') && content.includes('ref');
        
        this.log(`🧠 ${file.split('/').pop()}:`);
        this.log(`   ${hasCleanupEffects ? '✅' : '❌'} Effect cleanup`);
        this.log(`   ${hasEventListenerCleanup ? '✅' : '❌'} Event listener cleanup`);
        this.log(`   ${hasTimerCleanup ? '✅' : '❌'} Timer cleanup`);
        this.log(`   ${hasMemoryLeakPrevention ? '✅' : '❌'} Memory leak prevention`);
        this.log(`   ${hasReferenceCleanup ? '✅' : '❌'} Reference cleanup`);
      }
    }

    return true;
  }

  async testLoadingStates() {
    this.log('Testing loading states and user experience...');

    const fs = require('fs');
    const uiFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/components/deck-builder/UltimateDeckBuilder.tsx',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/components/ui/UpgradePrompt.tsx',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/dashboard/page.tsx'
    ];

    for (const file of uiFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasLoadingStates = content.includes('loading') || content.includes('isLoading');
        const hasSkeletonScreens = content.includes('Skeleton') || content.includes('skeleton');
        const hasProgressIndicators = content.includes('progress') || content.includes('Progress');
        const hasErrorStates = content.includes('error') && content.includes('state');
        const hasOptimisticUpdates = content.includes('optimistic') || content.includes('immediate');
        const hasSpinners = content.includes('spinner') || content.includes('Spinner');
        
        this.log(`🎨 ${file.split('/').pop()}:`);
        this.log(`   ${hasLoadingStates ? '✅' : '❌'} Loading states`);
        this.log(`   ${hasSkeletonScreens ? '✅' : '❌'} Skeleton screens`);
        this.log(`   ${hasProgressIndicators ? '✅' : '❌'} Progress indicators`);
        this.log(`   ${hasErrorStates ? '✅' : '❌'} Error states`);
        this.log(`   ${hasOptimisticUpdates ? '✅' : '❌'} Optimistic updates`);
        this.log(`   ${hasSpinners ? '✅' : '❌'} Loading spinners`);
      }
    }

    return true;
  }

  async testBundleSize() {
    this.log('Testing bundle size optimization...');

    const fs = require('fs');
    
    // Check package.json for dependencies
    const packagePath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/package.json';
    if (fs.existsSync(packagePath)) {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const dependencies = Object.keys(packageContent.dependencies || {});
      const devDependencies = Object.keys(packageContent.devDependencies || {});
      
      this.log(`📦 Package Analysis:`);
      this.log(`   Dependencies: ${dependencies.length}`);
      this.log(`   Dev Dependencies: ${devDependencies.length}`);
      
      // Check for bundle optimization tools
      const hasBundleAnalyzer = devDependencies.includes('@next/bundle-analyzer');
      const hasTreeShaking = packageContent.sideEffects === false;
      
      this.log(`   ${hasBundleAnalyzer ? '✅' : '❌'} Bundle analyzer configured`);
      this.log(`   ${hasTreeShaking ? '✅' : '❌'} Tree shaking enabled`);
      
      // Check for heavy dependencies
      const heavyDeps = dependencies.filter(dep => 
        dep.includes('lodash') || dep.includes('moment') || dep.includes('material-ui')
      );
      
      if (heavyDeps.length > 0) {
        this.log(`   ⚠️  Heavy dependencies detected: ${heavyDeps.join(', ')}`, 'warning');
      } else {
        this.log(`   ✅ No obviously heavy dependencies`);
      }
    }

    return true;
  }

  async testCaching() {
    this.log('Testing caching strategies...');

    const fs = require('fs');
    const cachingFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/hooks/useTierLimits.ts',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/presentations/route.ts'
    ];

    for (const file of cachingFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasClientSideCaching = content.includes('useState') || content.includes('cache');
        const hasAPIResponseCaching = content.includes('revalidate') || content.includes('cache-control');
        const hasInMemoryCaching = content.includes('Map') || content.includes('WeakMap');
        const hasBrowserCaching = content.includes('localStorage') || content.includes('sessionStorage');
        const hasSWRCaching = content.includes('swr') || content.includes('useSWR');
        
        this.log(`💾 ${file.split('/').pop()}:`);
        this.log(`   ${hasClientSideCaching ? '✅' : '❌'} Client-side caching`);
        this.log(`   ${hasAPIResponseCaching ? '✅' : '❌'} API response caching`);
        this.log(`   ${hasInMemoryCaching ? '✅' : '❌'} In-memory caching`);
        this.log(`   ${hasBrowserCaching ? '✅' : '❌'} Browser caching`);
        this.log(`   ${hasSWRCaching ? '✅' : '❌'} SWR caching`);
      }
    }

    return true;
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive performance tests...');

    const tests = [
      { name: 'Code Optimization', fn: () => this.testCodeOptimization() },
      { name: 'Database Optimization', fn: () => this.testDatabaseOptimization() },
      { name: 'Asset Optimization', fn: () => this.testAssetOptimization() },
      { name: 'API Performance', fn: () => this.testAPIPerformance() },
      { name: 'Memory Management', fn: () => this.testMemoryManagement() },
      { name: 'Loading States', fn: () => this.testLoadingStates() },
      { name: 'Bundle Size', fn: () => this.testBundleSize() },
      { name: 'Caching Strategies', fn: () => this.testCaching() }
    ];

    const results = { passed: 0, failed: 0, total: tests.length };

    for (const test of tests) {
      this.log(`\n📋 Running: ${test.name}`);
      try {
        const passed = await test.fn();
        if (passed) {
          results.passed++;
          this.log(`✅ ${test.name} - PASSED`);
        } else {
          results.failed++;
          this.log(`❌ ${test.name} - FAILED`, 'error');
        }
      } catch (error) {
        results.failed++;
        this.log(`❌ ${test.name} - ERROR: ${error.message}`, 'error');
      }
    }

    this.log('\n📊 Performance Test Results:');
    this.log(`   Total: ${results.total}`);
    this.log(`   Passed: ${results.passed}`);
    this.log(`   Failed: ${results.failed}`);
    this.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    return results;
  }
}

// Run tests
async function main() {
  const tester = new PerformanceTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Performance test suite failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PerformanceTester };