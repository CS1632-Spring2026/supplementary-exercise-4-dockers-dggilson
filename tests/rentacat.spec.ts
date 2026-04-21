import { test, expect } from '@playwright/test';
const BASE_URL = 'http://localhost:8080/';

// Test fixture 
test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  
  // Set cookies to false (no cats are rented)
  await page.evaluate(() => {
    document.cookie = "1=false";
    document.cookie = "2=false";
    document.cookie = "3=false";
  });
});

test('TEST-1-RESET', async ({ page }) => {
  // all cats to rented 
  await page.evaluate(() => {
    document.cookie = "1=true";
    document.cookie = "2=true";
    document.cookie = "3=true";
  });
  
  // Press the "Reset" link
  await page.click('a[href="/reset"]');
  
  // Verify all cats are available
  const listItems = await page.locator('#listing li').allTextContents();
  expect(listItems[0]).toContain('ID 1. Jennyanydots');
  expect(listItems[1]).toContain('ID 2. Old Deuteronomy');
  expect(listItems[2]).toContain('ID 3. Mistoffelees');
});

test('TEST-2-CATALOG', async ({ page }) => {
  // "Catalog" link is pressed
  await page.click('a[href="/"]');
  
  //  Verify image source is cat2.jpg
  const secondImage = page.locator('img').nth(1);
  await expect(secondImage).toHaveAttribute('src', '/images/cat2.jpg');
});

test('TEST-3-LISTING', async ({ page }) => {
  // Press the "Catalog" link
  await page.click('a[href="/"]');
  
  // Verify listing has 3 cats and third is Mistoffelees
  const listItems = page.locator('#listing li');
  await expect(listItems).toHaveCount(3);
  await expect(listItems.nth(2)).toHaveText('ID 3. Mistoffelees');
});

test('TEST-4-RENT-A-CAT', async ({ page }) => {
  // Press the "Rent-A-Cat" link
  await page.click('a[href="/rent-a-cat"]');
  
  // Verify Rent and Return buttons exist
  await expect(page.getByRole('button', { name: 'Rent' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Return' })).toBeVisible();
});

test('TEST-5-RENT', async ({ page }) => {
  //Press the "Rent-A-Cat" link
  await page.click('a[href="/rent-a-cat"]');
  
  //Enter "1" into the input box for the rented cat ID
  await page.getByTestId('rentID').fill('1');
  
  //Press the "Rent" button
  await page.getByRole('button', { name: 'Rent' }).click();
  
  //Verify listing and success message
  const listItems = await page.locator('#listing li').allTextContents();
  expect(listItems[0]).toContain('Rented out');
  expect(listItems[1]).toContain('ID 2. Old Deuteronomy');
  expect(listItems[2]).toContain('ID 3. Mistoffelees');
  await expect(page.getByTestId('rentResult')).toHaveText('Success!');
});

test('TEST-6-RETURN', async ({ page }) => {
  //Set cats 2 and 3 to rented
  await page.evaluate(() => {
    document.cookie = "2=true";
    document.cookie = "3=true";
  });
  // Press the "Rent-A-Cat" link
  await page.click('a[href="/rent-a-cat"]');
  
  // Enter "2" into the input box for the returned cat ID
  await page.getByTestId('returnID').fill('2');
  
  // Press the "Return" button
  await page.getByRole('button', { name: 'Return' }).click();
  
  const listItems = await page.locator('#listing li').allTextContents();
  expect(listItems[0]).toContain('ID 1. Jennyanydots');
  expect(listItems[1]).toContain('ID 2. Old Deuteronomy');
  expect(listItems[2]).toContain('Rented out');
  await expect(page.getByTestId('returnResult')).toHaveText('Success!');
});

test('TEST-7-FEED-A-CAT', async ({ page }) => {
  // Feed-A-Cat" link
  await page.click('a[href="/feed-a-cat"]');
  
  // Verify Feed button 
  await expect(page.getByRole('button', { name: 'Feed' })).toBeVisible();
});

test('TEST-8-FEED', async ({ page }) => {

  // Press the "Feed-A-Cat" link
  await page.click('a[href="/feed-a-cat"]');
  
  //Enter "6" into the input box 
  await page.getByTestId('catnips').fill('6');
  
  //Press the "Feed" button
  await page.getByRole('button', { name: 'Feed' }).click();
  
  //Verify "Nom, nom, nom." appears (with 10 second timeout)
  await expect(page.getByTestId('feedResult')).toHaveText('Nom, nom, nom.', { timeout: 10000 });
});

test('TEST-9-GREET-A-CAT', async ({ page }) => {
  //Press the "Greet-A-Cat" link
  await page.click('a[href="/greet-a-cat"]');
  
  // Verify "Meow!Meow!Meow!" appears
  await expect(page.locator('body')).toContainText('Meow!Meow!Meow!');
});

test('TEST-10-GREET-A-CAT-WITH-NAME', async ({ page }) => {
  //Navigate to /greet-a-cat/Jennyanydots
  await page.goto(`${BASE_URL}greet-a-cat/Jennyanydots`);
  
  //Verify greeting message appears
  await expect(page.locator('body')).toContainText('Meow! from Jennyanydots.');
});

test('TEST-11-FEED-A-CAT-SCREENSHOT', async ({ page }) => {
  //Set all cats to rented
  await page.evaluate(() => {
    document.cookie = "1=true";
    document.cookie = "2=true";
    document.cookie = "3=true";
  });
  
  //Press the "Feed-A-Cat" link
  await page.click('a[href="/feed-a-cat"]');
  
  //Verify screenshot matches
  await expect(page.locator('body')).toHaveScreenshot();
});

// DEFECT TEST CASES 

// //DEFECT FOUND
// test('DEFECT1-FUN-GREET-A-CAT-WITH-NAME', async ({ page }) => {
//   await page.evaluate(() => {
//     document.cookie = "1=true";
//   });
  
//   await page.goto(`${BASE_URL}greet-a-cat/Jennyanydots`);

//   await expect(page.locator('body')).toContainText('Jennyanydots is not here.');
// });

// //0 cat nip produces nom nom
// test('DEFECT2-FUN-FEED', async ({ page }) => {
//   await page.click('a[href="/feed-a-cat"]');
//   await page.getByTestId('catnips').fill('0');
//   await page.getByRole('button', { name: 'Feed' }).click();
  
//   //show "Cat fight!" because 0 is not positive
//   await expect(page.getByTestId('feedResult')).toHaveText('Cat fight!', { timeout: 10000 });
// });

// //greet a cat always displays 3 meows
// test('DEFECT3-FUN-GREET-A-CAT', async ({ page }) => {
//   // Rent cats 1 and 2,
//   await page.evaluate(() => {
//     document.cookie = "1=true";
//     document.cookie = "2=true";
//   });
  
  
//   await page.click('a[href="/greet-a-cat"]');
  
//   // Should show only 1 "Meow!" since only 1 cat is available
//   await expect(page.locator('body')).toContainText('Meow!');

//   await expect(page.locator('body')).not.toContainText('Meow!Meow!Meow!');
//   const bodyText = await page.locator('body').textContent();
//   const meowCount = (bodyText?.match(/Meow!/g) || []).length;
//   expect(meowCount).toBe(1);
// });