// Import playwright Library
import playwright from "playwright";
import { CONSTANTS } from "./constants.js";

// Import node-fetch if you need to fetch your paths from an API.
// import fetch from 'node-fetch';


// We'll be screenshotting the pages with an emulator(iPhone 12 Pro) and Desktop mode
// For more information about the devices, check out the playwright docs via config file.
const iPhone12Pro = playwright.devices['iPhone 12 Pro'];
export const getViewport = (javaScriptEnabled,mobile) => mobile ? {
        viewport: iPhone12Pro.viewport,
        userAgent: iPhone12Pro.userAgent,
        javaScriptEnabled
    } : {
        javaScriptEnabled
    }
export const getViewportArguments = (isMobile)  => isMobile ? [] : ['--start-maximized'];

// Get Page paths from the API
// For the sake of the example, I'm using a fake API
// which returns an array of paths.
/**
 * A function to get the paths of the pages to screenshot.
*/ 
export const getPagePaths =  async () => CONSTANTS.paths;

// Get the Page and Browser Instance of Playwright API.
export const getPlaywrightPageAPI = async (isJavascriptEnabled,isMobile) => {
    // We'll be using Chromium for this example and we'll be using the iPhone 12 Pro Emulator viewports.
    let viewport = getViewport(isJavascriptEnabled,isMobile);
    // If we have a desktop viewport, we'll be maximizing the window.
    let viewportArguments = getViewportArguments(isMobile);

    // launch the browser
    const browser = await playwright.chromium.launch(
        {
            headless: false,
            ...viewport,
            args : [
                '--window-position=0,0',
                ...viewportArguments
            ]
        }
    );
    // create the context with the viewport
    const context = await browser.newContext(viewport);
    const page = await context.newPage();
    // return the page and browser instance
    return { page, browser};
}


/**
 * Converts the slug to a filename
 * For example: /about => about
 * /about-us => about-us
 * @param {string} slug 
 * @returns {string} filename
 */
export const pathToFileName = (slug) => {
    return slug.substring(1).replace('/','-') 
}


/**
 * A function which constructs the page that will be screenshotted.
 * @param {string} slug
 * @return {string} fullSlug
*/ 
export const clientSlug = (slug) => `${CONSTANTS.origin}/${slug}`


export const getScreenshotLocalPath = (path,isJavascriptEnabled,isMobile) => {
    let urlScreenshot = pathToFileName(path);
    if(urlScreenshot === '') urlScreenshot = 'homepage';
    urlScreenshot += '.jpg';
    let slug = './screenshots/';
    if(isMobile){
        slug += 'mobile/';
    }else {
        slug += 'desktop/';
    }
    if(!isJavascriptEnabled){
        slug += 'no-js/';
    }else {
        slug += 'js/';
    }
    slug = slug + 'pages/'
    slug += urlScreenshot;

    return slug;
}

export const getScreenshotSectionLocalPath = (isJavascriptEnabled,isMobile,section) => {
    let slug = './screenshots/';
    if(isMobile){
        slug += 'mobile/';
    }else {
        slug += 'desktop/';
    }
    if(!isJavascriptEnabled){
        slug += 'no-js/';
    }else {
        slug += 'js/';
    }
    slug += 'sections/';
    slug += section + '.jpg';
    return slug;
}