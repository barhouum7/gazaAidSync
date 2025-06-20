import { NextResponse } from 'next/server';
import axios from 'axios';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export async function GET() {
    try {
        // Scrape the Gaza section for more relevant news
        // const response = await axios.get('https://www.aljazeera.net');
        const liveResponse = await axios.get('https://www.aljazeera.net');
        const liveHtml = liveResponse.data;
        const $live = cheerio.load(liveHtml);

        // Log any title in the html result
        // Find any possible title in the html result
        // const titles = $live('h3').map((_, el) => $(el).text()).get();
        // console.log(titles);

        console.log('Scraping Al Jazeera live blog updates...');

        // Extract live blog updates from the live blog page
        const blogs: any[] = [];

        // 🟢 Live Blog Updates
        $live('li.liveblog-timeline__update').each((_, el) => {
            const time = $live(el).find('div.liveblog-timeline__update-time').text().trim();
            const linkPath = $live(el).find('a.liveblog-timeline__update-link').attr('href');
            const content = $live(el).find('h4.liveblog-timeline__update-content').text().trim();
            const fullLink = 'https://www.aljazeera.net' + linkPath;
            const idMatch = fullLink.match(/update=(\d+)/);
            const id = idMatch ? idMatch[1] : null;

            const parsedTime = (() => {
                const match = time.match(/(\d+)\s*(د|س)/); // د = minutes, س = hours
                if (!match) return null;
                const value = parseInt(match[1]);
                return match[2] === 'د' ? value : value * 60;
            })();

            blogs.push({
                id,
                time,
                parsedTime,
                link: fullLink,
                content,
                source: 'الجزيرة مباشر',
                type: content.includes('عاجل') ? 'urgent' : 'update',
                hasVideo: $live(el).find('iframe[src*="youtube"], video').length > 0
            });
        });


        // Themed scrap for Palestine related news
        const themedResponse = await axios.get('https://www.aljazeera.net/palestine/');
        const themedHtml = themedResponse.data;
        const $themed = cheerio.load(themedHtml);
        console.log('Scraping Al Jazeera themed news...');

        // 🟢 Headline Themed News
        const news: { title: string; link: string; postExcerpt: string }[] = [];
        $themed('li.themed-featured-posts-list__item').each((_, el) => {
            const link = 'https://www.aljazeera.net' + $themed(el).find('a.u-clickable-card__link').attr('href');
            const title = $themed(el).find('a.u-clickable-card__link').text().trim();
            const postExcerpt = $themed(el).find('p.article-card__excerpt').text().trim();
            news.push({ title, link, postExcerpt });
        });

        // 🔴 Trending Articles
        const trending: { title: string; link: string }[] = [];
        $live('div.trending-articles ol.trending-articles__list li').each((_, el) => {
            const linkPath = $live(el).find('a.article-trending__title-link').attr('href');
            const title = $live(el).find('a.article-trending__title-link span').text().trim();
            if (linkPath && title) {
                trending.push({
                title,
                link: 'https://www.aljazeera.net' + linkPath
                });
            }
        });


        // 🟢 Al Soumoud Convoy Act news
        // const soumoudResponse = await axios.get('https://www.aljazeera.net/search/صمود%20قافلة?sort=date');
        // const soumoudResponse = await axios.get('https://www.aljazeera.net/search/convoy?sort=date');
        // const soumoudHtml = soumoudResponse.data;
        // const $soumoud = cheerio.load(soumoudHtml);


        // const browser = await puppeteer.launch({
        //     headless: true,
        //     args: ['--no-sandbox', '--disable-setuid-sandbox'],
        //     timeout: 60000, // Increase browser launch timeout
        // });
        // const page = await browser.newPage();
        
        // // Set a more reasonable page timeout
        // page.setDefaultNavigationTimeout(15000);
        
        // let soumoudConvoyNews: { title: string; link: string; postExcerpt: string }[] = [];

        // try {
        //     // Try to navigate to the search page
        //     // await page.goto('https://www.aljazeera.net/search/convoy%20قافلة%20صمود', { waitUntil: 'networkidle2' });
        //     await page.goto('https://www.aljazeera.net/search/convoy', { 
        //         waitUntil: 'domcontentloaded', // Less strict than networkidle2
        //         timeout: 15000 
        //     });

        //     console.log('Scraping Al Jazeera Soumoud Convoy news...');

        //     // Wait for the results with a shorter timeout
        //     await page.waitForSelector('div.search-results div.search-result__list div.gc__content', { 
        //         timeout: 10000 
        //     });

        //     soumoudConvoyNews = await page.evaluate(() => {
        //         const items: { title: string; link: string; postExcerpt: string }[] = [];
        //         document.querySelectorAll('div.search-results div.search-result__list div.gc__content').forEach(el => {
        //             const a = el.querySelector('h3.gc__title a');
        //             const title = a?.textContent?.trim() || '';
        //             const link = a?.getAttribute('href') || '';
        //             const postExcerpt = el.querySelector('div.gc__excerpt p')?.textContent?.trim() || '';
        //             if (link && title) {
        //                 items.push({
        //                     title,
        //                     link: 'https://www.aljazeera.net' + link,
        //                     postExcerpt
        //                 });
        //             }
        //         });
        //         return items;
        //     });
        // } catch (scrapeError) {
        //     console.warn('Failed to scrape Soumoud Convoy news:', scrapeError);
        //     // Continue with empty results rather than failing the entire request
        //     soumoudConvoyNews = [];
        // } finally {
        //     await browser.close();
        // }


        // const soumoudConvoyNews: { title: string; link: string; postExcerpt: string }[] = [];
        // $soumoud('div.search-results div.search-result__list div.gc__content').each((_, el) => {
        //     // div.gc__header-wrap h3.gc__title a
        //     // div.gc__body-wrap div.gc__excerpt p
        //     const linkPath = $soumoud(el).find('h3.gc__title a').attr('href');
        //     const title = $soumoud(el).find('h3.gc__title a').text().trim();
        //     const postExcerpt = $soumoud(el).find('div.gc__excerpt p').text().trim();
        //     if (linkPath && title) {
        //         soumoudConvoyNews.push({
        //             title,
        //             link: 'https://www.aljazeera.net' + linkPath,
        //             postExcerpt
        //         });
        //     }
        // });



        // Crises overview, and Devastation across Gaza
        const crisisOverviewResponse = await axios.get('https://www.aljazeera.com/news/longform/2023/10/9/israel-hamas-war-in-maps-and-charts-live-tracker');
        const crisisOverviewHtml = crisisOverviewResponse.data;
        const $crisisOverview = cheerio.load(crisisOverviewHtml);
        console.log('Scraping Al Jazeera crisis overview...');

        // Extract crisis overview data
        const crisisOverviewData = {
            killed: $crisisOverview('div.longform-text div.wysiwyg.css-mkhf1y li').eq(0).text().trim(),
            injured: $crisisOverview('div.longform-text div.wysiwyg.css-mkhf1y li').eq(1).text().trim(),
            missing: $crisisOverview('div.longform-text div.wysiwyg.css-mkhf1y li').eq(2).text().trim(),
        };

        // Devastation across Gaza
        // Israeli attacks have damaged:

        // Almost all of Gaza’s homes (damaged or destroyed)
        // 80 percent of commercial facilities
        // 88 percent of school buildings
        // Healthcare facilities - 50 percent of hospitals are partially functional
        // 68 percent of road networks
        // 68 percent of cropland
        const devastationData = {
            homes: $crisisOverview('div.longform-text div.wysiwyg.css-mkhf1y li').eq(7).text().trim(),
            commercialFacilities: $crisisOverview('div.longform-text div.wysiwyg.css-mkhf1y li').eq(8).text().trim(),
            schools: $crisisOverview('div.longform-text div.wysiwyg.css-mkhf1y li').eq(9).text().trim(),
            hospitals: $crisisOverview('div.longform-text div.wysiwyg.css-mkhf1y li').eq(10).text().trim(),
            roads: $crisisOverview('div.longform-text div.wysiwyg.css-mkhf1y li').eq(11).text().trim(),
            cropland: $crisisOverview('div.longform-text div.wysiwyg.css-mkhf1y li').eq(12).text().trim(),
        };


        // console.log('Crisis Overview:', crisisOverviewData);
        // console.log('Devastation Data:', devastationData);



        // Return the scraped data
        return NextResponse.json({
            headline: { title: '', link: '' },
            blogs,
            news,
            trending,
            // soumoudConvoyNews
            crisisOverview: crisisOverviewData,
            devastation: devastationData,
        });
    } catch (error) {
        console.error('Error scraping:', error);
        return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
    }
}
