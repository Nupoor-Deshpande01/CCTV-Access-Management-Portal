import { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

const SEED_CAMERAS = [
    { id: 'c1', ownerId: 'o1', name: 'Main St. Junction', lat: 40.7128, lng: -74.0060, status: 'active' },
    { id: 'c2', ownerId: 'o1', name: 'Market Entrance', lat: 40.7138, lng: -74.0070, status: 'active' },
    { id: 'c3', ownerId: 'o2', name: 'Park View', lat: 40.7118, lng: -74.0050, status: 'maintenance' },
];

const SEED_REQUESTS = [
    { id: 'r1', userId: 'u1', cameraId: 'c1', status: 'pending', reason: 'Car accident evidence', timestamp: new Date().toISOString() },
    { id: 'r2', userId: 'u2', cameraId: 'c2', status: 'approved', reason: 'Theft reporting', timestamp: new Date(Date.now() - 86400000).toISOString(), footageUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' },
];

export const DataProvider = ({ children }) => {
    const [cameras, setCameras] = useState(SEED_CAMERAS);
    const [requests, setRequests] = useState(SEED_REQUESTS);

    const addRequest = (requestData) => {
        const newRequest = {
            id: 'r' + Math.random().toString(36).substr(2, 9),
            status: 'pending',
            timestamp: new Date().toISOString(),
            ...requestData
        };
        setRequests([newRequest, ...requests]);
        return newRequest;
    };

    const updateRequestStatus = (requestId, status, footageUrl = null) => {
        setRequests(requests.map(r => {
            if (r.id === requestId) {
                return { ...r, status, footageUrl };
            }
            return r;
        }));
    };

    const addCamera = (cameraData) => {
        const newCamera = {
            id: 'c' + Math.random().toString(36).substr(2, 9),
            status: 'active',
            ...cameraData
        };
        setCameras([...cameras, newCamera]);
        return newCamera;
    };

    const value = {
        cameras,
        requests,
        addRequest,
        updateRequestStatus,
        addCamera
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
