# Screaming Frog SEO Analysis Tools

<p align="center">
  <img src="https://github.com/abushanisro/screamingfrog/blob/main/Screeming%20frog.png?raw=true" width="400"/>
  <img src="https://github.com/abushanisro/screamingfrog/blob/main/screamingfrog22.0.png?raw=true" width="400"/>
</p>

A collection of advanced JavaScript tools for analyzing website structure, internal linking patterns, and semantic content relationships using Screaming Frog SEO Spider.

## Overview

This project provides three main analysis scripts designed to run within the Screaming Frog SEO Spider browser context:

- **linkgap.js** - Contextual Internal Link Gap Analyzer
- **semantic.js** - AI-powered Semantic Content Analysis
- **vector.js** - Data Processing and Fallback Embedding Generation

## Features

### Link Gap Analysis (`linkgap.js`)
- Identifies internal linking opportunities by analyzing contextual link density
- Separates contextual links from template/navigation links
- Provides content quality classification (thin, medium, high)
- Calculates optimal link targets based on content length
- Generates actionable recommendations for link building

### Semantic Analysis (`semantic.js`)
- AI-powered content similarity analysis using Ollama embeddings
- Content clustering and theme consistency checking
- Intelligent link suggestion system
- Competitive content analysis
- Batch processing with rate limiting

### Vector Processing (`vector.js`)
- Data cleanup for malformed embedding strings
- Fallback embedding generation when AI services are unavailable
- Enhanced content extraction for blog posts and articles
- Hash-based deterministic vector generation

## Requirements

- Screaming Frog SEO Spider (desktop application)
- For semantic analysis: Ollama server running locally on port 11434
- Modern web browser with JavaScript enabled

## Installation

1. Clone or download this repository
2. Copy the JavaScript files to your desired location
3. For semantic analysis features, install and run Ollama:
   ```bash
   # Install Ollama (macOS/Linux)
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull the embedding model
   ollama pull nomic-embed-text
   ```

## Usage

### Basic Link Gap Analysis

1. Open Screaming Frog SEO Spider
2. Configure the browser to run custom JavaScript
3. Load `linkgap.js` in the browser console on target pages
4. Review the analysis output for linking opportunities

### AI-Powered Semantic Analysis

1. Ensure Ollama is running locally (`ollama serve`)
2. Load `semantic.js` in the browser console
3. Run analysis on your target website pages
4. Review similarity mappings and link suggestions

### Data Processing

Load `vector.js` for data cleanup and fallback functionality when working with embedding data.

## Configuration

Each script includes configurable parameters at the top of the file:

### Link Gap Analyzer
```javascript
const CONFIG = {
    CONTEXTUAL_LINK_TARGET: 100,     // 1 link per 100 words
    MIN_CONTEXTUAL_DENSITY: 0.8,    // Minimum density percentage
    MAX_CONTEXTUAL_DENSITY: 3.0,    // Maximum density percentage
    THIN_CONTENT_THRESHOLD: 300,    // Words for thin content
    // ... additional settings
};
```

### Semantic Analyzer
```javascript
const SEMANTIC_CONFIG = {
    OLLAMA_ENDPOINT: 'http://localhost:11434',
    SIMILARITY_THRESHOLD: 0.85,
    MAX_SUGGESTIONS_PER_PAGE: 5,
    // ... additional settings
};
```

## Output

The tools generate detailed analysis reports including:

- Content quality classifications
- Link density metrics
- Similarity scores between pages
- Actionable recommendations
- Performance statistics

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Ollama is configured to allow cross-origin requests
2. **Missing Embeddings**: The vector.js script provides fallback functionality
3. **Performance**: Adjust batch sizes and rate limits for large sites

### Support

This is an analysis tool designed for SEO professionals using Screaming Frog SEO Spider. Ensure you have the appropriate permissions to analyze target websites.

## License

This project is provided as-is for educational and professional SEO analysis purposes.# screamingfrog
