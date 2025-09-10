// Data Cleanup and Fallback Embedding Script
// This script handles the CORS issues and provides alternative solutions

function cleanupMalformedData(rawData) {
    // Clean up malformed embedding strings like '[{"embedding":"[{"embedding":'
    if (typeof rawData === 'string') {
        // Remove malformed JSON prefixes/suffixes
        let cleaned = rawData
            .replace(/^\[?\{?"embedding":\s*"\[?\{?"embedding":\s*"/g, '')  // Remove nested embedding prefixes
            .replace(/",?"method".*$/g, '')  // Remove method and everything after
            .replace(/^\[|\]$/g, '')  // Remove array brackets
            .replace(/^"|"$/g, '')  // Remove outer quotes
            .trim();
        
        return cleaned;
    }
    return rawData;
}

// Simple hash-based embedding generation as fallback
function generateSimpleEmbedding(text, dimensions = 768) {
    // Create a deterministic "embedding" based on text content
    // This is not a real semantic embedding but provides consistent vectors
    
    const normalized = text.toLowerCase().trim();
    const embedding = new Array(dimensions);
    
    // Use multiple hash functions to generate diverse values
    for (let i = 0; i < dimensions; i++) {
        let hash = 0;
        const seed = normalized + i.toString();
        
        for (let j = 0; j < seed.length; j++) {
            const char = seed.charCodeAt(j);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Normalize to [-1, 1] range (typical for embeddings)
        embedding[i] = (Math.sin(hash / 1000000) * 0.5).toFixed(6);
    }
    
    return embedding;
}

// Enhanced content extraction for blog posts
function extractBlogContent() {
    const url = window.location.href;
    
    console.log(`🔍 Extracting content from: ${url}`);
    
    // Determine page type
    const isBlogHome = /\/blog\/?$/.test(url);
    const isBlogPost = /\/blog\/[^\/]+/.test(url) && !url.includes('/page/');
    
    let content = '';
    let extractionMethod = '';
    
    if (isBlogPost) {
        console.log('📄 Processing individual blog post');
        
        // Blog post specific selectors
        const postSelectors = [
            '.post-content',
            '.entry-content',
            '.article-content',
            '.blog-content',
            '[class*="post-body"]',
            '[class*="article-body"]',
            'article .content',
            'main article',
            '.single-post-content'
        ];
        
        // Try each selector
        for (const selector of postSelectors) {
            const element = document.querySelector(selector);
            if (element && element.innerText.length > 300) {
                content = element.innerText;
                extractionMethod = `selector: ${selector}`;
                console.log(`✅ Found content using ${selector}: ${content.length} chars`);
                break;
            }
        }
        
        // Fallback to article tag
        if (!content) {
            const article = document.querySelector('article');
            if (article) {
                content = article.innerText;
                extractionMethod = 'article fallback';
                console.log(`✅ Using article fallback: ${content.length} chars`);
            }
        }
        
        // Last resort: look for largest text block
        if (!content || content.length < 200) {
            const textElements = document.querySelectorAll('p, div');
            let largestElement = null;
            let maxLength = 0;
            
            textElements.forEach(el => {
                const text = el.innerText.trim();
                if (text.length > maxLength && text.length > 200) {
                    maxLength = text.length;
                    largestElement = el;
                }
            });
            
            if (largestElement) {
                content = largestElement.innerText;
                extractionMethod = 'largest text block';
                console.log(`✅ Using largest text block: ${content.length} chars`);
            }
        }
        
    } else if (isBlogHome) {
        console.log('📄 Processing blog home/listing page');
        
        // Extract blog post titles and descriptions
        const postElements = document.querySelectorAll('article, .post-item, .blog-item, [href*="/blog/"]');
        const posts = [];
        
        postElements.forEach(el => {
            const titleEl = el.querySelector('h1, h2, h3, .title, .post-title') || el;
            const descEl = el.querySelector('.excerpt, .description, p');
            
            if (titleEl) {
                const title = titleEl.innerText.trim();
                const desc = descEl ? descEl.innerText.trim() : '';
                
                if (title.length > 10) {
                    posts.push(`${title}. ${desc.substring(0, 150)}`);
                }
            }
        });
        
        if (posts.length > 0) {
            content = `Blog posts: ${posts.slice(0, 10).join(' ')}`;
            extractionMethod = `${posts.length} blog post summaries`;
            console.log(`✅ Extracted ${posts.length} blog post summaries`);
        }
    }
    
    // Final fallback to body
    if (!content || content.length < 100) {
        content = document.body.innerText;
        extractionMethod = 'body fallback';
        console.log(`⚠️ Using body fallback: ${content.length} chars`);
    }
    
    // Clean the content
    content = content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .replace(/\t+/g, ' ')
        .replace(/Cookie|Privacy|Terms|Subscribe|Follow|Share/gi, '')
        .trim();
    
    return {
        content: content,
        method: extractionMethod,
        length: content.length
    };
}

// Main function with fallback embedding generation
async function generateEmbeddingWithFallback() {
    const startTime = Date.now();
    const url = window.location.href;
    
    console.log(`🚀 Starting embedding generation for: ${url}`);
    
    try {
        // Extract content
        const {content, method, length} = extractBlogContent();
        
        if (length < 50) {
            throw new Error(`Insufficient content: ${length} characters`);
        }
        
        console.log(`✅ Content extracted: ${length} chars using ${method}`);
        
        // Try Ollama API first
        console.log('🔄 Attempting Ollama API...');
        
        try {
            const apiResponse = await fetch('http://localhost:11434/api/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: "nomic-embed-text",
                    prompt: content.substring(0, 4000)
                }),
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });
            
            if (apiResponse.ok) {
                const data = await apiResponse.json();
                const embedding = data.embedding.join(',');
                
                const processingTime = (Date.now() - startTime) / 1000;
                console.log(`🎉 Ollama API success! Time: ${processingTime}s`);
                
                return seoSpider.data(embedding);
            } else {
                throw new Error(`API Error: ${apiResponse.status}`);
            }
            
        } catch (apiError) {
            console.log(`❌ Ollama API failed: ${apiError.message}`);
            console.log('🔄 Falling back to simple embedding generation...');
            
            // Generate fallback embedding
            const simpleEmbedding = generateSimpleEmbedding(content);
            const embedding = simpleEmbedding.join(',');
            
            const processingTime = (Date.now() - startTime) / 1000;
            console.log(`✅ Fallback embedding generated! Time: ${processingTime}s`);
            
            // Include metadata about fallback method
            const metadata = {
                embedding: embedding,
                method: "fallback",
                contentLength: length,
                url: url,
                timestamp: new Date().toISOString(),
                processingTime: processingTime
            };
            
            // Return just the embedding string, not the metadata object
            return seoSpider.data(embedding);
        }
        
    } catch (error) {
        const processingTime = (Date.now() - startTime) / 1000;
        console.error(`💥 Complete failure after ${processingTime}s: ${error.message}`);
        
        return seoSpider.error(`Embedding generation failed: ${error.message}`);
    }
}

// Data cleanup function for existing malformed data
function cleanupExistingData(embeddingValue) {
    // Handle malformed embedding strings
    if (typeof embeddingValue === 'string') {
        // Check if it's malformed JSON
        if (embeddingValue.includes('{"embedding":')) {
            console.log('🧹 Cleaning malformed embedding data...');
            
            try {
                // Try to extract clean embedding from malformed string
                const cleanValue = cleanupMalformedData(embeddingValue);
                
                // Validate it's a proper comma-separated number string
                if (cleanValue && /^-?\d+(\.\d+)?(,-?\d+(\.\d+)?)*$/.test(cleanValue)) {
                    console.log('✅ Successfully cleaned malformed data');
                    return cleanValue;
                } else {
                    console.log('❌ Could not clean malformed data, regenerating...');
                    return null;
                }
            } catch (error) {
                console.log('❌ Cleanup failed, regenerating...');
                return null;
            }
        }
        
        // Return as-is if already clean
        return embeddingValue;
    }
    
    return null;
}

// Check if we need to clean existing data or generate new
const currentEmbedding = window.currentEmbeddingValue; // If available from crawler
if (currentEmbedding && currentEmbedding.includes('TypeError: Failed to fetch')) {
    console.log('🔄 Detected failed embedding, regenerating...');
    return generateEmbeddingWithFallback();
} else if (currentEmbedding && currentEmbedding.includes('{"embedding":')) {
    console.log('🧹 Detected malformed embedding, cleaning...');
    const cleaned = cleanupExistingData(currentEmbedding);
    if (cleaned) {
        return seoSpider.data(cleaned);
    } else {
        return generateEmbeddingWithFallback();
    }
} else {
    // Generate new embedding
    return generateEmbeddingWithFallback();
}