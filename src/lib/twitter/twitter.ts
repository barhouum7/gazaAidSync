"use server";

import prismadb from '../prismadb';
import axios from 'axios';
import { isAfter, startOfDay, endOfDay } from 'date-fns';

// Try to import mockTweets if available
const mockTweets: any[] = [];
// If you want to use mockTweets, create src/lib/twitter/mockTweets.ts exporting 'mockTweets'.
// (async () => {
//   try {
//     const mod = await import('./mockTweets');
//     mockTweets = mod.mockTweets || [];
//   } catch {}
// })();

const isMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const isDev = process.env.NODE_ENV !== 'production';

// --- Types ---
export interface GazaTweet {
  tweetId: string;
  text: string;
  author: {
    twitterId: string;
    username: string;
    displayName: string;
  };
  createdAt: string;
  tweetUrl: string;
  hashtags: string[];
  rawJson?: any;
}

// --- Twitter Query for Gaza/Palestine ---
const GAZA_QUERY = encodeURIComponent(`(gaza OR palestine OR #gaza OR #palestine OR #gazaunderattack OR #gazagenocide OR #freepalestine) has:links -is:retweet -is:quote -is:reply`);
const TWEET_FIELDS = 'created_at,author_id,entities';
const USER_FIELDS = 'username,name';
const URL = `https://api.twitter.com/2/tweets/search/recent?query=${GAZA_QUERY}&tweet.fields=${TWEET_FIELDS}&expansions=author_id&user.fields=${USER_FIELDS}&max_results=10&sort_order=recency`;

// --- Bearer Token Rotation ---
const BEARER_TOKENS = [
  process.env.TWITTER_BEARER_TOKEN,
  process.env.TWITTER_2_BEARER_TOKEN,
  process.env.TWITTER_3_BEARER_TOKEN
].filter(Boolean);
let currentTokenIndex = 0;
const getNextBearerToken = () => {
  currentTokenIndex = (currentTokenIndex + 1) % BEARER_TOKENS.length;
  return BEARER_TOKENS[currentTokenIndex];
};

async function makeTwitterRequest(url: string) {
  let attempts = 0;
  const maxAttempts = BEARER_TOKENS.length;
  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${BEARER_TOKENS[currentTokenIndex]}` },
      });
      return response;
    } catch (error: any) {
      if (error.response?.status === 429) {
        getNextBearerToken();
        attempts++;
        continue;
      }
      throw error;
    }
  }
  throw new Error('All tokens are rate limited');
}

// --- Main Fetch & Store Logic ---
export async function fetchAndStoreGazaTweets({ force = false, useMock = false } = {}): Promise<GazaTweet[]> {
  // Use mock data if requested or in dev mode
  if (useMock || (isMockData && mockTweets.length > 0)) {
    return storeGazaTweets(mockTweets.map((tweet: any) => mapRawToGazaTweet(tweet)));
  }

  // Real API call
  const response = await makeTwitterRequest(URL);
  const tweets = response.data.data || [];
  const users = response.data.includes?.users || [];

  // Map and store
  const gazaTweets: GazaTweet[] = tweets.map((tweet: any) => mapRawToGazaTweet(tweet, users));
  return storeGazaTweets(gazaTweets);
}

function mapRawToGazaTweet(tweet: any, users: any[] = []): GazaTweet {
  const author = users.find((u) => u.id === tweet.author_id) || tweet.author || {};
  const hashtags = (tweet.entities?.hashtags || []).map((h: any) => h.tag.toLowerCase());
  return {
    tweetId: tweet.id,
    text: tweet.text,
    author: {
      twitterId: tweet.author_id || author.id || '',
      username: author.username || tweet.username || 'unknown',
      displayName: author.name || tweet.displayName || 'Unknown',
    },
    createdAt: tweet.created_at || tweet.createdAt || new Date().toISOString(),
    tweetUrl: tweet.tweetUrl || `https://twitter.com/${author.username}/status/${tweet.id}`,
    hashtags,
    rawJson: tweet,
  };
}

// --- Store Tweets, Users, Hashtags ---
async function storeGazaTweets(tweets: GazaTweet[]): Promise<GazaTweet[]> {
  for (const tweet of tweets) {
    // Upsert user
    const user = await prismadb.gazaTweetUser.upsert({
      where: { twitterId: tweet.author.twitterId },
      update: {
        username: tweet.author.username,
        displayName: tweet.author.displayName,
      },
      create: {
        twitterId: tweet.author.twitterId,
        username: tweet.author.username,
        displayName: tweet.author.displayName,
      },
    });
    // Upsert hashtags
    const hashtagRecords = await Promise.all(
      tweet.hashtags.map((tag: string) =>
        prismadb.gazaTweetHashtag.upsert({
          where: { tag },
          update: {},
          create: { tag },
        })
      )
    );
    // Upsert tweet
    await prismadb.gazaTweetUpdate.upsert({
      where: { tweetId: tweet.tweetId },
      update: {
        text: tweet.text,
        authorId: user.id,
        createdAt: new Date(tweet.createdAt),
        tweetUrl: tweet.tweetUrl,
        hashtags: {
          set: hashtagRecords.map((h: any) => ({ id: h.id })),
        },
        rawJson: tweet.rawJson,
        fetchedAt: new Date(),
      },
      create: {
        tweetId: tweet.tweetId,
        text: tweet.text,
        authorId: user.id,
        createdAt: new Date(tweet.createdAt),
        tweetUrl: tweet.tweetUrl,
        hashtags: {
          connect: hashtagRecords.map((h: any) => ({ id: h.id })),
        },
        rawJson: tweet.rawJson,
        fetchedAt: new Date(),
      },
    });
  }
  return tweets;
}