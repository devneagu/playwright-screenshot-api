import {  clientSlug, getPagePaths, getPlaywrightPageAPI, getScreenshotLocalPath, getScreenshotSectionLocalPath } from "./helpers/index.js";


/**
 * A function to screenshot each page with javascript enabled or disabled, desktop or mobile.
 * @param {isJavascriptEnabled : string , isMobile : boolean} param0
 */
async function screenshotPageHandler({isMobile = false, isJavascriptEnabled = false}){
    
    // Get Pages Paths
    let paths = await getPagePaths();
    // If we don't have any paths, we stop the process
    if(!paths) throw new Error('paths not found');

    // We initialize playwright via a custom function
    const {page,browser} = await getPlaywrightPageAPI(isJavascriptEnabled,isMobile);
    
    // We loop through each path
    for(let i = 0; i < paths.length; i++){
        // We get the slug of the page
        let pageSlug = clientSlug(paths[i]);
        
        await page.goto(pageSlug,{timeout: 8000});
        await page.waitForLoadState('networkidle');

        // find the element to screenshot
        let locators = page.locator('.crayons-story');
        
        for(let j = 0; j < await locators.count(); j++){
            // since we are dealing with an infinite scroll, we'll be breaking the loop after 50 articles. Otherwise it'll be an infinite loop.
            if(j >= 50 ) break;
            
            let locator = locators.nth(j);
            // find more details about the element, we'll use the first anchor tag for the section name.
            let fullUrl = await locator.locator('.crayons-story__hidden-navigation-link').evaluate(el => el.href);
            if(!fullUrl) continue;
            
            // we'll convert the full url to a slug
            let sectionName = new URL(fullUrl).pathname;
            // we'll get the screenshot path 
            let sectionSlug = getScreenshotSectionLocalPath(isJavascriptEnabled,isMobile,sectionName)
            // we'll check if the element is visible, otherwise we'll continue to the next section;
            let isSectionVisible = await locator.isVisible();
            if(!isSectionVisible) continue;

            // we'll take the screenshot of the element
            await locator.screenshot({path : sectionSlug });
        }

        // we'll get the screenshot path
        let slug = getScreenshotLocalPath(paths[i],isJavascriptEnabled,isMobile);
        // we'll take the screenshot of the page
        await page.screenshot({ path: slug , fullPage: true });
    }

    await browser.close();
}

(async() => {
    const promises = [
        // We screenshot the page with javascript enabled and desktop viewports
        screenshotPageHandler({
            isMobile : false,
            isJavascriptEnabled : true
        }),
        // We screenshot the page with javascript enabled and mobile viewports
        screenshotPageHandler({
            isJavascriptEnabled : true,
            isMobile : true
        }),
    ];
    await Promise.all(promises);
    console.log('Process finished...');
})();