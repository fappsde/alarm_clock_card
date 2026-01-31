/**
 * Version Consistency Test
 *
 * CRITICAL: This test verifies that all version declarations match,
 * preventing version skew that causes stale cached resources.
 *
 * For the frontend-only repository:
 * - package.json is the single source of truth
 * - alarm-clock-card.js CARD_VERSION must match
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Version Consistency Test', () => {
  const rootDir = join(process.cwd());

  it('should have matching versions in package.json and card', () => {
    // Read package.json (single source of truth for frontend-only repo)
    const packagePath = join(rootDir, 'package.json');
    const packageContent = readFileSync(packagePath, 'utf-8');
    const packageJson = JSON.parse(packageContent);
    const packageVersion = packageJson.version;

    expect(packageVersion).toBeDefined();
    expect(packageVersion).toMatch(/^\d+\.\d+\.\d+$/); // Semantic versioning

    // Read frontend card
    const cardPath = join(rootDir, 'alarm-clock-card.js');
    const cardContent = readFileSync(cardPath, 'utf-8');

    // Extract CARD_VERSION from the card
    const versionMatch = cardContent.match(/const CARD_VERSION = ["']([^"']+)["']/);
    expect(versionMatch).toBeTruthy();

    const cardVersion = versionMatch ? versionMatch[1] : null;
    expect(cardVersion).toBe(packageVersion);
  });

  it('should not have version skew between files', () => {
    const packagePath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    const packageVersion = packageJson.version;

    const cardPath = join(rootDir, 'alarm-clock-card.js');
    const cardContent = readFileSync(cardPath, 'utf-8');
    const cardVersionMatch = cardContent.match(/const CARD_VERSION = ["']([^"']+)["']/);
    const cardVersion = cardVersionMatch ? cardVersionMatch[1] : null;

    // All versions must match exactly
    expect(cardVersion).toBe(packageVersion);

    // Success: no version skew possible
  });

  it('should have semantic version format', () => {
    const packagePath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    const version = packageJson.version;

    // Must be semantic versioning: X.Y.Z
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);

    // Must not be 0.0.0
    expect(version).not.toBe('0.0.0');
  });

  it('should have version in card registration', async () => {
    // Import the card
    await import('../alarm-clock-card.js');

    // Check window.customCards
    const alarmCard = window.customCards.find(c => c.type === 'alarm-clock-card');

    expect(alarmCard).toBeDefined();
    expect(alarmCard.version).toBeDefined();
    expect(alarmCard.version).toMatch(/^\d+\.\d+\.\d+$/);

    // Verify it matches package.json
    const packagePath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

    expect(alarmCard.version).toBe(packageJson.version);
  });

  it('should fail build if versions diverge', () => {
    /**
     * This test enforces that CI MUST fail if versions don't match.
     * Human error must not be able to reintroduce version skew.
     */

    const packagePath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    const packageVersion = packageJson.version;

    const cardPath = join(rootDir, 'alarm-clock-card.js');
    const cardContent = readFileSync(cardPath, 'utf-8');
    const cardVersionMatch = cardContent.match(/const CARD_VERSION = ["']([^"']+)["']/);
    const cardVersion = cardVersionMatch ? cardVersionMatch[1] : null;

    // If any version doesn't match, this test fails and blocks CI
    if (cardVersion !== packageVersion) {
      throw new Error(
        `VERSION SKEW DETECTED!\n` +
        `  package.json: ${packageVersion}\n` +
        `  alarm-clock-card.js: ${cardVersion}\n` +
        `All versions must match. Update the version in package.json ` +
        `and ensure it propagates to alarm-clock-card.js.`
      );
    }

    expect(cardVersion).toBe(packageVersion);
  });
});
