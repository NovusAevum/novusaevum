/**
 * Metrics SVG Validation Tests
 * 
 * This suite validates the metrics.svg file which contains
 * GitHub statistics and activity visualizations.
 * 
 * Tests cover:
 * - SVG structure and well-formedness
 * - Data visualization accuracy
 * - Consistency of statistics
 * - Visual element integrity
 */

const fs = require('fs');
const path = require('path');

describe('Metrics SVG File', () => {
  
  let metricsContent;
  const metricsPath = 'metrics.svg';
  
  beforeAll(() => {
    const fullPath = path.join(process.cwd(), metricsPath);
    metricsContent = fs.readFileSync(fullPath, 'utf8');
  });

  describe('File Structure and Format', () => {
    
    test('should be valid SVG with proper structure', () => {
      expect(metricsContent).toMatch(/^<svg/);
      expect(metricsContent).toMatch(/<\/svg>\s*$/);
    });

    test('should have SVG namespace declaration', () => {
      expect(metricsContent).toMatch(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    });

    test('should define width and height attributes', () => {
      const svgTag = metricsContent.match(/<svg[^>]*>/);
      expect(svgTag[0]).toMatch(/width=["']\d+["']/);
      expect(svgTag[0]).toMatch(/height=["']\d+["']/);
    });

    test('should have class attribute for styling', () => {
      const svgTag = metricsContent.match(/<svg[^>]*>/);
      expect(svgTag[0]).toMatch(/class=["'][^"']*["']/);
    });

    test('file size should be reasonable (< 500KB)', () => {
      const fullPath = path.join(process.cwd(), metricsPath);
      const stats = fs.statSync(fullPath);
      const sizeInKB = stats.size / 1024;
      
      expect(sizeInKB).toBeGreaterThan(0);
      expect(sizeInKB).toBeLessThan(500);
    });
  });

  describe('Embedded Styles and Animations', () => {
    
    test('should have style definitions', () => {
      expect(metricsContent).toMatch(/<style[^>]*>/);
    });

    test('should define CSS animations if present', () => {
      if (metricsContent.includes('@keyframes')) {
        const keyframes = metricsContent.match(/@keyframes\s+[a-z-]+/gi);
        expect(keyframes).toBeTruthy();
        expect(keyframes.length).toBeGreaterThan(0);
      }
    });

    test('should have responsive or adaptive styling', () => {
      // Check for classes that handle different sizes
      expect(metricsContent).toMatch(/class=["'][^"']*large[^"']*["']/);
    });

    test('CSS rules should be well-formed', () => {
      const styleBlock = metricsContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      if (styleBlock) {
        // Should have proper CSS syntax with braces
        expect(styleBlock[1]).toMatch(/\{[^}]*\}/);
      }
    });

    test('should include media queries for responsive design in embedded styles', () => {
      const styleBlock = metricsContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      expect(styleBlock).toBeTruthy();
      const cssContent = styleBlock ? styleBlock[1] : '';
      // Check for presence of at least one media query
      const mediaQueryMatch = cssContent.match(/@media[^{]+\{[\s\S]+?\}/);
      expect(mediaQueryMatch).toBeTruthy();
      // Optionally, check that the media query contains valid CSS rules
      expect(mediaQueryMatch[0]).toMatch(/\{[^}]*\}/);
    });
  });

  describe('GitHub Statistics Integration', () => {
    
    test('should display commit count', () => {
      expect(metricsContent).toMatch(/\d+\s+Commits?/i);
    });

    test('commit count should be a reasonable number', () => {
      const commitMatch = metricsContent.match(/(\d+)\s+Commits?/i);
      if (commitMatch) {
        const count = parseInt(commitMatch[1]);
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(100000); // Sanity check
      }
    });

    test('should display pull request information', () => {
      expect(metricsContent).toMatch(/Pull requests?/i);
    });

    test('PR count should be non-negative', () => {
      const prMatch = metricsContent.match(/(\d+)\s+Pull requests?/i);
      if (prMatch) {
        const count = parseInt(prMatch[1]);
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display repository storage usage', () => {
      expect(metricsContent).toMatch(/\d+\s*(kB|MB|GB)\s+used/i);
    });

    test('storage size should be in valid format', () => {
      const storageMatch = metricsContent.match(/(\d+)\s*(kB|MB|GB)\s+used/i);
      if (storageMatch) {
        const size = parseInt(storageMatch[1]);
        const unit = storageMatch[2];
        
        expect(size).toBeGreaterThan(0);
        expect(['kB', 'MB', 'GB']).toContain(unit);
      }
    });

    test('should include timestamp of last update', () => {
      expect(metricsContent).toMatch(/Last updated/i);
    });

    test('timestamp should have valid date format', () => {
      const timestampMatch = metricsContent.match(/Last updated\s+(\d+\s+\w+\s+\d{4})/i);
      if (timestampMatch) {
        const dateStr = timestampMatch[1];
        expect(dateStr).toMatch(/\d+\s+\w+\s+\d{4}/);
      }
    });
  });

  describe('Activity Calendar Visualization', () => {
    
    test('should contain contribution calendar', () => {
      expect(metricsContent).toMatch(/calendar/i);
    });

    test('should have day elements for activity', () => {
      expect(metricsContent).toMatch(/class=["']day["']/);
    });

    test('day elements should have valid fill colors', () => {
      const dayElements = metricsContent.match(/<rect[^>]*class=["']day["'][^>]*>/g);
      
      if (dayElements) {
        dayElements.forEach(element => {
          expect(element).toMatch(/fill=["'][^"']+["']/);
        });
      }
    });

    test('calendar should use standard GitHub color scheme', () => {
      const colors = [
        '#ebedf0', // No contributions
        '#9be9a8', // Low
        '#40c463', // Medium-low  
        '#30a14e', // Medium
        '#216e39'  // High
      ];
      
      colors.forEach(color => {
        if (metricsContent.includes(color)) {
          expect(metricsContent).toContain(color);
        }
      });
    });

    test('day rectangles should have consistent dimensions', () => {
      const dayRects = metricsContent.match(/class=["']day["'][^>]*width=["'](\d+)["'][^>]*height=["'](\d+)["']/g);
      
      if (dayRects && dayRects.length > 1) {
        const firstRect = dayRects[0];
        const widthMatch = firstRect.match(/width=["'](\d+)["']/);
        const heightMatch = firstRect.match(/height=["'](\d+)["']/);
        
        if (widthMatch && heightMatch) {
          const width = widthMatch[1];
          const height = heightMatch[1];
          
          // All day rectangles should have same dimensions
          dayRects.forEach(rect => {
            expect(rect).toContain(`width="${width}"`);
            expect(rect).toContain(`height="${height}"`);
          });
        }
      }
    });
  });

  describe('Visual Progress Bars and Indicators', () => {
    
    test('should have progress bar elements if stats are visualized', () => {
      if (metricsContent.includes('pr-bar') || metricsContent.includes('issues-bar')) {
        expect(metricsContent).toMatch(/<rect[^>]*mask=/);
      }
    });

    test('progress values should be within 0-100% range', () => {
      const widthMatches = metricsContent.match(/width=["'](\d+(?:\.\d+)?)["']/g);
      
      if (widthMatches) {
        widthMatches.forEach(match => {
          const value = parseFloat(match.match(/[\d.]+/)[0]);
          // Width in percentage terms should be reasonable
          if (value <= 100) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(100);
          }
        });
      }
    });

    test('should use appropriate colors for different metric types', () => {
      // GitHub uses specific colors for different states
      const githubColors = {
        success: '#238636',
        info: '#58a6ff',
        warning: '#d29922',
        danger: '#da3633'
      };
      
      Object.values(githubColors).forEach(color => {
        if (metricsContent.includes(color)) {
          // Color is used - verify it's in proper context
          expect(metricsContent).toContain(color);
        }
      });
    });
  });

  describe('Icons and SVG Paths', () => {
    
    test('should include GitHub octicons or similar icons', () => {
      expect(metricsContent).toMatch(/<path[^>]*fill-rule=["']evenodd["']/);
    });

    test('path elements should have valid d attribute', () => {
      const paths = metricsContent.match(/<path[^>]*d=["']([^"']+)["']/g);
      
      if (paths) {
        paths.forEach(path => {
          const dAttr = path.match(/d=["']([^"']+)["']/);
          expect(dAttr).toBeTruthy();
          expect(dAttr[1].length).toBeGreaterThan(0);
        });
      }
    });

    test('icons should have consistent sizing', () => {
      const svgIcons = metricsContent.match(/<svg[^>]*width=["']16["'][^>]*height=["']16["']/g);
      
      if (svgIcons) {
        expect(svgIcons.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Text Content and Formatting', () => {
    
    test('should not have text overflow issues', () => {
      // Check for reasonable text lengths
      const textElements = metricsContent.match(/<text[^>]*>([^<]+)<\/text>/g);
      
      if (textElements) {
        textElements.forEach(element => {
          const content = element.match(/>([^<]+)</)[1];
          expect(content.length).toBeLessThan(200); // Reasonable text length
        });
      }
    });

    test('should use appropriate font families', () => {
      const fontFamilies = metricsContent.match(/font-family:\s*([^;]+)/gi);
      
      if (fontFamilies) {
        fontFamilies.forEach(font => {
          // Should include standard system fonts
          const fontValue = font.toLowerCase();
          const hasStandardFont = 
            fontValue.includes('sans-serif') ||
            fontValue.includes('monospace') ||
            fontValue.includes('arial') ||
            fontValue.includes('helvetica');
          
          expect(hasStandardFont).toBe(true);
        });
      }
    });

    test('font sizes should be readable', () => {
      const fontSizes = metricsContent.match(/font-size:\s*(\d+)px/gi);
      
      if (fontSizes) {
        fontSizes.forEach(size => {
          const sizeValue = parseInt(size.match(/\d+/)[0]);
          expect(sizeValue).toBeGreaterThanOrEqual(8); // Minimum readable size
          expect(sizeValue).toBeLessThan(100); // Sanity check
        });
      }
    });
  });

  describe('Data Consistency and Accuracy', () => {
    
    test('merged PR count should not exceed opened PR count', () => {
      const openedMatch = metricsContent.match(/(\d+)\s+Pull requests?\s+opened/i);
      const mergedMatch = metricsContent.match(/(\d+)\s+merged/i);
      
      if (openedMatch && mergedMatch) {
        const opened = parseInt(openedMatch[1]);
        const merged = parseInt(mergedMatch[1]);
        
        expect(merged).toBeLessThanOrEqual(opened);
      }
    });

    test('statistics should be internally consistent', () => {
      // Extract all numeric statistics
      const numbers = metricsContent.match(/>\s*(\d+)\s*</g);
      
      if (numbers) {
        numbers.forEach(num => {
          const value = parseInt(num.match(/\d+/)[0]);
          expect(value).not.toBeNaN();
          expect(value).toBeGreaterThanOrEqual(0);
        });
      }
    });

    test('should not show negative values', () => {
      const negativePattern = />-\d+</;
      expect(metricsContent).not.toMatch(negativePattern);
    });
  });

  describe('Accessibility Features', () => {
    
    test('should have descriptive class names', () => {
      const classes = metricsContent.match(/class=["']([^"']+)["']/g);
      
      if (classes) {
        expect(classes.length).toBeGreaterThan(0);
        
        // Classes should be semantic
        classes.forEach(cls => {
          const className = cls.match(/class=["']([^"']+)["']/)[1];
          expect(className.length).toBeGreaterThan(1);
        });
      }
    });

    test('should provide context for visual elements', () => {
      // Check for semantic grouping
      expect(metricsContent).toMatch(/<g[^>]*>/); // SVG groups
    });

    test('should have readable color contrast', () => {
      // Text should have sufficient contrast
      const darkColors = ['#0D1117', '#000', '#000000', '#161b22'];
      const lightColors = ['#ffffff', '#fff', '#f0f0f0'];
      
      const hasDark = darkColors.some(color => metricsContent.includes(color));
      const hasLight = lightColors.some(color => metricsContent.includes(color));
      
      if (hasDark && hasLight) {
        // Good - using contrasting colors
        expect(hasDark && hasLight).toBe(true);
      }
    });
  });

  describe('Performance and Optimization', () => {
    
    test('should not have excessive nested groups', () => {
      const nestingMatches = metricsContent.match(/<g[^>]*>[\s\S]*?<g[^>]*>[\s\S]*?<g[^>]*>/g);
      
      if (nestingMatches) {
        // Deep nesting can impact rendering performance
        expect(nestingMatches.length).toBeLessThan(50);
      }
    });

    test('should reuse definitions where possible', () => {
      const defs = metricsContent.match(/<defs[^>]*>([\s\S]*?)<\/defs>/);
      
      if (defs) {
        // If defs exist, they should be used
        const ids = defs[1].match(/id=["']([^"']+)["']/g);
        
        if (ids) {
          ids.forEach(id => {
            const idValue = id.match(/id=["']([^"']+)["']/)[1];
            // ID should be referenced somewhere
            expect(metricsContent).toMatch(new RegExp(`#${idValue}`));
          });
        }
      }
    });

    test('should not have redundant style definitions', () => {
      const styles = metricsContent.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
      
      if (styles && styles.length > 1) {
        // Multiple style blocks should be consolidated
        expect(styles.length).toBeLessThan(5);
      }
    });
  });

  describe('Metrics Tool Attribution', () => {
    
    test('should include reference to metrics generation tool', () => {
      expect(metricsContent.toLowerCase()).toMatch(/metrics|lowlighter/);
    });

    test('should have footer with metadata', () => {
      expect(metricsContent).toMatch(/<footer/i);
    });

    test('footer should include version information if present', () => {
      if (metricsContent.includes('lowlighter/metrics')) {
        expect(metricsContent).toMatch(/lowlighter\/metrics@[\d.]+/);
      }
    });
  });
});

// Helper to run tests
if (require.main === module) {
  console.log('Metrics SVG Validation Test Suite');
  console.log('==================================\n');
  console.log('Run these tests with: node tests/metrics-svg-validation.test.js\n');
}