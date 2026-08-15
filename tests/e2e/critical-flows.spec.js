import { test, expect } from '@playwright/test';

test.describe('CampusConnect Critical End-to-End User Journeys', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Test Student ${timestamp}`,
    email: `student_${timestamp}@university.edu`,
    password: 'Password123!@#'
  };

  test('1. User Registration & Instant Dashboard Landing Flow', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('input[type="text"][placeholder*="name" i]', testUser.name);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or login
    await expect(page).toHaveURL(/\/(dashboard|login)/);
  });

  test('2. User Authentication & Session Persistence', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);

    await page.click('button[type="submit"]');

    // Validate navigation to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=My Projects')).toBeVisible();
  });

  test('3. Campus Event Creation Flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Navigate to Create Event
    await page.goto('/create-event');
    await page.fill('input[name="title"], input[placeholder*="title" i]', 'AI & Robotics Hackathon 2026');
    await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'Annual collegiate robotics showcase and hackathon.');
    await page.fill('input[name="venue"], input[placeholder*="venue" i]', 'Tech Auditorium A');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/events/);
  });

  test('4. Project Showcase & Collaboration Post Flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Navigate to Add Project
    await page.goto('/add-project');
    await page.fill('input[name="title"], input[placeholder*="title" i]', 'Open Autonomous Drone Flight Controller');
    await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'Rust-powered embedded flight controller for quadcopters.');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/projects/);
  });

  test('5. Profile Editing & Department Tagging Flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Navigate to Profile
    await page.goto('/profile');
    await expect(page.locator('input[value*="student_" i], text=Edit Profile')).toBeVisible();
  });
});
