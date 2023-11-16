import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import path from "path";

async function scrapeAndSaveData(
  filePathsOrUrls: string[],
  outputPath: string
) {
  const browser = await puppeteer.launch({ headless: "new" });

  const processFn = async (filePathOrUrl: string) => {
    console.log(`Processing: ${filePathOrUrl}`);
    const page = await loadPage(filePathOrUrl, browser);
    if (!page) {
      return null;
    }

    try {
      const scrapedData = await scrapeData(page);
      const companyName = extractCompanyName(filePathOrUrl);
      return { ...scrapedData, companyName };
    } catch (error) {
      console.error(`Error processing '${filePathOrUrl}':`, error);
      return null;
    } finally {
      await page.close();
    }
  };

  const results = await processArrayInBatches(filePathsOrUrls, 10, processFn);

  await browser.close();

  // Save the results to a JSON file
  try {
    // TODO: One file fail's, looks like a redirect unsure how to make it follow it
    const filteredResults = results.filter((result: any) => result !== null);
    fs.writeFileSync(outputPath, JSON.stringify(filteredResults, null, 2));
  } catch (error) {
    console.error("Error writing file:", error);
  }
}

const isUrl = (filePathOrUrl: string) =>
  filePathOrUrl.startsWith("http") || filePathOrUrl.startsWith("https");

async function loadPage(
  filePathOrUrl: string,
  browser: Browser
): Promise<Page | null> {
  const page = await browser.newPage();

  try {
    if (isUrl(filePathOrUrl)) {
      await page.goto(filePathOrUrl, {
        waitUntil: "domcontentloaded",
      });
    } else {
      await page.goto(`file://${filePathOrUrl}`, {
        waitUntil: "domcontentloaded",
      });
    }

    return page;
  } catch (error) {
    console.error(`Error loading URL '${filePathOrUrl}':`, error);
    await page.close();
    return null;
  }
}

function extractCompanyName(fileOrUrl: string): string {
  if (isUrl(fileOrUrl)) {
    const url = new URL(fileOrUrl);
    const hostnameParts = url.hostname.split(".");
    const topLevelDomainIndex = hostnameParts.length - 1;
    // Remove subdomains, protocol, and 'www.' if present
    if (hostnameParts.length > 2) {
      hostnameParts.splice(0, topLevelDomainIndex - 1);
      if (hostnameParts[0] === "www") {
        hostnameParts.shift();
      }
    }
    return hostnameParts.join(".");
  } else {
    const parts = fileOrUrl.replace(`${dataDirectoryPath}/`, "").replace(".html", "").split(".");

    if (parts.length > 0) {
    }

    return parts[0];
  }
}

async function checkForDrift(page: Page): Promise<boolean> {
  const isDriftInitialized = await page.evaluate(() => {
    if (typeof drift !== "undefined" && drift.on) {
      return true;
    }

    const scriptElements = Array.from(document.querySelectorAll("script"));
    const hasDriftScript = scriptElements.some((element) => {
      return element.src.includes("js.driftt.com");
    });

    if (hasDriftScript) {
      return true;
    }

    const driftInitializationScripts = scriptElements.filter((element: any) => {
      return (
        element.textContent.includes("drift.SNIPPET_VERSION") ||
        element.textContent.includes("drift.load")
      );
    });

    if (driftInitializationScripts.length > 0) {
      return true;
    }

    const linkElements = Array.from(document.querySelectorAll("link"));
    const hasDriftLink = linkElements.some((element) => {
      return element.href.includes("js.driftt.com");
    });

    if (hasDriftLink) {
      return true;
    }

    const driftController =
      document.querySelector("#drift-widget") ||
      document.querySelector(".drift-open-chat") ||
      document.querySelector(".drift-frame-controller");
    
    if (driftController) {
      return true;
    }

    return false;
  });

  return isDriftInitialized;
}


async function checkForSalesforceLiveAgent(page: Page): Promise<boolean> {
  const isSalesforceLiveAgentUsed = await page.evaluate(() => {
    const pageHTML = document.documentElement.outerHTML;
    const scripts = Array.from(document.querySelectorAll("script")).map(
      (script) => script.src
    );

    const containsSalesforceLiveAgent =
      pageHTML.includes("salesforceliveagent.com") ||
      scripts.some((src) => src.includes("salesforceliveagent.com"));

    return containsSalesforceLiveAgent;
  });

  return isSalesforceLiveAgentUsed;
}


async function scrapeData(page: Page): Promise<any> {
  const hasDrift = await checkForDrift(page);
  const hasSalesForce = await checkForSalesforceLiveAgent(page);

  const chatApp = hasDrift
    ? "Drift"
    : hasSalesForce
    ? "Salesforce Live Agent"
    : "No chat";

  return { chatApp, hasDrift, hasSalesForce };
}

function getFilesToScrape(directoryPath: string): string[] {
  const files = fs.readdirSync(directoryPath);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  const filePaths = htmlFiles.map((file) => path.join(directoryPath, file));

  return filePaths;
}

async function processArrayInBatches<T>(
  array: T[],
  batchSize: number,
  asyncFn: (item: T) => Promise<any>
): Promise<any> {
  const results: any[] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(asyncFn));
    results.push(...batchResults);
  }
  return results;
}

// Local path to files in this excercise, however we might want to provide a list of URLs instead.
const dataDirectoryPath = path.join(__dirname, "data");
const filesOrUrlsToScrape = getFilesToScrape(dataDirectoryPath);
const outputPath = path.join(__dirname, "output", "scraped_data.json");

scrapeAndSaveData(filesOrUrlsToScrape, outputPath)
  .then(() => {
    console.log("Scraping completed and data saved to JSON.");
  })
  .catch((error) => {
    console.error("Error during scraping:", error);
  });
