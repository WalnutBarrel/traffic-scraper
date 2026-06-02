import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { addCrawlJob } from './queue/crawlQueue';

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
  origin: true // allow all origins for local dev
});

const prisma = new PrismaClient();

fastify.post('/api/crawl', async (request, reply) => {
  const { url } = request.body as { url: string };
  
  try {
    // Basic domain extraction
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Check if website already exists or create it
    let website = await prisma.website.findUnique({ where: { domain } });
    if (!website) {
      website = await prisma.website.create({
        data: { domain, status: 'PENDING' }
      });
    } else {
      await prisma.website.update({
        where: { id: website.id },
        data: { status: 'PENDING' }
      });
    }

    // Add job to BullMQ
    const job = await addCrawlJob(url, website.id);
    
    return { success: true, websiteId: website.id, jobId: job.id };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: 'Failed to create crawl job' });
  }
});

fastify.get('/api/crawl/:websiteId', async (request, reply) => {
  const { websiteId } = request.params as { websiteId: string };
  
  try {
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: { 
        pages: {
          include: {
            keywords: true
          }
        } 
      }
    });
    
    if (!website) {
      return reply.status(404).send({ error: 'Website not found' });
    }
    
    return { success: true, website };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: 'Failed to fetch crawl status' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
