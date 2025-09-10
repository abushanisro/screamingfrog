# Technical Documentation - Screaming Frog SEO Analysis Tools

## Architecture Overview

This project consists of three interconnected JavaScript modules designed to run within the Screaming Frog SEO Spider browser environment for advanced website analysis.

## Module Details

### 1. Link Gap Analyzer (`linkgap.js`)

#### Purpose
Analyzes internal linking patterns to identify opportunities for contextual link building while filtering out template/navigation noise.

#### Core Components

##### Configuration Object
```javascript
const CONFIG = {
    CONTEXTUAL_LINK_TARGET: 100,        // Target: 1 contextual link per 100 words
    MIN_CONTEXTUAL_DENSITY: 0.8,       // Minimum acceptable density
    MAX_CONTEXTUAL_DENSITY: 3.0,       // Maximum recommended density
    THIN_CONTENT_THRESHOLD: 300,       // Thin content boundary
    MEDIUM_CONTENT_THRESHOLD: 800,     // Medium content boundary
    MIN_WORDS_FOR_LINKS: 50,          // Minimum words to expect links
    EXTERNAL_WARNING_RATIO: 2.0        // External to contextual ratio warning
};
```

##### Key Functions

**`analyzeLinksAdvanced()`**
- Categorizes links into contextual vs template types
- Uses DOM analysis to identify navigation, footer, and content area links
- Tracks unique destinations to avoid duplicate counting

**`analyzeContent()`**
- Extracts meaningful text content using multiple selectors
- Filters out navigation and boilerplate text
- Calculates word counts and content quality metrics

**Link Classification Logic**
```javascript
// Template link detection
const isTemplateLink = (link) => {
    const templateSelectors = [
        'nav', 'header', 'footer', '.navigation',
        '.menu', '.breadcrumb', '.sidebar'
    ];
    return templateSelectors.some(selector => 
        link.closest(selector)
    );
};
```

#### Algorithm Flow
1. Extract all links from DOM
2. Classify each link as contextual or template
3. Analyze content quality and word count
4. Calculate link density ratios
5. Generate recommendations based on thresholds

---

### 2. Semantic AI Analyzer (`semantic.js`)

#### Purpose
Provides AI-powered semantic content analysis using Ollama embeddings for similarity detection and intelligent link suggestions.

#### Architecture

##### Configuration System
```javascript
const SEMANTIC_CONFIG = {
    // Ollama Integration
    OLLAMA_ENDPOINT: 'http://localhost:11434',
    OLLAMA_MODEL: 'nomic-embed-text',
    
    // Analysis Thresholds
    SIMILARITY_THRESHOLD: 0.85,
    HIGH_SIMILARITY_THRESHOLD: 0.95,
    CLUSTER_THRESHOLD: 0.8,
    
    // Performance Settings
    BATCH_SIZE: 20,
    RATE_LIMIT_DELAY: 150,
    MAX_RETRIES: 3
};
```

##### Core Class: `SemanticAIAnalyzer`

**Properties**
- `cache`: Map for storing computed results
- `embeddings`: Map for vector representations
- `clusters`: Map for content groupings
- `siteCentroid`: Overall site theme vector

**Key Methods**

**`generateEmbedding(text)`**
- Interfaces with Ollama API
- Handles text preprocessing and chunking
- Implements retry logic with exponential backoff
- Caches results to avoid redundant API calls

**`calculateSimilarity(embedding1, embedding2)`**
- Computes cosine similarity between vectors
- Normalizes vectors for accurate comparison
- Returns similarity scores from 0-1

**`analyzePageSemantically(url)`**
- Extracts and processes page content
- Generates embeddings for content blocks
- Compares against site centroid for theme consistency
- Identifies similar pages and content clusters

#### Embedding Pipeline
```javascript
async generateEmbedding(text) {
    // 1. Text preprocessing
    const cleanText = this.preprocessText(text);
    
    // 2. Check cache first
    if (this.cache.has(cleanText)) {
        return this.cache.get(cleanText);
    }
    
    // 3. API call with retry logic
    const embedding = await this.callOllamaAPI(cleanText);
    
    // 4. Cache result
    this.cache.set(cleanText, embedding);
    return embedding;
}
```

#### Link Suggestion Algorithm
1. Generate embeddings for current page content
2. Compare against all other pages in site
3. Find pages with similarity above threshold
4. Extract relevant anchor text suggestions
5. Rank suggestions by semantic relevance

---

### 3. Vector Processor (`vector.js`)

#### Purpose
Handles data cleanup, fallback functionality, and content extraction when AI services are unavailable.

#### Key Functions

**`cleanupMalformedData(rawData)`**
- Fixes malformed JSON embedding strings
- Removes nested prefixes and suffixes
- Handles various data corruption patterns

```javascript
function cleanupMalformedData(rawData) {
    if (typeof rawData === 'string') {
        let cleaned = rawData
            .replace(/^\[?\{?"embedding":\s*"\[?\{?"embedding":\s*"/g, '')
            .replace(/",?"method".*$/g, '')
            .replace(/^\[|\]$/g, '')
            .replace(/^"|"$/g, '')
            .trim();
        return cleaned;
    }
    return rawData;
}
```

**`generateSimpleEmbedding(text, dimensions)`**
- Creates deterministic pseudo-embeddings using hash functions
- Provides consistent vectors for text analysis
- Fallback when AI embedding services are unavailable

```javascript
function generateSimpleEmbedding(text, dimensions = 768) {
    const normalized = text.toLowerCase().trim();
    const embedding = new Array(dimensions);
    
    for (let i = 0; i < dimensions; i++) {
        let hash = 0;
        const seed = normalized + i.toString();
        
        for (let j = 0; j < seed.length; j++) {
            const char = seed.charCodeAt(j);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        embedding[i] = (Math.sin(hash / 1000000) * 0.5).toFixed(6);
    }
    
    return embedding;
}
```

**`extractBlogContent()`**
- Enhanced content extraction specifically for blog posts
- Handles various CMS structures
- Filters out boilerplate content

---

## Integration Patterns

### Cross-Module Communication
The modules are designed to work independently but can share data:

1. **Link Gap → Semantic**: Pass identified content areas for semantic analysis
2. **Semantic → Vector**: Use fallback embeddings when AI service is unavailable
3. **Vector → Link Gap**: Provide cleaned content for link analysis

### Data Flow
```
Page Content → Content Extraction → Link Analysis
     ↓              ↓                    ↓
Semantic Analysis → Embedding Generation → Similarity Calculation
     ↓              ↓                    ↓
Link Suggestions → Ranking → Final Report
```

## Performance Considerations

### Batch Processing
- Process pages in batches of 20 to avoid overwhelming APIs
- Implement 150ms delays between requests
- Use caching to avoid redundant computations

### Memory Management
- Clear caches periodically for large sites
- Use weak references where possible
- Implement garbage collection for unused embeddings

### Error Handling
- Graceful degradation when AI services unavailable
- Retry logic with exponential backoff
- Fallback to simpler algorithms when needed

## API Dependencies

### Ollama Integration
- **Endpoint**: `http://localhost:11434`
- **Model**: `nomic-embed-text` (default) or `mxbai-embed-large`
- **Timeout**: 30 seconds
- **Rate Limiting**: 150ms between requests

### CORS Considerations
The semantic analyzer requires CORS-enabled access to the local Ollama server. Configure Ollama with:

```bash
OLLAMA_ORIGINS=* ollama serve
```

## Debugging and Monitoring

### Console Logging
Each module includes comprehensive console logging:
- 🔍 Content extraction progress
- 📊 Analysis statistics
- ⚠️ Warnings and errors
- ✅ Success confirmations

### Performance Metrics
Track key performance indicators:
- Embedding generation time
- Cache hit rates
- API response times
- Analysis completion rates

### Error Categories
1. **Network Errors**: Ollama server connectivity issues
2. **Data Errors**: Malformed content or embeddings
3. **Threshold Errors**: Configuration issues
4. **Memory Errors**: Large dataset processing issues

## Extending the System

### Adding New Analysis Types
1. Create new configuration section
2. Implement analysis function following existing patterns
3. Add results to output schema
4. Update documentation

### Custom Embedding Models
Replace the default Ollama model by updating:
```javascript
SEMANTIC_CONFIG.OLLAMA_MODEL = 'your-custom-model';
```

### Additional Content Types
Extend the content extraction functions in `vector.js` to handle:
- E-commerce product pages
- News articles
- Documentation pages
- Landing pages

## Security Considerations

- Scripts run in browser context with page permissions
- No external data transmission beyond Ollama API
- Local processing ensures data privacy
- Consider rate limiting for production use

## Testing

### Unit Testing Approach
```javascript
// Test embedding generation
const testText = "Sample content for testing";
const embedding = generateSimpleEmbedding(testText, 128);
console.assert(embedding.length === 128, "Embedding dimension mismatch");

// Test similarity calculation
const similarity = calculateSimilarity(embedding, embedding);
console.assert(similarity === 1.0, "Self-similarity should be 1.0");
```

### Integration Testing
1. Test with various website structures
2. Validate against known similar/dissimilar content pairs
3. Verify performance under load
4. Test fallback functionality

This technical documentation provides the foundation for understanding, maintaining, and extending the Screaming Frog SEO analysis tools.