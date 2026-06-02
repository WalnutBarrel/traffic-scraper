import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const crawlQueue = new Queue('crawl-queue', { connection });

export async function addCrawlJob(url: string, websiteId: string) {
  return crawlQueue.add('crawl', { url, websiteId });
}
