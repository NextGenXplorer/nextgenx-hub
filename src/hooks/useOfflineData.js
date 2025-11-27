import { useState, useEffect } from 'react';
import { getAllDocuments } from '../services/firebase';
import { getCachedData, setCachedData } from '../utils/cache';
import NetInfo from '@react-native-community/netinfo';

export const useOfflineData = (collectionName, cacheKey = null) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const key = cacheKey || collectionName;

    useEffect(() => {
        fetchData();

        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!state.isConnected);
            if (state.isConnected) {
                fetchData();
            }
        });

        return () => unsubscribe();
    }, [collectionName]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const netInfo = await NetInfo.fetch();

            if (netInfo.isConnected) {
                const freshData = await getAllDocuments(collectionName);
                setData(freshData);
                await setCachedData(key, freshData);
                setIsOffline(false);
            } else {
                const cachedData = await getCachedData(key);
                if (cachedData) {
                    setData(cachedData);
                    setIsOffline(true);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            const cachedData = await getCachedData(key);
            if (cachedData) {
                setData(cachedData);
                setIsOffline(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, isOffline, refetch: fetchData };
};
