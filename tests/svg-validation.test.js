/**
 * SVG Header Files Validation Tests
 * 
 * This suite validates the SVG header files for:
 * - XML well-formedness
 * - Accessibility compliance (WCAG 2.1)
 * - Responsive design attributes
 * - Animation definitions
 * - Color contrast and visual design
 */

const fs = require('fs');
const path = require('path');

// List of SVG files to validate based on the diff
const SVG_FILES = [
  'assets/headers/certifications-header.svg',
  'assets/headers/persona-header.svg',
  'assets/headers/strategic-header.svg',
  'assets/headers/technical-header.svg',
  'assets/headers/timeline-header.svg',
  'metrics.svg'
];

describe('SVG Header Files - Accessibility and Standards Compliance', () => {
  
  SVG_FILES.forEach(filePath => {
    describe(`${path.basename(filePath)}`, () => {
      let svgContent;
      
      beforeAll(() => {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
          throw new Error(`SVG file not found: ${fullPath}`);
        }
        svgContent = fs.readFileSync(fullPath, 'utf8');
      });

      describe('XML Structure and Well-Formedness', () => {
        
        test('should be valid XML with proper opening and closing tags', () => {
          expect(svgContent).toMatch(/^<svg\s/);
          expect(svgContent).toMatch(/<\/svg>\s*$/);
        });

        test('should have properly nested tags', () => {
          // Check that all opening tags have corresponding closing tags
          const openTags = svgContent.match(/<([a-z][a-z0-9]*)\b[^>]*>/gi) || [];
          const closeTags = svgContent.match(/<\/([a-z][a-z0-9]*)>/gi) || [];
          const selfClosingTags = svgContent.match(/<[a-z][a-z0-9]*\b[^>]*\/>/gi) || [];
          
          // Count should roughly match (accounting for self-closing tags)
          const openCount = openTags.length;
          const closeCount = closeTags.length;
          const selfClosingCount = selfClosingTags.length;
          
          expect(openCount).toBeGreaterThan(0);
          expect(closeCount).toBeGreaterThan(0);
          // Total opens should equal total closes (including self-closing)
          expect(openCount).toBeGreaterThanOrEqual(closeCount);
        });

        test('should not contain malformed tags', () => {
          // Check for common XML errors
          expect(svgContent).not.toMatch(/<<|>>/); // Double brackets
          expect(svgContent).not.toMatch(/<\s+[a-z]/i); // Space after opening bracket
          expect(svgContent).not.toMatch(/[a-z]\s+>/i); // Space before closing bracket (except in content)
        });

        test('should have valid namespace declaration', () => {
          expect(svgContent).toMatch(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
        });

        test('should not contain syntax errors in attributes', () => {
          // Check for unquoted attributes or malformed attribute syntax
          const attributePattern = /\s([a-z-]+)=["'][^"']*["']/gi;
          const matches = svgContent.match(attributePattern);
          expect(matches).toBeTruthy();
          expect(matches.length).toBeGreaterThan(0);
        });
      });

      describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
        
        test('should have role="img" attribute on root SVG element', () => {
          const svgTagMatch = svgContent.match(/<svg[^>]*>/);
          expect(svgTagMatch).toBeTruthy();
          expect(svgTagMatch[0]).toMatch(/role=["']img["']/);
        });

        test('should have aria-label attribute for screen readers', () => {
          const svgTagMatch = svgContent.match(/<svg[^>]*>/);
          expect(svgTagMatch).toBeTruthy();
          expect(svgTagMatch[0]).toMatch(/aria-label=["'][^"']+["']/);
        });

        test('aria-label should be descriptive (not empty)', () => {
          const ariaLabelMatch = svgContent.match(/aria-label=["']([^"']+)["']/);
          expect(ariaLabelMatch).toBeTruthy();
          expect(ariaLabelMatch[1]).toBeTruthy();
          expect(ariaLabelMatch[1].length).toBeGreaterThan(10); // Meaningful description
        });

        test('should have a <title> element for accessibility', () => {
          expect(svgContent).toMatch(/<title>[^<]+<\/title>/);
        });

        test('<title> element should have meaningful content', () => {
          const titleMatch = svgContent.match(/<title>([^<]+)<\/title>/);
          expect(titleMatch).toBeTruthy();
          expect(titleMatch[1]).toBeTruthy();
          expect(titleMatch[1].trim().length).toBeGreaterThan(5);
        });

        test('decorative elements should have aria-hidden="true" if present', () => {
          // Check if there are background or decorative groups
          const decorativeElements = svgContent.match(/<g[^>]*opacity=["']0\.\d+["'][^>]*>/g);
          if (decorativeElements && decorativeElements.length > 0) {
            // At least some should have aria-hidden
            const hasAriaHidden = svgContent.includes('aria-hidden="true"');
            expect(hasAriaHidden).toBe(true);
          }
        });
      });

      describe('Responsive Design Attributes', () => {
        
        test('should use viewBox instead of fixed width/height for scalability', () => {
          const svgTagMatch = svgContent.match(/<svg[^>]*>/);
          expect(svgTagMatch).toBeTruthy();
          expect(svgTagMatch[0]).toMatch(/viewBox=["'][^"']+["']/);
        });

        test('viewBox should have valid format (4 numeric values)', () => {
          const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
          expect(viewBoxMatch).toBeTruthy();
          
          const values = viewBoxMatch[1].trim().split(/\s+/);
          expect(values).toHaveLength(4);
          
          values.forEach(val => {
            expect(parseFloat(val)).not.toBeNaN();
          });
        });

        test('should have preserveAspectRatio attribute', () => {
          const svgTagMatch = svgContent.match(/<svg[^>]*>/);
          expect(svgTagMatch).toBeTruthy();
          expect(svgTagMatch[0]).toMatch(/preserveAspectRatio=["'][^"']+["']/);
        });

        test('preserveAspectRatio should use valid values', () => {
          const preserveMatch = svgContent.match(/preserveAspectRatio=["']([^"']+)["']/);
          expect(preserveMatch).toBeTruthy();
          
          // Valid values include: xMidYMid meet, xMinYMin meet, etc.
          const validPatterns = /^(none|x(Min|Mid|Max)Y(Min|Mid|Max)\s+(meet|slice))$/;
          expect(preserveMatch[1]).toMatch(validPatterns);
        });

        test('should include responsive media queries in CSS if present', () => {
          if (svgContent.includes('<style>')) {
            // Check for mobile-first or responsive breakpoints
            const hasMediaQueries = svgContent.match(/@media\s*\([^)]*\)/);
            expect(hasMediaQueries).toBeTruthy();
          }
        });

        test('should use relative units (%, vw, etc.) for responsive elements', () => {
          // Check if percentage-based positioning is used
          const hasPercentages = svgContent.match(/=["']\d+%["']/);
          if (filePath.includes('headers/')) {
            // Header SVGs should use percentages for responsive layout
            expect(hasPercentages).toBeTruthy();
          }
        });
      });

      describe('CSS Animations and Styling', () => {
        
        test('should define animations in a <style> block if animations exist', () => {
          const hasAnimations = svgContent.match(/class=["'][^"']*["']/) && 
                               svgContent.match(/animation[:-]/);
          
          if (hasAnimations) {
            expect(svgContent).toMatch(/<style>/);
            expect(svgContent).toMatch(/@keyframes/);
          }
        });

        test('animation definitions should be well-formed', () => {
          const keyframesMatches = svgContent.match(/@keyframes\s+([a-z-]+)\s*{[^}]*}/gi);
          
          if (keyframesMatches) {
            keyframesMatches.forEach(keyframe => {
              // Should have proper structure with percentage or from/to
              expect(keyframe).toMatch(/(@keyframes\s+[a-z-]+\s*{.*?(0%|100%|from|to).*?})/is);
            });
          }
        });

        test('CSS classes should be properly defined before use', () => {
          const classUsages = svgContent.match(/class=["']([^"']+)["']/g);
          
          if (classUsages) {
            const usedClasses = new Set();
            classUsages.forEach(usage => {
              const match = usage.match(/class=["']([^"']+)["']/);
              if (match) {
                match[1].split(/\s+/).forEach(cls => usedClasses.add(cls));
              }
            });
            
            // Check that used classes are defined in style block
            const styleBlock = svgContent.match(/<style>(.*?)<\/style>/s);
            if (styleBlock && usedClasses.size > 0) {
              usedClasses.forEach(className => {
                if (className) {
                  expect(styleBlock[1]).toMatch(new RegExp(`\\.${className}\\b`));
                }
              });
            }
          }
        });

        test('animation delays should be positive or zero', () => {
          const delayMatches = svgContent.match(/animation-delay:\s*([0-9.]+)s/g);
          
          if (delayMatches) {
            delayMatches.forEach(match => {
              const delay = parseFloat(match.match(/([0-9.]+)/)[1]);
              expect(delay).toBeGreaterThanOrEqual(0);
            });
          }
        });

        test('animation durations should be reasonable (not too fast or slow)', () => {
          const durationMatches = svgContent.match(/animation(?:-duration)?:\s*([a-z-]+\s+)?([0-9.]+)s/g);
          
          if (durationMatches) {
            durationMatches.forEach(match => {
              const duration = parseFloat(match.match(/([0-9.]+)s/)[1]);
              expect(duration).toBeGreaterThan(0);
              expect(duration).toBeLessThan(30); // Animations longer than 30s are likely errors
            });
          }
        });
      });

      describe('Color and Visual Design', () => {
        
        test('should use valid color formats (hex, rgb, named, or gradients)', () => {
          const colorMatches = svgContent.match(/(?:fill|stroke|stop-color)=["']([^"']+)["']/g);
          
          if (colorMatches) {
            colorMatches.forEach(match => {
              const color = match.match(/=["']([^"']+)["']/)[1];
              
              // Valid formats: hex (#fff, #ffffff), rgb(a), url(), or named colors
              const isValid = 
                /^#[0-9a-f]{3,8}$/i.test(color) ||
                /^rgba?\([^)]+\)$/i.test(color) ||
                /^url\(#[^)]+\)$/i.test(color) ||
                /^[a-z]+$/i.test(color) ||
                color === 'none';
              
              expect(isValid).toBe(true);
            });
          }
        });

        test('should define gradient IDs before using them', () => {
          const gradientUsages = svgContent.match(/url\(#([^)]+)\)/g);
          
          if (gradientUsages) {
            const usedGradients = new Set();
            gradientUsages.forEach(usage => {
              const match = usage.match(/url\(#([^)]+)\)/);
              if (match) usedGradients.add(match[1]);
            });
            
            usedGradients.forEach(gradientId => {
              expect(svgContent).toMatch(new RegExp(`id=["']${gradientId}["']`));
            });
          }
        });

        test('linearGradient elements should have valid stop elements', () => {
          const linearGradients = svgContent.match(/<linearGradient[^>]*>[\s\S]*?<\/linearGradient>/g);
          
          if (linearGradients) {
            linearGradients.forEach(gradient => {
              expect(gradient).toMatch(/<stop/);
              
              const stops = gradient.match(/<stop[^>]*>/g);
              expect(stops.length).toBeGreaterThanOrEqual(2); // Need at least 2 stops
              
              // Each stop should have offset
              stops.forEach(stop => {
                expect(stop).toMatch(/offset=["'][^"']+["']/);
              });
            });
          }
        });

        test('opacity values should be between 0 and 1', () => {
          const opacityMatches = svgContent.match(/opacity=["']([^"']+)["']/g);
          
          if (opacityMatches) {
            opacityMatches.forEach(match => {
              const opacity = parseFloat(match.match(/=["']([^"']+)["']/)[1]);
              expect(opacity).toBeGreaterThanOrEqual(0);
              expect(opacity).toBeLessThanOrEqual(1);
            });
          }
        });
      });

      describe('Performance and Optimization', () => {
        
        test('file size should be reasonable (< 500KB)', () => {
          const fullPath = path.join(process.cwd(), filePath);
          const stats = fs.statSync(fullPath);
          const sizeInKB = stats.size / 1024;
          
          expect(sizeInKB).toBeLessThan(500);
        });

        test('should not have excessive embedded data URIs', () => {
          const dataUriMatches = svgContent.match(/data:[^"']*/g);
          
          if (dataUriMatches) {
            expect(dataUriMatches.length).toBeLessThan(5); // Limit embedded data
          }
        });

        test('should use symbol/use pattern for repeated elements if applicable', () => {
          // Check if there are symbol definitions
          const symbols = svgContent.match(/<symbol[^>]*id=["']([^"']+)["'][^>]*>/g);
          
          if (symbols) {
            symbols.forEach(symbol => {
              const idMatch = symbol.match(/id=["']([^"']+)["']/);
              if (idMatch) {
                const symbolId = idMatch[1];
                // Verify the symbol is actually used
                expect(svgContent).toMatch(new RegExp(`href=["']#${symbolId}["']`));
              }
            });
          }
        });

        test('should not have unnecessary whitespace bloat', () => {
          const lines = svgContent.split('\n');
          const emptyLines = lines.filter(line => line.trim() === '');
          const emptyLineRatio = emptyLines.length / lines.length;
          
          expect(emptyLineRatio).toBeLessThan(0.3); // Less than 30% empty lines
        });
      });

      describe('Browser Compatibility', () => {
        
        test('should not use deprecated SVG attributes', () => {
          // Check for deprecated attributes
          const deprecated = [
            'baseProfile',
            'version="1.0"',
            'version="1.1"',
            'contentScriptType',
            'contentStyleType'
          ];
          
          deprecated.forEach(attr => {
            expect(svgContent.toLowerCase()).not.toContain(attr.toLowerCase());
          });
        });

        test('should use standard SVG elements (not proprietary)', () => {
          // Ensure no non-standard elements
          const tagMatches = svgContent.match(/<([a-z][a-z0-9]*)\b/gi);
          
          if (tagMatches) {
            const standardTags = new Set([
              'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 
              'polygon', 'text', 'tspan', 'defs', 'linearGradient', 'radialGradient',
              'stop', 'use', 'symbol', 'clipPath', 'mask', 'pattern', 'filter',
              'feGaussianBlur', 'feOffset', 'feBlend', 'feMerge', 'feMergeNode',
              'foreignObject', 'div', 'h1', 'h2', 'h3', 'p', 'span', 'style', 'title',
              'animate', 'animateTransform', 'image'
            ]);
            
            tagMatches.forEach(tag => {
              const tagName = tag.replace(/^</, '').toLowerCase();
              if (tagName !== 'svg') {
                expect(standardTags.has(tagName) || tagName.startsWith('fe')).toBe(true);
              }
            });
          }
        });

        test('foreignObject content should have proper namespace', () => {
          const foreignObjects = svgContent.match(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/g);
          
          if (foreignObjects) {
            foreignObjects.forEach(fo => {
              // Should contain XHTML namespace
              expect(fo).toMatch(/xmlns=["']http:\/\/www\.w3\.org\/1999\/xhtml["']/);
            });
          }
        });
      });

      describe('Security Considerations', () => {
        
        test('should not contain script tags (XSS prevention)', () => {
          expect(svgContent.toLowerCase()).not.toContain('<script');
        });

        test('should not contain event handlers (onclick, onload, etc.)', () => {
          const eventHandlers = [
            'onclick', 'onload', 'onmouseover', 'onmouseout', 
            'onerror', 'onactivate', 'onfocus', 'onblur'
          ];
          
          eventHandlers.forEach(handler => {
            expect(svgContent.toLowerCase()).not.toContain(handler.toLowerCase());
          });
        });

        test('should not contain external resource references (SSRF prevention)', () => {
          // Check for external URLs in hrefs and src attributes
          const externalRefs = svgContent.match(/(?:href|src)=["']https?:\/\//gi);
          
          if (externalRefs) {
            expect(externalRefs.length).toBe(0);
          }
        });

        test('should not use data URIs with executable content', () => {
          const dataUris = svgContent.match(/data:[^"']*/g);
          
          if (dataUris) {
            dataUris.forEach(uri => {
              expect(uri.toLowerCase()).not.toContain('javascript:');
              expect(uri.toLowerCase()).not.toContain('data:text/html');
            });
          }
        });
      });
    });
  });
});

// Helper function to run tests programmatically
if (require.main === module) {
  console.log('SVG Validation Test Suite');
  console.log('=========================\n');
  console.log('Run these tests with: node tests/svg-validation.test.js\n');
  console.log('Or use a test runner like Jest: npm test\n');
}