"use client";

import { useState, useEffect, useRef } from "react";

export function useLiveNewsData(pollIntervalMs = 60000) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/get-liveblog-news");
            if (!res.ok) throw new Error("Failed to fetch news data");
            setData(await res.json());
        } catch (err: any) {
            setError(err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Auto-refresh
        intervalRef.current = setInterval(fetchData, pollIntervalMs);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [pollIntervalMs]);

    return { data, loading, error, refetch: fetchData };
}