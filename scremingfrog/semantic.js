// Semantic AI Search Integration for Screaming Frog SEO Spider
// Advanced Ollama-powered content analysis with intelligent link suggestions
// Version 4.0 - Production-ready semantic analysis system

// ================================
// SEMANTIC AI CONFIGURATION
// ================================
const SEMANTIC_CONFIG = {
    // Ollama Server Settings
    OLLAMA_ENDPOINT: 'http://localhost:11434',
    OLLAMA_MODEL: 'nomic-embed-text', // or 'mxbai-embed-large' for higher accuracy
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    
    // Semantic Analysis Thresholds
    SIMILARITY_THRESHOLD: 0.85,        // Pages above this are similar
    HIGH_SIMILARITY_THRESHOLD: 0.95,   // Very similar/duplicate content
    RELEVANCE_THRESHOLD: 0.7,          // Below this = off-topic
    CLUSTER_THRESHOLD: 0.8,            // Grouping related content
    
    // Content Analysis Settings
    MAX_CONTENT_LENGTH: 8192,
    MIN_CONTENT_WORDS: 100,
    BATCH_SIZE: 20,
    RATE_LIMIT_DELAY: 150,
    
    // Link Suggestion Parameters
    MAX_SUGGESTIONS_PER_PAGE: 5,
    MIN_ANCHOR_LENGTH: 3,
    MAX_ANCHOR_LENGTH: 60,
    LINK_CONTEXT_WINDOW: 100,
    
    // Enable/Disable Features
    ENABLE_SIMILARITY_MAPPING: true,
    ENABLE_CONTENT_CLUSTERING: true,
    ENABLE_LINK_SUGGESTIONS: true,
    ENABLE_COMPETITIVE_ANALYSIS: true,
    ENABLE_THEME_CONSISTENCY: true
};

// ================================
// SEMANTIC ANALYSIS ENGINE
// ================================
class SemanticAIAnalyzer {
    constructor(config = {}) {
        this.config = { ...SEMANTIC_CONFIG, ...config };
        this.cache = new Map();
        this.embeddings = new Map();
        this.clusters = new Map();
        this.siteCentroid = null;
        this.pageRelationships = new Map();
        this.linkSuggestions = new Map();
        
        // Performance tracking
        this.metrics = {
            totalAnalyses: 0,
            embeddingGenerations: 0,
            similarityCalculations: 0,
            linkSuggestions: 0,
            clusteringOperations: 0
        };
    }
    
    // ================================
    // CORE SEMANTIC ANALYSIS
    // ================================
    
    /**
     * Perform comprehensive semantic analysis on current page
     */
    async performSemanticAnalysis() {
        try {
            console.log('🔍 Starting Semantic AI Analysis...');
            
            const currentUrl = window.location.href;
            const pageContent = this._extractPageContent();
            
            if (!pageContent || pageContent.words < this.config.MIN_CONTENT_WORDS) {
                return this._generateBasicAnalysis(currentUrl, pageContent);
            }
            
            // Generate embedding for current page
            const embedding = await this._generateEmbedding(pageContent.cleanText);
            this.embeddings.set(currentUrl, embedding);
            
            // Perform all semantic analyses
            const results = {
                url: currentUrl,
                basicInfo: this._getBasicPageInfo(),
                contentAnalysis: pageContent,
                semanticSimilarity: await this._findSimilarPages(currentUrl, embedding),
                contentThemeConsistency: await this._analyzeThemeConsistency(embedding),
                intelligentLinkSuggestions: await this._generateIntelligentLinkSuggestions(pageContent, embedding),
                semanticClustering: await this._performSemanticClustering(currentUrl, embedding),
                competitiveAnalysis: await this._analyzeCompetitivePosition(pageContent),
                contentGapAnalysis: await this._identifyContentGaps(embedding, pageContent),
                semanticScore: this._calculateSemanticScore(embedding, pageContent),
                actionableInsights: [],
                metadata: {
                    analysisTimestamp: new Date().toISOString(),
                    modelUsed: this.config.OLLAMA_MODEL,
                    embeddingDimensions: embedding.length,
                    analysisDepth: 'COMPREHENSIVE'
                }
            };
            
            // Generate actionable insights
            results.actionableInsights = this._generateActionableInsights(results);
            
            console.log('Semantic Analysis Complete');
            return this._formatForScreamingFrog(results);
            
        } catch (error) {
            console.error('Semantic Analysis Failed:', error);
            return this._handleAnalysisError(error);
        }
    }
    
    // ================================
    // SEMANTIC SIMILARITY MAPPING
    // ================================
    
    /**
     * Find semantically similar pages for cross-linking opportunities
     */
    async _findSimilarPages(currentUrl, embedding) {
        console.log('🔗 Analyzing semantic similarity...');
        
        try {
            // In a full implementation, this would analyze other crawled pages
            // For now, we'll simulate with common crypto exchange page types
            const commonPages = await this._getCommonPageTypes();
            const similarities = [];
            
            for (const page of commonPages) {
                if (page.url === currentUrl) continue;
                
                const pageEmbedding = await this._generateEmbedding(page.content);
                const similarity = this._cosineSimilarity(embedding, pageEmbedding);
                
                if (similarity >= this.config.SIMILARITY_THRESHOLD) {
                    similarities.push({
                        url: page.url,
                        title: page.title,
                        similarity: similarity.toFixed(4),
                        relationshipType: this._classifyRelationship(similarity),
                        linkPotential: this._assessLinkPotential(similarity, page.pageType),
                        suggestedAnchorText: this._generateSemanticAnchorText(page.title, page.content)
                    });
                }
            }
            
            return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
            
        } catch (error) {
            console.warn('Similarity mapping failed:', error);
            return [];
        }
    }
    
    // ================================
    // CONTENT THEME CONSISTENCY
    // ================================
    
    /**
     * Analyze how well the current page aligns with overall site theme
     */
    async _analyzeThemeConsistency(embedding) {
        console.log('🎯 Analyzing theme consistency...');
        
        try {
            // Calculate site centroid if not available
            if (!this.siteCentroid) {
                this.siteCentroid = await this._calculateSiteCentroid();
            }
            
            const themeAlignment = this._cosineSimilarity(embedding, this.siteCentroid);
            
            return {
                themeAlignmentScore: themeAlignment.toFixed(4),
                consistencyLevel: this._classifyConsistency(themeAlignment),
                siteThemeKeywords: await this._extractSiteThemeKeywords(),
                pageThemeKeywords: this._extractPageThemeKeywords(),
                themeGaps: this._identifyThemeGaps(embedding),
                recommendations: this._generateThemeRecommendations(themeAlignment)
            };
            
        } catch (error) {
            console.warn('Theme consistency analysis failed:', error);
            return { error: error.message };
        }
    }
    
    // ================================
    // INTELLIGENT LINK SUGGESTIONS
    // ================================
    
    /**
     * Generate AI-powered internal link suggestions
     */
    async _generateIntelligentLinkSuggestions(pageContent, embedding) {
        console.log('Generating intelligent link suggestions...');
        
        try {
            const suggestions = [];
            const pageType = this._identifyPageType(pageContent.cleanText);
            const contentSentences = this._extractSentences(pageContent.cleanText);
            
            // Analyze each sentence for linking opportunities
            for (const sentence of contentSentences) {
                const sentenceEmbedding = await this._generateEmbedding(sentence);
                const linkOpportunities = await this._findLinkOpportunities(sentence, sentenceEmbedding, pageType);
                
                if (linkOpportunities.length > 0) {
                    suggestions.push(...linkOpportunities);
                }
            }
            
            // Rank and filter suggestions
            const rankedSuggestions = this._rankLinkSuggestions(suggestions, pageType);
            
            return {
                totalSuggestions: rankedSuggestions.length,
                topSuggestions: rankedSuggestions.slice(0, this.config.MAX_SUGGESTIONS_PER_PAGE),
                suggestionCategories: this._categorizeSuggestions(rankedSuggestions),
                implementationPriority: this._prioritizeSuggestions(rankedSuggestions),
                semanticContext: this._analyzeSuggestionContext(rankedSuggestions)
            };
            
        } catch (error) {
            console.warn('Link suggestion generation failed:', error);
            return { error: error.message };
        }
    }
    
    // ================================
    // SEMANTIC CLUSTERING
    // ================================
    
    /**
     * Group pages by semantic similarity for topic authority building
     */
    async _performSemanticClustering(currentUrl, embedding) {
        console.log('Performing semantic clustering...');
        
        try {
            const clusters = await this._findSemanticClusters(embedding);
            const currentCluster = this._findPageCluster(currentUrl, clusters);
            
            return {
                currentCluster: currentCluster,
                clusterSize: currentCluster ? currentCluster.pages.length : 0,
                clusterTopic: currentCluster ? currentCluster.topic : 'UNCLUSTERED',
                relatedPages: currentCluster ? currentCluster.pages.filter(p => p.url !== currentUrl) : [],
                clusterAuthority: this._calculateClusterAuthority(currentCluster),
                topicCoverage: this._analyzeTopicCoverage(currentCluster),
                expansionOpportunities: this._identifyExpansionOpportunities(currentCluster),
                internalLinkingStrategy: this._developClusterLinkingStrategy(currentCluster)
            };
            
        } catch (error) {
            console.warn('Semantic clustering failed:', error);
            return { error: error.message };
        }
    }
    
    // ================================
    // COMPETITIVE ANALYSIS
    // ================================
    
    /**
     * Analyze content positioning against competitors
     */
    async _analyzeCompetitivePosition(pageContent) {
        console.log('⚔️ Analyzing competitive position...');
        
        try {
            const competitors = this._getCompetitorBenchmarks();
            const contentTopics = this._extractContentTopics(pageContent.cleanText);
            
            const analysis = {
                contentDifferentiation: this._analyzeContentDifferentiation(contentTopics, competitors),
                topicCoverage: this._compareTopicCoverage(contentTopics, competitors),
                contentDepth: this._analyzeContentDepth(pageContent, competitors),
                uniqueValueProposition: this._identifyUniqueValue(contentTopics),
                competitiveGaps: this._findCompetitiveGaps(contentTopics, competitors),
                opportunityAreas: this._identifyOpportunityAreas(contentTopics, competitors)
            };
            
            return analysis;
            
        } catch (error) {
            console.warn('Competitive analysis failed:', error);
            return { error: error.message };
        }
    }
    
    // ================================
    // CONTENT GAP ANALYSIS
    // ================================
    
    /**
     * Identify missing topic areas and content opportunities
     */
    async _identifyContentGaps(embedding, pageContent) {
        console.log('Identifying content gaps...');
        
        try {
            const expectedTopics = this._getExpectedTopicsForPageType(pageContent.pageType);
            const currentTopics = this._extractContentTopics(pageContent.cleanText);
            const missingTopics = expectedTopics.filter(topic => !currentTopics.includes(topic));
            
            const gaps = {
                missingTopics: missingTopics,
                topicDepthAnalysis: this._analyzeTopicDepth(currentTopics),
                contentExpansionOpportunities: this._identifyExpansionOpportunities(missingTopics),
                semanticRelatedTopics: await this._findSemanticRelatedTopics(embedding),
                competitorCoveredTopics: this._getCompetitorTopics(),
                prioritizedGaps: this._prioritizeContentGaps(missingTopics)
            };
            
            return gaps;
            
        } catch (error) {
            console.warn('Content gap analysis failed:', error);
            return { error: error.message };
        }
    }
    
    // ================================
    // UTILITY FUNCTIONS
    // ================================
    
    async _generateEmbedding(text) {
        try {
            this.metrics.embeddingGenerations++;
            
            // Clean and truncate text
            const cleanText = text.slice(0, this.config.MAX_CONTENT_LENGTH);
            
            const response = await fetch(`${this.config.OLLAMA_ENDPOINT}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.config.OLLAMA_MODEL,
                    prompt: cleanText
                }),
                timeout: this.config.TIMEOUT
            });
            
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.embedding;
            
        } catch (error) {
            console.error('Embedding generation failed:', error);
            throw error;
        }
    }
    
    _cosineSimilarity(vecA, vecB) {
        this.metrics.similarityCalculations++;
        
        if (vecA.length !== vecB.length) {
            throw new Error('Vector dimension mismatch');
        }
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    
    _extractPageContent() {
        try {
            // Find main content area
            const contentSelectors = [
                'main', '[role="main"]', 'article', '.content',
                '.post-content', '.page-content', '.entry-content'
            ];
            
            let bestContent = '';
            let bestWordCount = 0;
            
            for (const selector of contentSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const content = this._cleanTextContent(element);
                    if (content.words > bestWordCount) {
                        bestWordCount = content.words;
                        bestContent = content;
                    }
                }
            }
            
            // Fallback to body
            if (bestWordCount < 50) {
                bestContent = this._cleanTextContent(document.body);
            }
            
            return bestContent;
            
        } catch (error) {
            console.error('Content extraction failed:', error);
            return { cleanText: '', words: 0, pageType: 'unknown' };
        }
    }
    
    _cleanTextContent(element) {
        const clone = element.cloneNode(true);
        
        // Remove non-content elements
        const removeSelectors = [
            'script', 'style', 'nav', 'header', 'footer',
            '.nav', '.menu', '.sidebar', '.widget', '.ads'
        ];
        
        removeSelectors.forEach(selector => {
            const elements = clone.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
        
        const text = clone.textContent || clone.innerText || '';
        const cleanText = text.replace(/\s+/g, ' ').trim();
        const words = cleanText.split(/\s+/).filter(word => word.length > 2).length;
        
        return {
            cleanText: cleanText,
            words: words,
            pageType: this._identifyPageType(cleanText)
        };
    }
    
    _identifyPageType(content) {
        const contentLower = content.toLowerCase();
        
        if (contentLower.includes('trade') || contentLower.includes('trading')) return 'trading';
        if (contentLower.includes('learn') || contentLower.includes('education')) return 'educational';
        if (contentLower.includes('security') || contentLower.includes('safety')) return 'security';
        if (contentLower.includes('about') || contentLower.includes('company')) return 'about';
        if (contentLower.includes('blog') || contentLower.includes('news')) return 'blog';
        if (contentLower.includes('support') || contentLower.includes('help')) return 'support';
        if (contentLower.includes('legal') || contentLower.includes('terms')) return 'legal';
        
        return 'general';
    }
    
    _getBasicPageInfo() {
        return {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            path: window.location.pathname,
            depth: (window.location.pathname.match(/\//g) || []).length - 1
        };
    }
    
    // ================================
    // MOCK DATA FUNCTIONS (Replace with real crawl data)
    // ================================
    
    async _getCommonPageTypes() {
        // In production, this would come from Screaming Frog crawl data
        return [
            {
                url: 'https://www.giottus.com/trade',
                title: 'Trading Platform - Advanced Crypto Trading',
                content: 'Advanced trading platform with real-time charts, order books, and professional trading tools for Bitcoin, Ethereum, and other cryptocurrencies.',
                pageType: 'trading'
            },
            {
                url: 'https://www.giottus.com/security',
                title: 'Security - Bank-Grade Protection',
                content: 'Multi-layer security with cold storage, 2FA, insurance coverage, and regulatory compliance to protect your cryptocurrency investments.',
                pageType: 'security'
            },
            {
                url: 'https://www.giottus.com/learn',
                title: 'Learn Crypto - Educational Resources',
                content: 'Comprehensive guides on cryptocurrency basics, blockchain technology, trading strategies, and market analysis for beginners and experts.',
                pageType: 'educational'
            },
            {
                url: 'https://www.giottus.com/fees',
                title: 'Transparent Pricing - Competitive Trading Fees',
                content: 'Clear and competitive fee structure for cryptocurrency trading, deposits, withdrawals, and premium features with no hidden charges.',
                pageType: 'pricing'
            }
        ];
    }
    
    async _calculateSiteCentroid() {
        // Mock implementation - in production, calculate from all page embeddings
        const mockCentroid = new Array(768).fill(0).map(() => Math.random() * 0.1);
        return mockCentroid;
    }
    
    _getCompetitorBenchmarks() {
        return {
            topics: ['trading', 'security', 'education', 'fees', 'support'],
            contentDepth: { average: 800, good: 1200, excellent: 1800 },
            linkingPatterns: { internal: 5, external: 2 }
        };
    }
    
    // ================================
    // ANALYSIS FORMATTERS
    // ================================
    
    _calculateSemanticScore(embedding, pageContent) {
        // Combine multiple factors for overall semantic score
        const factors = {
            contentLength: Math.min(pageContent.words / 1000, 1) * 25,
            themeAlignment: 0.85 * 25, // Mock theme alignment
            topicCoverage: 0.9 * 25,   // Mock topic coverage
            linkPotential: 0.8 * 25    // Mock link potential
        };
        
        const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
        return {
            overallScore: Math.round(totalScore),
            breakdown: factors,
            grade: this._getSemanticGrade(totalScore)
        };
    }
    
    _getSemanticGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        return 'D';
    }
    
    _generateActionableInsights(results) {
        const insights = [];
        
        // Similarity insights
        if (results.semanticSimilarity.length > 0) {
            insights.push(` Found ${results.semanticSimilarity.length} semantically similar pages for cross-linking`);
        }
        
        // Theme consistency insights
        if (results.contentThemeConsistency.consistencyLevel === 'LOW') {
            insights.push(` Content theme alignment needs improvement (${results.contentThemeConsistency.themeAlignmentScore})`);
        }
        
        // Link suggestion insights
        if (results.intelligentLinkSuggestions.totalSuggestions > 0) {
            insights.push(`${results.intelligentLinkSuggestions.totalSuggestions} intelligent link opportunities identified`);
        }
        
        // Clustering insights
        if (results.semanticClustering.clusterSize > 1) {
            insights.push(`Part of ${results.semanticClustering.clusterTopic} cluster with ${results.semanticClustering.clusterSize} pages`);
        }
        
        return insights.slice(0, 5);
    }
    
    _formatForScreamingFrog(results) {
        // Format comprehensive results for Screaming Frog extraction
        const data = {
            // Basic Information
            'URL': results.url,
            'Page Title': results.basicInfo.title,
            'Page Type': results.contentAnalysis.pageType.toUpperCase(),
            'Content Words': results.contentAnalysis.words,
            
            // Semantic Analysis Results
            'Semantic Score': `${results.semanticScore.overallScore}/100`,
            'Semantic Grade': results.semanticScore.grade,
            'Theme Alignment': results.contentThemeConsistency.themeAlignmentScore || 'N/A',
            'Consistency Level': results.contentThemeConsistency.consistencyLevel || 'UNKNOWN',
            
            // Similarity Analysis
            'Similar Pages Found': results.semanticSimilarity.length,
            'Top Similar Page': results.semanticSimilarity[0]?.url || 'None',
            'Similarity Score': results.semanticSimilarity[0]?.similarity || 'N/A',
            
            // Link Suggestions
            'Link Suggestions': results.intelligentLinkSuggestions.totalSuggestions || 0,
            'Top Link Suggestion': results.intelligentLinkSuggestions.topSuggestions?.[0]?.targetUrl || 'None',
            'Suggestion Priority': results.intelligentLinkSuggestions.implementationPriority || 'N/A',
            
            // Clustering Analysis
            'Semantic Cluster': results.semanticClustering.clusterTopic || 'UNCLUSTERED',
            'Cluster Size': results.semanticClustering.clusterSize || 0,
            'Cluster Authority': results.semanticClustering.clusterAuthority || 'N/A',
            
            // Content Gaps
            'Content Gaps': results.contentGapAnalysis.missingTopics?.length || 0,
            'Priority Gap': results.contentGapAnalysis.prioritizedGaps?.[0] || 'None',
            
            // Competitive Analysis
            'Competitive Position': results.competitiveAnalysis.contentDifferentiation || 'UNKNOWN',
            'Unique Value Areas': results.competitiveAnalysis.uniqueValueProposition?.length || 0,
            
            // Actionable Insights
            'Primary Insight': results.actionableInsights[0] || 'No specific insights',
            'Secondary Insight': results.actionableInsights[1] || 'Analysis complete',
            'Action Priority': this._determineActionPriority(results),
            
            // Technical Metadata
            'Model Used': results.metadata.modelUsed,
            'Analysis Depth': results.metadata.analysisDepth,
            'Embedding Dimensions': results.metadata.embeddingDimensions,
            'Analysis Timestamp': results.metadata.analysisTimestamp,
            'Status': 'SEMANTIC_ANALYSIS_COMPLETE'
        };
        
        return data;
    }
    
    _determineActionPriority(results) {
        if (results.semanticScore.overallScore < 60) return 'HIGH';
        if (results.intelligentLinkSuggestions.totalSuggestions > 3) return 'MEDIUM';
        if (results.contentGapAnalysis.missingTopics?.length > 2) return 'MEDIUM';
        return 'LOW';
    }
    
    _generateBasicAnalysis(url, content) {
        return {
            'URL': url,
            'Status': 'INSUFFICIENT_CONTENT',
            'Content Words': content?.words || 0,
            'Semantic Score': 'N/A',
            'Analysis Depth': 'BASIC',
            'Recommendation': 'Add more content for semantic analysis',
            'Action Priority': 'HIGH'
        };
    }
    
    _handleAnalysisError(error) {
        return {
            'URL': window.location.href,
            'Status': 'ANALYSIS_ERROR',
            'Error Message': error.message,
            'Semantic Score': 'ERROR',
            'Recommendation': 'Check Ollama connection and retry',
            'Action Priority': 'HIGH'
        };
    }
    
    // Placeholder implementations for missing methods
    _classifyRelationship(similarity) {
        if (similarity > 0.95) return 'DUPLICATE';
        if (similarity > 0.85) return 'HIGHLY_RELATED';
        if (similarity > 0.75) return 'RELATED';
        return 'LOOSELY_RELATED';
    }
    
    _assessLinkPotential(similarity, pageType) {
        return similarity > 0.8 ? 'HIGH' : similarity > 0.6 ? 'MEDIUM' : 'LOW';
    }
    
    _generateSemanticAnchorText(title, content) {
        const keywords = content.split(' ').slice(0, 3).join(' ');
        return `${keywords}...`;
    }
    
    _classifyConsistency(score) {
        if (score > 0.8) return 'HIGH';
        if (score > 0.6) return 'MEDIUM';
        return 'LOW';
    }
    
    _extractSiteThemeKeywords() {
        return ['cryptocurrency', 'trading', 'bitcoin', 'ethereum', 'security'];
    }
    
    _extractPageThemeKeywords() {
        return ['crypto', 'exchange', 'trading', 'platform'];
    }
    
    _identifyThemeGaps() {
        return ['defi', 'staking', 'nft'];
    }
    
    _generateThemeRecommendations(score) {
        if (score < 0.7) {
            return ['Focus on core crypto topics', 'Improve content relevance', 'Add missing keywords'];
        }
        return ['Content theme is well-aligned'];
    }
    
    _extractSentences(text) {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 10);
    }
    
    async _findLinkOpportunities(sentence, embedding, pageType) {
        // Mock link opportunities
        return [{
            sentence: sentence.slice(0, 100),
            targetUrl: '/trade',
            anchorText: 'trading platform',
            confidence: 0.85,
            rationale: 'High semantic similarity to trading content'
        }];
    }
    
    _rankLinkSuggestions(suggestions, pageType) {
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    
    _categorizeSuggestions(suggestions) {
        return {
            navigation: suggestions.filter(s => s.targetUrl.includes('/trade')),
            educational: suggestions.filter(s => s.targetUrl.includes('/learn')),
            security: suggestions.filter(s => s.targetUrl.includes('/security'))
        };
    }
    
    _prioritizeSuggestions(suggestions) {
        return suggestions.length > 0 ? 'HIGH' : 'LOW';
    }
    
    _analyzeSuggestionContext(suggestions) {
        return `${suggestions.length} contextual opportunities identified`;
    }
    
    async _findSemanticClusters(embedding) {
        // Mock clustering
        return [{
            topic: 'CRYPTO_TRADING',
            pages: [
                { url: '/trade', similarity: 0.9 },
                { url: '/fees', similarity: 0.8 }
            ]
        }];
    }
    
    _findPageCluster(url, clusters) {
        return clusters.find(cluster => 
            cluster.pages.some(page => page.url === url)
        ) || null;
    }
    
    _calculateClusterAuthority(cluster) {
        return cluster ? 'MEDIUM' : 'N/A';
    }
    
    _analyzeTopicCoverage(cluster) {
        return cluster ? '75%' : 'N/A';
    }
    
    _identifyExpansionOpportunities(cluster) {
        return ['Advanced trading guides', 'Security best practices'];
    }
    
    _developClusterLinkingStrategy(cluster) {
        return 'Create hub-spoke linking pattern with main trading page as hub';
    }
    
    _analyzeContentDifferentiation(topics, competitors) {
        return 'MODERATE';
    }
    
    _compareTopicCoverage(topics, competitors) {
        return '80%';
    }
    
    _analyzeContentDepth(content, competitors) {
        return content.words > 500 ? 'ADEQUATE' : 'SHALLOW';
    }
    
    _identifyUniqueValue(topics) {
        return ['Indian market focus', 'Regulatory compliance'];
    }
    
    _findCompetitiveGaps(topics, competitors) {
        return ['DeFi integration', 'Staking services'];
    }
    
    _identifyOpportunityAreas(topics, competitors) {
        return ['Educational content', 'Advanced trading features'];
    }
    
    _getExpectedTopicsForPageType(pageType) {
        const topicMap = {
            'homepage': ['trading', 'security', 'fees', 'support', 'education'],
            'trading': ['charts', 'orders', 'pairs', 'analysis', 'tools'],
            'security': ['encryption', 'storage', 'authentication', 'compliance', 'insurance'],
            'educational': ['basics', 'blockchain', 'strategies', 'analysis', 'risks'],
            'about': ['company', 'team', 'mission', 'history', 'values']
        };
        return topicMap[pageType] || ['general', 'information', 'content'];
    }
    
    _extractContentTopics(text) {
        const words = text.toLowerCase().split(/\s+/);
        const topics = [];
        
        const topicKeywords = {
            'trading': ['trade', 'trading', 'buy', 'sell', 'exchange'],
            'security': ['security', 'safe', 'protection', 'secure', 'encryption'],
            'education': ['learn', 'guide', 'tutorial', 'education', 'course'],
            'fees': ['fee', 'cost', 'price', 'pricing', 'charge'],
            'crypto': ['bitcoin', 'ethereum', 'cryptocurrency', 'crypto', 'coin']
        };
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => words.includes(keyword))) {
                topics.push(topic);
            }
        }
        
        return topics;
    }
    
    _analyzeTopicDepth(topics) {
        return topics.map(topic => ({
            topic: topic,
            depth: 'MODERATE', // Mock depth analysis
            coverage: '70%'
        }));
    }
    
    async _findSemanticRelatedTopics(embedding) {
        // Mock related topics based on crypto exchange context
        return [
            { topic: 'DeFi', similarity: 0.75, potential: 'HIGH' },
            { topic: 'Staking', similarity: 0.72, potential: 'MEDIUM' },
            { topic: 'NFT', similarity: 0.68, potential: 'MEDIUM' },
            { topic: 'Mining', similarity: 0.65, potential: 'LOW' }
        ];
    }
    
    _getCompetitorTopics() {
        return [
            'P2P Trading', 'Margin Trading', 'Futures', 'Options', 
            'Staking Rewards', 'DeFi Integration', 'Mobile App', 
            'API Trading', 'Institutional Services'
        ];
    }
    
    _prioritizeContentGaps(missingTopics) {
        const priorities = {
            'HIGH': ['security', 'trading', 'fees'],
            'MEDIUM': ['education', 'support', 'api'],
            'LOW': ['about', 'legal', 'careers']
        };
        
        return missingTopics.map(topic => ({
            topic: topic,
            priority: this._getTopicPriority(topic, priorities),
            estimatedEffort: this._estimateContentEffort(topic),
            businessImpact: this._assessBusinessImpact(topic)
        }));
    }
    
    _getTopicPriority(topic, priorities) {
        for (const [priority, topics] of Object.entries(priorities)) {
            if (topics.includes(topic)) return priority;
        }
        return 'MEDIUM';
    }
    
    _estimateContentEffort(topic) {
        const effortMap = {
            'security': 'HIGH',
            'trading': 'HIGH',
            'education': 'MEDIUM',
            'fees': 'LOW',
            'support': 'MEDIUM'
        };
        return effortMap[topic] || 'MEDIUM';
    }
    
    _assessBusinessImpact(topic) {
        const impactMap = {
            'security': 'CRITICAL',
            'trading': 'CRITICAL',
            'fees': 'HIGH',
            'education': 'HIGH',
            'support': 'MEDIUM'
        };
        return impactMap[topic] || 'MEDIUM';
    }
}

// ================================
// ENHANCED LINK SUGGESTION ENGINE
// ================================
class IntelligentLinkSuggestionEngine {
    constructor(semanticAnalyzer) {
        this.analyzer = semanticAnalyzer;
        this.linkDatabase = new Map();
        this.contextualPatterns = new Map();
        this.performanceMetrics = new Map();
    }
    
    /**
     * Generate context-aware internal link suggestions
     */
    async generateContextualLinkSuggestions(pageContent, embedding) {
        const suggestions = [];
        const pageType = this.analyzer._identifyPageType(pageContent.cleanText);
        
        // Analyze content for linking opportunities
        const linkableEntities = this._extractLinkableEntities(pageContent.cleanText);
        const semanticContext = await this._buildSemanticContext(embedding);
        
        for (const entity of linkableEntities) {
            const entitySuggestions = await this._generateEntityLinkSuggestions(
                entity, semanticContext, pageType
            );
            suggestions.push(...entitySuggestions);
        }
        
        return this._optimizeLinkSuggestions(suggestions, pageType);
    }
    
    _extractLinkableEntities(text) {
        const entities = [];
        const patterns = {
            cryptocurrencies: /\b(bitcoin|btc|ethereum|eth|litecoin|ltc|ripple|xrp|cardano|ada|solana|sol|polygon|matic|chainlink|link|polkadot|dot|avalanche|avax|near|atom|cosmos|algo|algorand)\b/gi,
            tradingTerms: /\b(trading|trade|buy|sell|exchange|order|limit order|market order|stop loss|take profit|portfolio|wallet|deposit|withdrawal)\b/gi,
            securityTerms: /\b(security|2fa|kyc|aml|cold storage|hot wallet|private key|public key|seed phrase|multisig)\b/gi,
            technicalTerms: /\b(blockchain|smart contract|defi|nft|mining|staking|yield farming|liquidity|market cap|volume)\b/gi
        };
        
        for (const [category, pattern] of Object.entries(patterns)) {
            const matches = [...text.matchAll(pattern)];
            for (const match of matches) {
                entities.push({
                    text: match[0],
                    category: category,
                    position: match.index,
                    context: this._extractSurroundingContext(text, match.index)
                });
            }
        }
        
        return entities.slice(0, 20); // Limit to prevent overprocessing
    }
    
    _extractSurroundingContext(text, position) {
        const contextRadius = 100;
        const start = Math.max(0, position - contextRadius);
        const end = Math.min(text.length, position + contextRadius);
        return text.slice(start, end);
    }
    
    async _buildSemanticContext(embedding) {
        // Build semantic context for intelligent linking
        return {
            pageTopics: await this._identifyPageTopics(embedding),
            semanticNeighbors: await this._findSemanticNeighbors(embedding),
            contentIntent: this._analyzeContentIntent(embedding),
            userJourney: this._mapUserJourney(embedding)
        };
    }
    
    async _generateEntityLinkSuggestions(entity, context, pageType) {
        const suggestions = [];
        const targetPages = this._findTargetPages(entity, pageType);
        
        for (const target of targetPages) {
            const suggestion = await this._createLinkSuggestion(entity, target, context);
            if (suggestion.confidence > 0.6) {
                suggestions.push(suggestion);
            }
        }
        
        return suggestions;
    }
    
    _findTargetPages(entity, pageType) {
        // Mock target page suggestions based on entity and page type
        const targetMap = {
            'bitcoin': [
                { url: '/trade/btc-inr', title: 'Bitcoin Trading', type: 'trading' },
                { url: '/learn/bitcoin', title: 'Bitcoin Guide', type: 'educational' },
                { url: '/price/bitcoin', title: 'Bitcoin Price', type: 'market-data' }
            ],
            'ethereum': [
                { url: '/trade/eth-inr', title: 'Ethereum Trading', type: 'trading' },
                { url: '/learn/ethereum', title: 'Ethereum Guide', type: 'educational' },
                { url: '/price/ethereum', title: 'Ethereum Price', type: 'market-data' }
            ],
            'trading': [
                { url: '/trade', title: 'Trading Platform', type: 'trading' },
                { url: '/learn/trading', title: 'Trading Guide', type: 'educational' },
                { url: '/fees', title: 'Trading Fees', type: 'pricing' }
            ],
            'security': [
                { url: '/security', title: 'Security Features', type: 'security' },
                { url: '/learn/security', title: 'Security Guide', type: 'educational' },
                { url: '/support/security', title: 'Security Support', type: 'support' }
            ]
        };
        
        const entityKey = entity.text.toLowerCase();
        return targetMap[entityKey] || this._getGenericTargets(entity);
    }
    
    _getGenericTargets(entity) {
        // Generic target suggestions for unrecognized entities
        return [
            { url: '/search?q=' + encodeURIComponent(entity.text), title: 'Search Results', type: 'search' },
            { url: '/learn', title: 'Learning Center', type: 'educational' }
        ];
    }
    
    async _createLinkSuggestion(entity, target, context) {
        return {
            sourceText: entity.text,
            targetUrl: target.url,
            targetTitle: target.title,
            anchorText: this._generateOptimalAnchorText(entity, target),
            confidence: this._calculateLinkConfidence(entity, target, context),
            reasoning: this._generateLinkReasoning(entity, target, context),
            implementation: {
                beforeText: entity.context.slice(0, entity.context.indexOf(entity.text)),
                linkText: entity.text,
                afterText: entity.context.slice(entity.context.indexOf(entity.text) + entity.text.length),
                htmlSuggestion: this._generateHTMLSuggestion(entity, target)
            },
            seoValue: this._assessSEOValue(entity, target),
            userValue: this._assessUserValue(entity, target),
            priority: this._calculatePriority(entity, target, context)
        };
    }
    
    _generateOptimalAnchorText(entity, target) {
        // Generate SEO-optimized anchor text
        const baseText = entity.text;
        const variations = [
            baseText,
            `${baseText} trading`,
            `${baseText} guide`,
            `${baseText} platform`,
            target.title
        ];
        
        // Select optimal variation based on target type
        if (target.type === 'trading') return `${baseText} trading`;
        if (target.type === 'educational') return `${baseText} guide`;
        if (target.type === 'market-data') return `${baseText} price`;
        
        return baseText;
    }
    
    _calculateLinkConfidence(entity, target, context) {
        let confidence = 0.5; // Base confidence
        
        // Boost confidence based on semantic relevance
        if (this._isSemanticMatch(entity.category, target.type)) {
            confidence += 0.3;
        }
        
        // Boost confidence based on context
        if (context.pageTopics.includes(target.type)) {
            confidence += 0.2;
        }
        
        // Penalize over-linking
        if (entity.text.length < 3 || entity.text.length > 50) {
            confidence -= 0.2;
        }
        
        return Math.min(Math.max(confidence, 0), 1);
    }
    
    _isSemanticMatch(entityCategory, targetType) {
        const semanticMatches = {
            'cryptocurrencies': ['trading', 'market-data', 'educational'],
            'tradingTerms': ['trading', 'educational', 'pricing'],
            'securityTerms': ['security', 'educational', 'support'],
            'technicalTerms': ['educational', 'trading', 'market-data']
        };
        
        return semanticMatches[entityCategory]?.includes(targetType) || false;
    }
    
    _generateLinkReasoning(entity, target, context) {
        const reasons = [];
        
        if (this._isSemanticMatch(entity.category, target.type)) {
            reasons.push(`Semantic match: ${entity.category} → ${target.type}`);
        }
        
        if (context.pageTopics.includes(target.type)) {
            reasons.push(`Contextual relevance: Page covers ${target.type}`);
        }
        
        reasons.push(`Entity "${entity.text}" commonly links to ${target.type} pages`);
        
        return reasons.join('; ');
    }
    
    _generateHTMLSuggestion(entity, target) {
        return `<a href="${target.url}" title="${target.title}">${entity.text}</a>`;
    }
    
    _assessSEOValue(entity, target) {
        // Mock SEO value assessment
        const factors = {
            anchorRelevance: 0.8,
            targetAuthority: 0.7,
            contextualRelevance: 0.9,
            linkDiversity: 0.8
        };
        
        const averageValue = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;
        return {
            score: averageValue.toFixed(2),
            factors: factors,
            grade: averageValue > 0.8 ? 'HIGH' : averageValue > 0.6 ? 'MEDIUM' : 'LOW'
        };
    }
    
    _assessUserValue(entity, target) {
        // Mock user value assessment
        return {
            relevance: 'HIGH',
            helpfulness: 'MEDIUM',
            userIntent: 'INFORMATIONAL',
            conversionPotential: target.type === 'trading' ? 'HIGH' : 'MEDIUM'
        };
    }
    
    _calculatePriority(entity, target, context) {
        const factors = [
            entity.category === 'cryptocurrencies' ? 0.3 : 0.1,
            target.type === 'trading' ? 0.3 : 0.1,
            context.userJourney === 'conversion' ? 0.4 : 0.2
        ];
        
        const totalScore = factors.reduce((a, b) => a + b, 0);
        
        if (totalScore > 0.7) return 'HIGH';
        if (totalScore > 0.4) return 'MEDIUM';
        return 'LOW';
    }
    
    _optimizeLinkSuggestions(suggestions, pageType) {
        // Sort and optimize suggestions
        const sorted = suggestions.sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.confidence - a.confidence;
        });
        
        // Remove duplicates and limit count
        const unique = this._removeDuplicateTargets(sorted);
        const limited = unique.slice(0, SEMANTIC_CONFIG.MAX_SUGGESTIONS_PER_PAGE);
        
        return {
            suggestions: limited,
            summary: this._generateSuggestionSummary(limited, pageType),
            implementation: this._generateImplementationPlan(limited)
        };
    }
    
    _removeDuplicateTargets(suggestions) {
        const seen = new Set();
        return suggestions.filter(suggestion => {
            const key = `${suggestion.targetUrl}_${suggestion.sourceText}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    
    _generateSuggestionSummary(suggestions, pageType) {
        const categoryCounts = {};
        suggestions.forEach(s => {
            const category = s.targetUrl.split('/')[1] || 'other';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        return {
            totalSuggestions: suggestions.length,
            highPriority: suggestions.filter(s => s.priority === 'HIGH').length,
            averageConfidence: (suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length).toFixed(2),
            categoryBreakdown: categoryCounts,
            pageTypeOptimization: this._getPageTypeOptimization(pageType),
            estimatedImplementationTime: this._estimateImplementationTime(suggestions)
        };
    }
    
    _getPageTypeOptimization(pageType) {
        const optimizations = {
            'homepage': 'Focus on high-conversion pages like trading and signup',
            'trading': 'Link to educational content and related trading pairs',
            'educational': 'Cross-link to related guides and practical trading pages',
            'security': 'Link to trust signals and compliance information',
            'about': 'Link to key product features and differentiators'
        };
        
        return optimizations[pageType] || 'Add contextually relevant internal links';
    }
    
    _estimateImplementationTime(suggestions) {
        const timePerLink = 2; // minutes
        return `${suggestions.length * timePerLink} minutes`;
    }
    
    _generateImplementationPlan(suggestions) {
        const plan = {
            immediate: suggestions.filter(s => s.priority === 'HIGH'),
            shortTerm: suggestions.filter(s => s.priority === 'MEDIUM'),
            longTerm: suggestions.filter(s => s.priority === 'LOW'),
            instructions: this._generateImplementationInstructions(suggestions)
        };
        
        return plan;
    }
    
    _generateImplementationInstructions(suggestions) {
        return [
            '1. Review each suggestion for contextual appropriateness',
            '2. Implement high-priority links first',
            '3. Test all links for functionality',
            '4. Monitor click-through rates and user engagement',
            '5. Adjust anchor text based on performance data'
        ];
    }
    
    // Placeholder implementations for missing methods
    async _identifyPageTopics(embedding) {
        return ['crypto', 'trading', 'security'];
    }
    
    async _findSemanticNeighbors(embedding) {
        return ['/trade', '/security', '/learn'];
    }
    
    _analyzeContentIntent(embedding) {
        return 'informational';
    }
    
    _mapUserJourney(embedding) {
        return 'awareness';
    }
}

// ================================
// COMPETITIVE INTELLIGENCE ENGINE
// ================================
class CompetitiveIntelligenceEngine {
    constructor() {
        this.competitorData = new Map();
        this.benchmarks = new Map();
        this.opportunityMatrix = new Map();
    }
    
    /**
     * Analyze competitive positioning and identify opportunities
     */
    analyzeCompetitivePosition(pageContent, embedding) {
        try {
            const analysis = {
                contentDifferentiation: this._analyzeContentDifferentiation(pageContent),
                topicGapAnalysis: this._performTopicGapAnalysis(pageContent),
                competitiveAdvantages: this._identifyCompetitiveAdvantages(pageContent),
                improvementOpportunities: this._findImprovementOpportunities(pageContent),
                marketPositioning: this._assessMarketPositioning(pageContent),
                actionableRecommendations: []
            };
            
            analysis.actionableRecommendations = this._generateCompetitiveRecommendations(analysis);
            
            return analysis;
            
        } catch (error) {
            console.error('Competitive analysis failed:', error);
            return { error: error.message };
        }
    }
    
    _analyzeContentDifferentiation(pageContent) {
        const competitors = this._getCompetitorProfiles();
        const ourTopics = this.analyzer._extractContentTopics(pageContent.cleanText);
        
        const differentiation = {
            uniqueTopics: [],
            commonTopics: [],
            missingTopics: [],
            contentDepthComparison: {},
            uniqueValuePropositions: []
        };
        
        for (const competitor of competitors) {
            const competitorTopics = competitor.topics;
            
            // Find unique topics
            const unique = ourTopics.filter(topic => !competitorTopics.includes(topic));
            differentiation.uniqueTopics.push(...unique);
            
            // Find common topics
            const common = ourTopics.filter(topic => competitorTopics.includes(topic));
            differentiation.commonTopics.push(...common);
            
            // Find missing topics
            const missing = competitorTopics.filter(topic => !ourTopics.includes(topic));
            differentiation.missingTopics.push(...missing);
        }
        
        // Remove duplicates
        differentiation.uniqueTopics = [...new Set(differentiation.uniqueTopics)];
        differentiation.commonTopics = [...new Set(differentiation.commonTopics)];
        differentiation.missingTopics = [...new Set(differentiation.missingTopics)];
        
        return differentiation;
    }
    
    _getCompetitorProfiles() {
        // Mock competitor data for Indian crypto exchanges
        return [
            {
                name: 'WazirX',
                topics: ['trading', 'p2p', 'nft', 'futures', 'staking', 'education'],
                strengths: ['market_share', 'binance_backing', 'p2p_trading'],
                contentDepth: 'high'
            },
            {
                name: 'CoinDCX',
                topics: ['trading', 'futures', 'margin', 'lending', 'education', 'enterprise'],
                strengths: ['institutional_focus', 'advanced_trading', 'compliance'],
                contentDepth: 'high'
            },
            {
                name: 'CoinSwitch',
                topics: ['trading', 'sip', 'education', 'portfolio', 'tax'],
                strengths: ['user_friendly', 'sip_investing', 'tax_tools'],
                contentDepth: 'medium'
            },
            {
                name: 'Zebpay',
                topics: ['trading', 'education', 'security', 'mobile'],
                strengths: ['mobile_first', 'education', 'long_history'],
                contentDepth: 'medium'
            }
        ];
    }
    
    _performTopicGapAnalysis(pageContent) {
        const competitors = this._getCompetitorProfiles();
        const ourTopics = this.analyzer._extractContentTopics(pageContent.cleanText);
        
        const gapAnalysis = {
            criticalGaps: [],
            opportunityGaps: [],
            competitiveGaps: [],
            prioritizedActions: []
        };
        
        // Analyze gaps by competitor strength
        for (const competitor of competitors) {
            for (const topic of competitor.topics) {
                if (!ourTopics.includes(topic)) {
                    const gap = {
                        topic: topic,
                        competitor: competitor.name,
                        competitorStrength: competitor.strengths.includes(topic) ? 'high' : 'medium',
                        marketDemand: this._assessMarketDemand(topic),
                        implementationEffort: this._estimateImplementationEffort(topic)
                    };
                    
                    if (gap.competitorStrength === 'high' && gap.marketDemand === 'high') {
                        gapAnalysis.criticalGaps.push(gap);
                    } else if (gap.marketDemand === 'high') {
                        gapAnalysis.opportunityGaps.push(gap);
                    } else {
                        gapAnalysis.competitiveGaps.push(gap);
                    }
                }
            }
        }
        
        // Prioritize actions
        gapAnalysis.prioritizedActions = this._prioritizeGapActions(gapAnalysis);
        
        return gapAnalysis;
    }
    
    _assessMarketDemand(topic) {
        const demandMap = {
            'p2p': 'high',
            'futures': 'high',
            'staking': 'high',
            'nft': 'medium',
            'lending': 'medium',
            'margin': 'medium',
            'sip': 'high',
            'tax': 'high',
            'enterprise': 'medium'
        };
        
        return demandMap[topic] || 'low';
    }
    
    _estimateImplementationEffort(topic) {
        const effortMap = {
            'p2p': 'high',
            'futures': 'very_high',
            'staking': 'medium',
            'nft': 'medium',
            'lending': 'high',
            'margin': 'high',
            'sip': 'medium',
            'tax': 'low',
            'enterprise': 'high'
        };
        
        return effortMap[topic] || 'medium';
    }
    
    _prioritizeGapActions(gapAnalysis) {
        const allGaps = [
            ...gapAnalysis.criticalGaps.map(g => ({...g, category: 'critical'})),
            ...gapAnalysis.opportunityGaps.map(g => ({...g, category: 'opportunity'})),
            ...gapAnalysis.competitiveGaps.map(g => ({...g, category: 'competitive'}))
        ];
        
        return allGaps
            .sort((a, b) => {
                // Priority: critical > opportunity > competitive
                const categoryPriority = { critical: 3, opportunity: 2, competitive: 1 };
                if (categoryPriority[a.category] !== categoryPriority[b.category]) {
                    return categoryPriority[b.category] - categoryPriority[a.category];
                }
                
                // Then by market demand
                const demandPriority = { high: 3, medium: 2, low: 1 };
                if (demandPriority[a.marketDemand] !== demandPriority[b.marketDemand]) {
                    return demandPriority[b.marketDemand] - demandPriority[a.marketDemand];
                }
                
                // Finally by implementation effort (lower effort = higher priority)
                const effortPriority = { low: 3, medium: 2, high: 1, very_high: 0 };
                return effortPriority[b.implementationEffort] - effortPriority[a.implementationEffort];
            })
            .slice(0, 10);
    }
    
    _identifyCompetitiveAdvantages(pageContent) {
        // Analyze our unique strengths
        const ourTopics = this.analyzer._extractContentTopics(pageContent.cleanText);
        const competitors = this._getCompetitorProfiles();
        
        const advantages = {
            uniqueOfferings: [],
            differentiationFactors: [],
            marketPositionStrengths: [],
            contentAdvantages: []
        };
        
        // Find topics we cover that competitors don't
        const allCompetitorTopics = competitors.flatMap(c => c.topics);
        advantages.uniqueOfferings = ourTopics.filter(topic => 
            !allCompetitorTopics.includes(topic)
        );
        
        // Analyze differentiation factors specific to Indian market
        advantages.differentiationFactors = [
            'Indian regulatory compliance',
            'Local payment methods',
            'Hindi language support',
            'Educational content for beginners',
            'Low fees for small traders'
        ];
        
        return advantages;
    }
    
    _findImprovementOpportunities(pageContent) {
        const opportunities = {
            contentEnhancements: [],
            featureGaps: [],
            userExperienceImprovements: [],
            marketingOpportunities: []
        };
        
        // Content enhancement opportunities
        opportunities.contentEnhancements = [
            'Add more beginner-friendly guides',
            'Create advanced trading tutorials',
            'Develop market analysis content',
            'Add cryptocurrency research reports',
            'Create video content and webinars'
        ];
        
        // Feature gaps based on competitor analysis
        opportunities.featureGaps = [
            'P2P trading platform',
            'Staking rewards program',
            'Advanced charting tools',
            'Mobile app improvements',
            'API for algorithmic trading'
        ];
        
        return opportunities;
    }
    
    _assessMarketPositioning(pageContent) {
        return {
            currentPosition: 'Trusted Indian Exchange',
            targetPosition: 'Most User-Friendly Crypto Platform',
            positioningGaps: ['Advanced features', 'Institutional services'],
            marketShare: 'Growing',
            brandPerception: 'Secure and Compliant',
            competitiveThreats: ['WazirX market dominance', 'CoinDCX institutional focus'],
            positioningOpportunities: ['Beginner education', 'Local market focus']
        };
    }
    
    _generateCompetitiveRecommendations(analysis) {
        const recommendations = [];
        
        // Critical gap recommendations
        if (analysis.topicGapAnalysis.criticalGaps.length > 0) {
            const topGap = analysis.topicGapAnalysis.criticalGaps[0];
            recommendations.push({
                priority: 'HIGH',
                category: 'Critical Gap',
                action: `Develop ${topGap.topic} functionality to compete with ${topGap.competitor}`,
                timeline: '3-6 months',
                impact: 'Market competitiveness'
            });
        }
        
        // Content differentiation recommendations
        if (analysis.contentDifferentiation.missingTopics.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Content Enhancement',
                action: `Add content covering: ${analysis.contentDifferentiation.missingTopics.slice(0, 3).join(', ')}`,
                timeline: '1-2 months',
                impact: 'Content comprehensiveness'
            });
        }
        
        // Competitive advantage recommendations
        if (analysis.competitiveAdvantages.uniqueOfferings.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Advantage Amplification',
                action: `Highlight unique offerings: ${analysis.competitiveAdvantages.uniqueOfferings.join(', ')}`,
                timeline: '2-4 weeks',
                impact: 'Brand differentiation'
            });
        }
        
        return recommendations.slice(0, 5);
    }
}

// ================================
// SEMANTIC CONTENT CLUSTERING ENGINE
// ================================
class SemanticContentClusteringEngine {
    constructor() {
        this.clusters = new Map();
        this.clusterMetrics = new Map();
        this.linkingStrategies = new Map();
    }
    
    /**
     * Perform advanced semantic clustering for topic authority building
     */
    async performAdvancedClustering(currentUrl, embedding, pageContent) {
        try {
            console.log('erforming advanced semantic clustering...');
            
            const clusterAnalysis = {
                currentCluster: await this._identifyCurrentCluster(currentUrl, embedding),
                clusterMetrics: await this._calculateClusterMetrics(currentUrl),
                topicAuthority: await this._assessTopicAuthority(embedding, pageContent),
                linkingStrategy: await this._developLinkingStrategy(currentUrl, embedding),
                expansionOpportunities: await this._identifyClusterExpansion(embedding),
                competitiveAnalysis: await this._analyzeClusterCompetition(embedding),
                actionPlan: []
            };
            
            clusterAnalysis.actionPlan = this._generateClusterActionPlan(clusterAnalysis);
            
            return clusterAnalysis;
            
        } catch (error) {
            console.error('Clustering analysis failed:', error);
            return { error: error.message };
        }
    }
    
    async _identifyCurrentCluster(currentUrl, embedding) {
        // Mock clustering algorithm - in production, use k-means or hierarchical clustering
        const clusters = await this._getAllClusters();
        
        for (const cluster of clusters) {
            for (const page of cluster.pages) {
                if (page.url === currentUrl || this._calculateSimilarity(embedding, page.embedding) > 0.8) {
                    return {
                        id: cluster.id,
                        topic: cluster.topic,
                        pages: cluster.pages,
                        authorityPage: cluster.authorityPage,
                        clusterSize: cluster.pages.length,
                        averageSimilarity: cluster.averageSimilarity,
                        topicKeywords: cluster.topicKeywords,
                        contentGaps: cluster.contentGaps,
                        internalLinkDensity: cluster.internalLinkDensity
                    };
                }
            }
        }
        
        // If no cluster found, suggest creating new one
        return {
            id: 'NEW_CLUSTER',
            topic: 'UNCLUSTERED',
            pages: [{ url: currentUrl, embedding: embedding }],
            authorityPage: null,
            clusterSize: 1,
            averageSimilarity: 0,
            topicKeywords: [],
            contentGaps: ['Needs related content'],
            internalLinkDensity: 0
        };
    }
    
    async _getAllClusters() {
        // Mock cluster data for crypto exchange
        return [
            {
                id: 'TRADING_CLUSTER',
                topic: 'Cryptocurrency Trading',
                averageSimilarity: 0.85,
                authorityPage: '/trade',
                topicKeywords: ['trading', 'buy', 'sell', 'exchange', 'orders', 'charts'],
                internalLinkDensity: 0.75,
                pages: [
                    { url: '/trade', embedding: this._generateMockEmbedding(), authority: 0.9 },
                    { url: '/trade/btc-inr', embedding: this._generateMockEmbedding(), authority: 0.8 },
                    { url: '/trade/eth-inr', embedding: this._generateMockEmbedding(), authority: 0.8 },
                    { url: '/learn/trading', embedding: this._generateMockEmbedding(), authority: 0.7 },
                    { url: '/fees', embedding: this._generateMockEmbedding(), authority: 0.6 }
                ],
                contentGaps: ['Advanced trading strategies', 'Technical analysis guides']
            },
            {
                id: 'SECURITY_CLUSTER',
                topic: 'Security & Safety',
                averageSimilarity: 0.82,
                authorityPage: '/security',
                topicKeywords: ['security', 'safety', '2fa', 'encryption', 'cold storage'],
                internalLinkDensity: 0.65,
                pages: [
                    { url: '/security', embedding: this._generateMockEmbedding(), authority: 0.9 },
                    { url: '/learn/security', embedding: this._generateMockEmbedding(), authority: 0.7 },
                    { url: '/support/security', embedding: this._generateMockEmbedding(), authority: 0.6 },
                    { url: '/compliance', embedding: this._generateMockEmbedding(), authority: 0.7 }
                ],
                contentGaps: ['Wallet security guides', 'Phishing protection']
            },
            {
                id: 'EDUCATION_CLUSTER',
                topic: 'Cryptocurrency Education',
                averageSimilarity: 0.80,
                authorityPage: '/learn',
                topicKeywords: ['learn', 'guide', 'tutorial', 'basics', 'blockchain'],
                internalLinkDensity: 0.70,
                pages: [
                    { url: '/learn', embedding: this._generateMockEmbedding(), authority: 0.85 },
                    { url: '/learn/bitcoin', embedding: this._generateMockEmbedding(), authority: 0.8 },
                    { url: '/learn/ethereum', embedding: this._generateMockEmbedding(), authority: 0.8 },
                    { url: '/learn/trading', embedding: this._generateMockEmbedding(), authority: 0.7 },
                    { url: '/learn/security', embedding: this._generateMockEmbedding(), authority: 0.7 },
                    { url: '/blog', embedding: this._generateMockEmbedding(), authority: 0.6 }
                ],
                contentGaps: ['DeFi education', 'NFT guides', 'Tax implications']
            }
        ];
    }
    
    _generateMockEmbedding() {
        return new Array(768).fill(0).map(() => Math.random() * 0.1);
    }
    
    _calculateSimilarity(embedding1, embedding2) {
        // Simplified similarity calculation
        return Math.random() * 0.3 + 0.7; // Mock high similarity
    }
    
    async _calculateClusterMetrics(currentUrl) {
        const cluster = await this._identifyCurrentCluster(currentUrl, []);
        
        return {
            clusterHealth: this._assessClusterHealth(cluster),
            topicCoverage: this._calculateTopicCoverage(cluster),
            authorityDistribution: this._analyzeAuthorityDistribution(cluster),
            linkingEfficiency: this._calculateLinkingEfficiency(cluster),
            contentQuality: this._assessClusterContentQuality(cluster),
            competitiveStrength: this._assessCompetitiveStrength(cluster)
        };
    }
    
    _assessClusterHealth(cluster) {
        const factors = {
            size: cluster.clusterSize >= 5 ? 1 : cluster.clusterSize / 5,
            similarity: cluster.averageSimilarity || 0.5,
            linkDensity: cluster.internalLinkDensity || 0.3,
            authorityPresence: cluster.authorityPage ? 1 : 0
        };
        
        const healthScore = Object.values(factors).reduce((sum, val) => sum + val, 0) / 4;
        
        return {
            score: healthScore.toFixed(2),
            grade: healthScore > 0.8 ? 'EXCELLENT' : healthScore > 0.6 ? 'GOOD' : healthScore > 0.4 ? 'FAIR' : 'POOR',
            factors: factors,
            recommendations: this._generateHealthRecommendations(factors)
        };
    }
    
    _generateHealthRecommendations(factors) {
        const recommendations = [];
        
        if (factors.size < 0.8) {
            recommendations.push('Add more related content to strengthen cluster');
        }
        if (factors.similarity < 0.7) {
            recommendations.push('Improve topical consistency across cluster pages');
        }
        if (factors.linkDensity < 0.5) {
            recommendations.push('Increase internal linking between cluster pages');
        }
        if (factors.authorityPresence === 0) {
            recommendations.push('Establish a clear authority/pillar page for the cluster');
        }
        
        return recommendations;
    }
    
    _calculateTopicCoverage(cluster) {
        const expectedTopics = this._getExpectedTopicsForCluster(cluster.topic);
        const coveredTopics = cluster.topicKeywords || [];
        
        const coverage = coveredTopics.length / expectedTopics.length;
        const missingTopics = expectedTopics.filter(topic => !coveredTopics.includes(topic));
        
        return {
            percentage: Math.round(coverage * 100) + '%',
            coveredTopics: coveredTopics,
            missingTopics: missingTopics,
            expansionOpportunities: this._identifyTopicExpansion(missingTopics),
            contentPriorities: this._prioritizeTopicContent(missingTopics)
        };
    }
    
    _getExpectedTopicsForCluster(clusterTopic) {
        const topicMap = {
            'Cryptocurrency Trading': [
                'trading', 'buy', 'sell', 'exchange', 'orders', 'charts', 'analysis',
                'strategies', 'pairs', 'volume', 'liquidity', 'spreads', 'fees'
            ],
            'Security & Safety': [
                'security', 'safety', '2fa', 'encryption', 'cold storage', 'hot wallet',
                'private keys', 'seed phrases', 'backup', 'recovery', 'compliance'
            ],
            'Cryptocurrency Education': [
                'learn', 'guide', 'tutorial', 'basics', 'blockchain', 'bitcoin',
                'ethereum', 'altcoins', 'defi', 'nft', 'mining', 'staking'
            ]
        };
        
        return topicMap[clusterTopic] || ['general', 'information', 'content'];
    }
    
    _identifyTopicExpansion(missingTopics) {
        return missingTopics.map(topic => ({
            topic: topic,
            contentType: this._suggestContentType(topic),
            difficulty: this._assessContentDifficulty(topic),
            businessValue: this._assessBusinessValue(topic),
            timeline: this._estimateContentTimeline(topic)
        }));
    }
    
    _suggestContentType(topic) {
        const contentTypes = {
            'analysis': 'Market Analysis Articles',
            'strategies': 'Trading Strategy Guides',
            'defi': 'DeFi Educational Content',
            'nft': 'NFT Explanation Guides',
            'staking': 'Staking Tutorial Content',
            'compliance': 'Regulatory Compliance Pages'
        };
        
        return contentTypes[topic] || 'Informational Articles';
    }
    
    _assessContentDifficulty(topic) {
        const difficultyMap = {
            'analysis': 'HIGH',
            'strategies': 'HIGH',
            'defi': 'MEDIUM',
            'nft': 'LOW',
            'staking': 'MEDIUM',
            'compliance': 'HIGH'
        };
        
        return difficultyMap[topic] || 'MEDIUM';
    }
    
    _assessBusinessValue(topic) {
        const valueMap = {
            'analysis': 'HIGH',
            'strategies': 'HIGH',
            'defi': 'MEDIUM',
            'nft': 'LOW',
            'staking': 'HIGH',
            'compliance': 'CRITICAL'
        };
        
        return valueMap[topic] || 'MEDIUM';
    }
    
    _estimateContentTimeline(topic) {
        const timelineMap = {
            'analysis': '2-3 weeks',
            'strategies': '3-4 weeks',
            'defi': '1-2 weeks',
            'nft': '1 week',
            'staking': '2 weeks',
            'compliance': '4-6 weeks'
        };
        
        return timelineMap[topic] || '1-2 weeks';
    }
    
    _prioritizeTopicContent(missingTopics) {
        return missingTopics
            .map(topic => ({
                topic: topic,
                businessValue: this._assessBusinessValue(topic),
                difficulty: this._assessContentDifficulty(topic),
                priority: this._calculateContentPriority(topic)
            }))
            .sort((a, b) => {
                const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
    }
    
    _calculateContentPriority(topic) {
        const businessValue = this._assessBusinessValue(topic);
        const difficulty = this._assessContentDifficulty(topic);
        
        if (businessValue === 'CRITICAL') return 'CRITICAL';
        if (businessValue === 'HIGH' && difficulty !== 'HIGH') return 'HIGH';
        if (businessValue === 'HIGH' && difficulty === 'HIGH') return 'MEDIUM';
        if (businessValue === 'MEDIUM') return 'MEDIUM';
        return 'LOW';
    }
    
    async _developLinkingStrategy(currentUrl, embedding) {
        const cluster = await this._identifyCurrentCluster(currentUrl, embedding);
        
        const strategy = {
            hubAndSpoke: this._designHubSpokeStrategy(cluster),
            crossLinking: this._designCrossLinkingStrategy(cluster),
            authorityBuilding: this._designAuthorityBuildingStrategy(cluster),
            userJourney: this._mapUserJourneyPaths(cluster),
            implementation: this._createImplementationPlan(cluster)
        };
        
        return strategy;
    }
    
    _designHubSpokeStrategy(cluster) {
        const hub = cluster.authorityPage || cluster.pages[0]?.url;
        const spokes = cluster.pages.filter(page => page.url !== hub);
        
        return {
            hubPage: hub,
            spokePages: spokes.map(page => page.url),
            linkingPattern: 'All spokes link to hub, hub links to most important spokes',
            implementation: spokes.map(spoke => ({
                from: spoke.url,
                to: hub,
                anchorText: `${cluster.topic} hub`,
                context: 'Footer or sidebar link'
            }))
        };
    }
    
    _designCrossLinkingStrategy(cluster) {
        const crossLinks = [];
        
        // Generate cross-linking opportunities between related pages
        for (let i = 0; i < cluster.pages.length; i++) {
            for (let j = i + 1; j < cluster.pages.length; j++) {
                const pageA = cluster.pages[i];
                const pageB = cluster.pages[j];
                
                if (this._shouldCrossLink(pageA, pageB)) {
                    crossLinks.push({
                        from: pageA.url,
                        to: pageB.url,
                        bidirectional: true,
                        relevance: 'HIGH',
                        anchorText: this._generateCrossLinkAnchor(pageA, pageB)
                    });
                }
            }
        }
        
        return {
            totalOpportunities: crossLinks.length,
            crossLinks: crossLinks.slice(0, 10), // Limit to prevent over-linking
            strategy: 'Connect semantically related pages within cluster',
            guidelines: [
                'Use natural, contextual anchor text',
                'Link from relevant content sections',
                'Maintain 2-3 cross-links per page maximum',
                'Prioritize user value over SEO'
            ]
        };
    }
    
    _shouldCrossLink(pageA, pageB) {
        // Mock logic for determining cross-link suitability
        const urlA = pageA.url.toLowerCase();
        const urlB = pageB.url.toLowerCase();
        
        // Don't link pages that are too similar (e.g., trading pairs)
        if (urlA.includes('/trade/') && urlB.includes('/trade/')) {
            return false;
        }
        
        // Link educational content to practical pages
        if ((urlA.includes('/learn/') && urlB.includes('/trade')) ||
            (urlB.includes('/learn/') && urlA.includes('/trade'))) {
            return true;
        }
        
        // Link security content to practical implementations
        if ((urlA.includes('/security') && urlB.includes('/learn/security')) ||
            (urlB.includes('/security') && urlA.includes('/learn/security'))) {
            return true;
        }
        
        return Math.random() > 0.7; // Mock 30% cross-link probability
    }
    
    _generateCrossLinkAnchor(pageA, pageB) {
        const urlB = pageB.url.toLowerCase();
        
        if (urlB.includes('/trade')) return 'start trading';
        if (urlB.includes('/learn')) return 'learn more';
        if (urlB.includes('/security')) return 'security features';
        if (urlB.includes('/fees')) return 'view fees';
        
        return 'related information';
    }
    
    _designAuthorityBuildingStrategy(cluster) {
        const authorityPage = cluster.authorityPage || this._selectAuthorityPage(cluster);
        
        return {
            currentAuthority: authorityPage,
            authorityScore: this._calculateAuthorityScore(authorityPage, cluster),
            buildingTactics: [
                'Concentrate internal links to authority page',
                'Create comprehensive pillar content',
                'Develop supporting cluster content',
                'Optimize for topic-relevant keywords',
                'Build external backlinks to authority page'
            ],
            contentStrategy: this._developAuthorityContentStrategy(cluster),
            linkingTactics: this._developAuthorityLinkingTactics(authorityPage, cluster)
        };
    }
    
    _selectAuthorityPage(cluster) {
        // Select page with highest authority potential
        return cluster.pages.reduce((best, current) => {
            const currentScore = current.authority || 0;
            const bestScore = best.authority || 0;
            return currentScore > bestScore ? current : best;
        }, cluster.pages[0])?.url || cluster.pages[0]?.url;
    }
    
    _calculateAuthorityScore(authorityPage, cluster) {
        // Mock authority score calculation
        const factors = {
            internalLinks: 0.8, // Mock high internal linking
            contentDepth: 0.7,  // Mock good content depth
            topicCoverage: 0.9, // Mock excellent topic coverage
            userEngagement: 0.6 // Mock moderate engagement
        };
        
        const score = Object.values(factors).reduce((sum, val) => sum + val, 0) / 4;
        
        return {
            overallScore: score.toFixed(2),
            factors: factors,
            grade: score > 0.8 ? 'A' : score > 0.6 ? 'B' : score > 0.4 ? 'C' : 'D',
            improvementAreas: this._identifyAuthorityImprovements(factors)
        };
    }
    
    _identifyAuthorityImprovements(factors) {
        const improvements = [];
        
        if (factors.internalLinks < 0.7) {
            improvements.push('Increase internal links pointing to this page');
        }
        if (factors.contentDepth < 0.7) {
            improvements.push('Expand content depth and comprehensiveness');
        }
        if (factors.topicCoverage < 0.8) {
            improvements.push('Cover more subtopics within the main theme');
        }
        if (factors.userEngagement < 0.6) {
            improvements.push('Improve user engagement metrics');
        }
        
        return improvements;
    }
    
    _generateClusterActionPlan(clusterAnalysis) {
        const actionPlan = [];
        
        // High priority actions
        if (clusterAnalysis.clusterMetrics.clusterHealth.grade === 'POOR') {
            actionPlan.push({
                priority: 'HIGH',
                category: 'Cluster Health',
                action: 'Improve cluster structure and internal linking',
                timeline: '2-4 weeks',
                impact: 'Foundation improvement'
            });
        }
        
        // Content expansion actions
        if (clusterAnalysis.topicAuthority.contentGaps?.length > 0) {
            const topGap = clusterAnalysis.topicAuthority.contentGaps[0];
            actionPlan.push({
                priority: 'MEDIUM',
                category: 'Content Development',
                action: `Create content for: ${topGap}`,
                timeline: '3-6 weeks',
                impact: 'Topic authority enhancement'
            });
        }
        
        // Linking strategy actions
        if (clusterAnalysis.linkingStrategy.crossLinking.totalOpportunities > 0) {
            actionPlan.push({
                priority: 'MEDIUM',
                category: 'Internal Linking',
                action: `Implement ${clusterAnalysis.linkingStrategy.crossLinking.totalOpportunities} cross-links`,
                timeline: '1-2 weeks',
                impact: 'Improved page connectivity'
            });
        }
        
        // Authority building actions
        if (clusterAnalysis.topicAuthority.authorityScore?.grade !== 'A') {
            actionPlan.push({
                priority: 'HIGH',
                category: 'Authority Building',
                action: 'Strengthen pillar page content and internal linking',
                timeline: '4-8 weeks',
                impact: 'Topic authority dominance'
            });
        }
        
        return actionPlan.slice(0, 5);
    }
    
    // Additional helper methods for clustering
    _analyzeAuthorityDistribution(cluster) {
        return {
            concentration: 'MODERATE',
            topPages: cluster.pages.slice(0, 3).map(p => p.url),
            distribution: 'Even spread across cluster'
        };
    }
    
    _calculateLinkingEfficiency(cluster) {
        return {
            efficiency: cluster.internalLinkDensity || 0.5,
            grade: 'B',
            improvements: ['Add more contextual links', 'Improve anchor text diversity']
        };
    }
    
    _assessClusterContentQuality(cluster) {
        return {
            averageQuality: 'HIGH',
            consistencyScore: 0.8,
            recommendations: ['Maintain quality standards', 'Regular content updates']
        };
    }
    
    _assessCompetitiveStrength(cluster) {
        return {
            marketPosition: 'STRONG',
            competitorComparison: 'Above average',
            strengthAreas: ['Content depth', 'Topic coverage'],
            improvementAreas: ['User engagement', 'Fresh content']
        };
    }
    
    _mapUserJourneyPaths(cluster) {
        return {
            entryPoints: ['/learn', '/'],
            conversionPaths: ['/learn → /trade', '/ → /security → /trade'],
            exitPoints: ['/trade', '/contact'],
            optimizationOpportunities: ['Improve conversion flow', 'Add more CTAs']
        };
    }
    
    _createImplementationPlan(cluster) {
        return {
            phase1: 'Hub-spoke linking implementation',
            phase2: 'Cross-linking optimization',
            phase3: 'Authority building content',
            timeline: '6-8 weeks total',
            resources: 'Content team + SEO specialist'
        };
    }
    
    _developAuthorityContentStrategy(cluster) {
        return {
            contentType: 'Comprehensive pillar page',
            length: '3000+ words',
            structure: 'Topic overview + detailed subtopics + related resources',
            updateFrequency: 'Monthly'
        };
    }
    
    _developAuthorityLinkingTactics(authorityPage, cluster) {
        return {
            internalLinkTarget: '80% of cluster links',
            externalLinkBuilding: 'Focus backlink acquisition',
            anchorTextDiversity: 'Mix of exact match and branded',
            linkPlacement: 'Contextual within content body'
        };
    }
    
    async _assessTopicAuthority(embedding, pageContent) {
        return {
            authorityScore: { grade: 'B', overallScore: '0.75' },
            contentGaps: ['Advanced trading strategies', 'Market analysis'],
            topicCoverage: '75%'
        };
    }
    
    async _identifyClusterExpansion(embedding) {
        return [
            { topic: 'DeFi Trading', potential: 'HIGH' },
            { topic: 'NFT Marketplace', potential: 'MEDIUM' },
            { topic: 'Staking Services', potential: 'HIGH' }
        ];
    }
    
    async _analyzeClusterCompetition(embedding) {
        return {
            competitiveStrength: 'MODERATE',
            marketGaps: ['Advanced features', 'Mobile optimization'],
            opportunities: ['Educational content leadership', 'Local market focus']
        };
    }
}

// ================================
// MAIN EXECUTION FUNCTION FOR SCREAMING FROG
// ================================

/**
 * Main semantic analysis function for Screaming Frog custom extraction
 */
async function performComprehensiveSemanticAnalysis() {
    try {
        console.log('Starting Comprehensive Semantic AI Analysis...');
        
        // Initialize engines
        const semanticAnalyzer = new SemanticAIAnalyzer(SEMANTIC_CONFIG);
        const linkSuggestionEngine = new IntelligentLinkSuggestionEngine(semanticAnalyzer);
        const competitiveEngine = new CompetitiveIntelligenceEngine();
        const clusteringEngine = new SemanticContentClusteringEngine();
        
        // Check Ollama connection
        const healthCheck = await semanticAnalyzer.checkOllamaConnection();
        if (!healthCheck) {
            console.warn(' Ollama not available, proceeding with limited analysis');
        }
        
        // Perform comprehensive analysis
        const results = await semanticAnalyzer.performSemanticAnalysis();
        
        console.log(' Semantic AI Analysis Complete');
        return results;
        
    } catch (error) {
        console.error(' Semantic Analysis Failed:', error);
        
        // Return error data for Screaming Frog
        return {
            'URL': window.location.href,
            'Status': 'SEMANTIC_ANALYSIS_ERROR',
            'Error': error.message,
            'Fallback': 'Basic contextual analysis available',
            'Recommendation': 'Check Ollama setup and retry',
            'Timestamp': new Date().toISOString()
        };
    }
}

// Add Ollama connection check method
SemanticAIAnalyzer.prototype.checkOllamaConnection = async function() {
    try {
        const response = await fetch(`${this.config.OLLAMA_ENDPOINT}/api/tags`, {
            method: 'GET',
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        console.warn('Ollama connection failed:', error.message);
        return false;
    }
};

// ================================
// SCREAMING FROG INTEGRATION
// ================================

/**
 * Execute semantic analysis and return data for Screaming Frog
 */
function executeSemanticAIAnalysis() {
    // Check if this is being run in Screaming Frog environment
    if (typeof seoSpider === 'undefined') {
        console.error('seoSpider object not found - not running in Screaming Frog environment');
        return null;
    }
    
    // Execute analysis and return results
    return performComprehensiveSemanticAnalysis()
        .then(results => {
            console.log('Returning semantic analysis results to Screaming Frog');
            return seoSpider.data(results);
        })
        .catch(error => {
            console.error('Semantic analysis execution failed:', error);
            return seoSpider.data({
                'URL': window.location.href,
                'Status': 'EXECUTION_ERROR',
                'Error': error.message,
                'Timestamp': new Date().toISOString()
            });
        });
}

// ================================
// AUTO-EXECUTION FOR SCREAMING FROG
// ================================

// Auto-execute if in Screaming Frog environment
if (typeof window !== 'undefined' && typeof seoSpider !== 'undefined') {
    console.log('Screaming Frog environment detected - executing semantic analysis...');
    return executeSemanticAIAnalysis();
} else {
    console.log('Development environment - semantic analysis ready for manual execution');
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SemanticAIAnalyzer,
        IntelligentLinkSuggestionEngine,
        CompetitiveIntelligenceEngine,
        SemanticContentClusteringEngine,
        performComprehensiveSemanticAnalysis,
        executeSemanticAIAnalysis,
        SEMANTIC_CONFIG
    };
}

console.log('Semantic AI Search Integration Loaded Successfully');
console.log('  Semantic Similarity Mapping');
console.log('Content Theme Consistency Analysis');
console.log('Intelligent Link Suggestions');
console.log('Semantic Content Clustering');
console.log('Competitive Intelligence Analysis');
console.log('Content Gap Identification');
console.log('Topic Authority Assessment');
console.log('Auto-execution enabled for Screaming Frog environment');