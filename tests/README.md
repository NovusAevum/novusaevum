# Test Suite for GitHub Profile Assets

This directory contains comprehensive test suites for validating the SVG assets and badge generation workflow in the GitHub profile repository.

## Overview

The test suite validates:

1. **SVG Header Files** (`svg-validation.test.js`)
   - XML structure and well-formedness
   - Accessibility compliance (WCAG 2.1 AA)
   - Responsive design attributes
   - CSS animations and styling
   - Color and visual design
   - Performance optimization
   - Browser compatibility
   - Security considerations

2. **Badge Generation Workflow** (`badge-workflow-validation.test.js`)
   - YAML workflow syntax and structure
   - Badge JSON schema compliance (shields.io)
   - Color format validation
   - Git operations safety
   - Error handling
   - Integration with shields.io

3. **Metrics SVG** (`metrics-svg-validation.test.js`)
   - Statistics accuracy
   - Data visualization integrity
   - Activity calendar validation
   - Progress bar accuracy
   - Icon and path validation

## Test Files

- **`svg-validation.test.js`**: 100+ tests for SVG header files
- **`badge-workflow-validation.test.js`**: 80+ tests for GitHub Actions workflow
- **`metrics-svg-validation.test.js`**: 60+ tests for metrics.svg file
- **`package.json`**: Test configuration and dependencies
- **`README.md`**: This file

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
cd tests
npm install
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# SVG validation only
npm run test:svg

# Badge workflow validation only
npm run test:badges

# Metrics SVG validation only
npm run test:metrics
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

## Test Structure

### SVG Validation Tests

The SVG validation suite covers:

- **XML Structure**: Proper opening/closing tags, nesting, namespace
- **Accessibility**: role, aria-label, title elements, screen reader support
- **Responsive Design**: viewBox, preserveAspectRatio, media queries
- **Animations**: @keyframes definitions, timing, delays
- **Colors**: Valid formats, gradients, opacity
- **Performance**: File size, optimization, reusability
- **Security**: XSS prevention, no external resources, no event handlers

### Badge Workflow Tests

The workflow validation suite covers:

- **Structure**: YAML syntax, triggers, jobs, steps
- **JSON Schema**: shields.io compliance, required fields
- **Content**: Label/message validation, color formats
- **Git Operations**: Commit safety, proper attribution
- **Error Handling**: Robust execution, proper error messages
- **Best Practices**: Version pinning, descriptive names

### Metrics SVG Tests

The metrics validation suite covers:

- **File Structure**: Valid SVG, proper formatting
- **Statistics**: Commit counts, PR counts, storage usage
- **Visualizations**: Calendar grid, progress bars, icons
- **Data Consistency**: Logical relationships, no negative values
- **Accessibility**: Color contrast, semantic markup

## Key Testing Principles

### 1. Comprehensive Coverage

Tests cover happy paths, edge cases, and potential failure scenarios:

```javascript
test('viewBox should have valid format (4 numeric values)', () => {
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
  expect(viewBoxMatch).toBeTruthy();
  
  const values = viewBoxMatch[1].trim().split(/\s+/);
  expect(values).toHaveLength(4);
  
  values.forEach(val => {
    expect(parseFloat(val)).not.toBeNaN();
  });
});
```

### 2. Standards Compliance

Tests enforce web standards and best practices:

```javascript
test('should have role="img" attribute on root SVG element', () => {
  const svgTagMatch = svgContent.match(/<svg[^>]*>/);
  expect(svgTagMatch).toBeTruthy();
  expect(svgTagMatch[0]).toMatch(/role=["']img["']/);
});
```

### 3. Security Validation

Tests check for security vulnerabilities:

```javascript
test('should not contain script tags (XSS prevention)', () => {
  expect(svgContent.toLowerCase()).not.toContain('<script');
});

test('should not contain event handlers', () => {
  const eventHandlers = ['onclick', 'onload', 'onmouseover'];
  eventHandlers.forEach(handler => {
    expect(svgContent.toLowerCase()).not.toContain(handler);
  });
});
```

### 4. Accessibility First

Tests ensure content is accessible:

```javascript
test('aria-label should be descriptive (not empty)', () => {
  const ariaLabelMatch = svgContent.match(/aria-label=["']([^"']+)["']/);
  expect(ariaLabelMatch).toBeTruthy();
  expect(ariaLabelMatch[1].length).toBeGreaterThan(10);
});
```

## Extending the Tests

### Adding New Test Cases

To add new tests, follow this pattern:

```javascript
describe('New Feature Category', () => {
  test('should validate specific behavior', () => {
    // Arrange
    const data = extractDataFromContent();
    
    // Act
    const result = validateData(data);
    
    // Assert
    expect(result).toBeTruthy();
  });
});
```

### Testing New SVG Files

Add new files to the `SVG_FILES` array in `svg-validation.test.js`:

```javascript
const SVG_FILES = [
  'assets/headers/certifications-header.svg',
  'assets/headers/new-header.svg', // Add new file here
  // ...
];
```

### Testing New Badge Types

Add validation for new badges in `badge-workflow-validation.test.js`:

```javascript
const expectedBadges = [
  'certifications',
  'domains',
  'new-badge-type', // Add new badge here
  // ...
];
```

## Continuous Integration

These tests can be integrated into GitHub Actions:

```yaml
name: Test Profile Assets

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd tests && npm install
      - name: Run tests
        run: cd tests && npm test
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "file not found"
**Solution**: Ensure you're running tests from the repository root or adjust paths in test files

**Issue**: Jest not found
**Solution**: Run `npm install` in the tests directory

**Issue**: Tests timeout
**Solution**: Increase Jest timeout in package.json or individual tests

### Debug Mode

Run tests with additional logging:

```bash
DEBUG=* npm test
```

## Test Metrics

Current test statistics:
- **Total Tests**: 240+
- **SVG Validation**: 100+ tests per file (6 files = 600+ checks)
- **Workflow Validation**: 80+ tests
- **Metrics Validation**: 60+ tests
- **Coverage Target**: > 90%

## Best Practices

1. **Write descriptive test names** that explain what is being tested
2. **Test one thing per test** to make failures easy to diagnose
3. **Use beforeAll/beforeEach** for common setup
4. **Mock external dependencies** when necessary
5. **Keep tests independent** - no test should depend on another
6. **Update tests** when requirements change

## Contributing

When adding new features to the profile assets:

1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add documentation for new test cases
4. Maintain > 90% code coverage
5. Follow the existing test structure and conventions

## License

MIT License - See repository LICENSE file for details

## Contact

For questions or issues with the test suite, please open an issue in the repository.

---

**Note**: These tests are designed to be comprehensive and enforce best practices for web accessibility, security, and performance. They serve as both validation tools and documentation of expected behavior.