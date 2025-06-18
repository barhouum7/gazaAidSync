import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { newsService } from '@/lib/services/news-service';
import { ReliefLocationType, LocationStatus } from '@/types/map';
import crypto from 'crypto';

// Helper to generate a stable ID for upserting based on content
const generateStableId = (content: string, link?: string): string => {
    if (link) {
        return crypto.createHash('sha256').update(link).digest('hex');
    }
    return crypto.createHash('sha256').update(content).digest('hex');
};

export async function POST(req: NextRequest) {
    try {
        // Ensure the request is from a trusted source
        // Check for secret
        const auth = req.headers.get('authorization');
        const expected = `Bearer ${process.env.INGEST_SECRET}`;
        if (auth !== expected) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting data ingestion process...');

        const updates = await newsService.getLatestUpdates();
        let upsertedCount = 0;
        let deletedCount = 0;

        for (const update of updates) {
            const { location, type, needs, status, placeName } = newsService.extractLocationInfo(update.content);

            if (location && type) { // Ensure we have enough data to create an AidPoint
                const stableId = generateStableId(update.content, update.link);

                try {
                    await prismadb.aidPoint.upsert({
                        where: { newsLinkId: stableId },
                        update: {
                            name: placeName || (typeof location[0] === 'number' && typeof location[1] === 'number'
                            ? `${type} - ${location[0].toFixed(4)}, ${location[1].toFixed(4)}`
                            : `Unnamed ${type} Location`),
                            description: update.content,
                            latitude: location[0],
                            longitude: location[1],
                            needs: JSON.stringify(needs || []), // Store needs as JSON string
                            ngoLink: update.link,
                            category: type,
                            status: status || LocationStatus.ACTIVE,
                            lastUpdated: new Date(), // Update timestamp
                        },
                        create: {
                            newsLinkId: stableId,
                            name: placeName || (typeof location[0] === 'number' && typeof location[1] === 'number'
                            ? `${type} - ${location[0].toFixed(4)}, ${location[1].toFixed(4)}`
                            : `Unnamed ${type} Location`),
                            description: update.content,
                            latitude: location[0],
                            longitude: location[1],
                            needs: JSON.stringify(needs || []), // Store needs as JSON string
                            ngoLink: update.link,
                            category: type,
                            status: status || LocationStatus.ACTIVE,
                            lastUpdated: new Date(),
                            createdAt: new Date(),
                        },
                    });
                    upsertedCount++;
                } catch (dbError) {
                    console.error(`Error upserting AidPoint for ${stableId}:`, dbError);
                }
            }
        }

        // Data Retention: Delete records older than 90 days (adjust as needed)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const deleteResult = await prismadb.aidPoint.deleteMany({
            where: {
                createdAt: {
                    lt: ninetyDaysAgo,
                },
            },
        });
        deletedCount = deleteResult.count;

        console.log(`Data ingestion complete. Upserted: ${upsertedCount}, Deleted old records: ${deletedCount}`);

        return NextResponse.json({
            message: 'Data ingestion successful',
            upsertedCount,
            deletedCount,
        });
    } catch (error) {
        console.error('Error during data ingestion:', error);
        return NextResponse.json({ error: 'Data ingestion failed' }, { status: 500 });
    }
}