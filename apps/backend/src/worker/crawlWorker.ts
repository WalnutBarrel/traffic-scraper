import { Worker } from 'bullmq';
import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const worker = new Worker('crawl-queue', async job => {
  const { url, websiteId } = job.data;
  console.log(`Starting crawl for ${url}`);

  let browser;
  try {
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'CRAWLING' }
    });

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    const statusCode = response?.status() || 200;

    // Extract basic page data
    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => null);
    
    // Count words in body
    const bodyText = await page.$eval('body', el => el.innerText);
    const wordCount = bodyText.split(/\s+/).length;

    // Create Page record
    const pageRecord = await prisma.page.create({
      data: {
        websiteId,
        url,
        title,
        description,
        wordCount,
        statusCode
      }
    });

    // Extract H1, H2, H3
    const headings = await page.$$eval('h1, h2, h3', els => els.map(el => ({
      tagName: el.tagName,
      text: (el.textContent || '').trim()
    })));

    if (headings.length > 0) {
      await prisma.heading.createMany({
        data: headings.filter(h => h.text.length > 0).map(h => ({
          pageId: pageRecord.id,
          type: h.tagName,
          text: h.text
        }))
      });
    }

    // Extract Internal Links
    const links = await page.$$eval('a', els => els.map(el => ({
      href: el.getAttribute('href'),
      text: (el.textContent || '').trim()
    })));

    const urlObj = new URL(url);
    const internalLinks = links.filter(l => {
      if (!l.href) return false;
      try {
        const linkUrl = new URL(l.href, url);
        return linkUrl.hostname === urlObj.hostname;
      } catch {
        return false;
      }
    });

    if (internalLinks.length > 0) {
      await prisma.link.createMany({
        data: internalLinks.map(l => ({
          sourcePageId: pageRecord.id,
          targetUrl: new URL(l.href!, url).href,
          anchorText: l.text
        }))
      });
    }

    // Extract Keywords using Compromise
    // Require here since compromise doesn't have built-in types for all submodules by default
    const nlp = require('compromise');
    const doc = nlp(bodyText);
    
    // Get top nouns/topics by frequency
    const terms = doc.nouns().out('frequency');
    // terms is an array: [{ normal: 'keyword', count: 5 }, ...]
    const topTerms = terms.slice(0, 15);

    if (topTerms.length > 0) {
      await prisma.keyword.createMany({
        data: topTerms.map((t: any) => ({
          pageId: pageRecord.id,
          term: t.normal,
          score: t.count,
          type: 'primary'
        }))
      });
    }

    // Update website status
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'COMPLETED' }
    });

    console.log(`Successfully crawled ${url}`);
  } catch (error) {
    console.error(`Failed to crawl ${url}`, error);
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'FAILED' }
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}, { connection });

worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});

console.log('Worker is running and waiting for jobs...');
