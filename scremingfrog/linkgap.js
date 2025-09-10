// Contextual Internal Link Gap Analyzer for Screaming Frog
// Focus: Find actual linking opportunities, ignore navigation noise
// v2.0 - Enhanced scoring and quality classification

// Refined Configuration for Contextual Analysis
const CONFIG = {
    CONTEXTUAL_LINK_TARGET: 100, // 1 contextual link per 100 words
    MIN_CONTEXTUAL_DENSITY: 0.8, // Minimum 0.8% contextual density
    MAX_CONTEXTUAL_DENSITY: 3.0, // Maximum 3% contextual density
    
    // Improved content quality thresholds
    THIN_CONTENT_THRESHOLD: 300,    // <300 = THIN
    MEDIUM_CONTENT_THRESHOLD: 800,  // 300-800 = MEDIUM
    HIGH_CONTENT_THRESHOLD: 800,    // >800 = HIGH
    
    MIN_WORDS_FOR_LINKS: 50, // Don't expect links in very short content
    EXTERNAL_WARNING_RATIO: 2.0 // Warn if external > contextual * ratio
};

// Get current page data
const currentUrl = window.location.href;
const currentTitle = document.title || 'No Title';
const domain = window.location.hostname;

// Enhanced link analysis - separate contextual from template links
function analyzeLinksAdvanced() {
    const allLinks = document.querySelectorAll('a[href]');
    const linkAnalysis = {
        contextual: 0,
        template: 0, // Nav + footer combined
        navigation: 0,
        footer: 0,
        external: 0,
        nofollow: 0,
        contextualLinks: [], // Store actual contextual links for analysis
        templateLinks: [], // Store template links separately
        uniqueContextual: new Set(),
        uniqueTemplate: new Set()
    };
    
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        const rel = link.getAttribute('rel') || '';
        const anchorText = link.textContent.trim();
        
        if (!href || href === '#' || href === '') return;
        
        // Determine if link is internal
        const isInternal = href.startsWith('/') || 
                          href.startsWith('?') ||
                          (href.startsWith('http') && href.includes(domain));
        
        if (isInternal) {
            const linkContext = getLinkContext(link);
            
            if (linkContext === 'contextual') {
                linkAnalysis.contextual++;
                linkAnalysis.uniqueContextual.add(href);
                linkAnalysis.contextualLinks.push({
                    text: anchorText,
                    href: href,
                    element: link.tagName,
                    parent: link.parentElement ? link.parentElement.tagName : 'unknown'
                });
            } else {
                linkAnalysis.template++;
                linkAnalysis[linkContext]++; // Still track nav vs footer
                linkAnalysis.uniqueTemplate.add(href);
                linkAnalysis.templateLinks.push({
                    text: anchorText,
                    href: href,
                    context: linkContext
                });
            }
            
            // Check for nofollow on contextual links only
            if (rel.includes('nofollow') && linkContext === 'contextual') {
                linkAnalysis.nofollow++;
            }
        } else if (href.startsWith('http')) {
            linkAnalysis.external++;
        }
    });
    
    return linkAnalysis;
}

// Enhanced context detection - better at identifying data/interface links
function getLinkContext(link) {
    let element = link;
    const href = link.getAttribute('href') || '';
    const linkText = link.textContent.trim();
    
    // Pattern-based detection for trading/crypto platforms
    // These are typically interface/data links, not contextual content
    if (/\/trade\/|\/tradeview\/|\/market\/|\/price\//i.test(href)) {
        // If it's a trading pair pattern (XXX-YYY), it's likely interface
        if (/\/[A-Z]+-[A-Z]+/i.test(href)) {
            return 'navigation'; // Treat as template/interface
        }
    }
    
    // Links that look like crypto pairs (BTC-INR, ETH-USDT, etc.)
    if (/^[A-Z]{2,5}-[A-Z]{2,5}$/.test(linkText)) {
        return 'navigation'; // Crypto pair listings = interface
    }
    
    // Check up to 5 levels of parent elements
    for (let i = 0; i < 5 && element && element !== document.body; i++) {
        const tagName = element.tagName.toLowerCase();
        const className = (element.className || '').toLowerCase();
        const id = (element.id || '').toLowerCase();
        
        // Data/interface containers (treat as template)
        if (className.includes('table') ||
            className.includes('list') ||
            className.includes('grid') ||
            className.includes('market') ||
            className.includes('trading') ||
            className.includes('pairs') ||
            className.includes('ticker') ||
            className.includes('price') ||
            tagName === 'table' ||
            tagName === 'tbody' ||
            tagName === 'tr' ||
            tagName === 'td') {
            return 'navigation'; // Data tables = interface
        }
        
        // Template link indicators (navigation)
        if (tagName === 'nav' || 
            className.includes('nav') || 
            className.includes('menu') ||
            className.includes('breadcrumb') ||
            className.includes('header') ||
            className.includes('sidebar') ||
            className.includes('widget') ||
            id.includes('nav') || 
            id.includes('menu') ||
            id.includes('header')) {
            return 'navigation';
        }
        
        // Template link indicators (footer)
        if (tagName === 'footer' || 
            className.includes('footer') || 
            id.includes('footer')) {
            return 'footer';
        }
        
        // Skip common template containers
        if (className.includes('template') ||
            className.includes('global') ||
            className.includes('sitewide') ||
            element.getAttribute('role') === 'navigation') {
            return 'navigation';
        }
        
        element = element.parentElement;
    }
    
    // Contextual content indicators - be more restrictive
    element = link;
    for (let i = 0; i < 3 && element; i++) {
        const tagName = element.tagName.toLowerCase();
        const className = (element.className || '').toLowerCase();
        
        // Strong indicators of actual written content
        if (tagName === 'p' ||
            (tagName === 'article' && className.includes('content')) ||
            (tagName === 'div' && className.includes('post')) ||
            className.includes('article-body') ||
            className.includes('post-content') ||
            className.includes('entry-content')) {
            return 'contextual';
        }
        
        element = element.parentElement;
    }
    
    // Default: if no clear contextual indicators and lots of similar links, 
    // it's probably interface/template
    return 'navigation';
}

// Enhanced content analysis with improved quality classification
function analyzeContentAdvanced() {
    // Try to find main content area first
    const contentSelectors = [
        'main', '[role="main"]', 'article', '.content',
        '.post-content', '.page-content', '.entry-content',
        '.main-content', '.article-content', '.post-body',
        '.description', '.summary'
    ];
    
    let bestContent = null;
    let bestWordCount = 0;
    
    // Find the content area with most words
    contentSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const analysis = analyzeContentElement(element);
            if (analysis.words > bestWordCount) {
                bestWordCount = analysis.words;
                bestContent = analysis;
            }
        });
    });
    
    // Fallback: analyze body but with heavy filtering
    if (!bestContent || bestWordCount < 50) {
        bestContent = analyzeContentElement(document.body, true);
    }
    
    return bestContent || { words: 0, headings: 0, paragraphs: 0, quality: 'none' };
}

function analyzeContentElement(element, isBodyFallback = false) {
    const clone = element.cloneNode(true);
    
    // Remove template elements more aggressively
    const removeSelectors = [
        'script', 'style', 'nav', 'header', 'footer',
        '.nav', '.menu', '.navigation', '.sidebar',
        '.widget', '.ads', '.social', '.breadcrumb',
        'button', '.button', '.btn', '.toolbar',
        '.meta', '.tags', '.share', '.related-posts'
    ];
    
    // For body fallback, remove even more template elements
    if (isBodyFallback) {
        removeSelectors.push(
            '.header', '.footer', '.sidebar', '.aside',
            '[role="navigation"]', '[role="banner"]', 
            '[role="contentinfo"]', '.skip-link'
        );
    }
    
    removeSelectors.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    
    // Count structural elements
    const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    const paragraphs = clone.querySelectorAll('p').length;
    const lists = clone.querySelectorAll('ul, ol').length;
    
    // Get clean text and count meaningful words
    const text = clone.textContent || clone.innerText || '';
    const words = text.trim()
        .split(/\s+/)
        .filter(word => 
            word.length > 2 && 
            !/^\d+$/.test(word) && 
            !/^[^\w\s]+$/.test(word) // Remove pure punctuation
        )
        .length;
    
    // Improved content quality classification
    let quality = 'thin';
    if (words < CONFIG.THIN_CONTENT_THRESHOLD) {
        quality = 'thin';
    } else if (words < CONFIG.MEDIUM_CONTENT_THRESHOLD) {
        quality = 'medium';
    } else {
        quality = 'high';
    }
    
    // Adjust quality based on structure
    if (quality === 'medium' && headings >= 3 && paragraphs >= 4) {
        quality = 'high';
    }
    if (quality === 'high' && headings < 2) {
        quality = 'medium'; // Demote if no structure
    }
    
    return { words, headings, paragraphs, lists, quality };
}

// Enhanced page categorization for crypto/fintech
function categorizePageType(url, title = '') {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();
    
    // More specific crypto/fintech patterns
    const patterns = {
        'homepage': /^https?:\/\/[^\/]+\/?(\?.*)?$/,
        'trading-pair': /\/(trade|trading)\/[A-Z]+-[A-Z]+/i,
        'trading-general': /\/(trade|trading|exchange|buy|sell)\//i,
        'crypto-specific': /\/(crypto|coin|bitcoin|ethereum|btc|eth|ada|sol)\//i,
        'market-data': /\/(market|price|chart|rates|ticker)\//i,
        'portfolio': /\/(portfolio|wallet|balance|holdings)\//i,
        'learn-hub': /\/(learn|education|academy|guide|tutorial|how-to)\//i,
        'blog-article': /\/(blog|news|article|post|insights)\//i,
        'security-page': /\/(security|safety|2fa|kyc|verification)\//i,
        'fees-pricing': /\/(fees|pricing|charges|cost|commission)\//i,
        'api-developer': /\/(api|developer|docs|documentation)\//i,
        'support-help': /\/(support|help|faq|contact|tickets)\//i,
        'legal-compliance': /\/(legal|terms|privacy|policy|compliance)\//i,
        'about-company': /\/(about|company|team|careers)\//i
    };
    
    for (const [category, pattern] of Object.entries(patterns)) {
        if (pattern.test(urlLower) || pattern.test(titleLower)) {
            return category;
        }
    }
    
    return 'other';
}

// Enhanced opportunity score calculation with transparent formula
function calculateContextualOpportunity(linkData, contentData, pageType, urlDepth) {
    let opportunityScore = 0;
    let scoreBreakdown = [];
    let opportunities = [];
    let gapAnalysis = {
        hasGap: false,
        severity: 'none',
        recommendedLinks: 0,
        currentLinks: linkData.contextual
    };
    
    // Handle extremely short content more aggressively
    if (contentData.words < 10) {
        return { 
            score: 90,
            scoreBreakdown: ['Critical: Broken/empty page (+90)'],
            opportunities: [`CRITICAL: Only ${contentData.words} words - page appears broken or empty`],
            gapAnalysis: {
                ...gapAnalysis,
                hasGap: true,
                severity: 'critical'
            }
        };
    }
    
    // Skip very short content
    if (contentData.words < CONFIG.MIN_WORDS_FOR_LINKS) {
        return { 
            score: 50,
            scoreBreakdown: ['Thin content penalty (+50)'],
            opportunities: [`THIN CONTENT: ${contentData.words} words insufficient for contextual linking`],
            gapAnalysis: {
                ...gapAnalysis,
                hasGap: true,
                severity: 'medium'
            }
        };
    }
    
    // Calculate ideal contextual links based on content
    const idealLinks = Math.max(1, Math.floor(contentData.words / CONFIG.CONTEXTUAL_LINK_TARGET));
    const contextualDensity = (linkData.contextual / contentData.words) * 100;
    
    gapAnalysis.recommendedLinks = idealLinks;
    
    // 1. Gap Severity Analysis (0-40 points)
    if (linkData.contextual === 0) {
        opportunityScore += 40;
        scoreBreakdown.push('Zero contextual links (+40)');
        gapAnalysis.hasGap = true;
        gapAnalysis.severity = 'critical';
        opportunities.push(`CRITICAL GAP: Zero contextual links in ${contentData.words} words`);
    } else if (linkData.contextual < idealLinks) {
        const deficit = idealLinks - linkData.contextual;
        const gapPoints = Math.min(30, deficit * 8);
        opportunityScore += gapPoints;
        scoreBreakdown.push(`Link deficit: ${deficit} missing (+${gapPoints})`);
        gapAnalysis.hasGap = true;
        gapAnalysis.severity = deficit >= 3 ? 'high' : 'medium';
        opportunities.push(`LINK GAP: Need ${deficit} more contextual links (${linkData.contextual}/${idealLinks})`);
    }
    
    // 2. Word Count to Link Ratio Imbalance (0-25 points)
    if (contextualDensity < CONFIG.MIN_CONTEXTUAL_DENSITY) {
        const densityPoints = 15;
        opportunityScore += densityPoints;
        scoreBreakdown.push(`Low density: ${contextualDensity.toFixed(1)}% (+${densityPoints})`);
        opportunities.push(`LOW DENSITY: ${contextualDensity.toFixed(1)}% contextual density (target: ${CONFIG.MIN_CONTEXTUAL_DENSITY}%+)`);
    }
    
    // Over-linking penalty
    if (contextualDensity > CONFIG.MAX_CONTEXTUAL_DENSITY) {
        const overLinkPoints = 20;
        opportunityScore += overLinkPoints;
        scoreBreakdown.push(`Over-linking: ${contextualDensity.toFixed(1)}% (+${overLinkPoints})`);
        opportunities.push(`OVER-LINKED: ${contextualDensity.toFixed(1)}% density exceeds ${CONFIG.MAX_CONTEXTUAL_DENSITY}% maximum`);
    }
    
    // 3. Page Type Weighting (0-25 points)
    const pageTypeWeights = {
        'homepage': { minLinks: 4, weight: 20, message: 'Homepage needs strong internal linking foundation' },
        'trading-pair': { minLinks: 3, weight: 15, message: 'Trading pairs should link to: guides, security, related pairs' },
        'crypto-specific': { minLinks: 4, weight: 15, message: 'Crypto pages should link to: trading, market data, guides, news' },
        'learn-hub': { minLinks: 5, weight: 18, message: 'Educational content needs cross-links to related lessons' },
        'blog-article': { minLinks: 3, weight: 12, message: 'Articles should reference related posts and crypto pages' },
        'market-data': { minLinks: 2, weight: 10, message: 'Market pages should link to trading and crypto info' }
    };
    
    const pageWeight = pageTypeWeights[pageType];
    if (pageWeight && linkData.contextual < pageWeight.minLinks) {
        opportunityScore += pageWeight.weight;
        scoreBreakdown.push(`Page type priority: ${pageType} (+${pageWeight.weight})`);
        opportunities.push(`PAGE TYPE: ${pageWeight.message}`);
    }
    
    // 4. Link Quality Issues (0-15 points)
    const uniqueRatio = linkData.uniqueContextual.size / Math.max(linkData.contextual, 1);
    const duplicateLinkIssue = linkData.contextual > 5 && uniqueRatio < 0.7;
    
    if (duplicateLinkIssue) {
        const duplicatePoints = 15;
        opportunityScore += duplicatePoints;
        const duplicates = linkData.contextual - linkData.uniqueContextual.size;
        scoreBreakdown.push(`Duplicate links: ${duplicates} redundant (+${duplicatePoints})`);
        opportunities.push(`DUPLICATE LINKS: ${duplicates} redundant links to same ${linkData.uniqueContextual.size} targets`);
    }
    
    // 5. URL Depth Factor (0-10 points)
    if (urlDepth > 3) {
        const depthPoints = Math.min(10, (urlDepth - 3) * 3);
        opportunityScore += depthPoints;
        scoreBreakdown.push(`Deep page: Level ${urlDepth} (+${depthPoints})`);
        opportunities.push(`DEEP PAGE: Level ${urlDepth} needs links from higher-level pages`);
    }
    
    return { 
        score: Math.min(opportunityScore, 100),
        scoreBreakdown,
        opportunities: opportunities.slice(0, 3),
        gapAnalysis
    };
}

// Calculate link diversity with proper N/A handling
function calculateLinkDiversity(linkData) {
    if (linkData.contextual === 0) {
        return 'N/A';
    }
    return Math.round((linkData.uniqueContextual.size / linkData.contextual) * 100) + '%';
}

// Check external link balance
function checkExternalLinkBalance(linkData) {
    const externalRatio = linkData.external / Math.max(linkData.contextual, 1);
    if (linkData.contextual > 0 && externalRatio > CONFIG.EXTERNAL_WARNING_RATIO) {
        return `HIGH EXTERNAL RATIO: ${linkData.external} external vs ${linkData.contextual} contextual`;
    }
    if (linkData.contextual === 0 && linkData.external > 10) {
        return `EXTERNAL ONLY: ${linkData.external} external links but zero contextual`;
    }
    return 'BALANCED';
}

// Generate actionable recommendations focused on contextual links
function generateContextualRecommendations(linkData, contentData, pageType, gapAnalysis, externalBalance) {
    const recommendations = [];
    const uniqueRatio = linkData.uniqueContextual.size / Math.max(linkData.contextual, 1);
    const contextualDensity = (linkData.contextual / contentData.words) * 100;
    
    // Handle critical content issues first
    if (contentData.words < 10) {
        recommendations.push(`BROKEN PAGE: Only ${contentData.words} words detected - check content extraction or page structure`);
        return recommendations;
    }
    
    if (contentData.words < 50 && pageType.includes('blog')) {
        recommendations.push(`BLOG FAILURE: ${contentData.words} words on blog page - add substantial content immediately`);
        return recommendations;
    }
    
    // External link imbalance warning
    if (externalBalance.includes('HIGH EXTERNAL RATIO') || externalBalance.includes('EXTERNAL ONLY')) {
        recommendations.push(`⚖️ LINK BALANCE: ${externalBalance.replace('HIGH EXTERNAL RATIO: ', '').replace('EXTERNAL ONLY: ', '')}`);
    }
    
    // Over-linking and duplicate link issues
    if (linkData.contextual > 5 && uniqueRatio < 0.7) {
        const duplicates = linkData.contextual - linkData.uniqueContextual.size;
        recommendations.push(`REMOVE ${duplicates} DUPLICATE LINKS: ${linkData.contextual} links → only ${linkData.uniqueContextual.size} unique targets`);
    }
    
    // High density issues
    if (contextualDensity > 3.0) {
        const excess = linkData.contextual - Math.ceil(contentData.words * 0.025); // Target 2.5% max
        recommendations.push(`REDUCE LINKS: ${contextualDensity.toFixed(1)}% density → remove ${excess} contextual links`);
    }
    
    // Primary gap recommendations
    if (gapAnalysis.hasGap) {
        const needed = gapAnalysis.recommendedLinks - gapAnalysis.currentLinks;
        
        if (gapAnalysis.severity === 'critical') {
            recommendations.push(`ADD ${needed} CONTEXTUAL LINKS: Zero internal links in content body`);
        } else if (gapAnalysis.severity === 'high') {
            recommendations.push(`ADD ${needed} MORE LINKS: Currently ${gapAnalysis.currentLinks}/${gapAnalysis.recommendedLinks}`);
        } else {
            recommendations.push(`OPTIMIZE: Add ${needed} contextual links for better internal linking`);
        }
    }
    
    // Homepage-specific recommendations
    if (pageType === 'homepage') {
        if (linkData.contextual > 10 && uniqueRatio < 0.8) {
            recommendations.push(`HOMEPAGE FOCUS: Prioritize 8-12 unique high-value pages instead of repeating links`);
        }
        if (contentData.quality === 'thin') {
            recommendations.push(`HOMEPAGE CONTENT: Expand beyond ${contentData.words} words for better context`);
        }
    }
    
    // Page-specific contextual recommendations (only if not over-linked)
    if (contextualDensity <= 3.0 && uniqueRatio >= 0.7) {
        const contextualSuggestions = {
            'trading-pair': [
                'Link to security/safety guides',
                'Reference related trading pairs',
                'Connect to educational content about this crypto'
            ],
            'crypto-specific': [
                'Link to current market data/charts',
                'Reference trading pages for this crypto',
                'Connect to news/updates about this coin'
            ],
            'learn-hub': [
                'Cross-reference prerequisite lessons',
                'Link to practical examples/trading pages',
                'Reference related educational content'
            ],
            'blog-article': [
                'Link to mentioned cryptocurrencies',
                'Reference related news articles',
                'Connect to relevant guides/tutorials'
            ],
            'market-data': [
                'Link to trading pages for displayed pairs',
                'Reference analysis/news for featured cryptos'
            ],
            'homepage': [
                'Feature key trading pairs',
                'Link to educational content for beginners',
                'Highlight security/trust signals'
            ]
        };
        
        const suggestions = contextualSuggestions[pageType];
        if (suggestions && gapAnalysis.hasGap) {
            recommendations.push(`📍 SPECIFIC IDEAS: ${suggestions.slice(0, 2).join(' | ')}`);
        }
    }
    
    return recommendations.slice(0, 3);
}

// Main analysis execution
const linkData = analyzeLinksAdvanced();
const contentData = analyzeContentAdvanced();
const pageType = categorizePageType(currentUrl, currentTitle);
const urlDepth = (currentUrl.match(/\//g) || []).length - 2; // More accurate depth

const contextualDensity = contentData.words > 0 ? (linkData.contextual / contentData.words) * 100 : 0;
const opportunityAnalysis = calculateContextualOpportunity(linkData, contentData, pageType, urlDepth);
const linkDiversity = calculateLinkDiversity(linkData);
const externalBalance = checkExternalLinkBalance(linkData);
const recommendations = generateContextualRecommendations(linkData, contentData, pageType, opportunityAnalysis.gapAnalysis, externalBalance);

// Create focused output for contextual link analysis
const contextualLinkData = {
    'URL': currentUrl,
    'Page Type': pageType,
    'Content Words': contentData.words,
    'Content Quality': contentData.quality.toUpperCase(),
    'Contextual Links': linkData.contextual,
    'Unique Contextual': linkData.uniqueContextual.size,
    'Link Diversity': linkDiversity,
    'Template Links': linkData.template,
    'Contextual Density': contextualDensity.toFixed(1) + '%',
    'Ideal Contextual Links': opportunityAnalysis.gapAnalysis.recommendedLinks,
    'Link Gap': opportunityAnalysis.gapAnalysis.hasGap ? 
        `${opportunityAnalysis.gapAnalysis.recommendedLinks - linkData.contextual} MISSING` : 'NONE',
    'Gap Severity': opportunityAnalysis.gapAnalysis.severity.toUpperCase(),
    'External Link Balance': externalBalance,
    'Opportunity Score': opportunityAnalysis.score + '/100',
    'Score Breakdown': opportunityAnalysis.scoreBreakdown.join(' | '),
    'URL Depth': urlDepth,
    'External Links': linkData.external,
    'Primary Issue': opportunityAnalysis.opportunities[0] || 'No significant issues',
    'Action 1': recommendations[0] || 'Monitor current approach',
    'Action 2': recommendations[1] || 'No additional actions needed',
    'Action 3': recommendations[2] || 'Consider content expansion',
    'Link Priority': opportunityAnalysis.score >= 50 ? 'HIGH' : 
                    (opportunityAnalysis.score >= 25 ? 'MEDIUM' : 'LOW'),
    'Quick Fix': contentData.words < 10 ? 'URGENT: Fix broken/empty page content' :
                (contentData.words < 50 && pageType.includes('blog') ? 'URGENT: Add substantial blog content' :
                (linkData.contextual === 0 && contentData.words >= 50 ? 'Add 1-2 contextual links immediately' :
                (opportunityAnalysis.gapAnalysis.hasGap ? `Add ${opportunityAnalysis.gapAnalysis.recommendedLinks - linkData.contextual} more links` : 
                (linkData.contextual > 5 && (linkData.uniqueContextual.size / linkData.contextual) < 0.7 ? 
                'Remove duplicate links' : 'Maintain current linking'))))
};

// Return focused contextual analysis
return seoSpider.data(contextualLinkData);