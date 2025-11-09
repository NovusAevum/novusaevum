/**
 * Dynamic Badge Workflow Validation Tests
 * 
 * This suite validates the GitHub Actions workflow that generates
 * badge JSON files for shields.io integration.
 * 
 * Tests cover:
 * - Workflow YAML syntax and structure
 * - Badge JSON schema compliance
 * - Color format validation
 * - Label and message content validation
 */

const fs = require('fs');
const path = require('path');

describe('Dynamic Badge Generation Workflow', () => {
  
  let workflowContent;
  const workflowPath = '.github/workflows/dynamic-badges.yml';
  
  beforeAll(() => {
    const fullPath = path.join(process.cwd(), workflowPath);
    workflowContent = fs.readFileSync(fullPath, 'utf8');
  });

  describe('Workflow Structure and Configuration', () => {
    
    test('workflow file should exist and be readable', () => {
      expect(workflowContent).toBeTruthy();
      expect(workflowContent.length).toBeGreaterThan(100);
    });

    test('should have a descriptive workflow name', () => {
      expect(workflowContent).toMatch(/^name:\s*.+/m);
      const nameMatch = workflowContent.match(/^name:\s*(.+)/m);
      expect(nameMatch[1]).toContain('Badge');
    });

    test('should define appropriate triggers (on)', () => {
      expect(workflowContent).toMatch(/^on:/m);
      
      // Should have schedule, workflow_dispatch, or push triggers
      const hasTriggers = 
        workflowContent.includes('schedule:') ||
        workflowContent.includes('workflow_dispatch') ||
        workflowContent.includes('push:');
      
      expect(hasTriggers).toBe(true);
    });

    test('should have cron schedule for daily updates if scheduled', () => {
      if (workflowContent.includes('schedule:')) {
        expect(workflowContent).toMatch(/cron:\s*["'].+["']/);
        
        // Validate cron syntax (5 fields)
        const cronMatch = workflowContent.match(/cron:\s*["']([^"']+)["']/);
        if (cronMatch) {
          const cronFields = cronMatch[1].split(/\s+/);
          expect(cronFields.length).toBe(5);
        }
      }
    });

    test('should run on ubuntu-latest runner', () => {
      expect(workflowContent).toMatch(/runs-on:\s*ubuntu-latest/);
    });

    test('should have proper permissions defined', () => {
      expect(workflowContent).toMatch(/permissions:/);
      expect(workflowContent).toMatch(/contents:\s*write/);
    });

    test('should checkout repository as first step', () => {
      expect(workflowContent).toMatch(/uses:\s*actions\/checkout@/);
    });

    test('should create badges directory', () => {
      expect(workflowContent).toMatch(/mkdir\s+-p\s+assets\/badges/);
    });
  });

  describe('Badge JSON Schema Validation', () => {
    
    // Expected badge types based on workflow
    const expectedBadges = [
      'certifications',
      'domains',
      'partnerships',
      'status',
      'learning'
    ];

    expectedBadges.forEach(badgeName => {
      describe(`${badgeName} badge`, () => {
        
        let badgeJson;
        
        beforeAll(() => {
          // Extract the JSON content from the workflow
          const pattern = new RegExp(
            `cat\\s*>\\s*assets/badges/${badgeName}\\.json\\s*<<\\s*'EOF'([\\s\\S]*?)EOF`,
            'm'
          );
          const match = workflowContent.match(pattern);
          
          if (match) {
            badgeJson = match[1].trim();
          }
        });

        test('should be defined in workflow', () => {
          expect(badgeJson).toBeTruthy();
        });

        test('should be valid JSON format', () => {
          expect(() => JSON.parse(badgeJson)).not.toThrow();
        });

        test('should have required schemaVersion field', () => {
          const parsed = JSON.parse(badgeJson);
          expect(parsed).toHaveProperty('schemaVersion');
          expect(parsed.schemaVersion).toBe(1);
        });

        test('should have required label field', () => {
          const parsed = JSON.parse(badgeJson);
          expect(parsed).toHaveProperty('label');
          expect(typeof parsed.label).toBe('string');
          expect(parsed.label.length).toBeGreaterThan(0);
        });

        test('should have required message field', () => {
          const parsed = JSON.parse(badgeJson);
          expect(parsed).toHaveProperty('message');
          expect(typeof parsed.message).toBe('string');
          expect(parsed.message.length).toBeGreaterThan(0);
        });

        test('should have required color field', () => {
          const parsed = JSON.parse(badgeJson);
          expect(parsed).toHaveProperty('color');
          expect(typeof parsed.color).toBe('string');
        });

        test('color should be valid hex format (without # prefix)', () => {
          const parsed = JSON.parse(badgeJson);
          // Should be 3 or 6 character hex without #
          expect(parsed.color).toMatch(/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/);
          expect(parsed.color).not.toContain('#');
        });

        test('should have required style field', () => {
          const parsed = JSON.parse(badgeJson);
          expect(parsed).toHaveProperty('style');
          expect(typeof parsed.style).toBe('string');
        });

        test('style should be a valid shields.io style', () => {
          const parsed = JSON.parse(badgeJson);
          const validStyles = [
            'flat',
            'flat-square',
            'plastic',
            'for-the-badge',
            'social'
          ];
          expect(validStyles).toContain(parsed.style);
        });

        test('should not have extra/unknown fields', () => {
          const parsed = JSON.parse(badgeJson);
          const knownFields = ['schemaVersion', 'label', 'message', 'color', 'style'];
          const actualFields = Object.keys(parsed);
          
          actualFields.forEach(field => {
            expect(knownFields).toContain(field);
          });
        });

        test('label should be properly capitalized', () => {
          const parsed = JSON.parse(badgeJson);
          // First letter should be uppercase
          expect(parsed.label[0]).toMatch(/[A-Z]/);
        });

        test('message should not be empty or just whitespace', () => {
          const parsed = JSON.parse(badgeJson);
          expect(parsed.message.trim()).not.toBe('');
        });
      });
    });
  });

  describe('Badge Content Validation', () => {
    
    test('certifications badge should show 100+ count', () => {
      const match = workflowContent.match(/certifications\.json[\s\S]*?"message":\s*"([^"]+)"/);
      if (match) {
        expect(match[1]).toContain('100');
      }
    });

    test('domains badge should reference pillars', () => {
      const match = workflowContent.match(/domains\.json[\s\S]*?"message":\s*"([^"]+)"/);
      if (match) {
        expect(match[1].toLowerCase()).toContain('pillar');
      }
    });

    test('partnerships badge should list key partners', () => {
      const match = workflowContent.match(/partnerships\.json[\s\S]*?"message":\s*"([^"]+)"/);
      if (match) {
        const message = match[1];
        expect(message).toMatch(/Google|IBM|AWS/);
      }
    });

    test('status badge should indicate active state', () => {
      const match = workflowContent.match(/status\.json[\s\S]*?"message":\s*"([^"]+)"/);
      if (match) {
        const message = match[1].toUpperCase();
        expect(message).toMatch(/ALWAYS_ON|ACTIVE|AVAILABLE/);
      }
    });

    test('learning badge should emphasize continuous nature', () => {
      const match = workflowContent.match(/learning\.json[\s\S]*?"message":\s*"([^"]+)"/);
      if (match) {
        expect(match[1].toLowerCase()).toContain('continuous');
      }
    });
  });

  describe('Git Operations and Commit Safety', () => {
    
    test('should configure git user for commits', () => {
      expect(workflowContent).toMatch(/git config user\.name/);
      expect(workflowContent).toMatch(/git config user\.email/);
    });

    test('should use github-actions bot identity', () => {
      expect(workflowContent).toMatch(/github-actions\[bot\]/);
    });

    test('should check for changes before committing', () => {
      expect(workflowContent).toMatch(/git status --porcelain/);
    });

    test('should add only badge files to git', () => {
      expect(workflowContent).toMatch(/git add assets\/badges\//);
    });

    test('should have descriptive commit message', () => {
      const commitMatch = workflowContent.match(/git commit -m ["']([^"']+)["']/);
      expect(commitMatch).toBeTruthy();
      expect(commitMatch[1]).toContain('badge');
    });

    test('commit message should skip CI to prevent loops', () => {
      const commitMatch = workflowContent.match(/git commit -m ["']([^"']+)["']/);
      if (commitMatch) {
        expect(commitMatch[1]).toMatch(/\[skip|skip\s+ci|ci skip\]/i);
      }
    });

    test('should push changes to repository', () => {
      expect(workflowContent).toMatch(/git push/);
    });

    test('should handle case when no changes exist', () => {
      expect(workflowContent).toMatch(/No changes/);
    });
  });

  describe('Workflow Output and Reporting', () => {
    
    test('should generate summary for GitHub Actions', () => {
      expect(workflowContent).toMatch(/GITHUB_STEP_SUMMARY/);
    });

    test('should provide success confirmation', () => {
      expect(workflowContent).toMatch(/✓|✅|success/i);
    });

    test('should use always() condition for summary if applicable', () => {
      if (workflowContent.includes('Generate summary')) {
        expect(workflowContent).toMatch(/if:\s*always\(\)/);
      }
    });

    test('summary should list all badge types', () => {
      if (workflowContent.includes('GITHUB_STEP_SUMMARY')) {
        const summarySection = workflowContent.match(/GITHUB_STEP_SUMMARY[\s\S]*?(?=\n\n|\n      -)/);
        if (summarySection) {
          expect(summarySection[0]).toMatch(/Certifications/);
          expect(summarySection[0]).toMatch(/Domains/);
          expect(summarySection[0]).toMatch(/Partnerships/);
        }
      }
    });
  });

  describe('Error Handling and Robustness', () => {
    
    test('heredoc markers should be properly quoted to prevent interpolation', () => {
      const heredocs = workflowContent.match(/<<\s*'?EOF'?/g);
      if (heredocs) {
        heredocs.forEach(heredoc => {
          // Should use quoted EOF to prevent variable expansion
          expect(heredoc).toMatch(/<<\s*'EOF'/);
        });
      }
    });

    test('should handle fetch-depth for git operations', () => {
      if (workflowContent.includes('checkout@')) {
        expect(workflowContent).toMatch(/fetch-depth:/);
      }
    });

    test('should use proper token for authentication', () => {
      expect(workflowContent).toMatch(/token:\s*\$\{\{\s*secrets\.GITHUB_TOKEN/);
    });

    test('shell commands should be safe (no injection vulnerabilities)', () => {
      // Check for proper quoting of variables
      const unsafePatterns = [
        /\$[A-Z_]+(?!\})/,  // Unquoted env vars (except in ${{ }} syntax)
        /`[^`]*\$[^`]*`/     // Command substitution with variables
      ];
      
      unsafePatterns.forEach(pattern => {
        const matches = workflowContent.match(pattern);
        if (matches) {
          // Ensure it's within ${{ }} GitHub Actions syntax
          matches.forEach(match => {
            if (!match.includes('${{')) {
              fail(`Potentially unsafe shell command: ${match}`);
            }
          });
        }
      });
    });
  });

  describe('Workflow Best Practices', () => {
    
    test('should specify checkout action version', () => {
      const checkoutMatch = workflowContent.match(/actions\/checkout@(v\d+)/);
      expect(checkoutMatch).toBeTruthy();
      
      const version = parseInt(checkoutMatch[1].substring(1));
      expect(version).toBeGreaterThanOrEqual(3); // Should use recent version
    });

    test('steps should have descriptive names', () => {
      const stepNames = workflowContent.match(/name:\s*(.+)/g);
      expect(stepNames).toBeTruthy();
      expect(stepNames.length).toBeGreaterThan(3);
      
      stepNames.forEach(name => {
        const stepName = name.replace('name:', '').trim();
        expect(stepName.length).toBeGreaterThan(5);
      });
    });

    test('should use appropriate shell for scripts', () => {
      const runBlocks = workflowContent.match(/run:\s*\|[\s\S]*?(?=\n\n|\n      -)/g);
      if (runBlocks) {
        // Multi-line run blocks should work with default shell
        expect(runBlocks.length).toBeGreaterThan(0);
      }
    });

    test('workflow should complete within reasonable time', () => {
      // Check if there are any sleep or wait commands that could slow things down
      expect(workflowContent.toLowerCase()).not.toMatch(/sleep\s+[5-9]\d+/); // No sleep > 50s
    });
  });

  describe('Integration with Shields.io', () => {
    
    test('JSON structure should be compatible with shields.io endpoint', () => {
      const jsonBlocks = workflowContent.match(/<<\s*'EOF'([\s\S]*?)EOF/g);
      
      if (jsonBlocks) {
        jsonBlocks.forEach(block => {
          const jsonContent = block.replace(/<<\s*'EOF'/, '').replace('EOF', '').trim();
          
          if (jsonContent.startsWith('{')) {
            const parsed = JSON.parse(jsonContent);
            
            // Shields.io endpoint requires these exact fields
            expect(parsed).toHaveProperty('schemaVersion');
            expect(parsed).toHaveProperty('label');
            expect(parsed).toHaveProperty('message');
            expect(parsed).toHaveProperty('color');
          }
        });
      }
    });

    test('badge files should be in correct directory for endpoint', () => {
      expect(workflowContent).toMatch(/assets\/badges\/[a-z-]+\.json/);
    });

    test('color values should render properly in shields.io', () => {
      const colorMatches = workflowContent.match(/"color":\s*"([^"]+)"/g);
      
      if (colorMatches) {
        colorMatches.forEach(match => {
          const color = match.match(/"color":\s*"([^"]+)"/)[1];
          
          // Should be valid hex color (no special chars that could break rendering)
          expect(color).toMatch(/^[0-9a-fA-F]{3,6}$/);
        });
      }
    });
  });
});

// Helper to run tests
if (require.main === module) {
  console.log('Badge Workflow Validation Test Suite');
  console.log('=====================================\n');
  console.log('Run these tests with: node tests/badge-workflow-validation.test.js\n');
}